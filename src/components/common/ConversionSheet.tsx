import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Sheet } from 'components/common/Sheet';
import { Icon } from 'components/common/Icon';
import { SectionLabel } from 'components/form/SectionLabel';
import { CurrencyGroup } from 'hooks/useAccountTotals';
import { updateUsdRate } from 'services/currencies';
import { USD_CODE } from 'types/Currency';
import { formatAmount, formatRate, parseRate } from 'utils/money';
import { primaryButtonSx } from 'utils/buttonStyles';
import { colors, tokens } from 'theme';

interface ConversionSheetProps {
  open: boolean;
  onClose: () => void;
  groups: CurrencyGroup[];
  totalUsd: number;
}

/**
 * Where the USD total comes from. Each currency shows its conversion
 * separately, so the total is never a magic number. The user sets the rate
 * and it stays saved: mio never looks up rates online.
 */
export const ConversionSheet = ({
  open,
  onClose,
  groups,
  totalUsd,
}: ConversionSheetProps) => {
  const [rates, setRates] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const editable = groups.filter((group) => group.currency.code !== USD_CODE);

  useEffect(() => {
    if (!open) return;
    setRates(
      Object.fromEntries(
        editable.map((group) => [
          group.currency.code,
          formatRate(group.currency.usdRate),
        ]),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        editable
          .map((group) => ({
            code: group.currency.code,
            rate: parseRate(rates[group.currency.code] ?? ''),
          }))
          .filter(({ rate }) => rate > 0)
          .map(({ code, rate }) => updateUsdRate(code, rate)),
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Cómo se calcula"
      maxWidth={460}
      footer={
        <Button
          fullWidth
          variant="contained"
          disabled={saving}
          onClick={handleSave}
          sx={primaryButtonSx({ py: 1.75, fontSize: 14 })}
        >
          {saving ? 'Guardando…' : 'Guardar cotizaciones'}
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {groups.map((group, index) => (
          <Box key={group.currency.code}>
            {index > 0 && (
              <Box sx={{ height: '1px', bgcolor: tokens.hairline, mb: 1.5 }} />
            )}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}
                >
                  {formatAmount(group.total, group.currency)} en{' '}
                  {group.currency.name.toLowerCase()}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 11,
                    color: colors.outline,
                    mt: 0.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {group.accounts.map((a) => a.account.name).join(' + ')}
                </Typography>
              </Box>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}
              >
                <Icon
                  name="arrow_forward"
                  size={16}
                  color={colors.outlineVariant}
                />
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 800,
                    fontSize: 15,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatAmount(group.totalUsd)}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: colors.surfaceContainerLow,
            borderRadius: 2.5,
            px: 1.75,
            py: 1.625,
            mt: 0.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: colors.onSurfaceVariant,
            }}
          >
            Total
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.625 }}>
            <Typography
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: '-0.5px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatAmount(totalUsd)}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 800,
                fontSize: 11,
                color: colors.outline,
              }}
            >
              USD
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <SectionLabel>Cotizaciones</SectionLabel>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {editable.map((group) => (
            <Box
              key={group.currency.code}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: colors.surfaceContainerLow,
                border: `2px solid ${colors.primary}33`,
                borderRadius: 2,
                px: 1.75,
                py: 0.75,
              }}
            >
              <TextField
                variant="standard"
                value={rates[group.currency.code] ?? ''}
                onChange={(e) =>
                  setRates((prev) => ({
                    ...prev,
                    [group.currency.code]: e.target.value,
                  }))
                }
                slotProps={{
                  input: { disableUnderline: true, inputMode: 'decimal' },
                }}
                sx={{
                  flex: 1,
                  '& input': {
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 800,
                    fontSize: 18,
                    fontVariantNumeric: 'tabular-nums',
                    py: 0.75,
                  },
                }}
              />
              <Typography
                sx={{ fontSize: 11, color: colors.outline, flexShrink: 0 }}
              >
                {group.currency.code} por dólar
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography
          sx={{ fontSize: 11, color: colors.outline, lineHeight: 1.45, mt: 1 }}
        >
          Las ponés vos y quedan guardadas hasta que las cambies. Mio no consulta
          cotizaciones online.
        </Typography>
      </Box>
    </Sheet>
  );
};
