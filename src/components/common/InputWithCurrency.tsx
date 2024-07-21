import {
  Box,
  TextField,
  Select,
  MenuItem,
  Tooltip,
  Typography,
  SxProps,
} from '@mui/material';
import { Category } from 'types/Transaction';

export const InputWithCurrency = ({
  loading,
  amount,
  setAmount,
  category,
  setCategory,
  categories,
  label,
  sx,
}: {
  loading: boolean;
  amount: number;
  setAmount: (amount: number) => void;
  category: string;
  setCategory: (category: string) => void;
  categories: Category[] | undefined;
  label?: string;
  sx?: SxProps;
}) => {
  return (
    <Box sx={{ display: 'flex', ...sx }}>
      <TextField
        value={amount}
        type="Number"
        InputProps={{
          inputProps: { min: 0 },
        }}
        label={label ?? 'Monto'}
        sx={{
          flex: 1,
          '.MuiInputBase-root': { borderRadius: '4px 0 0 4px' },
          '& .MuiFormLabel-root': {
            width: 'fit-content',
            display: 'flex',
          },
        }}
        onChange={(e) => setAmount(Number(e.target.value))}
        disabled={loading}
      />
      <Select
        value={category}
        onChange={(e) =>
          setCategory(
            categories?.find((x) => x.name === e.target.value)?.name as string
          )
        }
        disabled={loading}
        sx={{
          marginLeft: '-1px',
          borderRadius: '0px 4px 4px 0',
          height: '56px',
        }}
      >
        {categories?.map((c) => (
          <MenuItem value={c.name} key={c.id}>
            <Tooltip title={c.name} placement="right">
              <Typography>{c.currency}</Typography>
            </Tooltip>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
