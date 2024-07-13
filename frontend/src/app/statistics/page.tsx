'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Grid, Box, Paper } from '@mui/material';
import DateFilter from '../components/statistics/DateFilter';
import StatisticsChart from '../components/statistics/StatisticsChart';
import withAuth from '../components/withAuth';

const StatisticsPage = () => {
  const [statistics, setStatistics] = useState<any>({
    ordersInRoute: 0,
    ordersFinalized: 0,
    ordersPending: 0,
    freightsToPay: 0,
    freightsPaid: 0,
    deliveriesByDriver: [],
    deliveriesInRoute: 0,
    deliveriesFinalized: 0,
    notesByRegion: [],
  });
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  const fetchStatistics = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirecione para a página de login se o token não estiver presente
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/statistics?startDate=${startDate}&endDate=${endDate}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [startDate, endDate]);

  const ordersData = [
    { name: 'In Route', value: statistics.ordersInRoute },
    { name: 'Finalized', value: statistics.ordersFinalized },
    { name: 'Pending', value: statistics.ordersPending },
  ];

  const freightsData = [
    { name: 'To Pay', value: statistics.freightsToPay },
    { name: 'Paid', value: statistics.freightsPaid },
  ];

  const deliveriesByDriverData = statistics.deliveriesByDriver.map((d: any) => ({
    name: `Driver ${d.motoristaId}`,
    value: d._count.motoristaId,
  }));

  const notesByRegionData = statistics.notesByRegion.map((n: any) => ({
    name: n.cidade,
    value: n._count.cidade,
  }));

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <DateFilter
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        fetchStatistics={fetchStatistics}
      />
      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        <Grid item xs={12} sm={6} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <StatisticsChart title="Total Orders" data={ordersData} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <StatisticsChart title="Freights" data={freightsData} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <StatisticsChart title="Deliveries by Driver" data={deliveriesByDriverData} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <StatisticsChart title="Notes by Region" data={notesByRegionData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default withAuth(StatisticsPage);
