import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { handleBotMessage } from './bot/webhook.js';

initializeApp();

const addAmount = (baseAmount, amount, income) => {
  return income ? baseAmount + amount : baseAmount - amount;
};

const formatDateToMMYY = (date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${month}-${year}`;
};

// Returns I/O total for all categories and the passed year
export const getAllTotals = onRequest({ cors: true }, async (req, res) => {
  const { userId, year } = req.body.data;
  if (!userId) {
    res.status(400).send('User ID is required');
    return;
  }
  const filterYear = year ? parseInt(year, 10) : null;

  try {
    let query = getFirestore()
      .collection('transactions')
      .where('userId', '==', userId)
      .where('saving', '==', false)
      .orderBy('date', 'asc');

    if (filterYear) {
      query = query
        .where('date', '>=', Timestamp.fromDate(new Date(filterYear, 0, 1)))
        .where('date', '<', Timestamp.fromDate(new Date(filterYear + 1, 0, 1)));
    }

    const snapshot = await query.get();
    const filteredTransactions = snapshot.docs.map((doc) => doc.data());

    const categoryTotals = {};
    filteredTransactions.forEach((transaction) => {
      const { amount, income } = transaction;

      // eslint-disable-next-line no-unused-vars
      const { subcategory, subcategories, ...category } = transaction.category;

      if (!categoryTotals[category.id]) {
        categoryTotals[category.id] = { total: 0, category, subcategories: {} };
      }

      categoryTotals[category.id].total = addAmount(
        categoryTotals[category.id].total,
        amount,
        income,
      );

      if (subcategory?.id) {
        if (!categoryTotals[category.id].subcategories[subcategory.id]) {
          categoryTotals[category.id].subcategories[subcategory.id] = {
            total: 0,
            subcategory,
          };
        }
        categoryTotals[category.id].subcategories[subcategory.id].total =
          addAmount(
            categoryTotals[category.id].subcategories[subcategory.id].total,
            amount,
            income,
          );
      }
    });

    res.status(200).json({ data: categoryTotals });
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    res.status(500).send({ name: 'Internal Server Error', error });
  }
});

// Returns total by category for each month
export const getMonthlyTotalsByCategory = onRequest({ cors: true }, async (req, res) => {
  const { userId, year, category } = req.body.data;
  if (!userId) {
    res.status(400).send('User ID is required');
    return;
  }
  const filterYear = year ? parseInt(year, 10) : null;

  try {
    let query = getFirestore()
      .collection('transactions')
      .where('userId', '==', userId)
      .where('category.id', '==', category)
      .where('saving', '==', false)
      .orderBy('date', 'asc');

    if (filterYear) {
      query = query
        .where('date', '>=', Timestamp.fromDate(new Date(filterYear, 0, 1)))
        .where('date', '<', Timestamp.fromDate(new Date(filterYear + 1, 0, 1)));
    }

    const snapshot = await query.get();
    const filteredTransactions = snapshot.docs.map((doc) => doc.data());

    const groupedByMonthAndYear = filteredTransactions.reduce(
      (acc, transaction) => {
        const key = formatDateToMMYY(transaction.date.toDate());

        if (!acc[key]) {
          acc[key] = { incomingTotal: 0, outgoingTotal: 0 };
        }

        if (transaction.income) {
          acc[key].incomingTotal += transaction.amount;
        } else {
          acc[key].outgoingTotal += transaction.amount;
        }

        return acc;
      },
      {},
    );
    const totalByMonthAndYear = Object.keys(groupedByMonthAndYear).map(
      (key) => ({
        monthYear: key,
        incomingTotal: groupedByMonthAndYear[key].incomingTotal,
        outgoingTotal: groupedByMonthAndYear[key].outgoingTotal
      }),
    );
    res.status(200).json({ data: totalByMonthAndYear });
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    res.status(500).send({ name: 'Internal Server Error', error });
  }
});

// WhatsApp bot webhook
// Body: { phoneNumber: string, message: string }
export const botWebhook = onRequest({ cors: true }, async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    res.status(400).send('phoneNumber and message are required');
    return;
  }

  try {
    const reply = await handleBotMessage(phoneNumber, message);
    res.status(200).set('Content-Type', 'text/plain').send(reply);
  } catch (error) {
    console.error('Bot error:', error);
    res.status(500).send({ name: 'Internal Server Error', error });
  }
});

export const telegramWebhook = onRequest(async (req, res) => {
  res.sendStatus(200);

  const msg = req.body.message;
  if (!msg) return;

  const phoneNumber = String(msg.chat.id); // usás el chat_id como identificador
  const message = msg.text;
  console.log('Received Telegram message:', { phoneNumber, message });
  if (!phoneNumber || !message) return;

  try {
    const reply = await handleBotMessage(phoneNumber, message);
    await sendTelegramMessage(msg.chat.id, reply);
  } catch (error) {
    console.error('Bot error:', error);
  }
});

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}