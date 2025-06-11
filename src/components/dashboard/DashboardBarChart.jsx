// src/components/dashboard/DashboardBarChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box, useTheme } from '@mui/material';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: payload[0].color }}>
          {`${payload[0].name}: ${payload[0].value.toLocaleString()}`}
        </Typography>
      </Paper>
    );
  }
  return null;
};

const DashboardBarChart = ({ data, title, dataKey, xAxisKey, name }) => {
  const theme = useTheme();

  return (
    <Paper variant="outlined" sx={{ p: {xs: 2, md: 3}, height: '400px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
            {/* CAMBIO DE COLOR: Usamos el color secundario para las barras */}
            <Bar name={name} dataKey={dataKey} fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default DashboardBarChart;