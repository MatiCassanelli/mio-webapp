import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { FirestoreError, Timestamp } from 'firebase/firestore';
import { UserContext } from 'context/UserContext';
import { Category, emptyCategory } from 'types/Transaction';
import { getAllCategories } from 'services/categories';
import { createTransaction } from 'services/transactions';
import { ROUTES } from 'lib';
import { parseAmount } from 'components/form/AmountInput';
import { MovementForm } from 'components/form/MovementForm';

interface RegisterMovementProps {
  saving?: boolean;
}

export const RegisterMovement = ({ saving = false }: RegisterMovementProps) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [income, setIncome] = useState(true);
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category>(emptyCategory);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        setCategories(res as Category[]);
      } catch (err) {
        setError((err as FirestoreError).message);
      }
    };
    fetchCategories();
  }, []);

  const needsSubcategory = !!(
    category.id &&
    category.subcategories?.length &&
    !category.subcategory
  );

  const isValid =
    !!amount &&
    parseAmount(amount) > 0 &&
    !!category.id &&
    !needsSubcategory &&
    !!description;

  const handleSubcategoryClick = (subcategoryId: string) => {
    const sub = category.subcategories?.find((s) => s.id === subcategoryId);
    if (sub) setCategory({ ...category, subcategory: sub });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      await createTransaction({
        amount: parseAmount(amount),
        category,
        income,
        date: Timestamp.fromDate(date.toDate()),
        description,
        userId: user?.uid,
        saving,
      });
      navigate(saving ? ROUTES.SAVINGS : ROUTES.TRANSACTIONS);
    } catch (err) {
      setError((err as FirestoreError).message);
      setLoading(false);
    }
  };

  return (
    <MovementForm
      income={income}
      onIncomeChange={setIncome}
      amount={amount}
      onAmountChange={setAmount}
      categories={categories}
      category={category}
      onCategorySelect={setCategory}
      onSubcategorySelect={handleSubcategoryClick}
      date={date}
      onDateChange={setDate}
      description={description}
      onDescriptionChange={setDescription}
      isValid={isValid}
      loading={loading}
      error={error}
      saving={saving}
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
      submitLabel="Guardar Movimiento"
    />
  );
};
