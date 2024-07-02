import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Grid, Paper, Typography } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface ChartData {
  name: string;
  value: number;
}

interface StatisticsChartProps {
  title: string;
  data: ChartData[];
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ title, data }) => {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper elevation={3} style={{ padding: '16px' }}>
        <Typography variant="h6">{title}</Typography>
        <PieChart width={200} height={200}>
          <Pie data={data} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value" label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Paper>
    </Grid>
  );
};

export default StatisticsChart;
