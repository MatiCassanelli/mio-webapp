/**
 * parser.js
 * Calls the Claude API to parse a free-text financial message
 * and return structured transactions.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { PARSE_TOOL, CLASSIFY_TOOL } from './tools.js';

const client = new Anthropic();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parserPromptTemplate = fs.readFileSync(path.join(__dirname, 'prompts/parser.md'), 'utf8');
const classifyPrompt = fs.readFileSync(path.join(__dirname, 'prompts/classify.md'), 'utf8');

/**
 * @param {string} message - User message in free text
 * @param {Array} accounts - User accounts from Firestore
 * @param {{ base64: string, mimeType: string } | null} imageData - Optional image to analyze
 * @returns {Promise<Object>} - { unrecognized, transactions, pendingQuestions }
 */
async function parseFinancialMessage(message, accounts, imageData = null) {
  const accountsContext = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    currencyCode: account.currencyCode,
    type: account.type,
  }));

  const systemPrompt = parserPromptTemplate.replace(
    '{{ACCOUNTS}}',
    JSON.stringify(accountsContext, null, 2),
  );

  let userContent;
  if (imageData) {
    const isPdf = imageData.mimeType === 'application/pdf';
    const fileBlock = isPdf
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: imageData.base64 } }
      : { type: 'image', source: { type: 'base64', media_type: imageData.mimeType, data: imageData.base64 } };
    userContent = [
      fileBlock,
      { type: 'text', text: message || 'Analizá los movimientos financieros en este archivo y registrálos.' },
    ];
  } else {
    userContent = message;
  }

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    tools: [PARSE_TOOL],
    tool_choice: { type: 'tool', name: 'register_operation' },
    messages: [{ role: 'user', content: userContent }],
  });

  const toolUse = response.content.find((b) => b.type === 'tool_use');
  if (!toolUse) {
    return {
      unrecognized: true,
      unrecognized_message: 'No pude procesar tu mensaje. Intentá de nuevo.',
      transactions: [],
      pendingQuestions: [],
    };
  }

  return toolUse.input;
}

/**
 * Classifies whether a user's reply is a confirmation, cancellation, or unclear.
 * @param {string} message
 * @returns {Promise<'confirm'|'cancel'|'unclear'>}
 */
async function classifyConfirmationIntent(message) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 50,
    system: classifyPrompt,
    tools: [CLASSIFY_TOOL],
    tool_choice: { type: 'tool', name: 'classify_intent' },
    messages: [{ role: 'user', content: message }],
  });

  const toolUse = response.content.find((b) => b.type === 'tool_use');
  return toolUse?.input?.intent || 'unclear';
}

export { parseFinancialMessage, classifyConfirmationIntent };
