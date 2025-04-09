import { Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { TotalCards } from 'components/category/CategoryTotalCard';
import { MonthlyTotalsBarChart } from './MonthlyTotalsBarChart';
import { useContext, useEffect, useState } from 'react';
import { MonthlyTotal } from 'types/Dashboard';
import { CategoryContext } from 'context/CategoryContext';
import { UserContext } from 'context/UserContext';
import { getMonthlyTotalsByCategory } from 'services/dashboard';
import { FirestoreError } from 'firebase/firestore';
import { Loading } from 'pages/Loading';

const getTotalsFromMonthlyData = (monthlyData: MonthlyTotal[]) => {
  const totals = monthlyData.reduce(
    (acc, current) => {
      acc.incoming += current.incomingTotal;
      acc.outgoing += current.outgoingTotal;
      return acc;
    },
    { incoming: 0, outgoing: 0 }
  );

  return totals;
};

export const MonthlyTotals = ({ year }: { year: number }) => {
  const { breakpoints } = useTheme();
  const isMobileScreen = useMediaQuery(breakpoints.only('xs'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [monthlyData, setMonthlyData] = useState<MonthlyTotal[]>([]);
  const [incomingTotal, setIncomingTotal] = useState(0);
  const [outgoingTotal, setOutgoingTotal] = useState(0);

  const { user } = useContext(UserContext);
  const { selectedCategory } = useContext(CategoryContext);

  useEffect(() => {
    const fetchMonthlyTotals = async () => {
      if (user?.uid && selectedCategory) {
        setLoading(true);
        try {
          const monthlyData = await getMonthlyTotalsByCategory({
            userId: user.uid,
            year,
            category: selectedCategory.id,
          });
          setMonthlyData(monthlyData);
          setLoading(false);
        } catch (err) {
          console.error(err);
          const error = err as FirestoreError;
          setError(`${error.name} (${error.code}): ${error.message}`);
          setLoading(false);
        }
      }
    };

    fetchMonthlyTotals();
  }, [selectedCategory, user?.uid, year]);

  useEffect(() => {
    if (monthlyData.length) {
      const totals = getTotalsFromMonthlyData(monthlyData);
      setIncomingTotal(totals.incoming);
      setOutgoingTotal(totals.outgoing);
    }
  }, [monthlyData]);

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <Typography sx={{ wordWrap: 'break-word' }}>{error}</Typography>;
  }

  return (
    <Grid item xs={3} container columns={3} sx={{ maxHeight: '60%' }}>
      {selectedCategory ? (
        <>
          {!loading && error && (
            <Typography sx={{ wordWrap: 'break-word' }}>{error}</Typography>
          )}
          {!loading && selectedCategory && monthlyData.length > 0 && (
            <>
              <Grid
                item
                xs={3}
                sm={2}
                sx={{ height: isMobileScreen ? '50%' : '100%' }}
              >
                <MonthlyTotalsBarChart monthlyData={monthlyData} />
              </Grid>
              <Grid item xs={3} sm={1}>
                <TotalCards
                  incomingTotal={incomingTotal}
                  outgoingTotal={outgoingTotal}
                  sx={{ flexDirection: 'column' }}
                />
              </Grid>
            </>
          )}
        </>
      ) : (
        <Typography>
          Selecciona una categoria para ver los totales por mes
        </Typography>
      )}
    </Grid>
  );
};
