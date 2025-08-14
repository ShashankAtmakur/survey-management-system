import React from 'react';
import { useNavigate } from 'react-router-dom';
import SurveyForm from '../components/SurveyForm';
import { surveyService } from '../services/surveyService';

const CreateSurvey = () => {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    try {
      await surveyService.createSurvey(data);
      navigate('/');
    } catch (error) {
      const detail =
        (error && error.response && error.response.data && error.response.data.detail)
          ? error.response.data.detail
          : (error && error.message)
            ? error.message
            : 'Unknown error';
      alert('Failed to create survey: ' + detail);
    }
  };

  return (
    <div className="create-survey-page">
      <h2>Create New Survey</h2>
      <SurveyForm onSubmit={handleCreate} />
    </div>
  );
};

export default CreateSurvey;
