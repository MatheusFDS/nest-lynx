'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Grid, Box, Paper } from '@mui/material';
import StatisticsChart from '../components/statistics/StatisticsChart';
import withAuth from '../hoc/withAuth';
import { fetchStatistics } from '../../services/statisticsService';

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

  const fetchAndSetStatistics = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const data = await fetchStatistics(token, startDate, endDate);
      setStatistics(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  useEffect(() => {
    fetchAndSetStatistics();
  }, [startDate, endDate]);

  const ordersData = [
    { name: 'Em Rota', value: statistics.ordersInRoute },
    { name: 'Finalizado', value: statistics.ordersFinalized },
    { name: 'Pendente', value: statistics.ordersPending },
  ];

  const freightsData = [
    { name: 'A pagar', value: statistics.freightsToPay },
    { name: 'Baixado', value: statistics.freightsPaid },
  ];

  const deliveriesByDriverData = statistics.deliveriesByDriver.map((d: any) => ({
    name: `Motorista ${d.motoristaId}`,
    value: d._count.motoristaId,
  }));

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        <Grid item xs={12} sm={6} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <StatisticsChart title="Total de Entregas" data={ordersData} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <StatisticsChart title="Fretes" data={freightsData} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <StatisticsChart title="Entregas por Motorista" data={deliveriesByDriverData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default withAuth(StatisticsPage);
