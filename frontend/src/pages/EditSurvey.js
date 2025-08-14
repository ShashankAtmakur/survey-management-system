import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SurveyForm from '../components/SurveyForm';
import { surveyService } from '../services/surveyService';

const EditSurvey = () => {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    loadSurvey();
  }, [id]);

  const loadSurvey = async () => {
    try {
      const data = await surveyService.getSurvey(id);
      setSurvey(data);
    } catch (error) {
      console.error('Error loading survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (surveyData) => {
    try {
      await surveyService.updateSurvey(id, surveyData);
      navigate('/');
    } catch (error) {
      console.error('Error updating survey:', error);
      alert('Failed to update survey');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!survey) return <div>Survey not found</div>;

  return (
    <div className="edit-survey-page">
      <h2>Edit Survey</h2>
      <SurveyForm 
        initialData={survey} 
        onSubmit={handleUpdate} 
        isEditing={true} 
      />
    </div>
  );
};

export default EditSurvey;
