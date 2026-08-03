import React from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Icon } from 'components/common/Icon';
import { colors, tokens } from 'theme';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** 4px strip on top: red for expenses, blue for everything else. */
  accent?: [string, string];
  maxWidth?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * The mobile sheet and the desktop dialog are the same piece: it rises from
 * the bottom on phones and centers on large screens, with the same field order.
 */
export const Sheet = ({
  open,
  onClose,
  title,
  accent = [colors.primary, colors.primaryContainer],
  maxWidth = 560,
  children,
  footer,
}: SheetProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            m: 0,
            width: '100%',
            maxWidth: isMobile ? '100%' : maxWidth,
            maxHeight: isMobile ? '94vh' : '90vh',
            borderRadius: isMobile ? '28px 28px 0 0' : '24px',
            boxShadow: isMobile ? tokens.sheetShadow : tokens.cardShadow,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            ...(isMobile && {
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
            }),
          },
        },
      }}
    >
      <Box
        sx={{
          height: 4,
          flexShrink: 0,
          background: `linear-gradient(to right, ${accent[0]}, ${accent[1]})`,
        }}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2.25, md: 3.25 },
          pt: { xs: 1.75, md: 2.75 },
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 800,
            fontSize: { xs: 16, md: 19 },
            letterSpacing: '-0.4px',
          }}
        >
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: colors.outline }}>
          <Icon name="close" size={20} />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: { xs: 2.25, md: 3.25 },
          pt: 1.5,
          pb: footer ? 0 : 2.5,
        }}
      >
        {children}
      </Box>

      {footer && (
        <Box
          sx={{
            flexShrink: 0,
            px: { xs: 2.25, md: 3.25 },
            py: 2,
            borderTop: `1px solid ${tokens.hairline}`,
          }}
        >
          {footer}
        </Box>
      )}
    </Dialog>
  );
};
