import React from 'react';
import { Box, Typography, Paper, LinearProgress } from '@mui/material';

const Analytics = ({ analyticsData }) => {
  if (!analyticsData) return null;

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" mb={3}>Survey Analytics</Typography>
      <Typography variant="h6" mb={2}>
        Total Responses: {analyticsData.total_responses}
      </Typography>
      {Object.entries(analyticsData.analytics).map(([question, data], idx) => (
        <Paper key={idx} variant="outlined" sx={{ padding: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {question}
          </Typography>
          {typeof data.data === 'string'
            ? <Typography color="text.secondary">{data.data}</Typography>
            : (
              <>
                {data.type === 'rating' && (
                  <>
                    <Typography>Average: {data.data.average} / 10</Typography>
                    <Typography>Median: {data.data.median}</Typography>
                    <Typography>Min: {data.data.min} / Max: {data.data.max}</Typography>
                  </>
                )}
                {data.type === 'multiple_choice' && data.data.responses && (
                  Object.entries(data.data.responses).map(([choice, count]) => (
                    <Box key={choice} mb={1}>
                      <Typography>{choice}: {count} ({data.data.percentages[choice]}%)</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={data.data.percentages[choice]}
                        sx={{ height: 8, borderRadius: 4, background: "#eee", mb: 0.5 }}
                      />
                    </Box>
                  ))
                )}
                {data.type === 'text' && (
                  <>
                    <Typography>Answer samples: {data.data.sample_responses?.join(' | ')}</Typography>
                  </>
                )}
                {/* Extend for yes_no/audio/number as needed */}
              </>
            )}
          <Typography mt={2} variant="body2" color="text.secondary">
            Responses: {data.response_count}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};
export default Analytics;
