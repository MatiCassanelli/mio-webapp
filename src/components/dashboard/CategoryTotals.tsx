import { useContext, useMemo, useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { CategoryContext } from 'context/CategoryContext';
import { UserContext } from 'context/UserContext';
import { FirestoreError } from 'firebase/firestore';
import { Loading } from 'pages/Loading';
import { getAllTotals } from 'services/dashboard';
import { CategoryTotal } from 'types/Dashboard';
import {
  CategoryListItem,
  SubCategoryListItem,
} from 'components/category/CategoryListItems';

export const CategoryTotals = ({ year }: { year: number }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryData, setCategoryData] = useState<CategoryTotal[]>([]);
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const { categories, selectedCategory, onCategoryClick } =
    useContext(CategoryContext);

  useEffect(() => {
    const fetchAllTotals = async () => {
      setLoading(true);
      if (user?.uid) {
        try {
          const categoryTotals = await getAllTotals({ userId: user.uid, year });
          setCategoryData(categoryTotals);
          setLoading(false);
        } catch (err) {
          console.error(err);
          const error = err as FirestoreError;
          setError(`${error.name} (${error.code}): ${error.message}`);
          setLoading(false);
        }
      }
    };
    fetchAllTotals();
  }, [user?.uid, year]);

  useEffect(() => {
    setCurrencyFilter('all');
  }, [year]);

  const categoryDataMap = useMemo(
    () =>
      new Map<string, CategoryTotal>(
        categoryData.map((x) => [x.category.id, x]),
      ),
    [categoryData],
  );

  const filteredCategories = useMemo(
    () =>
      categories?.filter((cat) => {
        const hasTotal = categoryDataMap.get(cat.id)?.total;
        if (!hasTotal) return false;
        if (currencyFilter === 'all') return true;
        return cat.currency === currencyFilter;
      }) ?? [],
    [categories, categoryDataMap, currencyFilter],
  );

  if (loading) return <Loading />;
  if (error)
    return <Typography sx={{ wordWrap: 'break-word' }}>{error}</Typography>;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {filteredCategories.map((category) => {
          const categoryTotal = categoryDataMap.get(category.id);
          const isSelected = selectedCategory?.id === category.id;
          return (
            <Box key={category.id}>
              <CategoryListItem
                category={category}
                amount={categoryTotal?.total ?? 0}
                isSelected={isSelected}
                onClick={() => onCategoryClick(category)}
              />
              {isSelected &&
                category.subcategories?.map((sub) => {
                  const subTotal = categoryTotal?.subcategories.find(
                    (s) => s.subcategory.id === sub.id,
                  );
                  return (
                    <SubCategoryListItem
                      key={sub.id}
                      subCategory={sub}
                      currency={category.currency}
                      amount={subTotal?.total ?? 0}
                    />
                  );
                })}
            </Box>
          );
        })}

        {filteredCategories.length === 0 && !loading ? (
          <Typography sx={{ fontSize: 13, color: 'text.secondary', p: 1 }}>
            Sin datos para el período seleccionado
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
};
