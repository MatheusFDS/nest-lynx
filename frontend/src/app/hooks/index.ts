// src/hooks/index.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../../services/api/client';
import { useLoading } from '../context/LoadingContext';
import { useMessage } from '../context/MessageContext';

// ========================================
// TYPES PARA HOOKS
// ========================================

export interface CrudState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  selectedItems: string[];
}

export interface CrudActions<T> {
  refresh: () => Promise<void>;
  create: (item: Partial<T>) => Promise<T | null>;
  update: (id: string, item: Partial<T>) => Promise<T | null>;
  delete: (id: string) => Promise<boolean>;
  deleteMany: (ids: string[]) => Promise<boolean>;
  selectItem: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  getById: (id: string) => T | undefined;
}

export interface FilterState {
  searchTerm: string;
  dateStart: string;
  dateEnd: string;
  status: string;
  customFilters: Record<string, any>;
}

export interface FilterActions {
  setSearchTerm: (term: string) => void;
  setDateRange: (start: string, end: string) => void;
  setStatus: (status: string) => void;
  setCustomFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  clearFilter: (key: string) => void;
  hasActiveFilters: boolean;
}

export interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

// ========================================
// HOOK 1: useCrud - CRUD Operations
// ========================================
interface UseCrudOptions<T> {
    autoLoad?: boolean;
    globalLoading?: boolean;
    initialData?: T[];
}

