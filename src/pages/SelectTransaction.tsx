import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import { ROUTES } from 'lib';
import { colors } from 'theme';

const OPTIONS = [
  {
    id: 'movement',
    title: 'Nuevo Movimiento',
    description:
      'Registra ingresos o egresos simples. Mantené el flujo de caja bajo control con etiquetas y categorías.',
    icon: 'account_balance',
    iconBgColor: colors.primaryFixed,
    tags: [
      {
        label: 'Ingresos',
        bgcolor: colors.secondaryFixed,
        color: colors.onSecondaryContainer,
      },
      {
        label: 'Gastos',
        bgcolor: colors.tertiaryFixed,
        color: colors.onTertiaryFixed,
      },
    ],
    path: ROUTES.TRANSACTIONS_NEW,
  },
  {
    id: 'exchange',
    title: 'Compra / Venta',
    description:
      'Registrá un intercambio entre monedas o activos. Generá dos movimientos vinculados con la cotización.',
    icon: 'currency_exchange',
    iconBgColor: colors.primaryFixed,
    tags: [
      {
        label: 'Doble entrada',
        bgcolor: colors.surfaceContainerHigh,
        color: colors.onSurfaceVariant,
      },
      {
        label: 'Multi-moneda',
        bgcolor: colors.primaryFixed,
        color: colors.onPrimaryFixedVariant,
      },
    ],
    path: ROUTES.TRANSACTIONS_EXCHANGE,
  },
];

export const SelectTransaction = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        px: 4,
        p: { xs: 4, md: 8 },
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 560 }}>
        <Typography
          variant="h3"
          sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 800, mb: 2 }}
        >
          ¿Qué querés registrar?
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 16 }}>
          Seleccioná el tipo de operación para mantener tus finanzas
          organizadas.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ width: '100%', maxWidth: 720 }}>
        {OPTIONS.map((option) => (
          <Grid key={option.id} size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                bgcolor: colors.surfaceContainerLowest,
                borderRadius: 4,
                border: `1px solid ${colors.outlineVariant}33`,
                transition: 'all 0.3s',
                '&:hover': {
                  border: `1px solid ${colors.primary}4d`,
                  boxShadow: '0 8px 24px rgba(0,63,177,0.12)',
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(option.path)}
                sx={{ p: 4, height: '100%' }}
              >
                <CardContent
                  sx={{
                    p: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      bgcolor: option.iconBgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 28, color: colors.primary }}
                    >
                      {option.icon}
                    </span>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Manrope", sans-serif',
                      fontWeight: 700,
                      mb: 1.5,
                    }}
                  >
                    {option.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: 14,
                      lineHeight: 1.6,
                      mb: 3,
                      flex: 1,
                    }}
                  >
                    {option.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {option.tags.map((tag) => (
                      <Chip
                        key={tag.label}
                        label={tag.label}
                        size="small"
                        sx={{
                          bgcolor: tag.bgcolor,
                          color: tag.color,
                          fontWeight: 700,
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          height: 24,
                          borderRadius: 12,
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
