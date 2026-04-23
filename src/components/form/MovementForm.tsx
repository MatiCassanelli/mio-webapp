import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import { Category } from 'types/Transaction';
import { colors } from 'theme';
import { CategorySelector } from 'components/form/CategorySelector';
import { AmountInput } from 'components/form/AmountInput';
import { SectionLabel } from 'components/form/SectionLabel';
import { Icon } from 'components/common/Icon';
import { primaryButtonSx } from 'utils/buttonStyles';

interface MovementFormProps {
  income: boolean;
  onIncomeChange: (income: boolean) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  categories: Category[];
  category: Category;
  onCategorySelect: (cat: Category) => void;
  onSubcategorySelect: (subcategoryId: string) => void;
  date: Dayjs;
  onDateChange: (date: Dayjs) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  isValid: boolean;
  loading: boolean;
  error: string;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  title?: string;
  submitLabel?: string;
  onDelete?: () => Promise<void>;
}

export const MovementForm = ({
  income,
  onIncomeChange,
  amount,
  onAmountChange,
  categories,
  category,
  onCategorySelect,
  onSubcategorySelect,
  date,
  onDateChange,
  description,
  onDescriptionChange,
  isValid,
  loading,
  error,
  saving,
  onSubmit,
  onCancel,
  title,
  submitLabel = 'Guardar',
  onDelete,
}: MovementFormProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Box
      component="section"
      sx={{
        flex: 1,
        p: { xs: 2, md: 6 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 640,
          bgcolor: colors.surfaceContainerLowest,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(11,28,48,0.05)',
        }}
      >
        <Box
          sx={{
            height: 4,
            background: income ? colors.secondary : colors.tertiary,
            transition: 'background 0.3s',
          }}
        />

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          {title && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
              <Icon name="edit" size={20} color={colors.outline} />
              <Typography
                sx={{
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: '-0.3px',
                }}
              >
                {title}
              </Typography>
            </Box>
          )}

          {error && (
            <Typography sx={{ color: 'error.main', mb: 2, fontSize: 14 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
            <ToggleButtonGroup
              value={income ? 'Ingreso' : 'Egreso'}
              exclusive
              onChange={(_, val) => val && onIncomeChange(val === 'Ingreso')}
              sx={{
                bgcolor: colors.surfaceContainerLow,
                borderRadius: 3,
                p: 0.5,
                border: 'none',
                '& .MuiToggleButtonGroup-grouped': {
                  border: 'none',
                  borderRadius: '10px !important',
                  mx: 0,
                },
              }}
            >
              {(['Ingreso', 'Egreso'] as const).map((t) => (
                <ToggleButton
                  key={t}
                  value={t}
                  sx={{
                    px: 4,
                    py: 1.25,
                    fontSize: 14,
                    fontWeight: 700,
                    textTransform: 'none',
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      boxShadow: 1,
                      '&:hover': { bgcolor: 'background.paper' },
                    },
                  }}
                >
                  {t}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
          >
            <Box>
              <SectionLabel>Monto</SectionLabel>
              <AmountInput value={amount} onChange={onAmountChange} disabled={loading} />
            </Box>

            <Box>
              <SectionLabel>Categoría</SectionLabel>
              <CategorySelector
                categories={categories}
                selectedCategoryId={category.id}
                selectedSubcategoryId={category.subcategory?.id}
                onCategorySelect={onCategorySelect}
                onSubcategorySelect={onSubcategorySelect}
                disabled={loading}
              />
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <SectionLabel>Fecha</SectionLabel>
                <DatePicker
                  value={date}
                  onChange={(val) => val && onDateChange(val)}
                  format="DD/MM/YYYY"
                  disabled={loading}
                  sx={{ width: '100%' }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <SectionLabel>Descripción</SectionLabel>
                <TextField
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  fullWidth
                  disabled={loading}
                  placeholder="Ej: supermercado, Netflix…"
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

            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={!isValid || loading}
                startIcon={<Icon name="save" size={20} />}
                sx={primaryButtonSx()}
              >
                {loading ? 'Guardando...' : submitLabel}
              </Button>

              <Button
                type="button"
                onClick={onCancel}
                disabled={loading}
                sx={{
                  color: colors.outline,
                  fontSize: 14,
                  fontWeight: 600,
                  '&:hover': { color: onDelete ? 'text.primary' : colors.tertiary },
                }}
              >
                Cancelar y volver
              </Button>

              {onDelete && (
                <Box sx={{ pt: 2, borderTop: `1px solid ${colors.outlineVariant}33` }}>
                  {!confirmDelete ? (
                    <Button
                      type="button"
                      fullWidth
                      disabled={loading}
                      startIcon={<Icon name="delete" size={18} />}
                      onClick={() => setConfirmDelete(true)}
                      sx={{
                        color: colors.tertiary,
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 2,
                        '&:hover': { bgcolor: alpha(colors.tertiary, 0.08) },
                      }}
                    >
                      {saving ? 'Eliminar ahorro' : 'Eliminar movimiento'}
                    </Button>
                  ) : (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(colors.tertiary, 0.06),
                        border: `1px solid ${alpha(colors.tertiary, 0.2)}`,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 13, color: colors.tertiary, fontWeight: 600, mb: 1.5 }}
                      >
                        {saving ? '¿Eliminar este ahorro?' : '¿Eliminar este movimiento?'}{' '}
                        Esta acción no se puede deshacer.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={loading}
                          onClick={onDelete}
                          sx={{
                            bgcolor: colors.tertiary,
                            color: 'white',
                            fontWeight: 700,
                            '&:hover': { bgcolor: colors.tertiary, filter: 'brightness(0.9)' },
                          }}
                        >
                          Sí, eliminar
                        </Button>
                        <Button
                          size="small"
                          disabled={loading}
                          onClick={() => setConfirmDelete(false)}
                          sx={{ color: 'text.secondary', fontWeight: 600 }}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
