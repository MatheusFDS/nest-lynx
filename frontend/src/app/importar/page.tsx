// src/app/orders/page.tsx (ou o caminho que você preferir para a página de importação)
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
  Link,
  Alert,
  ListItemIcon, // Certifique-se de que este import existe e é usado corretamente, ou remova-o se não for.
} from '@mui/material';
import { styled } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import ApiIcon from '@mui/icons-material/Api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Lib para ler Excel
import * as XLSX from 'xlsx';

import withAuth from '../hoc/withAuth';
import { uploadOrders as submitOrdersToBackend } from '../../services/orderService';
import { useLoading } from '../context/LoadingContext';
import { useMessage } from '../context/MessageContext';
import { Order } from '../../types';
import { getStoredToken } from '../../services/authService';

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

const OrdersImportPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedOrders, setParsedOrders] = useState<Partial<Order>[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const { isLoading, setLoading } = useLoading();
  const { showMessage } = useMessage();

  useEffect(() => {
    const t = getStoredToken();
    if (t) {
      setToken(t);
    } else {
      showMessage('Token de autenticação não encontrado. Faça login novamente.', 'error');
      // Idealmente, redirecionar para login aqui
    }
  }, [showMessage]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedFile(null);
    setParsedOrders([]);
    setFileName('');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (activeTab === 0 && !/\.(xlsx|xls|csv)$/i.test(file.name)) {
          showMessage("Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv).", "warning");
          event.target.value = ''; // Limpa o input
          return;
      }
      if (activeTab === 1 && !/\.(xml)$/i.test(file.name)) {
        showMessage("Por favor, selecione um arquivo XML (.xml).", "warning");
        event.target.value = ''; // Limpa o input
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
      setParsedOrders([]);
      showMessage(`Arquivo "${file.name}" selecionado.`, "info");
    } else {
        setSelectedFile(null);
        setFileName('');
    }
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
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true }); // cellDates: true para tentar parsear datas
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // raw: false para que datas sejam parseadas se cellDates for true
        const jsonOrders: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });


        if (jsonOrders.length === 0) {
            showMessage('O arquivo Excel parece estar vazio ou não contém dados na primeira planilha.', 'warning');
            setParsedOrders([]);
            setLoading(false);
            return;
        }

        const mappedOrders: Partial<Order>[] = jsonOrders.map((row: any, index: number) => {
          // Tentativa de normalizar data do Excel
          let orderData = row['DataEmissao'] || row['Data de Emissão'] || row['data'];
          if (orderData instanceof Date) {
            // Formata para DD/MM/YYYY se o Excel já retornou como Date
            const day = String(orderData.getDate()).padStart(2, '0');
            const month = String(orderData.getMonth() + 1).padStart(2, '0'); // Mês é 0-indexed
            const year = orderData.getFullYear();
            orderData = `${day}/${month}/${year}`;
          } else if (typeof orderData === 'number') { // Data serial do Excel
             // Se for número serial do Excel, converter para data (requer lógica mais complexa ou ajuste na leitura do XLSX)
             // Por simplicidade, vamos assumir que se for número, já é um formato que o backend não espera diretamente
             // ou o usuário deve formatar a coluna como Texto/Data no Excel.
             // Poderia tentar: orderData = XLSX.SSF.format('dd/mm/yyyy', orderData); mas SSF pode não estar sempre disponível/configurado
             console.warn(`Data na linha ${index + 2} do Excel é um número: ${orderData}. Esperado string DD/MM/YYYY.`);
             // Deixe como está para o backend tentar parsear, ou lance um erro se preferir.
          } else if (typeof orderData === 'string') {
            // Se for string, verifica se já está no formato DD/MM/YYYY, senão, avisa.
            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(orderData)) {
                console.warn(`Formato de data inesperado na linha ${index + 2}: ${orderData}. Esperado DD/MM/YYYY.`);
            }
          }


          return {
            // **AJUSTE OS NOMES DAS COLUNAS ABAIXO PARA CORRESPONDER AO SEU ARQUIVO EXCEL**
            numero: String(row['NumeroNota'] || row['Número da Nota'] || row['numero'] || `L${index+1}`), // Adiciona um fallback se número não existir
            data: orderData, // Deve estar no formato DD/MM/YYYY
            cliente: String(row['NomeCliente'] || row['Cliente'] || row['cliente'] || ''),
            cpfCnpj: String(row['CPFCNPJCliente'] || row['CPF/CNPJ Cliente'] || row['cpfCnpj'] || ''),
            endereco: String(row['EnderecoEntrega'] || row['Endereço de Entrega'] || row['endereco'] || ''),
            bairro: String(row['BairroEntrega'] || row['Bairro de Entrega'] || row['bairro'] || ''),
            cidade: String(row['CidadeEntrega'] || row['Cidade de Entrega'] || row['cidade'] || ''),
            uf: String(row['UFEntrega'] || row['UF de Entrega'] || row['uf'] || ''),
            cep: String(row['CEPEntrega'] || row['CEP de Entrega'] || row['cep'] || '').replace(/\D/g,''), // Remove não dígitos do CEP
            telefone: String(row['TelefoneCliente'] || row['Telefone'] || row['telefone'] || ''),
            email: String(row['EmailCliente'] || row['Email'] || row['email'] || ''),
            nomeContato: String(row['NomeContato'] || row['Contato no Local'] || row['nomeContato'] || ''),
            valor: row['ValorNota'] || row['Valor Total'] || row['valor'], // Backend trata string com vírgula
            peso: row['PesoTotal'] || row['Peso (Kg)'] || row['peso'],     // Backend trata string com vírgula
            volume: row['VolumeTotal'] || row['Volumes'] || row['volume'], // Backend trata como int
            instrucoesEntrega: String(row['InstrucoesEntrega'] || row['Instruções de Entrega'] || row['instrucoesEntrega'] || ''),
            idCliente: String(row['CodigoCliente'] || row['ID Cliente'] || row['idCliente'] || (row['CPFCNPJCliente'] || row['CPF/CNPJ Cliente'] || row['cpfCnpj'] || '')), // Usa CNPJ se ID não existir
            // Campos opcionais que podem ou não estar no Excel:
            prazo: String(row['PrazoEntrega'] || row['Prazo'] || row['prazo'] || ''),
            prioridade: String(row['Prioridade'] || row['prioridade'] || 'Normal'),
          };
        });

        setParsedOrders(mappedOrders);
        showMessage(`${mappedOrders.length} pedidos lidos do arquivo. Verifique a prévia e envie.`, 'success');
      } catch (error) {
        console.error("Erro ao processar arquivo Excel:", error);
        showMessage('Falha ao ler ou processar o arquivo Excel. Verifique o formato e o conteúdo. Datas devem estar como Texto ou no formato DD/MM/YYYY.', 'error');
        setParsedOrders([]);
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
    showMessage('Processamento de XML NF-e ainda não implementado nesta interface. Esta funcionalidade requer um parser XML específico para o schema da NF-e.', 'info');
    // TODO: Lógica para ler e parsear arquivos XML NF-e
    // Usar FileReader para ler o arquivo como texto.
    // Usar uma biblioteca como 'xml2js' ou o DOMParser nativo do navegador.
    // Exemplo:
    // const reader = new FileReader();
    // reader.onload = async (event) => {
    //   const xmlString = event.target?.result as string;
    //   try {
    //     const parser = new DOMParser();
    //     const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    //     // A partir daqui, navegar no xmlDoc para extrair os campos:
    //     const nNF = xmlDoc.querySelector('infNFe ide nNF')?.textContent;
    //     const dhEmi = xmlDoc.querySelector('infNFe ide dhEmi')?.textContent; // YYYY-MM-DDTHH:MM:SSZ
    //     const destNome = xmlDoc.querySelector('infNFe dest xNome')?.textContent;
    //     // ... e assim por diante para todos os campos necessários para montar o objeto Order.
    //     // Lembre-se de converter formatos (ex: data, valores) conforme necessário.
    //     setParsedOrders([/* ...pedidos parseados do XML... */]);
    //     showMessage('XML processado (simulação).', 'success');
    //   } catch (e) {
    //     showMessage('Erro ao processar XML.', 'error');
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // reader.readAsText(selectedFile);
    setLoading(false); // Remover quando implementar
  }, [selectedFile, setLoading, showMessage]);


  const handleUploadToServer = async () => {
    if (!token || parsedOrders.length === 0) {
      showMessage('Nenhum pedido para enviar ou token inválido.', 'warning');
      return;
    }
    setLoading(true);
    try {
      // Validar se campos obrigatórios (ex: numero, cliente, data) estão presentes antes de enviar
      const validOrders = parsedOrders.filter(order => order.numero && order.cliente && order.data);
      if (validOrders.length !== parsedOrders.length) {
          showMessage('Alguns pedidos na lista estão com campos obrigatórios (Número, Cliente, Data) faltando. Verifique o arquivo.', 'error');
          setLoading(false);
          return;
      }

      await submitOrdersToBackend(token, validOrders as Order[]);
      showMessage(`${validOrders.length} pedidos enviados com sucesso!`, 'success');
      setParsedOrders([]);
      setSelectedFile(null);
      setFileName('');
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ textAlign: 'center', mb: 3 }}>
        Importar Novos Pedidos/Notas
      </Typography>

      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="Métodos de importação de pedidos" centered variant="fullWidth">
            <Tab label="Excel / CSV" icon={<BackupTableIcon/>} iconPosition="start" id="tab-excel" aria-controls="tabpanel-excel" />
            <Tab label="NF-e (XML)" icon={<ApiIcon/>} iconPosition="start" id="tab-xml" aria-controls="tabpanel-xml" />
            <Tab label="Integração API" icon={<CloudUploadIcon/>} iconPosition="start" id="tab-integration" aria-controls="tabpanel-integration" />
          </Tabs>
        </Box>

        {/* Painel para Excel/CSV */}
        <Box role="tabpanel" hidden={activeTab !== 0} id="tabpanel-excel" aria-labelledby="tab-excel" sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h6" gutterBottom>Importar Planilha (Excel ou CSV)</Typography>
          <Grid container spacing={2} alignItems="center" sx={{mb: 2}}>
            <Grid item>
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<UploadFileIcon />}
                disabled={isLoading}
              >
                Selecionar Planilha
                <VisuallyHiddenInput type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
              </Button>
            </Grid>
            {fileName && activeTab === 0 && (
              <Grid item xs>
                <Typography variant="body1" sx={{fontStyle: 'italic'}}>{fileName}</Typography>
              </Grid>
            )}
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                onClick={processExcelFile}
                disabled={!selectedFile || isLoading}
              >
                {isLoading && selectedFile ? <CircularProgress size={24} /> : "Processar Planilha"}
              </Button>
            </Grid>
          </Grid>
          <Alert severity="info">
            Formatos suportados: .xlsx, .xls, .csv. A primeira planilha do arquivo será lida.
            <br/>
            Certifique-se que sua planilha contém colunas como: <strong>NumeroNota, DataEmissao (DD/MM/YYYY), NomeCliente, CPFCNPJCliente, EnderecoEntrega, CidadeEntrega, UFEntrega, CEPEntrega, ValorNota, PesoTotal</strong>, etc.
            {/* <Link href="/caminho/para/seu/modelo-excel.xlsx" download sx={{display:'block', mt:1}}>Baixar modelo de planilha</Link> */}
            <Typography variant="caption" display="block" sx={{mt:1}}> (O link para baixar modelo é um exemplo, substitua pelo caminho real do seu arquivo modelo se tiver um)</Typography>
          </Alert>

          {parsedOrders.length > 0 && activeTab === 0 && (
            <Box mt={3}>
              <Typography variant="subtitle1">Pré-visualização dos Pedidos Lidos ({parsedOrders.length}):</Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 300, mt:1, mb:2 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{fontWeight:'bold'}}>#</TableCell>
                      <TableCell sx={{fontWeight:'bold'}}>Número Nota</TableCell>
                      <TableCell sx={{fontWeight:'bold'}}>Data</TableCell>
                      <TableCell sx={{fontWeight:'bold'}}>Cliente</TableCell>
                      <TableCell sx={{fontWeight:'bold'}} align="right">Valor</TableCell>
                      <TableCell sx={{fontWeight:'bold'}} align="right">Peso</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedOrders.slice(0, 10).map((order, index) => ( // Mostra até 10 como preview
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{order.numero}</TableCell>
                        <TableCell>{order.data}</TableCell>
                        <TableCell>{order.cliente}</TableCell>
                        <TableCell align="right">{typeof order.valor === 'number' ? order.valor.toFixed(2) : order.valor}</TableCell>
                        <TableCell align="right">{typeof order.peso === 'number' ? order.peso.toFixed(2) : order.peso}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {parsedOrders.length > 10 && <Typography variant='caption'>Mostrando os primeiros 10 de {parsedOrders.length} pedidos para pré-visualização.</Typography>}
              <Button
                variant="contained"
                color="success"
                onClick={handleUploadToServer}
                disabled={isLoading || parsedOrders.length === 0}
                sx={{ mt: 2, display: 'block', mx: 'auto' }}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <CloudUploadIcon />}
              >
                Enviar {parsedOrders.length} Pedido(s) para o Sistema
              </Button>
            </Box>
          )}
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 1} id="tabpanel-xml" aria-labelledby="tab-xml" sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h6" gutterBottom>Importar NF-e (Arquivos XML)</Typography>
           <Grid container spacing={2} alignItems="center" sx={{mb: 2}}>
            <Grid item>
              <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<UploadFileIcon />} disabled={isLoading}>
                Selecionar XML(s)
                <VisuallyHiddenInput type="file" accept=".xml" multiple onChange={handleFileChange} /> {/* 'multiple' para vários arquivos */}
              </Button>
            </Grid>
            {fileName && activeTab === 1 && ( <Grid item xs> <Typography variant="body1" sx={{fontStyle: 'italic'}}>{fileName} {selectedFile && 'files' in selectedFile && (selectedFile as unknown as FileList).length > 1 ? `(${(selectedFile as unknown as FileList).length} arquivos)` : ''}</Typography> </Grid>)}
            <Grid item>
              <Button variant="outlined" color="primary" onClick={processXmlFiles} disabled={!selectedFile || isLoading}>
                {isLoading && selectedFile ? <CircularProgress size={24} /> : "Processar XML(s)"}
              </Button>
            </Grid>
          </Grid>
          <Alert severity="warning">
            A funcionalidade completa de processamento de NF-e (XML) ainda está em desenvolvimento.
            Esta seção permitirá o upload de um ou mais arquivos XML de Nota Fiscal Eletrônica para extrair automaticamente os dados dos pedidos.
            O parser precisa ser cuidadosamente implementado para ler a estrutura complexa do XML da NF-e.
          </Alert>
           {parsedOrders.length > 0 && activeTab === 1 && (
             <Box mt={3}>
                {/* Tabela de pré-visualização e botão de Enviar (similar ao do Excel) */}
             </Box>
           )}
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 2} id="tabpanel-integration" aria-labelledby="tab-integration" sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h6" gutterBottom>Integração entre Sistemas (API)</Typography>
          <Alert severity="info">
            Para integrar seu sistema ERP ou plataforma de e-commerce diretamente com nossa plataforma,
            disponibilizamos uma API RESTful para o envio de pedidos.
            <br/><br/>
            Consulte nossa documentação da API (link fictício: <Link href="#" target="_blank">Ver Documentação da API</Link>) ou entre em contato com o suporte técnico para mais detalhes sobre os endpoints, autenticação e formato dos dados.
            <br/><br/>
            A integração permite automatizar o fluxo de criação de pedidos, reduzindo a necessidade de importações manuais.
          </Alert>
        </Box>
      </Paper>
    </Container>
  );
};

export default withAuth(OrdersImportPage);