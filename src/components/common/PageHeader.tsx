import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Icon } from 'components/common/Icon';
import { colors } from 'theme';

interface PageHeaderProps {
  title: string;
  /** The big-figure block, below the title. */
  headline?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Period selector or another action, aligned to the right. */
  action?: React.ReactNode;
}

export const PageHeader = ({
  title,
  headline,
  subtitle,
  action,
}: PageHeaderProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 2,
      mb: 2,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 800,
          fontSize: { xs: 20, md: 26 },
          letterSpacing: '-0.6px',
        }}
      >
        {title}
      </Typography>
      {headline}
      {subtitle}
    </Box>
    {action}
  </Box>
);

interface TotalHeadlineProps {
  amount: string;
  code: string;
  trend?: number | null;
  onClick?: () => void;
}

/** Big figure + currency + variation against the previous period. */
export const TotalHeadline = ({
  amount,
  code,
  trend,
  onClick,
}: TotalHeadlineProps) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 0.625,
      mt: 0.375,
      cursor: onClick ? 'pointer' : 'inherit',
    }}
  >
    <Typography
      sx={{
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 800,
        fontSize: { xs: 24, md: 34 },
        letterSpacing: '-0.8px',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {amount}
    </Typography>
    <Typography
      sx={{
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 800,
        fontSize: { xs: 11, md: 14 },
        color: colors.outline,
      }}
    >
      {code}
    </Typography>
    {trend != null && (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.25,
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 800,
          fontSize: { xs: 11, md: 13 },
          color: trend >= 0 ? colors.secondary : colors.tertiary,
        }}
      >
        <Icon name={trend >= 0 ? 'trending_up' : 'trending_down'} size={14} />
        {`${Math.abs(trend * 100).toLocaleString('es-ar', {
          maximumFractionDigits: 1,
        })}%`}
      </Box>
    )}
  </Box>
);
