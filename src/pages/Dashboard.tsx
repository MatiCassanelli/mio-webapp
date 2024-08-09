import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  CategoryTotalCard,
  SubCategoryTotalCard,
  TotalCards,
} from 'components/category/CategoryTotalCard';
import { MonthlyTotalsBarChart } from 'components/dashboard/MonthlyTotalsBarChart';
import { UserContext } from 'context/UserContext';
import { useContext, useEffect, useState } from 'react';
import { getYearlyTotals } from 'services/dashboard';
import { CategoryTotal, MonthlyTotal } from 'types/Dashboard';
import { Loading } from './Loading';
import { FirestoreError } from 'firebase/firestore';
import { MonthSelector } from 'components/common/MonthSelector';

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

export const Dashboard = () => {
  const { breakpoints } = useTheme();
  const isMobileScreen = useMediaQuery(breakpoints.only('xs'));
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [monthlyData, setMonthlyData] = useState<MonthlyTotal[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryTotal[]>([]);
  const [incomingTotal, setIncomingTotal] = useState(0);
  const [outgoingTotal, setOutgoingTotal] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<CategoryTotal>();

  useEffect(() => {
    const fetchYearlyTotals = async () => {
      setLoading(true);
      if (user?.uid) {
        try {
          const { totalsByMonthAndYear, categoryTotals } = await getYearlyTotals(
            user.uid,
            year
          );
          setMonthlyData(totalsByMonthAndYear);
          setCategoryData(categoryTotals);
          setLoading(false);
        } catch (error) {
          console.error(error);
          setError((error as FirestoreError).message);
          setLoading(false);
        }
      }
    };

    fetchYearlyTotals();
  }, [user?.uid, year]);

  useEffect(() => {
    if (monthlyData.length) {
      const totals = getTotalsFromMonthlyData(monthlyData);
      setIncomingTotal(totals.incoming);
      setOutgoingTotal(totals.outgoing);
    }
  }, [monthlyData]);

  const onCategoryClick = (category: CategoryTotal) => {
    if (selectedCategory?.category.id === category.category.id) {
      setSelectedCategory(undefined);
    } else {
      setSelectedCategory(category);
    }
  };

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <Typography sx={{ wordWrap: 'break-word' }}>{error}</Typography>;
  }

  if (!loading && !error && !monthlyData?.length) {
    return <Typography>No se encontraron resultados</Typography>;
  }

  return (
    <Box sx={{ height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          margin: '16px 0 8px',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>
          Total de movimientos anuales (USD)
        </Typography>
        <MonthSelector year={year} setYear={setYear} />
      </Box>
      <Grid
        container
        columns={3}
        columnSpacing={2}
        sx={{ height: '60%', paddingY: 2 }}
      >
        <Grid item xs={3} sm={2}>
          <MonthlyTotalsBarChart monthlyData={monthlyData} />
        </Grid>
        <Grid item xs={3} sm={1}>
          <TotalCards
            incomingTotal={incomingTotal}
            outgoingTotal={outgoingTotal}
            sx={{ flexDirection: 'column' }}
          />
        </Grid>
      </Grid>
      <Box>
        <Typography sx={{ fontWeight: 600, margin: '16px 0 8px' }}>
          Total acumulado por categoría
        </Typography>
        <Box
          sx={(theme) => ({
            display: 'grid',
            [theme.breakpoints.up('sm')]: {
              display: 'flex',
            },
            gap: 1,
            padding: 0.5,
            overflow: 'auto',
            whiteSpace: 'nowrap',
          })}
        >
          {categoryData.map((categoryTotal) => (
            <>
              <CategoryTotalCard
                key={categoryTotal.category.id}
                amount={categoryTotal.total}
                category={categoryTotal.category}
                onCategoryClick={() => onCategoryClick(categoryTotal)}
              />
              {isMobileScreen &&
                selectedCategory?.category.id === categoryTotal.category.id && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      paddingY: 0.5,
                      paddingX: 1,
                      overflow: 'auto',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {selectedCategory?.subcategories?.map(
                      (subcategoryTotal) => (
                        <SubCategoryTotalCard
                          key={subcategoryTotal.subcategory.id}
                          amount={subcategoryTotal.total}
                          category={selectedCategory.category}
                          subCategory={subcategoryTotal.subcategory}
                        />
                      )
                    )}
                  </Box>
                )}
            </>
          ))}
        </Box>
        {!isMobileScreen && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              paddingY: 0.5,
              paddingX: 1,
              overflow: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedCategory?.subcategories?.map((subcategoryTotal) => (
              <SubCategoryTotalCard
                key={subcategoryTotal.subcategory.id}
                amount={subcategoryTotal.total}
                category={selectedCategory.category}
                subCategory={subcategoryTotal.subcategory}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