export function useCrud<T = any>(
  endpoint: string,
  options: UseCrudOptions<T> = {}
): CrudState<T> & CrudActions<T> {
  
  const { autoLoad = true, globalLoading = false, initialData = [] } = options;
  
  // States
  const [data, setData] = useState<T[]>(initialData);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Contexts
  const { setLoading: setGlobalLoading } = useLoading();
  const { showMessage } = useMessage();
  
  // Determine which loading to use
  const loading = globalLoading ? false : localLoading;
  const setLoading = globalLoading ? setGlobalLoading : setLocalLoading;
  
  // Create service instance
  const service = useMemo(() => apiClient.createCrudService<T>(endpoint), [endpoint]);
  
  // ========================================
  // CRUD OPERATIONS
  // ========================================
  
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await service.list();
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar dados';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [service, setLoading, showMessage]);
  
  const create = useCallback(async (item: Partial<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const newItem = await service.create(item);
      setData(prev => [...prev, newItem]);
      showMessage('Item criado com sucesso!', 'success');
      return newItem;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar item';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, setLoading, showMessage]);
  
  const update = useCallback(async (id: string, item: Partial<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedItem = await service.update(id, item);
      setData(prev => prev.map(existing => 
        (existing as any).id === id ? updatedItem : existing
      ));
      showMessage('Item atualizado com sucesso!', 'success');
      return updatedItem;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar item';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, setLoading, showMessage]);
  
  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await service.delete(id);
      setData(prev => prev.filter(item => (item as any).id !== id));
      setSelectedItems(prev => prev.filter(selectedId => selectedId !== id));
      showMessage('Item deletado com sucesso!', 'success');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao deletar item';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [service, setLoading, showMessage]);
  
  const deleteMany = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Delete em paralelo para performance
      await Promise.all(ids.map(id => service.delete(id)));
      
      setData(prev => prev.filter(item => !ids.includes((item as any).id)));
      setSelectedItems([]);
      showMessage(`${ids.length} itens deletados com sucesso!`, 'success');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao deletar itens';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [service, setLoading, showMessage]);
  
  // ========================================
  // SELECTION OPERATIONS
  // ========================================
  
  const selectItem = useCallback((id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }, []);
  
  const selectAll = useCallback(() => {
    const allIds = data.map(item => (item as any).id);
    setSelectedItems(prev => 
      prev.length === allIds.length ? [] : allIds
    );
  }, [data]);
  
  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);
  
  const getById = useCallback((id: string): T | undefined => {
    return data.find(item => (item as any).id === id);
  }, [data]);
  
  // ========================================
  // EFFECTS
  // ========================================
  
  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);
  
  return {
    // State
    data,
    loading,
    error,
    selectedItems,
    
    // Actions
    refresh,
    create,
    update,
    delete: deleteItem,
    deleteMany,
    selectItem,
    selectAll,
    clearSelection,
    getById,
  };
}

// ========================================
// HOOK 2: useFilters - Filter Management
// ========================================

export function useFilters<T = any>(
  data: T[],
  filterFunctions: {
    search?: (item: T, term: string) => boolean;
    dateRange?: (item: T, start: string, end: string) => boolean;
    status?: (item: T, status: string) => boolean;
    custom?: Record<string, (item: T, value: any) => boolean>;
  } = {}
): {
  filteredData: T[];
  filters: FilterState;
  actions: FilterActions;
} {
  
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    dateStart: '',
    dateEnd: '',
    status: '',
    customFilters: {},
  });
  
  // ========================================
  // FILTER ACTIONS
  // ========================================
  
  const setSearchTerm = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  }, []);
  
  const setDateRange = useCallback((start: string, end: string) => {
    setFilters(prev => ({ ...prev, dateStart: start, dateEnd: end }));
  }, []);
  
  const setStatus = useCallback((status: string) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);
  
  const setCustomFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      customFilters: { ...prev.customFilters, [key]: value }
    }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      dateStart: '',
      dateEnd: '',
      status: '',
      customFilters: {},
    });
  }, []);
  
  const clearFilter = useCallback((key: string) => {
    if (key === 'searchTerm' || key === 'dateStart' || key === 'dateEnd' || key === 'status') {
      setFilters(prev => ({ ...prev, [key]: '' }));
    } else {
      setFilters(prev => {
        const newCustomFilters = { ...prev.customFilters };
        delete newCustomFilters[key];
        return { ...prev, customFilters: newCustomFilters };
      });
    }
  }, []);
  
  // ========================================
  // FILTERED DATA COMPUTATION
  // ========================================
  
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Search filter
    if (filters.searchTerm && filterFunctions.search) {
      result = result.filter(item => filterFunctions.search!(item, filters.searchTerm));
    } else if (filters.searchTerm && !filterFunctions.search) {
      // Default search: busca em todas as propriedades string
      result = result.filter(item =>
        Object.values(item as any).some(value =>
          value?.toString().toLowerCase().includes(filters.searchTerm.toLowerCase())
        )
      );
    }
    
    // Date range filter
    if (filters.dateStart && filters.dateEnd && filterFunctions.dateRange) {
      result = result.filter(item => 
        filterFunctions.dateRange!(item, filters.dateStart, filters.dateEnd)
      );
    }
    
    // Status filter
    if (filters.status && filterFunctions.status) {
      result = result.filter(item => filterFunctions.status!(item, filters.status));
    }
    
    // Custom filters
    Object.entries(filters.customFilters).forEach(([key, value]) => {
      if (value && filterFunctions.custom?.[key]) {
        result = result.filter(item => filterFunctions.custom![key](item, value));
      }
    });
    
    return result;
  }, [data, filters, filterFunctions]);
  
  // Check if has active filters
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.searchTerm ||
      filters.dateStart ||
      filters.dateEnd ||
      filters.status ||
      Object.keys(filters.customFilters).length > 0
    );
  }, [filters]);
  
  return {
    filteredData,
    filters,
    actions: {
      setSearchTerm,
      setDateRange,
      setStatus,
      setCustomFilter,
      clearFilters,
      clearFilter,
      hasActiveFilters,
    },
  };
}

// ========================================
// HOOK 3: usePagination - Pagination Management
// ========================================

