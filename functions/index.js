const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
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

exports.calculateYearlyTotals = onRequest(async (req, res) => {
  const userId = req.method === 'GET' ? req.query.userId : req.body.data.userId;
  if (!userId) {
    res.status(400).send('User ID is required');
    return;
  }

  const currentDate = new Date();
  const startOfCurrentMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );

  const monthlyTotals = [];
  const categoryTotals = {};

  for (let i = 0; i < 12; i++) {
    const startOfMonth = Timestamp.fromDate(new Date(startOfCurrentMonth));
    const endOfMonth = Timestamp.fromDate(
      new Date(
        startOfCurrentMonth.getFullYear(),
        startOfCurrentMonth.getMonth() + 1,
        0,
        23,
        59,
        59,
      ),
    );

    const snapshot = await getFirestore()
      .collection('transactions')
      .where('userId', '==', userId)
      .where('saving', '==', false)
      .where('date', '>=', startOfMonth)
      .where('date', '<=', endOfMonth)
      .get();

    let incomingMonthlyTotal = 0;
    let outgoingMonthlyTotal = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const { amount, income } = data;

      // eslint-disable-next-line no-unused-vars
      const { subcategory, subcategories, ...category } = data.category;
      if (category.id === 'usd') {
        income
          ? (incomingMonthlyTotal += amount)
          : (outgoingMonthlyTotal += amount);
      }

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

    monthlyTotals.unshift({
      month: formatDateToMMYY(endOfMonth.toDate()),
      incomingTotal: incomingMonthlyTotal,
      outgoingTotal: outgoingMonthlyTotal,
    });

    startOfCurrentMonth.setMonth(startOfCurrentMonth.getMonth() - 1);
  }

  res.send({ data: { monthlyTotals, categoryTotals } });
});
