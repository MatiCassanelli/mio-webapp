import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Icon } from 'components/common/Icon';
import { colors } from 'theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <Box sx={{ py: 6, textAlign: 'center' }}>
    <Icon name={icon} size={40} color={colors.outlineVariant} />
    <Typography sx={{ fontSize: 14, fontWeight: 600, mt: 1 }}>{title}</Typography>
    {description && (
      <Typography
        sx={{
          fontSize: 13,
          color: colors.outline,
          mt: 0.5,
          maxWidth: 340,
          mx: 'auto',
          lineHeight: 1.5,
        }}
      >
        {description}
      </Typography>
    )}
    {actionLabel && onAction && (
      <Button
        onClick={onAction}
        sx={{ mt: 2, color: colors.primary, fontWeight: 700, fontSize: 13 }}
      >
        {actionLabel}
      </Button>
    )}
  </Box>
);
