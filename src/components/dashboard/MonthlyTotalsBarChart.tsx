import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  Legend,
} from 'recharts';
import { MonthlyTotal } from 'types/Dashboard';
import { colors } from 'theme';
import { toLocaleAmount } from 'utils/toLocaleAmount';

interface CustomTooltipProps {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const income = payload.find((p) => p.dataKey === 'incomingTotal')?.value ?? 0;
  const expense = payload.find((p) => p.dataKey === 'outgoingTotal')?.value ?? 0;
  const balance = income - expense;
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: `1px solid ${colors.outlineVariant}44`,
        borderRadius: 2,
        p: 1.5,
        boxShadow: '0 4px 20px rgba(11,28,48,0.12)',
        minWidth: 180,
      }}
    >
      <Typography
        sx={{ fontSize: 12, fontWeight: 700, mb: 1.5, fontFamily: '"Manrope", sans-serif' }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Ingresos</Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.secondary }}>
            +{toLocaleAmount(income)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Egresos</Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.tertiary }}>
            -{toLocaleAmount(expense)}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 3,
            borderTop: `1px solid ${colors.outlineVariant}44`,
            pt: 0.75,
            mt: 0.25,
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Saldo</Typography>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: balance >= 0 ? colors.secondary : colors.tertiary,
            }}
          >
            {balance >= 0 ? '+' : ''}
            {toLocaleAmount(balance)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

interface MonthlyTotalsBarChartProps {
  monthlyData: MonthlyTotal[];
}

export const MonthlyTotalsBarChart = ({ monthlyData }: MonthlyTotalsBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={monthlyData}
        margin={{ top: 8, left: -8, right: 8, bottom: 0 }}
        barCategoryGap="30%"
        barGap={3}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={`${colors.outlineVariant}55`}
          vertical={false}
        />
        <XAxis
          dataKey="monthYear"
          tick={{ fontSize: 11, fill: colors.outline, fontFamily: '"Inter", sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: colors.outline, fontFamily: '"Inter", sans-serif' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => toLocaleAmount(v)}
          width={64}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: `${colors.surfaceContainerLow}` }} />
        <Legend
          formatter={(value) => (
            <span
              style={{
                fontSize: 12,
                fontFamily: '"Inter", sans-serif',
                color: colors.outline,
              }}
            >
              {value === 'incomingTotal' ? 'Ingresos' : 'Egresos'}
            </span>
          )}
          wrapperStyle={{ paddingTop: 12 }}
        />
        <Bar
          dataKey="incomingTotal"
          name="incomingTotal"
          fill={colors.secondary}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          dataKey="outgoingTotal"
          name="outgoingTotal"
          fill={colors.tertiary}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
