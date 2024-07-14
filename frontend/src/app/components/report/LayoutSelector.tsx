import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface LayoutSelectorProps {
  onLayoutChange: (layout: string) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ onLayoutChange }) => {
  const [selectedLayout, setSelectedLayout] = React.useState<string>('');

  const handleLayoutChange = (event: SelectChangeEvent<string>) => {
    const layout = event.target.value as string;
    setSelectedLayout(layout);
    onLayoutChange(layout);
  };

  return (
    <FormControl style={{ minWidth: 200, marginBottom: 20 }}>
      <InputLabel>Layout</InputLabel>
      <Select value={selectedLayout} onChange={handleLayoutChange}>
        <MenuItem value="default">Padrão</MenuItem>
        <MenuItem value="detailed">Detalhado</MenuItem>
        <MenuItem value="summary">Resumo</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LayoutSelector;
