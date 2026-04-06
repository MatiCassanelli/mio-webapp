import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import dayjs, { Dayjs } from 'dayjs';
import { FirestoreError, Timestamp } from 'firebase/firestore';
import { UserContext } from 'context/UserContext';
import { Category, emptyCategory } from 'types/Transaction';
import { getAllCategories } from 'services/categories';
import { getTransaction, editTransaction, deleteTransaction } from 'services/transactions';
import { ROUTES } from 'lib';
import { parseAmount } from 'components/form/AmountInput';
import { MovementForm } from 'components/form/MovementForm';
import { Loading } from './Loading';

interface EditMovementProps {
  saving?: boolean;
}

export const EditMovement = ({ saving = false }: EditMovementProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [income, setIncome] = useState(true);
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category>(emptyCategory);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setFetchLoading(true);
      try {
        const [cats, transaction] = await Promise.all([getAllCategories(), getTransaction(id)]);
        setCategories(cats as Category[]);
        if (transaction) {
          setIncome(transaction.income);
          setAmount(String(transaction.amount));
          setCategory(transaction.category);
          setDate(dayjs(transaction.date.toDate()));
          setDescription(transaction.description);
        } else {
          setFetchError('No se encontró el movimiento.');
        }
      } catch (err) {
        setFetchError((err as FirestoreError).message);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
    if (!isValid || !id) return;
    setLoading(true);
    setError('');
    try {
      await editTransaction({
        id,
        amount: Number(amount),
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

  const handleDelete = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await deleteTransaction(id);
      navigate(saving ? ROUTES.SAVINGS : ROUTES.TRANSACTIONS);
    } catch (err) {
      setError((err as FirestoreError).message);
      setLoading(false);
    }
  };

  if (fetchLoading) return <Loading />;

  if (fetchError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">{fetchError}</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

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
      title={saving ? 'Editar Ahorro' : 'Editar Movimiento'}
      submitLabel="Guardar cambios"
      onDelete={handleDelete}
    />
  );
};
