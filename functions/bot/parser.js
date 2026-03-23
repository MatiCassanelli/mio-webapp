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
 * @param {Array} categories - User categories from Firestore
 * @returns {Promise<Object>} - { unrecognized, transactions, pendingQuestions }
 */
async function parseFinancialMessage(message, categories) {
  const categoriesContext = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    currencyCode: cat.currencyCode,
    subcategories: (cat.subcategories || []).map((sub) => ({ id: sub.id, name: sub.name })),
  }));

  const systemPrompt = parserPromptTemplate.replace(
    '{{CATEGORIES}}',
    JSON.stringify(categoriesContext, null, 2),
  );

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    tools: [PARSE_TOOL],
    tool_choice: { type: 'tool', name: 'register_operation' },
    messages: [{ role: 'user', content: message }],
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
    model: 'claude-sonnet-4-6',
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
