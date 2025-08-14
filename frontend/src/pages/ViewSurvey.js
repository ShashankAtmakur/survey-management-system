import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { surveyService } from '../services/surveyService';
import { Box, Typography, Paper } from '@mui/material';

const ViewSurvey = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const data = await surveyService.getSurvey(id);
        setSurvey(data);
      } catch (err) {
        setError('Failed to load survey.');
        console.error('Error loading survey:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSurvey();
  }, [id]);

  if (loading) return <Typography>Loading survey...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!survey) return <Typography>Survey not found.</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 2 }}>
      <Typography variant="h4" mb={2}>{survey.title}</Typography>
      <Typography variant="body1" mb={4}>{survey.description}</Typography>

      {survey.questions.map((q, idx) => (
        <Paper key={idx} variant="outlined" sx={{ padding: 2, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom>{`Question ${idx + 1}:`}</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>{q.text}</Typography>
          {q.options && q.options.length > 0 && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              Type: {q.type} | Options: {q.options.join(', ')}
            </Typography>
          )}
          <Typography variant="body2">Required: {q.required ? 'Yes' : 'No'}</Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default ViewSurvey;
