import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

interface ParameterConfiguratorProps {
  onParametersChange: (parameters: { [key: string]: string }) => void;
}

const ParameterConfigurator: React.FC<ParameterConfiguratorProps> = ({ onParametersChange }) => {
  const [parameters, setParameters] = useState<{ [key: string]: string }>({});
  const [key, setKey] = useState<string>('');
  const [value, setValue] = useState<string>('');

  const handleAddParameter = () => {
    setParameters({ ...parameters, [key]: value });
    setKey('');
    setValue('');
    onParametersChange({ ...parameters, [key]: value });
  };

  return (
    <Box>
      <TextField
        label="Nome do Parâmetro"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        variant="outlined"
        style={{ marginBottom: 20, marginRight: 10 }}
      />
      <TextField
        label="Valor do Parâmetro"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        variant="outlined"
        style={{ marginBottom: 20, marginRight: 10 }}
      />
      <Button variant="contained" color="primary" onClick={handleAddParameter}>
        Adicionar Parâmetro
      </Button>
    </Box>
  );
};

export default ParameterConfigurator;
