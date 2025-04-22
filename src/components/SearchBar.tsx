import { useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ru } from "date-fns/locale";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterChange: (filters: {
    dateFrom?: Date | null;
    dateTo?: Date | null;
    source?: string;
  }) => void;
  sources: string[];
}

export const SearchBar = ({
  value,
  onChange,
  onFilterChange,
  sources,
}: SearchBarProps) => {
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [source, setSource] = useState("");

  const handleClearFilters = () => {
    setDateFrom(null);
    setDateTo(null);
    setSource("");
    onFilterChange({ dateFrom: null, dateTo: null, source: "" });
  };

  const handleDateFromChange = (date: Date | null) => {
    setDateFrom(date);
    onFilterChange({ dateFrom: date });
  };

  const handleDateToChange = (date: Date | null) => {
    setDateTo(date);
    onFilterChange({ dateTo: date });
  };

  const handleSourceChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSource(value);
    onFilterChange({ source: value });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Поиск новостей..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton onClick={() => onChange("")} edge="end">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ display: "flex", gap: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
          <DatePicker
            label="От"
            value={dateFrom}
            onChange={handleDateFromChange}
            slotProps={{ textField: { fullWidth: true } }}
          />
          <DatePicker
            label="До"
            value={dateTo}
            onChange={handleDateToChange}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>

        <FormControl fullWidth>
          <InputLabel>Источник</InputLabel>
          <Select value={source} onChange={handleSourceChange} label="Источник">
            <MenuItem value="">
              <em>Все источники</em>
            </MenuItem>
            {sources.map((source) => (
              <MenuItem key={source} value={source}>
                {source}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(dateFrom || dateTo || source) && (
          <IconButton onClick={handleClearFilters} color="primary">
            <ClearIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};
