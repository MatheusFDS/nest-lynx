import React from 'react';
import { Grid, TextField, Button } from '@mui/material';

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
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item>
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item>
        <Button variant="contained" color="primary" onClick={fetchStatistics}>
          Filter
        </Button>
      </Grid>
    </Grid>
  );
};

export default DateFilter;
