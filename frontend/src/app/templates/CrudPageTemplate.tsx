// src/templates/CrudPageTemplate.tsx
'use client';

import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  InputAdornment,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Download as ExportIcon,
} from '@mui/icons-material';

import DS from '../components/ds';
import { useTableState } from '../hooks';
import withAuth from '../hoc/withAuth';

// ========================================
// TYPES PARA O TEMPLATE
// ========================================

export interface CrudField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'date' | 'textarea';
  required?: boolean;
  options?: { value: any; label: string }[];
  validation?: (value: any) => string | null;
}

export interface CrudPageConfig<T = any> {
  // Configuração da entidade
  endpoint: string;
  title: string;
  entityName: string;
  
  // Campos do formulário
  fields: CrudField[];
  
  // Configuração da tabela
  columns: {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
  }[];
  
  // Configuração de filtros
  filters?: {
    key: string;
    label: string;
    type: 'text' | 'select' | 'date';
    options?: { value: any; label: string }[];
  }[];
  
  // Funções de filtro customizadas
  filterFunctions?: {
    search?: (item: T, term: string) => boolean;
    [key: string]: ((item: T, value: any) => boolean) | undefined;
  };
  
  // Configurações opcionais
  options?: {
    enableSelection?: boolean;
    enableExport?: boolean;
    defaultRowsPerPage?: number;
    requiredRole?: string;
  };
}

// ========================================
// COMPONENTE: CRUD PAGE TEMPLATE
// ========================================

