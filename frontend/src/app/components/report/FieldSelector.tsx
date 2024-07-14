import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, SelectChangeEvent } from '@mui/material';
import useMetadata, { Column } from '../../hooks/useMetadata';

interface FieldSelectorProps {
  onFieldsChange: (fields: string[]) => void;
  token: string;
}

const FieldSelector: React.FC<FieldSelectorProps> = ({ onFieldsChange, token }) => {
  const metadata = useMetadata(token);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleTableChange = (event: SelectChangeEvent<string>) => {
    const table = event.target.value as string;
    setSelectedTable(table);
    setSelectedFields([]);
    onFieldsChange([]);
  };

  const handleFieldChange = (event: SelectChangeEvent<string[]>) => {
    const fields = event.target.value as string[];
    setSelectedFields(fields);
    onFieldsChange(fields);
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
          <InputLabel>Campos</InputLabel>
          <Select
            multiple
            value={selectedFields}
            onChange={handleFieldChange}
            renderValue={(selected) => (selected as string[]).join(', ')}
          >
            {metadata[selectedTable].map((column: Column) => (
              <MenuItem key={column.column_name} value={column.column_name}>
                <Checkbox checked={selectedFields.indexOf(column.column_name) > -1} />
                <ListItemText primary={column.column_name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
};

export default FieldSelector;
