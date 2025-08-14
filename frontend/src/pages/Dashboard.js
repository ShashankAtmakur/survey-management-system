import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Analytics from '../components/Analytics';
import { analyticsService } from '../services/analyticsService';

const Dashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    loadAnalytics();
  }, [id]);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsService.getAnalytics(id);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;
  if (!analyticsData) return <div>No analytics data available</div>;

  return (
    <div className="dashboard-page">
      <h2>Survey Dashboard: {analyticsData.title}</h2>
      <Analytics analyticsData={analyticsData} />
    </div>
  );
};

export default Dashboard;
