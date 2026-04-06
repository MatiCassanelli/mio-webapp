import {
  lazy,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { TotalCards } from 'components/dashboard/TotalCards';
import { colors } from 'theme';
import { MonthlyTotal } from 'types/Dashboard';
import { CategoryContext } from 'context/CategoryContext';
import { UserContext } from 'context/UserContext';
import { getMonthlyTotalsByCategory } from 'services/dashboard';
import { FirestoreError } from 'firebase/firestore';
import { Loading } from 'pages/Loading';

const MonthlyTotalsBarChart = lazy(() =>
  import('./MonthlyTotalsBarChart').then((m) => ({
    default: m.MonthlyTotalsBarChart,
  })),
);

const getTotalsFromMonthlyData = (monthlyData: MonthlyTotal[]) =>
  monthlyData.reduce(
    (acc, current) => {
      acc.incoming += current.incomingTotal;
      acc.outgoing += current.outgoingTotal;
      return acc;
    },
    { incoming: 0, outgoing: 0 },
  );

const EMPTY_PLACEHOLDER = (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 280,
      gap: 1.5,
      opacity: 0.6,
    }}
  >
    <Box
      sx={{
        p: 2,
        bgcolor: colors.surfaceContainerLow,
        borderRadius: '50%',
        display: 'flex',
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 32, color: colors.outline, display: 'block' }}
      >
        bar_chart
      </span>
    </Box>
    <Typography
      sx={{ fontSize: 14, color: 'text.secondary', textAlign: 'center' }}
    >
      Seleccioná una categoría
      <br />
      para ver el desglose mensual
    </Typography>
  </Box>
);

export const MonthlyTotals = ({ year }: { year: number }) => {
  const { breakpoints } = useTheme();
  const isMobileScreen = useMediaQuery(breakpoints.only('xs'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [monthlyData, setMonthlyData] = useState<MonthlyTotal[]>([]);

  const { user } = useContext(UserContext);
  const { selectedCategory } = useContext(CategoryContext);

  const { incoming: incomingTotal, outgoing: outgoingTotal } = useMemo(
    () =>
      monthlyData.length
        ? getTotalsFromMonthlyData(monthlyData)
        : { incoming: 0, outgoing: 0 },
    [monthlyData],
  );

  useEffect(() => {
    const fetchMonthlyTotals = async () => {
      if (user?.uid && selectedCategory) {
        setLoading(true);
        try {
          const data = await getMonthlyTotalsByCategory({
            userId: user.uid,
            year,
            category: selectedCategory.id,
          });
          setMonthlyData(data);
          setLoading(false);
        } catch (err) {
          console.error(err);
          const fireErr = err as FirestoreError;
          setError(`${fireErr.name} (${fireErr.code}): ${fireErr.message}`);
          setLoading(false);
        }
      }
    };

    fetchMonthlyTotals();
  }, [selectedCategory, user?.uid, year]);

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <Typography sx={{ wordWrap: 'break-word' }}>{error}</Typography>;
  }

  return (
    <Box sx={{ minWidth: 0, minHeight: 300 }}>
      {selectedCategory ? (
        <>
          {monthlyData.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobileScreen ? 'column' : 'row',
                gap: 2,
                height: '100%',
              }}
            >
              <Box sx={{ flex: 2 }}>
                <Suspense fallback={<Loading />}>
                  <MonthlyTotalsBarChart monthlyData={monthlyData.slice(-12)} />
                </Suspense>
              </Box>
              <Box sx={{ flex: 1 }}>
                <TotalCards
                  incomingTotal={incomingTotal}
                  outgoingTotal={outgoingTotal}
                  balance={incomingTotal - outgoingTotal}
                />
              </Box>
            </Box>
          )}
        </>
      ) : (
        EMPTY_PLACEHOLDER
      )}
    </Box>
  );
};
