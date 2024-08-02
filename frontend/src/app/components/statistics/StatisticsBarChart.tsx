import React from 'react';
import { Typography, useTheme, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface StatisticsBarChartProps {
  title: string;
  data: { name: string; value: number }[];
}

const StatisticsBarChart: React.FC<StatisticsBarChartProps> = ({ title, data }) => {
  const theme = useTheme();
  const COLORS = [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main];

  return (
    <Box sx={{ width: '100%', height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width="80%" height="80%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={theme.palette.primary.main}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default StatisticsBarChart;
