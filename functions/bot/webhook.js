/**
 * webhook.js
 * Main bot handler. Routes incoming messages based on conversation state.
 *
 * Conversation states:
 *   (none)                  → parse message with Claude
 *   awaiting_clarification  → resolve pending account questions
 *   awaiting_confirmation   → user confirms or cancels the operation
 *
 * Expected request body: { phoneNumber: string, message: string }
 */

import { parseFinancialMessage, classifyConfirmationIntent } from './parser.js';
import { getPendingConversation, savePendingConversation, clearPendingConversation } from './conversation.js';
import { getUserByTelegramId, linkTelegramUser, getAccountsMap, writeTransactions, buildBalanceSummary } from './transactions.js';
import { toLocaleAmount } from './utils.js';

/**
 * Formats a parsed transaction for display in a confirmation message.
 * Transfers read as a move between two accounts, never as income or expense.
 * @param {Object} t - Parsed transaction
 * @param {Object} accountsMap
 * @param {Array} all - Every parsed transaction, to find the other leg of a transfer
 * @returns {string}
 */
function formatTransaction(t, accountsMap, all) {
  const account = accountsMap[t.accountId];
  const amount = toLocaleAmount(t.amount);
  const currency = account?.currencyCode || '';
  const label = account?.name || t.accountId;

  if (t.type === 'transfer_out' || t.type === 'transfer_in') {
    const counterpart = all.find((other) => other !== t && other.transferGroup === t.transferGroup);
    const otherName = accountsMap[counterpart?.accountId]?.name || 'otra cuenta';
    const arrow = t.type === 'transfer_out' ? `${label} → ${otherName}` : `${otherName} → ${label}`;
    return `  ${amount} ${currency} (${arrow})`;
  }

  const sign = t.type === 'income' ? '+' : '-';
  return `  ${sign}${amount} ${currency} (${label})`;
}

/**
 * Builds the confirmation summary message.
 */
function buildConfirmationMessage(transactions, accountsMap) {
  const lines = transactions.map((t) => formatTransaction(t, accountsMap, transactions));
  return `Entendí:\n${lines.join('\n')}\n\n¿Confirmo? (sí / no)`;
}

/**
 * Handles a new message when there is no active conversation.
 */
async function handleNewMessage(chatId, userId, message, accountsMap, imageData = null) {
  const accountsList = Object.values(accountsMap);
  const parsed = await parseFinancialMessage(message, accountsList, imageData);

  if (parsed.unrecognized) {
    return parsed.unrecognized_message || 'No entendí el mensaje. Intentá describir la operación de nuevo.';
  }

  const status = parsed.pendingQuestions && parsed.pendingQuestions.length > 0 ? 'awaiting_clarification' : 'awaiting_confirmation';

  await savePendingConversation(chatId, userId, {
    status,
    transactions: parsed.transactions,
    pendingQuestions: parsed.pendingQuestions,
  });

  if (status === 'awaiting_clarification') {
    return parsed.pendingQuestions[0].question;
  }

  return buildConfirmationMessage(parsed.transactions, accountsMap);
}

/**
 * Handles a user reply when there are pending clarification questions.
 * Tries to match the reply to one of the available options.
 */
async function handleClarification(phoneNumber, userId, message, pending, accountsMap) {
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

  return buildConfirmationMessage(updatedTransactions, accountsMap);
}

/**
 * Handles a user reply when waiting for confirmation (yes/no).
 */
async function handleConfirmation(phoneNumber, userId, message, pending, accountsMap) {
  const intent = await classifyConfirmationIntent(message);

  if (intent === 'cancel') {
    await clearPendingConversation(phoneNumber);
    return 'Operación cancelada.';
  }

  if (intent === 'unclear') {
    return buildConfirmationMessage(pending.transactions, accountsMap) + '\n\nRespondé *sí* para confirmar o *no* para cancelar.';
  }

  // Write transactions to Firestore
  await writeTransactions(userId, pending.transactions, accountsMap);
  await clearPendingConversation(phoneNumber);

  // Build balance summary for the affected accounts
  const balanceSummary = await buildBalanceSummary(userId, pending.transactions, accountsMap);

  return `✅ Operación registrada.\n\nSaldo actualizado:\n${balanceSummary}`;
}

/**
 * Main bot handler. Receives a message and returns a reply string.
 * @param {string} chatId - Telegram chat ID
 * @param {string} message - Incoming message text
 * @param {{ base64: string, mimeType: string } | null} imageData - Optional image to analyze
 * @returns {Promise<string>} - Reply to send back
 */
async function handleBotMessage(chatId, message, imageData = null) {
  const pending = await getPendingConversation(chatId);

  // Linking flow: user is responding with their email
  if (pending?.status === 'awaiting_link') {
    const linked = await linkTelegramUser(message, chatId);
    await clearPendingConversation(chatId);
    if (!linked) {
      return 'No encontré una cuenta con ese email. Verificá que sea el email con el que te registraste en la app.';
    }
    return '✅ Cuenta vinculada. Ya podés enviarme tus operaciones.';
  }

  const user = await getUserByTelegramId(chatId);

  // Unknown user: start linking flow
  if (!user) {
    await savePendingConversation(chatId, null, { status: 'awaiting_link', transactions: [], pendingQuestions: [] });
    return '¡Hola! Para empezar, necesito vincular tu cuenta. ¿Cuál es el email con el que te registraste en la app?';
  }

  const accountsMap = await getAccountsMap(user.id);

  if (!pending) {
    return handleNewMessage(chatId, user.id, message, accountsMap, imageData);
  }

  if (pending.status === 'awaiting_clarification') {
    return handleClarification(chatId, user.id, message, pending, accountsMap);
  }

  if (pending.status === 'awaiting_confirmation') {
    return handleConfirmation(chatId, user.id, message, pending, accountsMap);
  }

  // Unknown state — reset
  await clearPendingConversation(chatId);
  return 'Algo salió mal. Intentá de nuevo.';
}

export { handleBotMessage };
