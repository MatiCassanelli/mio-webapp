import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import { Amount } from 'components/common/Amount';
import { Category, Transaction } from 'types/Transaction';
import { toLocaleAmount } from 'utils/toLocaleAmount';
import { useEffect, useState } from 'react';
import { getAllCategories } from 'services/categories';
import { blue } from '@mui/material/colors';

export const TotalCard = ({
  title,
  income,
  amount,
}: {
  title: string;
  income: boolean;
  amount: number;
}) => {
  return (
    <Card
      sx={{
        flex: 1,
        padding: 2,
        overflow: 'visible',
      }}
    >
      <Typography>{title}</Typography>
      <Amount amount={amount} income={income} variant="h5" currency="$" />
    </Card>
  );
};

const CategoryTotalCard = ({
  category,
  amount,
  onCategoryClick,
  isSelected,
}: {
  category: Category;
  amount: number;
  onCategoryClick: (category: Category) => void;
  isSelected: boolean;
}) => {
  const amountToShow = `${category.currency} ${toLocaleAmount(amount)}`;
  return (
    <Card
      sx={{
        flex: 1,
        overflow: 'visible',
        background: isSelected ? blue[50] : '',
      }}
      onClick={() => onCategoryClick(category)}
    >
      <CardActionArea>
        <CardContent>
          <Typography sx={{ color: category.color, fontSize: '0.875rem' }}>
            {category.name}
          </Typography>
          <Typography variant="h6">{amountToShow}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const getTotalAmount = (transactions: Transaction[]) => {
  return transactions.reduce(
    (accum, { amount, income }) => (income ? accum + amount : accum - amount),
    0
  );
};

export const TotalCardList = ({
  transactions,
  selectedCategory,
  setSelectedCategory,
}: {
  transactions: Transaction[];
  selectedCategory: Category | undefined;
  setSelectedCategory: (category: Category | undefined) => void;
}) => {
  const [categories, setCategories] = useState<Category[]>();
  useEffect(() => {
    const getCategories = async () => {
      const response = await getAllCategories();
      setCategories(
        (response as Category[]).sort((a, b) => b.id.localeCompare(a.id))
      );
    };
    getCategories();
  }, []);

  const incomingTransactions = transactions.filter(
    (x) => x.income && x.category.isUSDValue
  );
  const outgoingTransactions = transactions.filter(
    (x) => !x.income && x.category.isUSDValue
  );

  const onCategoryClick = (category: Category) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(undefined);
    } else {
      setSelectedCategory(category);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          padding: 0.5,
          overflow: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <TotalCard
          amount={getTotalAmount(incomingTransactions)}
          income={true}
          title="Total ingresos"
        />
        <TotalCard
          amount={getTotalAmount(outgoingTransactions)}
          income={false}
          title="Total egresos"
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          padding: 0.5,
          overflow: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {categories?.map((category) => (
          <CategoryTotalCard
            key={category.id}
            amount={getTotalAmount(
              transactions.filter((x) => x.category.id === category.id)
            )}
            category={category}
            onCategoryClick={() => onCategoryClick(category)}
            isSelected={selectedCategory?.id === category.id}
          />
        ))}
      </Box>
    </Box>
  );
};
