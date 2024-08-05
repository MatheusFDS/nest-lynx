import React from 'react';
import { Typography, useTheme, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatisticsPieChartProps {
  title: string;
  data: { name: string; value: number }[];
}

const StatisticsPieChart: React.FC<StatisticsPieChartProps> = ({ title, data }) => {
  const theme = useTheme();
  const COLORS = [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main];

  return (
    <Box sx={{ width: '100%', height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width="80%" height="80%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={theme.palette.primary.main}
              dataKey="value"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" align="center" layout="horizontal" />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default StatisticsPieChart;
