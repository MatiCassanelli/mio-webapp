import { Button, ButtonProps, CircularProgress } from '@mui/material';

export interface ButtonWithSpinnerProps {
  loading: boolean;
}

export const ButtonWithSpinner = ({
  children,
  loading,
  disabled,
  ...props
}: ButtonWithSpinnerProps & ButtonProps) => {
  return (
    <Button disabled={loading || disabled} {...props}>
      {children}
      {loading && (
        <CircularProgress size="2rem" sx={{ marginLeft: '0.5rem' }} />
      )}
    </Button>
  );
};
