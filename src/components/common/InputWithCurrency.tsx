import {
  Box,
  TextField,
  Select,
  MenuItem,
  Tooltip,
  Typography,
  SxProps,
  Chip,
  alpha,
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
  category: Category;
  setCategory: (category: Category) => void;
  categories: Category[] | undefined;
  label?: string;
  sx?: SxProps;
}) => {
  return (
    <Box>
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
          value={category.name}
          onChange={(e) =>
            setCategory(
              categories?.find((x) => x.name === e.target.value) as Category
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
      <Box sx={{ marginTop: 1, display: 'flex', gap: 0.5 }}>
        {category?.subcategories?.map((subcategory) => (
          <Chip
            key={subcategory.id}
            label={subcategory.name}
            variant="outlined"
            clickable
            sx={{
              color: subcategory.color,
              borderColor: subcategory.color,
              background:
                category?.subcategory?.id === subcategory.id
                  ? alpha(subcategory.color, 0.2)
                  : '',
              '&.MuiChip-clickable:hover': {
                background:
                  category?.subcategory?.id === subcategory.id ? alpha(subcategory.color, 0.2) : '',
              },
            }}
            onClick={() => setCategory({ ...category, subcategory })}
          />
        ))}
      </Box>
    </Box>
  );
};
