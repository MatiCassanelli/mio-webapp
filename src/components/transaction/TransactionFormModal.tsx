import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { Category, emptyCategory, Transaction } from 'types/Transaction';
import { getAllCategories } from 'services/categories';
import { FirestoreError, Timestamp } from 'firebase/firestore';
import {
  createTransaction,
  deleteTransaction,
  editTransaction,
} from 'services/transactions';
import { UserContext } from 'context/UserContext';
import { ButtonWithSpinner } from 'components/common/ButtonWithSpinner';
import { InputWithCurrency } from 'components/common/InputWithCurrency';
import {
  HelpIconWithTooltip,
  INTERNAL_TRANSACTION_HELP_TEXT,
} from 'components/common/HelpIconWithTooltip';

export interface EditDeploymentPlanNameModalProps {
  open: boolean;
  onClose: () => void;
  existingTransaction?: Transaction;
  saving?: boolean;
}

export const TransactionFormModal = ({
  open,
  onClose,
  existingTransaction,
  saving,
}: EditDeploymentPlanNameModalProps) => {
  const { user } = useContext(UserContext);
  const [amount, setAmount] = useState<number>(
    existingTransaction?.amount ?? 0
  );
  const [income, setIncome] = useState(!!existingTransaction?.income);
  const [categories, setCategories] = useState<Category[]>();
  const [category, setCategory] = useState<Category>(
    existingTransaction?.category ?? emptyCategory
  );
  const [date, setDate] = useState<Dayjs>(
    dayjs(existingTransaction?.date.toDate()) ?? dayjs()
  );
  const [description, setDescription] = useState<string>(
    existingTransaction?.description ?? ''
  );
  const [isInternal, setIsInternal] = useState<boolean>(
    existingTransaction?.isInternal ?? false
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      const response = await getAllCategories();
      setCategories(response as Category[]);
    };
    getCategories();
  }, []);

  const onSave = async () => {
    setLoading(true);
    const newTransaction: Transaction = {
      amount,
      category,
      income,
      date: Timestamp.fromDate(date.toDate()),
      description,
      userId: user?.uid,
      saving: !!saving,
      isInternal,
    };
    try {
      if (!!existingTransaction) {
        await editTransaction({
          ...newTransaction,
          id: existingTransaction.id,
        });
      } else {
        await createTransaction(newTransaction);
      }
      onClose();
    } catch (error) {
      setError((error as FirestoreError).message);
    }
    setLoading(false);
  };

  const onDeleteClick = async () => {
    setLoading(true);
    try {
      await deleteTransaction(existingTransaction?.id as string);
      onClose();
    } catch (error) {
      setError((error as FirestoreError).message);
    }
    setLoading(false);
  };

  const getModalTitle = () => {
    const action = existingTransaction ? 'Editar' : 'Nuevo';
    return `${action} ${saving ? 'Ahorro' : 'Movimiento'}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {error && <Typography>{error}</Typography>}
      <DialogTitle sx={{ paddingBottom: 0 }}>{getModalTitle()}</DialogTitle>
      <DialogContent className="margined" sx={{ paddingTop: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            marginBottom: 3,
          }}
        >
          <FormControlLabel
            label="Movimiento interno"
            labelPlacement="start"
            control={
              <Checkbox
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                disabled={loading}
              />
            }
            sx={{ marginLeft: 0 }}
          />
          <HelpIconWithTooltip title={INTERNAL_TRANSACTION_HELP_TEXT} />
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'start',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            rowGap: 3,
          }}
        >
          <InputWithCurrency
            categories={categories}
            category={category}
            setCategory={setCategory}
            amount={amount}
            setAmount={setAmount}
            loading={loading}
          />
          <DatePicker
            label="Fecha"
            value={date}
            onChange={(newValue) => setDate(newValue as Dayjs)}
            format="DD/MM/YYYY"
            disabled={loading}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            marginTop: 1,
            marginBottom: 2,
          }}
        >
          <Typography>Egreso</Typography>
          <Switch
            checked={income}
            onChange={() => setIncome(!income)}
            disabled={loading}
          />
          <Typography>Ingreso</Typography>
        </Box>
        <TextField
          fullWidth
          label="Descripcion"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
        {!!existingTransaction && (
          <ButtonWithSpinner
            variant="outlined"
            loading={loading}
            onClick={onDeleteClick}
            disabled={loading}
            color="error"
            sx={{ marginRight: 'auto  ' }}
          >
            Borrar
          </ButtonWithSpinner>
        )}
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <ButtonWithSpinner
          variant="contained"
          loading={loading}
          disabled={
            !amount ||
            !category.id ||
            (category.id && category.subcategories && !category.subcategory) ||
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
