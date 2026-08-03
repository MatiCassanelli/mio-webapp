import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { colors } from 'theme';

interface BigAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Currency symbol of the chosen Account: "$", "U$S", "USDT". */
  prefix: string;
  color: string;
  disabled?: boolean;
  /** "queda 3.110,50" — the check that prevents loading into the wrong account. */
  hint?: string;
  size?: 'md' | 'lg';
}

export const BigAmountInput = ({
  value,
  onChange,
  prefix,
  color,
  disabled,
  hint,
  size = 'lg',
}: BigAmountInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace('.', ',');
    if (/^\d*(,\d{0,8})?$/.test(next)) onChange(next);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 1,
        bgcolor: colors.surfaceContainerLow,
        border: `2px solid ${colors.primary}33`,
        borderRadius: 2,
        px: 1.75,
        py: size === 'lg' ? 1.5 : 1.25,
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 800,
          fontSize: size === 'lg' ? 18 : 16,
          color: colors.outline,
          flexShrink: 0,
        }}
      >
        {prefix}
      </Typography>
      <TextField
        variant="standard"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="0,00"
        slotProps={{ input: { disableUnderline: true, inputMode: 'decimal' } }}
        sx={{
          flex: 1,
          minWidth: 0,
          '& input': {
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 800,
            fontSize: size === 'lg' ? 30 : 26,
            letterSpacing: '-0.8px',
            color,
            fontVariantNumeric: 'tabular-nums',
            padding: 0,
          },
        }}
      />
      {hint && (
        <Typography
          sx={{
            fontSize: 10,
            color: colors.outline,
            fontWeight: 600,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {hint}
        </Typography>
      )}
    </Box>
  );
};

export const parseAmount = (value: string): number =>
  parseFloat(value.replace(',', '.')) || 0;
