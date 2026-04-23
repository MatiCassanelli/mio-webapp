import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { FirestoreError, Timestamp } from 'firebase/firestore';
import { UserContext } from 'context/UserContext';
import { Category, emptyCategory } from 'types/Transaction';
import { getAllCategories } from 'services/categories';
import { buySellTransaction } from 'services/transactions';
import { ROUTES } from 'lib';
import { colors } from 'theme';
import { CategorySelector } from 'components/form/CategorySelector';
import { AmountInput, parseAmount } from 'components/form/AmountInput';
import { SectionLabel } from 'components/form/SectionLabel';
import { Icon } from 'components/common/Icon';
import { primaryButtonSx } from 'utils/buttonStyles';

/** Returns true if both category+sub combos represent the same "account". */
const isSameAccount = (a: Category, b: Category): boolean => {
  if (!a.id || !b.id || a.id !== b.id) return false;
  if (!a.subcategories?.length) return true;
  if (!a.subcategory || !b.subcategory) return false;
  return a.subcategory.id === b.subcategory.id;
};

export const CurrencyExchange = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [categories, setCategories] = useState<Category[]>([]);
  const [sellAmount, setSellAmount] = useState('');
  const [sellCategory, setSellCategory] = useState<Category>(emptyCategory);
  const [buyAmount, setBuyAmount] = useState('');
  const [buyCategory, setBuyCategory] = useState<Category>(emptyCategory);
  const [rate, setRate] = useState('');
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        setCategories(res as Category[]);
      } catch (err) {
        setError((err as FirestoreError).message);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (sellCategory.id && buyCategory.id) {
      const sellLabel = sellCategory.subcategory
        ? `${sellCategory.name} (${sellCategory.subcategory.name})`
        : sellCategory.name;
      const buyLabel = buyCategory.subcategory
        ? `${buyCategory.name} (${buyCategory.subcategory.name})`
        : buyCategory.name;
      setDescription(
        `De ${sellLabel} a ${buyLabel}${rate ? `. Cotización: ${rate}` : ''}.`,
      );
    }
  }, [sellCategory, buyCategory, rate]);

  const isValid =
    !!sellAmount &&
    parseAmount(sellAmount) > 0 &&
    !!buyAmount &&
    parseAmount(buyAmount) > 0 &&
    !!sellCategory.id &&
    !!buyCategory.id &&
    !isSameAccount(sellCategory, buyCategory) &&
    !(sellCategory.subcategories?.length && !sellCategory.subcategory) &&
    !(buyCategory.subcategories?.length && !buyCategory.subcategory) &&
    !!description;

  const handleSwap = () => {
    const tmpAmt = sellAmount;
    const tmpCat = sellCategory;
    setSellAmount(buyAmount);
    setSellCategory(buyCategory);
    setBuyAmount(tmpAmt);
    setBuyCategory(tmpCat);
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    const base = {
      date: Timestamp.fromDate(date.toDate()),
      description,
      userId: user?.uid,
      saving: false,
    };
    try {
      await buySellTransaction(
        {
          amount: parseAmount(buyAmount),
          category: buyCategory,
          income: true,
          ...base,
        },
        {
          amount: parseAmount(sellAmount),
          category: sellCategory,
          income: false,
          ...base,
        },
      );
      navigate(ROUTES.TRANSACTIONS);
    } catch (err) {
      setError((err as FirestoreError).message);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, lg: 5 }, maxWidth: 1152, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            mb: 0.5,
          }}
        >
          Compra / Venta
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
          Registrá un intercambio entre monedas o activos. Se crean dos
          movimientos vinculados.
        </Typography>
      </Box>

      {error && (
        <Typography sx={{ color: 'error.main', mb: 3, fontSize: 14 }}>
          {error}
        </Typography>
      )}

      <Paper
        elevation={0}
        sx={{
          bgcolor: colors.surfaceContainerLowest,
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          boxShadow: '0 12px 32px -4px rgba(11,28,48,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -32,
            right: -32,
            width: 128,
            height: 128,
            bgcolor: `${colors.primary}0d`,
            borderBottomLeftRadius: '100px',
          }}
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* ── Sell leg ── */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
                pb: 1.5,
                borderBottom: `1px solid ${colors.outlineVariant}22`,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: alpha(colors.tertiary, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="trending_down" size={16} color={colors.tertiary} />
              </Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.tertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                Vendés / Salida
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <SectionLabel>Monto</SectionLabel>
              <AmountInput
                value={sellAmount}
                onChange={setSellAmount}
                disabled={loading}
                fontSize={24}
                py={1.25}
              />
            </Box>

            <SectionLabel>Categoría</SectionLabel>
            <CategorySelector
              categories={categories}
              selectedCategoryId={sellCategory.id}
              selectedSubcategoryId={sellCategory.subcategory?.id}
              disabled={loading}
              onCategorySelect={setSellCategory}
              onSubcategorySelect={(subId) => {
                const sub = sellCategory.subcategories?.find(
                  (s) => s.id === subId,
                );
                if (sub) setSellCategory({ ...sellCategory, subcategory: sub });
              }}
              getCategoryDisabled={(cat) =>
                buyCategory.id === cat.id && !cat.subcategories?.length
              }
              getSubcategoryDisabled={(sub) =>
                buyCategory.id === sellCategory.id &&
                buyCategory.subcategory?.id === sub.id
              }
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', my: -1 }}>
            <IconButton
              onClick={handleSwap}
              sx={{
                bgcolor: colors.primaryFixed,
                color: colors.primaryContainer,
                boxShadow: 3,
                '&:hover': {
                  transform: 'scale(1.1)',
                  bgcolor: colors.primaryFixed,
                },
                transition: 'all 0.2s',
              }}
            >
              <Icon name="swap_vert" size={24} />
            </IconButton>
          </Box>

          {/* ── Buy leg ── */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
                pb: 1.5,
                borderBottom: `1px solid ${colors.outlineVariant}22`,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: alpha(colors.secondary, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="trending_up" size={16} color={colors.secondary} />
              </Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                Comprás / Entrada
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <SectionLabel>Monto</SectionLabel>
              <AmountInput
                value={buyAmount}
                onChange={setBuyAmount}
                disabled={loading}
                fontSize={24}
                py={1.25}
              />
            </Box>

            <SectionLabel>Categoría</SectionLabel>
            <CategorySelector
              categories={categories}
              selectedCategoryId={buyCategory.id}
              selectedSubcategoryId={buyCategory.subcategory?.id}
              disabled={loading}
              onCategorySelect={setBuyCategory}
              onSubcategorySelect={(subId) => {
                const sub = buyCategory.subcategories?.find(
                  (s) => s.id === subId,
                );
                if (sub) setBuyCategory({ ...buyCategory, subcategory: sub });
              }}
              getCategoryDisabled={(cat) =>
                sellCategory.id === cat.id && !cat.subcategories?.length
              }
              getSubcategoryDisabled={(sub) =>
                sellCategory.id === buyCategory.id &&
                sellCategory.subcategory?.id === sub.id
              }
            />
          </Box>

          <Grid
            container
            size={{ xs: 12, sm: 7 }}
            spacing={2}
            sx={{
              pt: 1,
              borderTop: `1px solid ${colors.outlineVariant}1a`,
            }}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <SectionLabel>Fecha</SectionLabel>
              <DatePicker
                value={date}
                onChange={(val) => val && setDate(val)}
                format="DD/MM/YYYY"
                disabled={loading}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SectionLabel>
                {sellCategory.name && buyCategory.name
                  ? `Cotización ${sellCategory.name}/${buyCategory.name}`
                  : 'Cotización'}
              </SectionLabel>
              <TextField
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="Ej: 1200"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: colors.surfaceContainerLow,
                    borderRadius: 2,
                    '& fieldset': { border: 'none' },
                    '&:focus-within fieldset': {
                      border: `2px solid ${colors.primary}33`,
                    },
                  },
                }}
              />
            </Grid>
          </Grid>

          {description && (
            <Box>
              <SectionLabel>Descripción</SectionLabel>
              <TextField
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: colors.surfaceContainerLow,
                    borderRadius: 2,
                    fontSize: 13,
                    '& fieldset': { border: 'none' },
                    '&:focus-within fieldset': {
                      border: `2px solid ${colors.primary}33`,
                    },
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: 11,
                  color: 'text.secondary',
                  mt: 0.75,
                  ml: 0.5,
                }}
              >
                Editá el texto si querés agregar más detalles
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            fullWidth
            disabled={!isValid || loading}
            onClick={handleSubmit}
            sx={primaryButtonSx({ py: 2, fontSize: 14 })}
          >
            {loading ? 'Guardando...' : 'Confirmar Intercambio'}
          </Button>
          <Button
            onClick={() => navigate(-1)}
            disabled={loading}
            sx={{
              color: colors.outline,
              fontSize: 14,
              fontWeight: 600,
              '&:hover': { color: colors.tertiary },
            }}
          >
            Cancelar y volver
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
