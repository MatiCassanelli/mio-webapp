import { useTheme } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
} from 'recharts';
import { MonthlyTotal } from 'types/Dashboard';

export const MonthlyTotalsBarChart = ({
  monthlyData,
}: {
  monthlyData: MonthlyTotal[];
}) => {
  const { palette } = useTheme();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={monthlyData}
        margin={{ top: 0, left: -16, right: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        {/* <Legend /> */}
        <Bar
          dataKey="incomingTotal"
          fill={palette.success.main}
          name="Ingresos"
          stackId="stack"
        />
        <Bar
          dataKey="outgoingTotal"
          fill={palette.error.main}
          name="Egresos"
          stackId="stack"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
