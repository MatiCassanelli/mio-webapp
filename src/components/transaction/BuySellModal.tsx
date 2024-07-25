import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormControl,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { ButtonWithSpinner } from 'components/common/ButtonWithSpinner';
import { InputWithCurrency } from 'components/common/InputWithCurrency';
import { UserContext } from 'context/UserContext';
import dayjs, { Dayjs } from 'dayjs';
import { FirestoreError, Timestamp } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { getAllCategories } from 'services/categories';
import { buySellTransaction } from 'services/transactions';
import { Category, emptyCategory, Transaction } from 'types/Transaction';

export const BuySellModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { user } = useContext(UserContext);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>();
  const [sellAmount, setSellAmount] = useState(0);
  const [sellCategory, setSellCategory] = useState<Category>(emptyCategory);
  const [buyAmount, setBuyAmount] = useState(0);
  const [buyCategory, setBuyCategory] = useState<Category>(emptyCategory);
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState('');
  const [date, setDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      const response = await getAllCategories();
      setCategories(response as Category[]);
      setLoading(false);
    };
    getCategories();
  }, []);

  const onSave = async () => {
    setLoading(true);
    const sellTransaction: Transaction = {
      amount: sellAmount,
      category: sellCategory,
      income: false,
      date: Timestamp.now(),
      description,
      userId: user?.uid,
    };
    const buyTransaction: Transaction = {
      amount: buyAmount,
      category: buyCategory,
      income: true,
      date: Timestamp.now(),
      description,
      userId: user?.uid,
    };
    try {
      await buySellTransaction(sellTransaction, buyTransaction);
      onClose();
    } catch (error) {
      setError((error as FirestoreError).message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (buyCategory.id && sellCategory.id) {
      const sellDescription = sellCategory.subcategory
        ? `${sellCategory.name} (${sellCategory.subcategory.name})`
        : sellCategory.name;
      const buyDescription = buyCategory.subcategory
        ? `${buyCategory.name} (${buyCategory.subcategory.name})`
        : buyCategory.name;

      setDescription(
        `De ${sellDescription} a ${buyDescription}. Cotizacion: ${rate} `
      );
    }
  }, [buyCategory, sellCategory, rate]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {error && <Typography>{error}</Typography>}
      <DialogTitle>Compra - Venta</DialogTitle>
      <DialogContent className="margined">
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'start',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 3,
            marginBottom: 3,
          }}
        >
          <InputWithCurrency
            amount={sellAmount}
            setAmount={setSellAmount}
            categories={categories}
            category={sellCategory}
            setCategory={setSellCategory}
            loading={loading}
            label="De"
          />
          <InputWithCurrency
            amount={buyAmount}
            setAmount={setBuyAmount}
            categories={categories}
            category={buyCategory}
            setCategory={setBuyCategory}
            loading={loading}
            label="A"
          />
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'start',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 3,
            marginBottom: 3,
          }}
        >
          <DatePicker
            label="Fecha"
            value={date}
            onChange={(newValue) => setDate(newValue as Dayjs)}
            format="DD/MM/YYYY"
            disabled={loading}
            sx={{ flex: 1 }}
          />
          {buyCategory && sellCategory && (
            <FormControl sx={{ flex: 1 }}>
              <TextField
                label={`Cotizacion ${sellCategory.name}/${buyCategory.name}`}
                id="rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                disabled={loading}
              />
            </FormControl>
          )}
        </Box>
        {buyCategory && sellCategory && (
          <TextField
            fullWidth
            label="Descripcion"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            multiline
          />
        )}
      </DialogContent>
      <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <ButtonWithSpinner
          variant="contained"
          loading={loading}
          disabled={
            !buyAmount ||
            !sellAmount ||
            !buyCategory ||
            (buyCategory &&
              buyCategory.subcategories &&
              !buyCategory.subcategory) ||
            (sellCategory &&
              sellCategory.subcategories &&
              !sellCategory.subcategory) ||
            !sellCategory ||
            !description
          }
          onClick={onSave}
        >
          Guardar
        </ButtonWithSpinner>
      </DialogActions>
    </Dialog>
  );
};