export function usePagination<T = any>(
  data: T[],
  defaultRowsPerPage: number = 12
): {
  paginatedData: T[];
  pagination: PaginationState;
  actions: PaginationActions;
} {
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  
  const total = data.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  
  // ========================================
  // PAGINATION ACTIONS
  // ========================================
  
  const handleSetPage = useCallback((newPage: number) => {
    setPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  }, [totalPages]);
  
  const handleSetRowsPerPage = useCallback((rows: number) => {
    setRowsPerPage(rows);
    setPage(0); // Reset to first page
  }, []);
  
  const nextPage = useCallback(() => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  }, [page, totalPages]);
  
  const prevPage = useCallback(() => {
    if (page > 0) {
      setPage(page - 1);
    }
  }, [page]);
  
  const goToFirstPage = useCallback(() => {
    setPage(0);
  }, []);
  
  const goToLastPage = useCallback(() => {
    setPage(totalPages - 1);
  }, [totalPages]);
  
  // Reset page when data changes
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(0);
    }
  }, [page, totalPages]);
  
  // ========================================
  // PAGINATED DATA
  // ========================================
  
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return data.slice(startIndex, startIndex + rowsPerPage);
  }, [data, page, rowsPerPage]);
  
  return {
    paginatedData,
    pagination: {
      page,
      rowsPerPage,
      total,
    },
    actions: {
      setPage: handleSetPage,
      setRowsPerPage: handleSetRowsPerPage,
      nextPage,
      prevPage,
      goToFirstPage,
      goToLastPage,
    },
  };
}

// ========================================
// HOOK 4: useTableState - Combina CRUD + Filters + Pagination
// ========================================
// CORREÇÃO: Tipagem do parâmetro 'options' para carregar o tipo genérico T
interface UseTableStateOptions<T> {
    defaultRowsPerPage?: number;
    filterFunctions?: Parameters<typeof useFilters<T>>[1];
    crudOptions?: UseCrudOptions<T>;
}

export function useTableState<T = any>(
  endpoint: string,
  options: UseTableStateOptions<T> = {}
) {
  const {
    defaultRowsPerPage = 12,
    filterFunctions = {},
    crudOptions = {}
  } = options;
  
  // CRUD operations
  const crud = useCrud<T>(endpoint, crudOptions);
  
  // Filters
  const { filteredData, filters, actions: filterActions } = useFilters(
    crud.data,
    filterFunctions
  );
  
  // Pagination
  const { paginatedData, pagination, actions: paginationActions } = usePagination(
    filteredData,
    defaultRowsPerPage
  );
  
  return {
    // Data states
    data: crud.data,
    filteredData,
    paginatedData,
    
    // States
    loading: crud.loading,
    error: crud.error,
    selectedItems: crud.selectedItems,
    
    // Filter state & actions
    filters,
    filterActions,
    
    // Pagination state & actions
    pagination,
    paginationActions,
    
    // CRUD actions
    crudActions: {
      refresh: crud.refresh,
      create: crud.create,
      update: crud.update,
      delete: crud.delete,
      deleteMany: crud.deleteMany,
      selectItem: crud.selectItem,
      selectAll: crud.selectAll,
      clearSelection: crud.clearSelection,
      getById: crud.getById,
    },
  };
}

// ========================================
// HOOKS ESPECÍFICOS (para casos especiais)
// ========================================

// Hook para gerenciar status de pedidos
export function useOrderStatus() {
  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      const result = await apiClient.patch(`/orders/${orderId}`, { status });
      return result;
    } catch (error) {
      throw error;
    }
  }, []);
  
  return { updateOrderStatus };
}

// Hook para operações de entrega
export function useDeliveryActions() {
  const { showMessage } = useMessage();
  
  const releaseDelivery = useCallback(async (deliveryId: string) => {
    try {
      await apiClient.patch(`/delivery/${deliveryId}/release`);
      showMessage('Entrega liberada com sucesso!', 'success');
      return true;
    } catch (error: any) {
      showMessage(error.message || 'Erro ao liberar entrega', 'error');
      return false;
    }
  }, [showMessage]);
  
  const rejectDelivery = useCallback(async (deliveryId: string, motivo: string) => {
    try {
      await apiClient.patch(`/delivery/${deliveryId}/reject`, { motivo });
      showMessage('Entrega rejeitada com sucesso!', 'success');
      return true;
    } catch (error: any) {
      showMessage(error.message || 'Erro ao rejeitar entrega', 'error');
      return false;
    }
  }, [showMessage]);
  
  return { releaseDelivery, rejectDelivery };
}

// Hook para estatísticas
export function useStatistics(autoLoad: boolean = true) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadStatistics = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.get('/statistics', { 
        params: { startDate, endDate } 
      });
      setStats(result);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    stats,
    loading,
    error,
    loadStatistics,
  };
}