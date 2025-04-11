const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { onRequest } = require('firebase-functions/v2/https');

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
exports.getAllTotals = onRequest({ cors: true }, async (req, res) => {
  const { userId, year } = req.body.data;
  if (!userId) {
    res.status(400).send('User ID is required');
    return;
  }
  const filterYear = year ? parseInt(year, 10) : null;

  try {
    const snapshot = await getFirestore()
      .collection('transactions')
      .where('userId', '==', userId)
      .where('saving', '==', false)
      .orderBy('date', 'asc')
      .get();

    const transactions = snapshot.docs.map((doc) => doc.data());
    const filteredTransactions = filterYear
      ? transactions.filter((transaction) => {
        const transactionYear = transaction.date.toDate().getFullYear();
        return transactionYear === filterYear;
      })
      : transactions;

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
exports.getMonthlyTotalsByCategory = onRequest({ cors: true }, async (req, res) => {
  const { userId, year, category } = req.body.data;
  if (!userId) {
    res.status(400).send('User ID is required');
    return;
  }
  const filterYear = year ? parseInt(year, 10) : null;

  try {
    const snapshot = await getFirestore()
      .collection('transactions')
      .where('userId', '==', userId)
      .where('category.id', '==', category)
      .where('saving', '==', false)
      .orderBy('date', 'asc')
      .get();

    const transactions = snapshot.docs.map((doc) => doc.data());
    const filteredTransactions = filterYear
      ? transactions.filter((transaction) => {
        const transactionYear = transaction.date.toDate().getFullYear();
        return transactionYear === filterYear;
      })
      : transactions;

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