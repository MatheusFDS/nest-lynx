'use client';

import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, TextField, Button } from '@mui/material';
import { fetchDeliveries, releaseDelivery, rejectRelease } from '../../services/deliveryService';
import { Delivery, Order } from '../../types';
import withAuth from '../hoc/withAuth';
import DeliveryTable from '../components/realese/DeliveryTable';
import ReleaseDialog from '../components/realese/ReleaseDialog';
import RejectDialog from '../components/realese/RejectDialog';
import DetailsDialog from '../components/realese/DetailsDialog';
import FilterBar from '../components/realese/FilterBar';

const ReleasePage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });
  const [rejectReason, setRejectReason] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('A liberar');

  const token = localStorage.getItem('token') || '';

  const loadDeliveries = async () => {
    try {
      const deliveriesData = await fetchDeliveries(token);
      setDeliveries(deliveriesData.filter((delivery: Delivery) => delivery.status === statusFilter));
    } catch (error: unknown) {
      setError('Failed to load deliveries.');
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [statusFilter]);

  const handleReleaseDialogOpen = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setReleaseDialogOpen(true);
  };

  const handleRejectDialogOpen = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setRejectDialogOpen(true);
  };

  const handleDialogClose = () => {
    setReleaseDialogOpen(false);
    setRejectDialogOpen(false);
    setDetailsDialogOpen(false);
    setSelectedDelivery(null);
  };

  const handleDetailsDialogOpen = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDetailsDialogOpen(true);
  };

  const handleRelease = async () => {
    if (!selectedDelivery) return;

    try {
      await releaseDelivery(token, selectedDelivery.id);
      setReleaseDialogOpen(false);
      loadDeliveries();
    } catch (error: unknown) {
      setError('Failed to release delivery.');
    }
  };

  const handleReject = async () => {
    if (!selectedDelivery || !rejectReason) return;

    try {
      await rejectRelease(token, selectedDelivery.id, rejectReason);
      setRejectDialogOpen(false);
      loadDeliveries();
    } catch (error: unknown) {
      setError('Failed to reject delivery.');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prevState => ({ ...prevState, [name]: value }));
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const { startDate, endDate } = dateRange;
    if (searchTerm) {
      return (
        Object.values(delivery).some(value =>
          value ? value.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false
        ) ||
        delivery.orders.some(order =>
          Object.values(order).some(value =>
            value ? value.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false
          )
        )
      );
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dataInicio = new Date(delivery.dataInicio);
      return dataInicio >= start && dataInicio <= end;
    }
    return true;
  });

  return (
    <Container style={{ marginTop: '24px' }}>
      {error && <Typography color="error">{error}</Typography>}
      <FilterBar
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        dateRange={dateRange}
        handleDateFilter={handleDateFilter}
        setStatusFilter={setStatusFilter}
      />
      <DeliveryTable
        deliveries={filteredDeliveries}
        handleDetailsDialogOpen={handleDetailsDialogOpen}
        handleReleaseDialogOpen={handleReleaseDialogOpen}
        handleRejectDialogOpen={handleRejectDialogOpen}
      />
      {selectedDelivery && (
        <>
          <ReleaseDialog
            open={releaseDialogOpen}
            onClose={handleDialogClose}
            delivery={selectedDelivery}
            onRelease={handleRelease}
          />
          <RejectDialog
            open={rejectDialogOpen}
            onClose={handleDialogClose}
            delivery={selectedDelivery}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            onReject={handleReject}
          />
          <DetailsDialog
            open={detailsDialogOpen}
            onClose={handleDialogClose}
            delivery={selectedDelivery}
          />
        </>
      )}
    </Container>
  );
};

export default withAuth(ReleasePage);
