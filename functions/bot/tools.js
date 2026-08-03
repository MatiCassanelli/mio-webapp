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
        description:
          'List of transactions to create. For exchanges or transfers between the user\'s own accounts, always two: one transfer_out and one transfer_in sharing the same transferGroup.',
        items: {
          type: 'object',
          properties: {
            amount: { type: 'number', description: 'Always a positive number' },
            type: {
              type: 'string',
              enum: ['income', 'expense', 'transfer_out', 'transfer_in'],
              description:
                'income = money entering from outside, expense = money leaving to outside, transfer_out/transfer_in = the two legs of a move between the user\'s own accounts',
            },
            accountId: {
              type: 'string',
              description: 'Exact account ID from the user accounts list',
            },
            transferGroup: {
              type: 'string',
              description:
                'Same arbitrary string on both legs of one transfer, e.g. "t1". Omit for plain income/expense.',
            },
            description: { type: 'string', description: 'Short description of the operation' },
          },
          required: ['amount', 'type', 'accountId', 'description'],
        },
      },
      pendingQuestions: {
        type: 'array',
        description: 'Questions to resolve ambiguities before confirming',
        items: {
          type: 'object',
          properties: {
            transactionIndex: { type: 'integer', description: 'Index of the ambiguous transaction' },
            field: { type: 'string', description: 'Field to resolve, e.g.: accountId' },
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
