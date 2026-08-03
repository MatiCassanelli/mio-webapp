import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import dayjs from 'dayjs';
import { Icon } from 'components/common/Icon';
import { Sheet } from 'components/common/Sheet';
import {
  allTimePeriod,
  lastMonthsPeriod,
  monthPeriod,
  Period,
  yearPeriod,
} from 'utils/period';
import { colors, tokens } from 'theme';

interface PeriodSelectorProps {
  period: Period;
  onChange: (period: Period) => void;
  transactionCount: number;
  firstDate?: Date;
}

/**
 * The arrows step month by month; tapping the label opens the full list,
 * which is the way out to the full history. The chosen option stays written
 * on the control, so there's never any doubt about what's being viewed.
 */
export const PeriodSelector = ({
  period,
  onChange,
  transactionCount,
  firstDate,
}: PeriodSelectorProps) => {
  const [open, setOpen] = useState(false);
  const current = period.month ?? dayjs();

  const step = (months: number) => onChange(monthPeriod(current.add(months, 'month')));

  const options: { label: string; hint: string; value: Period }[] = [
    {
      label: dayjs().format('MMMM YYYY'),
      hint: 'este mes',
      value: monthPeriod(dayjs()),
    },
    {
      label: dayjs().subtract(1, 'month').format('MMMM YYYY'),
      hint: 'mes anterior',
      value: monthPeriod(dayjs().subtract(1, 'month')),
    },
    {
      label: 'Últimos 3 meses',
      hint: lastMonthsPeriod(3).label,
      value: lastMonthsPeriod(3),
    },
    {
      label: `Año ${dayjs().year()}`,
      hint: `ene – ${dayjs().format('MMM')}`,
      value: yearPeriod(dayjs().year()),
    },
  ];

  const select = (value: Period) => {
    onChange(value);
    setOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.25,
          bgcolor: colors.surfaceContainerLow,
          border: `1px solid ${tokens.rule}`,
          borderRadius: 2,
          px: 0.5,
          py: 0.25,
          flexShrink: 0,
        }}
      >
        <IconButton
          size="small"
          disabled={!period.month}
          onClick={() => step(-1)}
          sx={{ color: colors.outline, borderRadius: 1.5, p: 0.375 }}
        >
          <Icon name="chevron_left" size={16} />
        </IconButton>

        <Typography
          onClick={() => setOpen(true)}
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 700,
            fontSize: { xs: 12, md: 13 },
            textTransform: 'capitalize',
            minWidth: { xs: 76, md: 104 },
            textAlign: 'center',
            cursor: 'pointer',
            px: 0.5,
          }}
        >
          {period.label}
        </Typography>

        <IconButton
          size="small"
          disabled={!period.month}
          onClick={() => step(1)}
          sx={{ color: colors.outline, borderRadius: 1.5, p: 0.375 }}
        >
          <Icon name="chevron_right" size={16} />
        </IconButton>
      </Box>

      <Sheet open={open} onClose={() => setOpen(false)} title="Período" maxWidth={440}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {options.map((option, index) => {
            const selected = option.value.label === period.label;
            return (
              <Box key={option.label}>
                {index > 0 && (
                  <Box sx={{ height: '1px', bgcolor: tokens.hairline }} />
                )}
                <Box
                  onClick={() => select(option.value)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: selected ? 600 : 400,
                      color: 'text.primary',
                    }}
                  >
                    {option.label}
                  </Typography>
                  {selected ? (
                    <Icon name="check" size={20} color={colors.primary} />
                  ) : (
                    <Typography sx={{ fontSize: 11, color: colors.outline }}>
                      {option.hint}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}

          <Box sx={{ height: '1px', bgcolor: tokens.hairline }} />
          <Box
            onClick={() => select(allTimePeriod())}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
              px: 1,
              mx: -1,
              my: 0.25,
              borderRadius: 1.5,
              bgcolor: `${colors.primary}0a`,
              cursor: 'pointer',
            }}
          >
            <Box>
              <Typography
                sx={{ fontSize: 14, fontWeight: 600, color: colors.primary }}
              >
                Todo el historial
              </Typography>
              <Typography sx={{ fontSize: 11, color: colors.outline, mt: 0.25 }}>
                {firstDate
                  ? `Desde ${dayjs(firstDate).format('MMMM YYYY')} · ${transactionCount} movimientos`
                  : `${transactionCount} movimientos`}
              </Typography>
            </Box>
            {period.isAll ? (
              <Icon name="check" size={20} color={colors.primary} />
            ) : (
              <Icon name="chevron_right" size={20} color={colors.primary} />
            )}
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: colors.surfaceContainerLow,
            borderRadius: 2,
            p: 1.75,
            mt: 1.5,
            fontSize: 11,
            color: colors.onSurfaceVariant,
            lineHeight: 1.45,
          }}
        >
          El saldo de cada Cuenta no depende del período: siempre es el acumulado
          de toda tu historia. El período sólo cambia cuánto entró y cuánto salió.
        </Box>
      </Sheet>
    </>
  );
};
