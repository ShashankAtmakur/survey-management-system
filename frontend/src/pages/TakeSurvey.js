import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResponseForm from '../components/ResponseForm';
import { surveyService } from '../services/surveyService';

const TakeSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const data = await surveyService.getSurvey(id);
        setSurvey(data);
      } catch (err) {
        setError('Failed to load the survey.');
      } finally {
        setLoading(false);
      }
    };
    loadSurvey();
  }, [id]);

  const handleSubmit = async (responseData) => {
    try {
      await surveyService.submitResponse(id, responseData);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit your response. Please try again.');
    }
  };

  if (loading) return <div>Loading survey...</div>;

  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  if (!survey) return <div>Survey not found.</div>;

  if (submitted) {
    return (
      <div style={{ maxWidth: '700px', margin: '40px auto', textAlign: 'center' }}>
        <h2>Thank you for your response!</h2>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '0.6rem 1.2rem' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="take-survey-page" style={{ padding: '20px' }}>
      <ResponseForm survey={survey} onSubmit={handleSubmit} />
    </div>
  );
};

export default TakeSurvey;
