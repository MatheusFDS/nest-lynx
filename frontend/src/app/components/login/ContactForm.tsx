// components/ContactForm.tsx
'use client';

import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { getApiUrl } from '../../../services/utils/apiUtils';

const ContactForm: React.FC = () => {
  const [contactForm, setContactForm] = useState({
    email: '',
    subject: '',
    message: '',
  });
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, subject, message } = contactForm;

    if (!email || !subject || !message) {
      setContactError('Todos os campos são obrigatórios.');
      setContactSuccess('');
      return;
    }

    try {
      // Chamada de API para envio de contato
      const response = await fetch(getApiUrl() + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar o email.');
      }

      setContactSuccess('Email enviado com sucesso!');
      setContactForm({ email: '', subject: '', message: '' });
      setContactError('');
    } catch (error) {
      setContactError('Erro ao enviar email. Tente novamente.');
      setContactSuccess('');
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
        Entre em Contato
      </Typography>
      <Box
        component="form"
        onSubmit={handleContactSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          name="email"
          label="Seu E-mail"
          fullWidth
          required
          value={contactForm.email}
          onChange={handleContactChange}
          type="email"
          autoComplete="email"
        />
        <TextField
          name="subject"
          label="Assunto"
          fullWidth
          required
          value={contactForm.subject}
          onChange={handleContactChange}
        />
        <TextField
          name="message"
          label="Mensagem"
          fullWidth
          required
          multiline
          rows={4}
          value={contactForm.message}
          onChange={handleContactChange}
        />
        {contactError && <Alert severity="error">{contactError}</Alert>}
        {contactSuccess && <Alert severity="success">{contactSuccess}</Alert>}
        <Button type="submit" fullWidth variant="contained" color="primary">
          Enviar
        </Button>
      </Box>
    </Paper>
  );
};

export default ContactForm;
