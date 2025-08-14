import React from 'react';
import { useNavigate } from 'react-router-dom';

const SurveyList = ({ surveys, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="survey-list">
      {surveys.map(survey => (
        <div key={survey.id} className="survey-card">
          <h3>{survey.title}</h3>
          <p>{survey.description}</p>
          <p>Created: {new Date(survey.created_at).toLocaleDateString()}</p>
          <div className="survey-actions">
            <button onClick={() => navigate(`/view/${survey.id}`)}>
              View
            </button>
            <button onClick={() => navigate(`/edit/${survey.id}`)}>
              Edit
            </button>
            <button onClick={() => navigate(`/dashboard/${survey.id}`)}>
              Analytics
            </button>
            <button onClick={() => navigate(`/take/${survey.id}`)}>
              Take Survey
            </button>
            <button 
              onClick={() => onDelete(survey.id)}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SurveyList;
