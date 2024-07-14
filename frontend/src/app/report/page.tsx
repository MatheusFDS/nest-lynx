'use client'

import React from 'react';
import ReportBuilder from '../components/report/ReportBuilder';
import withAuth from '../hoc/withAuth';

const ReportsPage: React.FC = () => {
  return (
    <div>
      <h1>Construção de Relatórios</h1>
      <ReportBuilder />
    </div>
  );
};

export default withAuth(ReportsPage);
