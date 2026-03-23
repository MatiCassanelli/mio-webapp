/**
 * webhook.js
 * Main bot handler. Routes incoming messages based on conversation state.
 *
 * Conversation states:
 *   (none)                  → parse message with Claude
 *   awaiting_clarification  → resolve pending subcategory questions
 *   awaiting_confirmation   → user confirms or cancels the operation
 *
 * Expected request body: { phoneNumber: string, message: string }
 */

import { parseFinancialMessage, classifyConfirmationIntent } from './parser.js';
import { getPendingConversation, savePendingConversation, clearPendingConversation } from './conversation.js';
import { getUserByPhone, getCategoriesMap, writeTransactions, buildBalanceSummary } from './transactions.js';
import { toLocaleAmount } from './utils.js';

/**
 * Formats a parsed transaction for display in a confirmation message.
 * @param {Object} t - Parsed transaction
 * @param {Object} categoriesMap
 * @returns {string}
 */
function formatTransaction(t, categoriesMap) {
  const category = categoriesMap[t.categoryId];
  const subcategory = t.subcategoryId
    ? (category?.subcategories || []).find((s) => s.id === t.subcategoryId)
    : null;

  const label = subcategory ? `${category.name} ${subcategory.name}` : category?.name || t.categoryId;
  const sign = t.income ? '+' : '-';
  const amount = toLocaleAmount(t.amount);
  const currency = category?.currencyCode || '';
  return `  ${sign}${amount} ${currency} (${label})`;
}

/**
 * Builds the confirmation summary message.
 */
function buildConfirmationMessage(transactions, categoriesMap) {
  const lines = transactions.map((t) => formatTransaction(t, categoriesMap));
  return `Entendí:\n${lines.join('\n')}\n\n¿Confirmo? (sí / no)`;
}

/**
 * Handles a new message when there is no active conversation.
 */
async function handleNewMessage(phoneNumber, userId, message, categoriesMap) {
  const categoriesList = Object.values(categoriesMap);
  const parsed = await parseFinancialMessage(message, categoriesList);

  if (parsed.unrecognized) {
    return parsed.unrecognized_message || 'No entendí el mensaje. Intentá describir la operación de nuevo.';
  }

  const status = parsed.pendingQuestions.length > 0 ? 'awaiting_clarification' : 'awaiting_confirmation';

  await savePendingConversation(phoneNumber, userId, {
    status,
    transactions: parsed.transactions,
    pendingQuestions: parsed.pendingQuestions,
  });

  if (status === 'awaiting_clarification') {
    return parsed.pendingQuestions[0].question;
  }

  return buildConfirmationMessage(parsed.transactions, categoriesMap);
}

/**
 * Handles a user reply when there are pending clarification questions.
 * Tries to match the reply to one of the available options.
 */
async function handleClarification(phoneNumber, userId, message, pending, categoriesMap) {
  const [currentQuestion, ...remainingQuestions] = pending.pendingQuestions;
  const normalizedReply = message.trim().toLowerCase();

  // Try to match the user's reply to one of the available options
  const matchedOption = currentQuestion.options.find(
    (opt) =>
      opt.name.toLowerCase() === normalizedReply ||
      opt.name.toLowerCase().includes(normalizedReply) ||
      normalizedReply.includes(opt.name.toLowerCase()),
  );

  if (!matchedOption) {
    const optionNames = currentQuestion.options.map((o) => o.name).join(' / ');
    return `No entendí. Las opciones son: ${optionNames}`;
  }

  // Apply the answer to the correct transaction field
  const updatedTransactions = [...pending.transactions];
  updatedTransactions[currentQuestion.transactionIndex] = {
    ...updatedTransactions[currentQuestion.transactionIndex],
    [currentQuestion.field]: matchedOption.id,
  };

  const newStatus = remainingQuestions.length > 0 ? 'awaiting_clarification' : 'awaiting_confirmation';

  await savePendingConversation(phoneNumber, userId, {
    status: newStatus,
    transactions: updatedTransactions,
    pendingQuestions: remainingQuestions,
  });

  if (newStatus === 'awaiting_clarification') {
    return remainingQuestions[0].question;
  }

  return buildConfirmationMessage(updatedTransactions, categoriesMap);
}

/**
 * Handles a user reply when waiting for confirmation (yes/no).
 */
async function handleConfirmation(phoneNumber, userId, message, pending, categoriesMap) {
  const intent = await classifyConfirmationIntent(message);

  if (intent === 'cancel') {
    await clearPendingConversation(phoneNumber);
    return 'Operación cancelada.';
  }

  if (intent === 'unclear') {
    return buildConfirmationMessage(pending.transactions, categoriesMap) + '\n\nRespondé *sí* para confirmar o *no* para cancelar.';
  }

  // Write transactions to Firestore
  await writeTransactions(userId, pending.transactions, categoriesMap);
  await clearPendingConversation(phoneNumber);

  // Build balance summary for affected subcategories
  const balanceSummary = await buildBalanceSummary(userId, pending.transactions, categoriesMap);

  return `✅ Operación registrada.\n\nBalance actualizado:\n${balanceSummary}`;
}

/**
 * Main bot handler. Receives a message and returns a reply string.
 * @param {string} phoneNumber - Sender's phone number (e.g. +5491112345678)
 * @param {string} message - Incoming message text
 * @returns {Promise<string>} - Reply to send back
 */
async function handleBotMessage(phoneNumber, message) {
  const user = await getUserByPhone(phoneNumber);
  if (!user) {
    return 'Tu número no está vinculado a ninguna cuenta. Ingresá a la app para configurarlo.';
  }

  const categoriesMap = await getCategoriesMap();
  const pending = await getPendingConversation(phoneNumber);

  if (!pending) {
    return handleNewMessage(phoneNumber, user.id, message, categoriesMap);
  }

  if (pending.status === 'awaiting_clarification') {
    return handleClarification(phoneNumber, user.id, message, pending, categoriesMap);
  }

  if (pending.status === 'awaiting_confirmation') {
    return handleConfirmation(phoneNumber, user.id, message, pending, categoriesMap);
  }

  // Unknown state — reset
  await clearPendingConversation(phoneNumber);
  return 'Algo salió mal. Intentá de nuevo.';
}

export { handleBotMessage };