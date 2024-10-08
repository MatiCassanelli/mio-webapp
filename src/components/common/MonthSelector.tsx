import { useEffect, useState } from 'react';
import { Tabs, Tab, Box, MenuItem, Select } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

const TABS = 3;

export const MonthTabs = ({
  onMonthChange,
}: {
  onMonthChange: (date: Dayjs) => void;
}) => {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [months, setMonths] = useState<Dayjs[]>([]);

  useEffect(() => {
    updateMonthArray(selectedMonth);
  }, [selectedMonth]);

  const updateMonthArray = (centerMonth: Dayjs) => {
    const newMonths: Dayjs[] = [];
    for (let i = -TABS; i <= TABS; i++) {
      newMonths.push(dayjs(centerMonth).add(i, 'month'));
    }
    setMonths(newMonths);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedMonth(months[newValue]);
    onMonthChange(months[newValue]);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Tabs
        value={TABS}
        onChange={handleChange}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="month selector"
        sx={{
          '.MuiTabs-scrollButtons.Mui-disabled': {
            opacity: 0.3,
          },
        }}
      >
        {months.map((month) => (
          <Tab
            key={`${month.get('M')}-${month.get('year')}`}
            label={month.format('MMMM YYYY')}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export const MonthSelector = ({
  year,
  setYear,
}: {
  year: number;
  setYear: (year: number) => void;
}) => {
  const currentYear = new Date().getFullYear();
  return (
    <Select
      labelId="year"
      id="year"
      value={year}
      onChange={(e) => setYear(e.target.value as number)}
      size="small"
    >
      <MenuItem value={currentYear}>{currentYear}</MenuItem>
      <MenuItem value={currentYear - 1}>{currentYear - 1}</MenuItem>
      <MenuItem value={0}>Todos</MenuItem>
    </Select>
  );
};
