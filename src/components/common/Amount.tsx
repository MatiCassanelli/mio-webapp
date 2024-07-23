import { Typography, useTheme, TypographyProps } from '@mui/material';
import { toLocaleAmount } from 'utils/toLocaleAmount';

export const Amount = ({
  amount,
  income,
  currency,
  sx,
  variant = 'h6',
}: {
  amount: number;
  income: boolean;
  currency: string;
} & TypographyProps) => {
  const { palette } = useTheme();
  const correctAmount = income || amount === 0 ? amount : amount * -1;
  const amountToShow = `${currency} ${toLocaleAmount(correctAmount)}`;

  return (
    <Typography
      variant={variant}
      sx={{
        color: income ? palette.success.main : palette.error.main,
        ...sx,
      }}
    >
      {amountToShow}
    </Typography>
  );
};
