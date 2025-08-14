import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { surveyService } from '../services/surveyService';
import Analytics from '../components/Analytics'; // This is just the visualizer

const AnalyticsPage = () => {
  const { id } = useParams();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    surveyService.getAnalytics(id)
      .then(setAnalyticsData)
      .catch(err => setError(err.message || "Error loading analytics."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Loading analytics...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 50 }}>{error}</div>;
  if (!analyticsData) return <div style={{ textAlign: 'center', marginTop: 50 }}>No analytics found.</div>;

  return <Analytics analyticsData={analyticsData} />;
};

export default AnalyticsPage;