export function CrudPageTemplate<T extends { id: string }>({
  endpoint,
  title,
  entityName,
  fields,
  columns,
  filters = [],
  filterFunctions = {},
  options = {},
}: CrudPageConfig<T>) {
  
  const {
    enableSelection = true,
    enableExport = true,
    defaultRowsPerPage = 12,
  } = options;
  
  // ========================================
  // HOOKS - TODO O CRUD EM UMA LINHA!
  // ========================================
  
  const table = useTableState<T>(endpoint, {
    defaultRowsPerPage,
    filterFunctions,
  });
  
  // Estados do formulário
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  
  // ========================================
  // FORM HANDLERS
  // ========================================
  
  const handleOpenForm = (item?: T) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({});
    }
    setFormErrors({});
    setFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
    setFormData({});
    setFormErrors({});
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = formData[field.key];
      
      if (field.required && (!value || value.toString().trim() === '')) {
        errors[field.key] = `${field.label} é obrigatório`;
      } else if (field.validation && value) {
        const validationError = field.validation(value);
        if (validationError) {
          errors[field.key] = validationError;
        }
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    
    try {
      if (editingItem) {
        // CORREÇÃO: Adicionado 'as Partial<T>' para garantir a compatibilidade de tipo.
        await table.crudActions.update(editingItem.id, formData as Partial<T>);
      } else {
        // CORREÇÃO: Adicionado 'as Partial<T>' para garantir a compatibilidade de tipo.
        await table.crudActions.create(formData as Partial<T>);
      }
      handleCloseForm();
    } catch (error) {
      // Error já tratado no hook
    }
  };
  
  // ========================================
  // RENDER HELPERS
  // ========================================
  
  const renderFormField = (field: CrudField) => {
    const value = formData[field.key] || '';
    const error = formErrors[field.key];
    
    const commonProps = {
      key: field.key,
      label: field.label,
      value,
      onChange: (e: any) => setFormData(prev => ({ 
        ...prev, 
        [field.key]: e.target.value 
      })),
      fullWidth: true,
      margin: 'normal' as const,
      error: !!error,
      helperText: error,
      required: field.required,
    };
    
    switch (field.type) {
      case 'select':
        return (
          <FormControl {...commonProps} key={field.key}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={commonProps.onChange}
            >
              {field.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
        
      case 'textarea':
        return <TextField {...commonProps} multiline rows={3} />;
        
      default:
        return <TextField {...commonProps} type={field.type} />;
    }
  };
  
  const renderTableCell = (item: T, column: typeof columns[0]) => {
    if (column.render) {
      return column.render(item);
    }
    
    const value = (item as any)[column.key];
    
    // Renderização padrão baseada no tipo
    if (typeof value === 'boolean') {
      return <Checkbox checked={value} disabled />;
    }
    
    if (typeof value === 'number' && column.key.includes('valor')) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    }
    
    return value?.toString() || '-';
  };
  
  // ========================================
  // EXPORT FUNCTION
  // ========================================
  
  const handleExport = () => {
    const dataToExport = table.filteredData.map(item => {
      const exported: Record<string, any> = {};
      columns.forEach(col => {
        exported[col.label] = (item as any)[col.key];
      });
      return exported;
    });
    
    // Simples CSV export
    const headers = columns.map(col => col.label).join(',');
    const rows = dataToExport.map(item => 
      Object.values(item).map(val => `"${val}"`).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName.toLowerCase()}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
  };
  
  // ========================================
  // RENDER PRINCIPAL
  // ========================================
  
  return (
    <DS.Container variant="page">
      {/* HEADER */}
      {/* CORREÇÃO: Trocado 'flex' por 'display="flex"' e 'between' por 'justifyContent' */}
      <DS.Box display="flex" justifyContent="space-between" alignItems="center" spacing="md">
        <Typography variant="h4" fontWeight={700}>
          {title}
        </Typography>
        
        {/* CORREÇÃO: Trocado 'flex' por 'display="flex"' */}
        <DS.Box display="flex" gap={8}>
          <DS.ActionButton 
            // CORREÇÃO: 'variant' inválida trocada por 'outlined'
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={table.crudActions.refresh}
            disabled={table.loading}
          >
            Atualizar
          </DS.ActionButton>
          
          <DS.ActionButton
            // CORREÇÃO: 'variant' inválida trocada por 'contained'
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Novo {entityName}
          </DS.ActionButton>
        </DS.Box>
      </DS.Box>
      
      {/* FILTERS PANEL */}
      <DS.FilterPanel>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <DS.SearchField
              fullWidth
              placeholder={`Buscar ${entityName.toLowerCase()}...`}
              value={table.filters.searchTerm}
              onChange={(e) => table.filterActions.setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: table.filters.searchTerm && (
                  <InputAdornment position="end">
                    <DS.IconButton
                      size="small"
                      onClick={() => table.filterActions.setSearchTerm('')}
                    >
                      <CloseIcon />
                    </DS.IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilterOpen(!filterOpen)}
              sx={{ height: 48 }}
            >
              Filtros
              {table.filterActions.hasActiveFilters && (
                <Chip
                  size="small"
                  label="Ativo"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Button>
          </Grid>
          
          <Grid item xs={12} md={3}>
            {/* CORREÇÃO: Trocado 'flex' por 'display="flex"' */}
            <DS.Box display="flex" gap={8}>
              {enableExport && (
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={handleExport}
                  disabled={table.filteredData.length === 0}
                >
                  Exportar
                </Button>
              )}
              
              {enableSelection && table.selectedItems.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => table.crudActions.deleteMany(table.selectedItems)}
                >
                  Deletar ({table.selectedItems.length})
                </Button>
              )}
            </DS.Box>
          </Grid>
        </Grid>
        
        {/* EXPANDED FILTERS */}
        <Collapse in={filterOpen}>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              {filters.map(filter => (
                <Grid item xs={12} sm={6} md={4} key={filter.key}>
                  {filter.type === 'select' ? (
                    <FormControl fullWidth size="small">
                      <InputLabel>{filter.label}</InputLabel>
                      <Select
                        value={table.filters.customFilters[filter.key] || ''}
                        label={filter.label}
                        onChange={(e) => table.filterActions.setCustomFilter(filter.key, e.target.value)}
                      >
                        <MenuItem value=""><em>Todos</em></MenuItem>
                        {filter.options?.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      label={filter.label}
                      type={filter.type}
                      value={table.filters.customFilters[filter.key] || ''}
                      onChange={(e) => table.filterActions.setCustomFilter(filter.key, e.target.value)}
                      InputLabelProps={filter.type === 'date' ? { shrink: true } : undefined}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>
      </DS.FilterPanel>
      
      {/* TABLE */}
      {/* CORREÇÃO: Removida a 'variant' inválida. */}
      <DS.ItemCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {enableSelection && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        table.selectedItems.length > 0 && 
                        table.selectedItems.length < table.paginatedData.length
                      }
                      checked={
                        table.paginatedData.length > 0 && 
                        table.selectedItems.length === table.paginatedData.length
                      }
                      onChange={table.crudActions.selectAll}
                    />
                  </TableCell>
                )}
                
                {columns.map(column => (
                  <TableCell 
                    key={column.key}
                    sx={{ 
                      fontWeight: 'bold',
                      width: column.width 
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {table.loading ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (enableSelection ? 2 : 1)} 
                    align="center"
                    sx={{ py: 4 }}
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : table.paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (enableSelection ? 2 : 1)} 
                    align="center"
                    sx={{ py: 4 }}
                  >
                    Nenhum {entityName.toLowerCase()} encontrado
                  </TableCell>
                </TableRow>
              ) : (
                table.paginatedData.map(item => (
                  <TableRow key={item.id} hover>
                    {enableSelection && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={table.selectedItems.includes(item.id)}
                          onChange={() => table.crudActions.selectItem(item.id)}
                        />
                      </TableCell>
                    )}
                    
                    {columns.map(column => (
                      <TableCell key={column.key}>
                        {renderTableCell(item, column)}
                      </TableCell>
                    ))}
                    
                    <TableCell align="center">
                      {/* CORREÇÃO: Trocado 'flex' por 'display="flex"' */}
                      <DS.Box display="flex" justifyContent="center" gap={4}>
                        <Tooltip title="Editar">
                          <DS.IconButton
                            variant="primary"
                            size="small"
                            onClick={() => handleOpenForm(item)}
                          >
                            <EditIcon fontSize="small" />
                          </DS.IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Deletar">
                          <DS.IconButton
                            variant="error"
                            size="small"
                            onClick={() => table.crudActions.delete(item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </DS.IconButton>
                        </Tooltip>
                      </DS.Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* PAGINATION */}
        <TablePagination
          component="div"
          count={table.pagination.total}
          page={table.pagination.page}
          onPageChange={(_, page) => table.paginationActions.setPage(page)}
          rowsPerPage={table.pagination.rowsPerPage}
          onRowsPerPageChange={(e) => table.paginationActions.setRowsPerPage(Number(e.target.value))}
          rowsPerPageOptions={[12, 24, 48, 100]}
          labelRowsPerPage={`${entityName}s por página:`}
        />
      </DS.ItemCard>
      
      {/* FORM DIALOG */}
      <Dialog 
        open={formOpen} 
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingItem ? `Editar ${entityName}` : `Novo ${entityName}`}
          <DS.IconButton onClick={handleCloseForm}>
            <CloseIcon />
          </DS.IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {fields.map(renderFormField)}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseForm}>
            Cancelar
          </Button>
          <DS.ActionButton onClick={handleSubmitForm} disabled={table.loading}>
            {editingItem ? 'Atualizar' : 'Criar'}
          </DS.ActionButton>
        </DialogActions>
      </Dialog>
    </DS.Container>
  );
}

// ========================================
// WRAPPER COM withAuth
// ========================================

export function createCrudPage<T extends { id: string }>(
  config: CrudPageConfig<T>
) {
  const CrudPage = () => <CrudPageTemplate {...config} />;
  
  if (config.options?.requiredRole) {
    return withAuth(CrudPage, { requiredRole: config.options.requiredRole });
  }
  
  return withAuth(CrudPage);
}

export default CrudPageTemplate;