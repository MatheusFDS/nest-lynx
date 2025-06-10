// src/app/orders/page.tsx
'use client';

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import {
  Typography,
  Container,
  Button,
  Paper,
  Grid,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Zoom,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  UploadFile as UploadFileIcon,
  BackupTable as BackupTableIcon,
  Api as ApiIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Assessment,
  TrendingUp,
  MonetizationOn,
  Scale,
  Inventory,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

// Lib para ler Excel
import * as XLSX from 'xlsx';

import withAuth from '../hoc/withAuth';
import { uploadOrders as submitOrdersToBackend } from '../../services/orderService';
import { useLoading } from '../context/LoadingContext';
import { useMessage } from '../context/MessageContext';
import { Order } from '../../types';
import { getStoredToken } from '../../services/authService';

// Styled Components
const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '1400px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const UploadCard = styled(Card)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    transform: 'translateY(-2px)',
  },
  '&.dragOver': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const StepperCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: theme.spacing(3),
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface ImportStats {
  total: number;
  valid: number;
  invalid: number;
  totalValue: number;
  totalWeight: number;
}

const steps = ['Selecionar Arquivo', 'Validar Dados', 'Confirmar Importação'];

const OrdersImportPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedOrders, setParsedOrders] = useState<Partial<Order>[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const { isLoading, setLoading } = useLoading();
  const { showMessage } = useMessage();

  // Estatísticas dos pedidos parseados
  const importStats: ImportStats = React.useMemo(() => {
    const total = parsedOrders.length;
    const valid = parsedOrders.filter(order => 
      order.numero && order.cliente && order.data
    ).length;
    const invalid = total - valid;
    const totalValue = parsedOrders.reduce((sum, order) => 
      sum + (Number(order.valor) || 0), 0
    );
    const totalWeight = parsedOrders.reduce((sum, order) => 
      sum + (Number(order.peso) || 0), 0
    );

    return { total, valid, invalid, totalValue, totalWeight };
  }, [parsedOrders]);

  useEffect(() => {
    const t = getStoredToken();
    if (t) {
      setToken(t);
    } else {
      showMessage('Token de autenticação não encontrado. Faça login novamente.', 'error');
    }
  }, [showMessage]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setActiveStep(0);
    setSelectedFile(null);
    setParsedOrders([]);
    setValidationErrors([]);
    setFileName('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (activeTab === 0 && !/\.(xlsx|xls|csv)$/i.test(file.name)) {
        showMessage("Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv).", "warning");
        return;
      }
      if (activeTab === 1 && !/\.(xml)$/i.test(file.name)) {
        showMessage("Por favor, selecione um arquivo XML (.xml).", "warning");
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
      setParsedOrders([]);
      setValidationErrors([]);
      showMessage(`Arquivo "${file.name}" selecionado.`, "info");
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (activeTab === 0 && !/\.(xlsx|xls|csv)$/i.test(file.name)) {
        showMessage("Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv).", "warning");
        event.target.value = '';
        return;
      }
      if (activeTab === 1 && !/\.(xml)$/i.test(file.name)) {
        showMessage("Por favor, selecione um arquivo XML (.xml).", "warning");
        event.target.value = '';
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
      setParsedOrders([]);
      setValidationErrors([]);
      setActiveStep(1);
      showMessage(`Arquivo "${file.name}" selecionado.`, "info");
    } else {
      setSelectedFile(null);
      setFileName('');
    }
  };

  const validateOrders = (orders: Partial<Order>[]): string[] => {
    const errors: string[] = [];
    
    orders.forEach((order, index) => {
      if (!order.numero) {
        errors.push(`Linha ${index + 2}: Número do pedido é obrigatório`);
      }
      if (!order.cliente) {
        errors.push(`Linha ${index + 2}: Nome do cliente é obrigatório`);
      }
      if (!order.data) {
        errors.push(`Linha ${index + 2}: Data de emissão é obrigatória`);
      }
      if (order.data && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(order.data)) {
        errors.push(`Linha ${index + 2}: Data deve estar no formato DD/MM/YYYY`);
      }
    });

    return errors;
  };

  const processExcelFile = useCallback(() => {
    if (!selectedFile) {
      showMessage('Nenhum arquivo selecionado.', 'warning');
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonOrders: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        if (jsonOrders.length === 0) {
          showMessage('O arquivo Excel parece estar vazio ou não contém dados na primeira planilha.', 'warning');
          setParsedOrders([]);
          setLoading(false);
          return;
        }

        const mappedOrders: Partial<Order>[] = jsonOrders.map((row: any, index: number) => {
          // Normalizar data do Excel
          let orderData = row['DataEmissao'] || row['Data de Emissão'] || row['data'];
          if (orderData instanceof Date) {
            const day = String(orderData.getDate()).padStart(2, '0');
            const month = String(orderData.getMonth() + 1).padStart(2, '0');
            const year = orderData.getFullYear();
            orderData = `${day}/${month}/${year}`;
          } else if (typeof orderData === 'number') {
            console.warn(`Data na linha ${index + 2} do Excel é um número: ${orderData}. Esperado string DD/MM/YYYY.`);
          } else if (typeof orderData === 'string') {
            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(orderData)) {
              console.warn(`Formato de data inesperado na linha ${index + 2}: ${orderData}. Esperado DD/MM/YYYY.`);
            }
          }

          return {
            numero: String(row['NumeroNota'] || row['Número da Nota'] || row['numero'] || `L${index+1}`),
            data: orderData,
            cliente: String(row['NomeCliente'] || row['Cliente'] || row['cliente'] || ''),
            cpfCnpj: String(row['CPFCNPJCliente'] || row['CPF/CNPJ Cliente'] || row['cpfCnpj'] || ''),
            endereco: String(row['EnderecoEntrega'] || row['Endereço de Entrega'] || row['endereco'] || ''),
            bairro: String(row['BairroEntrega'] || row['Bairro de Entrega'] || row['bairro'] || ''),
            cidade: String(row['CidadeEntrega'] || row['Cidade de Entrega'] || row['cidade'] || ''),
            uf: String(row['UFEntrega'] || row['UF de Entrega'] || row['uf'] || ''),
            cep: String(row['CEPEntrega'] || row['CEP de Entrega'] || row['cep'] || '').replace(/\D/g,''),
            telefone: String(row['TelefoneCliente'] || row['Telefone'] || row['telefone'] || ''),
            email: String(row['EmailCliente'] || row['Email'] || row['email'] || ''),
            nomeContato: String(row['NomeContato'] || row['Contato no Local'] || row['nomeContato'] || ''),
            valor: row['ValorNota'] || row['Valor Total'] || row['valor'],
            peso: row['PesoTotal'] || row['Peso (Kg)'] || row['peso'],
            volume: row['VolumeTotal'] || row['Volumes'] || row['volume'],
            instrucoesEntrega: String(row['InstrucoesEntrega'] || row['Instruções de Entrega'] || row['instrucoesEntrega'] || ''),
            idCliente: String(row['CodigoCliente'] || row['ID Cliente'] || row['idCliente'] || (row['CPFCNPJCliente'] || row['CPF/CNPJ Cliente'] || row['cpfCnpj'] || '')),
            prazo: String(row['PrazoEntrega'] || row['Prazo'] || row['prazo'] || ''),
            prioridade: String(row['Prioridade'] || row['prioridade'] || 'Normal'),
          };
        });

        const errors = validateOrders(mappedOrders);
        setValidationErrors(errors);
        setParsedOrders(mappedOrders);
        setActiveStep(1);
        
        if (errors.length === 0) {
          showMessage(`${mappedOrders.length} pedidos lidos com sucesso. Todos os dados são válidos.`, 'success');
        } else {
          showMessage(`${mappedOrders.length} pedidos lidos, mas ${errors.length} erro(s) de validação encontrado(s).`, 'warning');
        }
      } catch (error) {
        console.error("Erro ao processar arquivo Excel:", error);
        showMessage('Falha ao ler ou processar o arquivo Excel. Verifique o formato e o conteúdo.', 'error');
        setParsedOrders([]);
        setValidationErrors([]);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      showMessage('Não foi possível ler o arquivo selecionado.', 'error');
      setLoading(false);
    };
    reader.readAsBinaryString(selectedFile);
  }, [selectedFile, setLoading, showMessage]);

  const processXmlFiles = useCallback(() => {
    if (!selectedFile) {
      showMessage('Nenhum arquivo XML selecionado.', 'warning');
      return;
    }
    setLoading(true);
    showMessage('Processamento de XML NF-e ainda não implementado nesta interface.', 'info');
    // TODO: Implementar lógica para processar XML NF-e
    setLoading(false);
  }, [selectedFile, setLoading, showMessage]);

  const handleUploadToServer = async () => {
    if (!token || parsedOrders.length === 0) {
      showMessage('Nenhum pedido para enviar ou token inválido.', 'warning');
      return;
    }

    if (validationErrors.length > 0) {
      showMessage('Corrija os erros de validação antes de enviar os pedidos.', 'error');
      return;
    }

    setLoading(true);
    try {
      const validOrders = parsedOrders.filter(order => order.numero && order.cliente && order.data);
      
      await submitOrdersToBackend(token, validOrders as Order[]);
      showMessage(`${validOrders.length} pedidos enviados com sucesso!`, 'success');
      
      // Reset form
      setParsedOrders([]);
      setValidationErrors([]);
      setSelectedFile(null);
      setFileName('');
      setActiveStep(0);
      
    } catch (error: unknown) {
      console.error("Erro ao enviar pedidos:", error);
      let apiErrorMessage = "Falha ao enviar pedidos para o servidor.";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string | string[] } } };
        if (axiosError.response?.data?.message) {
          apiErrorMessage = Array.isArray(axiosError.response.data.message)
            ? axiosError.response.data.message.join('; ')
            : axiosError.response.data.message;
        }
      } else if (error instanceof Error) {
        apiErrorMessage = error.message;
      }
      showMessage(`Erro: ${apiErrorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (activeTab === 0) {
        processExcelFile();
      } else if (activeTab === 1) {
        processXmlFiles();
      }
    } else if (activeStep === 1) {
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setActiveStep(Math.max(0, activeStep - 1));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={600}>
            <Box>
              {/* Upload Area */}
              <UploadCard
                className={dragOver ? 'dragOver' : ''}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{ p: 4, textAlign: 'center', mb: 3 }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {activeTab === 0 ? <BackupTableIcon sx={{ fontSize: 64, color: 'primary.main' }} /> : <ApiIcon sx={{ fontSize: 64, color: 'primary.main' }} />}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {activeTab === 0 ? 'Arraste e solte sua planilha aqui' : 'Arraste e solte seus arquivos XML aqui'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {activeTab === 0 
                      ? 'Formatos suportados: .xlsx, .xls, .csv' 
                      : 'Formato suportado: .xml (NF-e)'
                    }
                  </Typography>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<UploadFileIcon />}
                    disabled={isLoading}
                    sx={{ borderRadius: 3 }}
                  >
                    {activeTab === 0 ? 'Selecionar Planilha' : 'Selecionar XML(s)'}
                    <VisuallyHiddenInput
                      type="file"
                      accept={activeTab === 0 ? '.xlsx, .xls, .csv' : '.xml'}
                      multiple={activeTab === 1}
                      onChange={handleFileChange}
                    />
                  </Button>
                  {fileName && (
                    <Chip
                      label={fileName}
                      color="primary"
                      sx={{ mt: 2, maxWidth: '100%' }}
                      onDelete={() => {
                        setSelectedFile(null);
                        setFileName('');
                        setParsedOrders([]);
                        setValidationErrors([]);
                      }}
                    />
                  )}
                </CardContent>
              </UploadCard>

              {/* Instructions */}
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {activeTab === 0 ? (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Estrutura da Planilha Excel/CSV:
                    </Typography>
                    <Typography variant="body2">
                      Certifique-se que sua planilha contém colunas como: <strong>NumeroNota, DataEmissao (DD/MM/YYYY), NomeCliente, CPFCNPJCliente, EnderecoEntrega, CidadeEntrega, UFEntrega, CEPEntrega, ValorNota, PesoTotal</strong>, etc.
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Processamento de XML NF-e:
                    </Typography>
                    <Typography variant="body2">
                      A funcionalidade completa de processamento de NF-e (XML) ainda está em desenvolvimento. Esta seção permitirá o upload de um ou mais arquivos XML de Nota Fiscal Eletrônica para extrair automaticamente os dados dos pedidos.
                    </Typography>
                  </>
                )}
              </Alert>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={600}>
            <Box>
              {/* Estatísticas dos Dados */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <StatsCard>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {importStats.total}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Total de Pedidos
                          </Typography>
                        </Box>
                        <Inventory sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </StatsCard>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                  <StatsCard sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {importStats.valid}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Válidos
                          </Typography>
                        </Box>
                        <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </StatsCard>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                  <StatsCard sx={{ background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {importStats.invalid}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Com Erros
                          </Typography>
                        </Box>
                        <ErrorIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </StatsCard>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                  <StatsCard sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {formatCurrency(importStats.totalValue).replace('R$', '')}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Valor Total
                          </Typography>
                        </Box>
                        <MonetizationOn sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </StatsCard>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                  <StatsCard sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {importStats.totalWeight.toFixed(0)}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Peso Total (kg)
                          </Typography>
                        </Box>
                        <Scale sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </StatsCard>
                </Grid>
              </Grid>

              {/* Erros de Validação */}
              {validationErrors.length > 0 && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Erros de Validação Encontrados ({validationErrors.length}):
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {validationErrors.slice(0, 10).map((error, index) => (
                      <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                        • {error}
                      </Typography>
                    ))}
                    {validationErrors.length > 10 && (
                      <Typography variant="caption" sx={{ ml: 2, fontStyle: 'italic' }}>
                        ... e mais {validationErrors.length - 10} erro(s)
                      </Typography>
                    )}
                  </Box>
                </Alert>
              )}

              {/* Pré-visualização dos Dados */}
              {parsedOrders.length > 0 && (
                <Paper elevation={1} sx={{ borderRadius: 3 }}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Pré-visualização dos Pedidos ({parsedOrders.length})
                    </Typography>
                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Número Nota</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Valor</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Peso</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {parsedOrders.slice(0, 20).map((order, index) => {
                            const isValid = order.numero && order.cliente && order.data;
                            return (
                              <TableRow key={index} sx={{ bgcolor: isValid ? 'inherit' : alpha('#f44336', 0.05) }}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{order.numero}</TableCell>
                                <TableCell>{order.data}</TableCell>
                                <TableCell>{order.cliente}</TableCell>
                                <TableCell align="right">
                                  {typeof order.valor === 'number' ? formatCurrency(order.valor) : order.valor}
                                </TableCell>
                                <TableCell align="right">
                                  {typeof order.peso === 'number' ? `${order.peso.toFixed(2)} kg` : order.peso}
                                </TableCell>
                                <TableCell align="center">
                                  {isValid ? (
                                    <CheckCircleIcon color="success" fontSize="small" />
                                  ) : (
                                    <ErrorIcon color="error" fontSize="small" />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {parsedOrders.length > 20 && (
                      <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                        Mostrando os primeiros 20 de {parsedOrders.length} pedidos para pré-visualização.
                      </Typography>
                    )}
                  </Box>
                </Paper>
              )}
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={600}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, color: 'primary.main' }}>
                  Confirmação da Importação
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Revise os dados antes de finalizar a importação dos pedidos.
                </Typography>
              </Box>

              {/* Resumo Final */}
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} md={8}>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <Assessment />
                      Resumo da Importação
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" fontWeight={700} color="primary.main">
                            {importStats.valid}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Pedidos Válidos
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" fontWeight={700} color="success.main">
                            {formatCurrency(importStats.totalValue)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Valor Total
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" fontWeight={700} color="warning.main">
                            {importStats.totalWeight.toFixed(0)} kg
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Peso Total
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" fontWeight={700} color="text.secondary">
                            {fileName.split('.').pop()?.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Formato
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {validationErrors.length > 0 && (
                      <Alert severity="warning" sx={{ mt: 3 }}>
                        <Typography variant="body2">
                          <strong>Atenção:</strong> {validationErrors.length} erro(s) de validação foram encontrados. 
                          Apenas os pedidos válidos serão importados.
                        </Typography>
                      </Alert>
                    )}

                    <Box sx={{ mt: 4 }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                        onClick={handleUploadToServer}
                        disabled={isLoading || importStats.valid === 0}
                        sx={{
                          borderRadius: 3,
                          padding: '12px 32px',
                          background: `linear-gradient(135deg, #4caf50 0%, #388e3c 100%)`,
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: `0 4px 15px ${alpha('#4caf50', 0.4)}`,
                          '&:hover': {
                            background: `linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 20px ${alpha('#4caf50', 0.5)}`,
                          },
                        }}
                      >
                        {isLoading ? 'Importando...' : `Importar ${importStats.valid} Pedidos`}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <StyledContainer>


      {/* Loading */}
      {isLoading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Tabs */}
      <Paper elevation={3} sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="Métodos de importação de pedidos" 
            centered 
            variant="fullWidth"
          >
            <Tab 
              label="Excel / CSV" 
              icon={<BackupTableIcon />} 
              iconPosition="start" 
              id="tab-excel" 
              aria-controls="tabpanel-excel"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab 
              label="NF-e (XML)" 
              icon={<ApiIcon />} 
              iconPosition="start" 
              id="tab-xml" 
              aria-controls="tabpanel-xml"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab 
              label="Integração API" 
              icon={<CloudUploadIcon />} 
              iconPosition="start" 
              id="tab-integration" 
              aria-controls="tabpanel-integration"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        {/* Excel/CSV Panel */}
        <Box 
          role="tabpanel" 
          hidden={activeTab !== 0} 
          id="tabpanel-excel" 
          aria-labelledby="tab-excel" 
          sx={{ p: { xs: 2, md: 4 } }}
        >
          {activeTab === 0 && (
            <StepperCard sx={{ p: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box sx={{ minHeight: '400px' }}>
                {renderStepContent()}
              </Box>

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 3, mt: 3, borderTop: `1px solid ${alpha('#000', 0.1)}` }}>
                <Button
                  color="inherit"
                  variant="outlined"
                  disabled={activeStep === 0 || isLoading}
                  onClick={handleBack}
                  sx={{ mr: 2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Voltar
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep < steps.length - 1 && (
                  <Button
                    onClick={handleNext}
                    disabled={!selectedFile || isLoading}
                    sx={{
                      borderRadius: 3,
                      padding: '8px 24px',
                      background: `linear-gradient(135deg, #1976d2 0%, #1565c0 100%)`,
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background: `linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)`,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {activeStep === 0 ? 'Processar Arquivo' : 'Próximo'}
                  </Button>
                )}
              </Box>
            </StepperCard>
          )}
        </Box>

        {/* XML Panel */}
        <Box 
          role="tabpanel" 
          hidden={activeTab !== 1} 
          id="tabpanel-xml" 
          aria-labelledby="tab-xml" 
          sx={{ p: { xs: 2, md: 4 } }}
        >
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Funcionalidade em Desenvolvimento
            </Typography>
            <Typography variant="body2">
              A funcionalidade completa de processamento de NF-e (XML) ainda está em desenvolvimento.
              Esta seção permitirá o upload de um ou mais arquivos XML de Nota Fiscal Eletrônica para extrair automaticamente os dados dos pedidos.
              O parser precisa ser cuidadosamente implementado para ler a estrutura complexa do XML da NF-e.
            </Typography>
          </Alert>
        </Box>

        {/* API Integration Panel */}
        <Box 
          role="tabpanel" 
          hidden={activeTab !== 2} 
          id="tabpanel-integration" 
          aria-labelledby="tab-integration" 
          sx={{ p: { xs: 2, md: 4 } }}
        >
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card sx={{ textAlign: 'center', p: 4, borderRadius: 3 }}>
                <CardContent>
                  <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom fontWeight={600}>
                    Integração entre Sistemas (API)
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Para integrar seu sistema ERP ou plataforma de e-commerce diretamente com nossa plataforma,
                    disponibilizamos uma API RESTful para o envio de pedidos.
                  </Typography>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="body2" color="text.secondary">
                    A integração permite automatizar o fluxo de criação de pedidos, reduzindo a necessidade de importações manuais.
                    Consulte nossa documentação da API ou entre em contato com o suporte técnico para mais detalhes sobre os endpoints, autenticação e formato dos dados.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button 
                    variant="outlined" 
                    size="large"
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Ver Documentação da API
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </StyledContainer>
  );
};

export default withAuth(OrdersImportPage);