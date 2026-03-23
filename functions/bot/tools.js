const PARSE_TOOL = {
  name: 'register_operation',
  description: 'Registers a financial operation parsed from a natural language message',
  input_schema: {
    type: 'object',
    properties: {
      unrecognized: {
        type: 'boolean',
        description: 'true if the message is not a recognizable financial operation',
      },
      unrecognized_message: {
        type: 'string',
        description: 'Response message if the operation was not recognized',
      },
      transactions: {
        type: 'array',
        description: 'List of transactions to create. For currency exchanges, always two: one outflow and one inflow.',
        items: {
          type: 'object',
          properties: {
            amount: { type: 'number', description: 'Always a positive number' },
            income: { type: 'boolean', description: 'true = inflow, false = outflow' },
            categoryId: { type: 'string', description: 'Exact category ID from the user categories list' },
            subcategoryId: { type: 'string', description: 'Exact subcategory ID, or null if it cannot be inferred' },
            description: { type: 'string', description: 'Short description of the operation' },
          },
          required: ['amount', 'income', 'categoryId', 'description'],
        },
      },
      pendingQuestions: {
        type: 'array',
        description: 'Questions to resolve ambiguities before confirming',
        items: {
          type: 'object',
          properties: {
            transactionIndex: { type: 'integer', description: 'Index of the ambiguous transaction' },
            field: { type: 'string', description: 'Field to resolve, e.g.: subcategoryId' },
            question: { type: 'string', description: 'Question to ask the user, in Spanish' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
                required: ['id', 'name'],
              },
            },
          },
          required: ['transactionIndex', 'field', 'question', 'options'],
        },
      },
    },
    required: ['unrecognized', 'transactions', 'pendingQuestions'],
  },
};

const CLASSIFY_TOOL = {
  name: 'classify_intent',
  description: "Classifies whether the user's message is a confirmation, cancellation, or unclear",
  input_schema: {
    type: 'object',
    properties: {
      intent: {
        type: 'string',
        enum: ['confirm', 'cancel', 'unclear'],
        description: "'confirm' if the user agreed, 'cancel' if they rejected, 'unclear' if ambiguous",
      },
    },
    required: ['intent'],
  },
};

export { PARSE_TOOL, CLASSIFY_TOOL };
