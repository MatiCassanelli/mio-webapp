import {
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  SxProps,
  Typography,
} from '@mui/material';
import { Amount } from 'components/common/Amount';
import { Category, SubCategory, Transaction } from 'types/Transaction';
import { toLocaleAmount } from 'utils/toLocaleAmount';
import { useContext } from 'react';
import { getTotalAmount } from 'utils/getTotalAmount';
import { CategoryContext } from 'context/CategoryContext';

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

export const CategoryTotalCard = ({
  category,
  amount,
  onCategoryClick,
  isSelected,
}: {
  category: Category;
  amount: number;
  onCategoryClick?: (category: Category) => void;
  isSelected?: boolean;
}) => {
  const amountToShow = `${category.currency} ${toLocaleAmount(amount)}`;
  return (
    <Card
      sx={{
        flex: 1,
        overflow: 'visible',
        background: isSelected ? alpha(category.color, 0.2) : '',
      }}
      onClick={() => onCategoryClick?.(category)}
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

export const SubCategoryTotalCard = ({
  category,
  amount,
  onSubCategoryClick,
  isSelected,
  subCategory,
}: {
  category: Category;
  subCategory: SubCategory;
  amount: number;
  onSubCategoryClick?: (category: SubCategory) => void;
  isSelected?: boolean;
}) => {
  const amountToShow = `${category.currency} ${toLocaleAmount(amount)}`;
  return (
    <Card
      sx={{
        flex: 1,
        overflow: 'visible',
        background: isSelected ? alpha(subCategory.color, 0.2) : '',
      }}
      onClick={() => onSubCategoryClick?.(subCategory)}
    >
      <CardActionArea>
        <CardContent>
          <Typography sx={{ color: subCategory.color, fontSize: '0.875rem' }}>
            {subCategory.name}
          </Typography>
          <Typography variant="h6">{amountToShow}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export const TotalCards = ({
  incomingTotal,
  outgoingTotal,
  sx,
}: {
  incomingTotal: number;
  outgoingTotal: number;
  sx?: SxProps;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        padding: 0.5,
        overflow: 'auto',
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      <TotalCard amount={incomingTotal} income={true} title="Total ingresos" />
      <TotalCard amount={outgoingTotal} income={false} title="Total egresos" />
    </Box>
  );
};

export const CategoriesTotalList = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const {
    categories,
    onCategoryClick,
    onSubCategoryClick,
    selectedCategory,
    selectedSubCategory,
  } = useContext(CategoryContext);

  return (
    <Box>
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
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          padding: 0.5,
          overflow: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {selectedCategory?.subcategories?.map((subcategory) => (
          <SubCategoryTotalCard
            key={subcategory.id}
            amount={getTotalAmount(
              transactions.filter(
                (x) => x.category.subcategory?.id === subcategory.id
              )
            )}
            category={selectedCategory}
            subCategory={subcategory}
            onSubCategoryClick={() => onSubCategoryClick(subcategory)}
            isSelected={selectedSubCategory?.id === subcategory.id}
          />
        ))}
      </Box>
    </Box>
  );
};
