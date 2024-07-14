import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, SelectChangeEvent } from '@mui/material';
import useMetadata, { Column } from '../../hooks/useMetadata';
import { useAuth } from '../../context/AuthContext';

interface TableColumnSelectorProps {
  onTableChange: (table: string) => void;
  onColumnsChange: (columns: string[]) => void;
}

const TableColumnSelector: React.FC<TableColumnSelectorProps> = ({ onTableChange, onColumnsChange }) => {
  const { isLoggedIn } = useAuth();
  const token = localStorage.getItem('token') || '';
  const metadata = useMetadata(token);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const handleTableChange = (event: SelectChangeEvent<string>) => {
    const table = event.target.value as string;
    setSelectedTable(table);
    setSelectedColumns([]);
    onTableChange(table);
  };

  const handleColumnChange = (event: SelectChangeEvent<string[]>) => {
    const columns = event.target.value as string[];
    setSelectedColumns(columns);
    onColumnsChange(columns);
  };

  if (!metadata) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <FormControl style={{ minWidth: 200, marginBottom: 20 }}>
        <InputLabel>Tabela</InputLabel>
        <Select value={selectedTable} onChange={handleTableChange}>
          {Object.keys(metadata).map(table => (
            <MenuItem key={table} value={table}>
              {table}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedTable && (
        <FormControl style={{ minWidth: 200, marginBottom: 20 }}>
          <InputLabel>Colunas</InputLabel>
          <Select
            multiple
            value={selectedColumns}
            onChange={handleColumnChange}
            renderValue={(selected) => (selected as string[]).join(', ')}
          >
            {metadata[selectedTable].map((column: Column) => (
              <MenuItem key={column.column_name} value={column.column_name}>
                <Checkbox checked={selectedColumns.indexOf(column.column_name) > -1} />
                <ListItemText primary={column.column_name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
};

export default TableColumnSelector;
