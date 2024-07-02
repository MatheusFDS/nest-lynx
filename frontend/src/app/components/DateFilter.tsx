import React from 'react';
import { TextField, Button, Grid, Paper, Typography } from '@mui/material';

interface DateFilterProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  fetchStatistics: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ startDate, endDate, setStartDate, setEndDate, fetchStatistics }) => {
  return (
    <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
      <Typography variant="h6" gutterBottom>Filter by Date</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button variant="contained" color="primary" onClick={fetchStatistics} fullWidth>
            Fetch Statistics
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DateFilter;
