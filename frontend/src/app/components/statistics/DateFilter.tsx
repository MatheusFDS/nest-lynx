import React from 'react';
import { Grid, TextField, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    fontSize: '0.875rem', // Tamanho da fonte menor
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem', // Tamanho da fonte do label menor
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#ccc', // Cor da borda mais clara
    },
    '&:hover fieldset': {
      borderColor: '#aaa', // Cor da borda ao passar o mouse
    },
    '&.Mui-focused fieldset': {
      borderColor: '#888', // Cor da borda ao focar
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  fontSize: '0.875rem', // Tamanho da fonte menor
  backgroundColor: '#eee', // Cor de fundo mais clara
  color: '#555', // Cor do texto mais escura
  '&:hover': {
    backgroundColor: '#ddd', // Cor de fundo ao passar o mouse
  },
}));

interface DateFilterProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  fetchStatistics: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ startDate, endDate, setStartDate, setEndDate, fetchStatistics }) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item>
        <StyledTextField
          label="Data Inicial"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item>
        <StyledTextField
          label="Data Final"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item>
        <StyledButton variant="contained" onClick={fetchStatistics}>
          Filtrar
        </StyledButton>
      </Grid>
    </Grid>
  );
};

export default DateFilter;
