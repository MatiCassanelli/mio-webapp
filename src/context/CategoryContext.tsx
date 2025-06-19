import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { Category, SubCategory } from 'types/Transaction';
import { getAllCategories } from 'services/categories';

export interface CategoryContextProps {
  categories: Category[] | null;
  loading: boolean;
  onCategoryClick: (category: Category) => void;
  onSubCategoryClick: (subCategory: SubCategory | undefined) => void;
  selectedCategory?: Category;
  selectedSubCategory?: SubCategory;
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<Category | undefined>
  >;
  setSelectedSubCategory: React.Dispatch<
    React.SetStateAction<SubCategory | undefined>
  >;
}
export const CategoryContext = createContext<CategoryContextProps>({
  categories: [],
  loading: false,
  onCategoryClick: () => true,
  onSubCategoryClick: () => true,
  setSelectedCategory: () => true,
  setSelectedSubCategory: () => true,
});

const CategoryProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory>();

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      const response = await getAllCategories();
      setCategories(
        (response as Category[]).sort((a, b) => b.id.localeCompare(a.id))
      );
      setLoading(false);
    };
    getCategories();
  }, []);

  const onCategoryClick = (category: Category) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(undefined);
    } else {
      setSelectedCategory(category);
    }
  };
  const onSubCategoryClick = (subCategory: SubCategory | undefined) => {
    if (subCategory?.id === selectedSubCategory?.id) {
      setSelectedSubCategory(undefined);
    } else {
      setSelectedSubCategory(subCategory);
    }
  };

  const contextValue: CategoryContextProps = {
    categories,
    loading,
    onCategoryClick,
    onSubCategoryClick,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
  };

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryProvider;
