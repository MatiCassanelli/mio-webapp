import { useState } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import dayjs, { Dayjs } from 'dayjs';
import { colors } from 'theme';

interface MonthNavigatorProps {
  onMonthChange: (date: Dayjs) => void;
}

export const MonthNavigator = ({ onMonthChange }: MonthNavigatorProps) => {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());

  const handlePrev = () => {
    const newMonth = selectedMonth.subtract(1, 'month');
    setSelectedMonth(newMonth);
    onMonthChange(newMonth);
  };

  const handleNext = () => {
    const newMonth = selectedMonth.add(1, 'month');
    setSelectedMonth(newMonth);
    onMonthChange(newMonth);
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.25,
        bgcolor: colors.surfaceContainerLow,
        border: `1px solid ${colors.outlineVariant}66`,
        borderRadius: 2,
        px: 0.5,
        py: 0.25,
        mt: 1,
      }}
    >
      <IconButton
        size="small"
        onClick={handlePrev}
        sx={{
          color: colors.outline,
          borderRadius: 1.5,
          '&:hover': {
            bgcolor: colors.surfaceContainer,
            color: 'text.primary',
          },
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          chevron_left
        </span>
      </IconButton>

      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 700,
          fontFamily: '"Manrope", sans-serif',
          textTransform: 'capitalize',
          color: 'text.primary',
          minWidth: 96,
          textAlign: 'center',
          letterSpacing: '-0.1px',
        }}
      >
        {selectedMonth.format('MMMM YYYY')}
      </Typography>

      <IconButton
        size="small"
        onClick={handleNext}
        sx={{
          color: colors.outline,
          borderRadius: 1.5,
          '&:hover': {
            bgcolor: colors.surfaceContainer,
            color: 'text.primary',
          },
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          chevron_right
        </span>
      </IconButton>
    </Box>
  );
};

interface MonthSelectorProps {
  year: number;
  setYear: (year: number) => void;
}

export const MonthSelector = ({ year, setYear }: MonthSelectorProps) => {
  const currentYear = new Date().getFullYear();
  return (
    <Select
      value={year}
      onChange={(e) => setYear(e.target.value as number)}
      size="small"
      sx={{
        bgcolor: colors.surfaceContainerLow,
        borderRadius: 2,
        fontSize: 13,
        fontWeight: 600,
        '& fieldset': { border: 'none' },
        minWidth: 110,
      }}
    >
      <MenuItem value={0}>Todos los años</MenuItem>
      <MenuItem value={currentYear}>{currentYear}</MenuItem>
      <MenuItem value={currentYear - 1}>{currentYear - 1}</MenuItem>
    </Select>
  );
};
