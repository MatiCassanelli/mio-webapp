import { Grid, Typography } from '@mui/material';
import {
  CategoryContainerBox,
  CategoryTotalCard,
  SubCategoryTotalCard,
} from 'components/category/CategoryTotalCard';
import { CategoryContext } from 'context/CategoryContext';
import { UserContext } from 'context/UserContext';
import { FirestoreError } from 'firebase/firestore';
import { Loading } from 'pages/Loading';
import { useContext, useState, useEffect } from 'react';
import { getAllTotals } from 'services/dashboard';
import { CategoryTotal } from 'types/Dashboard';

export const CategoryTotals = ({ year }: { year: number }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryData, setCategoryData] = useState<CategoryTotal[]>([]);
  const { categories, selectedCategory, onCategoryClick } =
    useContext(CategoryContext);

  useEffect(() => {
    const fetchAllTotals = async () => {
      setLoading(true);
      if (user?.uid) {
        try {
          const categoryTotals = await getAllTotals({
            userId: user.uid,
            year,
          });
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

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <Typography sx={{ wordWrap: 'break-word' }}>{error}</Typography>;
  }

  return (
    <Grid item xs={3} sx={{ marginBottom: 4 }}>
      <CategoryContainerBox>
        {categories?.map((category) => {
          const categoryTotal = categoryData?.find(
            (x) => x.category.id === category.id
          );
          return categoryTotal?.total ? (
            <CategoryTotalCard
              key={category.id}
              amount={categoryTotal?.total || 0}
              category={category}
              onCategoryClick={() => onCategoryClick(category)}
              isSelected={selectedCategory?.id === category.id}
            />
          ) : null;
        })}
      </CategoryContainerBox>
      <CategoryContainerBox>
        {selectedCategory?.subcategories?.map((subCategory) => {
          const categoryTotal = categoryData?.find(
            (x) => x.category.id === selectedCategory.id
          );
          const subCategoryTotal = categoryTotal?.subcategories.find(
            (x) => x.subcategory.id === subCategory.id
          );
          return (
            <SubCategoryTotalCard
              key={subCategory.id}
              amount={subCategoryTotal?.total || 0}
              category={selectedCategory}
              subCategory={subCategory}
            />
          );
        })}
      </CategoryContainerBox>
    </Grid>
  );
};
