import TextField from '@mui/material/TextField';
import { SxProps } from '@mui/material/styles';
import { colors } from 'theme';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  fontSize?: number;
  py?: number;
  sx?: SxProps;
}

export const AmountInput = ({
  value,
  onChange,
  disabled,
  fontSize = 28,
  py = 2,
  sx,
}: AmountInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace('.', ',');
    if (/^\d*(,\d{0,2})?$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <TextField
      value={value}
      onChange={handleChange}
      placeholder="0,00"
      fullWidth
      disabled={disabled}
      slotProps={{ htmlInput: { inputMode: 'decimal' } }}
      sx={{
        '& input': {
          fontSize,
          fontWeight: 800,
          fontFamily: '"Manrope", sans-serif',
          py,
        },
        '& .MuiOutlinedInput-root': {
          bgcolor: colors.surfaceContainerLow,
          borderRadius: 3,
          '& fieldset': { border: 'none' },
          '&:focus-within fieldset': {
            border: `2px solid ${colors.primary}33`,
          },
        },
        ...sx,
      }}
    />
  );
};

/** Converts a comma-separated amount string to a number. */
export const parseAmount = (value: string): number =>
  parseFloat(value.replace(',', '.')) || 0;
