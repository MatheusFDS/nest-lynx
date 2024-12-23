// src/pages/StatisticsPage.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Grid, Box, Paper } from '@mui/material';
import StatisticsPieChart from '../components/statistics/StatisticsPieChart';
import StatisticsBarChart from '../components/statistics/StatisticsBarChart';
import withAuth from '../hoc/withAuth';
import { fetchStatistics } from '../../services/statisticsService';
import DateFilter from '../components/statistics/DateFilter';
import { useLoading } from '../context/LoadingContext'; // Importe o hook de carregamento
import SkeletonLoader from '../components/SkeletonLoader'; // Importe o SkeletonLoader

interface Statistics {
  ordersInRoute: number;
  ordersFinalized: number;
  ordersPending: number;
  freightsToPay: number;
  freightsPaid: number;
  deliveriesByDriver: { motoristaId: string; _count: { motoristaId: number } }[];
  deliveriesInRoute: number;
  deliveriesFinalized: number;
  notesByRegion: { region: string; count: number }[];
  avgOrdersPerDriver: { driverId: string; average: number }[];
  avgValueNotesPerDriver: { driverId: string; average: number }[];
  avgWeightPerDriver: { driverId: string; average: number }[];
}

interface Driver {
  id: string;
  name: string;
}

const StatisticsPage: React.FC = () => {
  const { setLoading, isLoading } = useLoading(); // Use o hook de carregamento
  const [statistics, setStatistics] = useState<Statistics>({
    ordersInRoute: 0,
    ordersFinalized: 0,
    ordersPending: 0,
    freightsToPay: 0,
    freightsPaid: 0,
    deliveriesByDriver: [],
    deliveriesInRoute: 0,
    deliveriesFinalized: 0,
    notesByRegion: [],
    avgOrdersPerDriver: [],
    avgValueNotesPerDriver: [],
    avgWeightPerDriver: [],
  });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  const fetchAndSetStatistics = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      const data = await fetchStatistics(token, startDate, endDate);
      setStatistics(data);
      setDrivers(data.drivers);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetStatistics();
  }, [startDate, endDate]);

  const deliveriesByDriverData = useMemo(
    () => statistics.deliveriesByDriver.map((d) => {
      const driver = drivers.find(driver => driver.id === d.motoristaId);
      return {
        name: driver ? driver.name : `Motorista ${d.motoristaId}`,
        value: d._count.motoristaId,
      };
    }),
    [statistics.deliveriesByDriver, drivers]
  );

  const regionData = useMemo(
    () => statistics.notesByRegion.map((region) => ({
      name: region.region,
      value: region.count,
    })),
    [statistics.notesByRegion]
  );

  const avgOrdersPerDriverData = useMemo(
    () => statistics.avgOrdersPerDriver.map(d => {
      const driver = drivers.find(driver => driver.id === d.driverId);
      return {
        name: driver ? driver.name : `Motorista ${d.driverId}`,
        value: d.average,
      };
    }),
    [statistics.avgOrdersPerDriver, drivers]
  );

  const avgValueNotesPerDriverData = useMemo(
    () => statistics.avgValueNotesPerDriver.map(d => {
      const driver = drivers.find(driver => driver.id === d.driverId);
      return {
        name: driver ? driver.name : `Motorista ${d.driverId}`,
        value: d.average,
      };
    }),
    [statistics.avgValueNotesPerDriver, drivers]
  );

  const avgWeightPerDriverData = useMemo(
    () => statistics.avgWeightPerDriver.map(d => {
      const driver = drivers.find(driver => driver.id === d.driverId);
      return {
        name: driver ? driver.name : `Motorista ${d.driverId}`,
        value: d.average,
      };
    }),
    [statistics.avgWeightPerDriver, drivers]
  );

  const paymentData = useMemo(
    () => [
      { name: 'A pagar', value: statistics.freightsToPay },
      { name: 'Baixado', value: statistics.freightsPaid },
    ],
    [statistics.freightsToPay, statistics.freightsPaid]
  );

  const ordersStatusData = useMemo(
    () => [
      { name: 'Em Rota', value: statistics.ordersInRoute },
      { name: 'Finalizado', value: statistics.ordersFinalized },
      { name: 'Pendente', value: statistics.ordersPending },
      { name: 'A liberar', value: statistics.ordersInRoute },
    ],
    [statistics.ordersInRoute, statistics.ordersFinalized, statistics.ordersPending]
  );

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <DateFilter
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        fetchStatistics={fetchAndSetStatistics}
      />
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <Grid container spacing={3} sx={{ marginTop: 2 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <StatisticsPieChart title="Entregas por Motorista" data={deliveriesByDriverData} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <StatisticsPieChart title="Entregas por Região" data={regionData} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <StatisticsPieChart title="Pagamentos" data={paymentData} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <StatisticsPieChart title="Status dos Pedidos" data={ordersStatusData} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <StatisticsBarChart title="Média de Pedidos por Motorista" data={avgOrdersPerDriverData} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <StatisticsBarChart title="Média de Valor de Notas por Motorista" data={avgValueNotesPerDriverData} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <StatisticsBarChart title="Média de Peso por Motorista" data={avgWeightPerDriverData} />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default withAuth(StatisticsPage);
