import React, { useState } from 'react';
import FieldSelector from './FieldSelector';
import ParameterConfigurator from './ParameterConfigurator';
import LayoutSelector from './LayoutSelector';
import { Button } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchFilteredData } from '../../../services/metadataService';
import { useAuth } from '../../context/AuthContext';

const ReportBuilder: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const token = localStorage.getItem('token') || '';
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [parameters, setParameters] = useState<{ [key: string]: string }>({});
  const [selectedLayout, setSelectedLayout] = useState<string>('default');

  const handleGenerateReport = async () => {
    try {
      const data = await fetchFilteredData(token, 'your_table_name', selectedFields, parameters);

      const doc = new jsPDF();
      const tableColumns = selectedFields;
      const tableRows = data.map((row: any) =>
        selectedFields.map(field => row[field]?.toString() || '')
      );

      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
      });

      doc.save('report.pdf');
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <div>
      <FieldSelector onFieldsChange={setSelectedFields} token={token} />
      <ParameterConfigurator onParametersChange={setParameters} />
      <LayoutSelector onLayoutChange={setSelectedLayout} />
      <Button variant="contained" color="primary" onClick={handleGenerateReport}>
        Gerar Relatório
      </Button>
    </div>
  );
};

export default ReportBuilder;
