import { IconButton, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export const INTERNAL_TRANSACTION_HELP_TEXT = `Un movimiento interno es una transferencia entre tus propias cuentas o billeteras. 
  No representa un ingreso o egreso real de dinero, sino un movimiento interno de tus fondos.`;

export const HelpIconWithTooltip = ({ title }: { title: string }) => {
  return (
    <Tooltip title={title}>
      <IconButton size="small" sx={{ padding: 0 }}>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
