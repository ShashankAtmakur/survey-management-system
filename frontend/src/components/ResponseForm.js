import React, { useState } from 'react';
import SurveyInput from './SurveyInput';

const ResponseForm = ({ survey, onSubmit }) => {
  const [responses, setResponses] = useState({});
  const [error, setError] = useState('');

  const updateResponse = (questionText, value) => {
    console.log(`Updating response for "${questionText}": ${value}`);
    setResponses(prev => ({ ...prev, [questionText]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required questions
    const missing = survey.questions.find(q => q.required && !responses[q.text]);
    if (missing) {
      setError(`Please answer the required question: "${missing.text}"`);
      return;
    }

    setError('');
    console.log('Submitting responses:', responses);
    onSubmit({ responses });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2>{survey.title}</h2>
      <p>{survey.description}</p>

      {survey.questions.map((q, idx) => (
        <div className="question-container" key={idx} style={{ marginBottom: '2rem' }}>
          <label style={{ fontWeight: 'bold' }}>
            {q.text} {q.required && <span style={{ color: 'red' }}>*</span>}
          </label>
          <SurveyInput question={q} onChange={(val) => updateResponse(q.text, val)} />
        </div>
      ))}

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <button type="submit" style={{ fontSize: '1.1rem', padding: '0.6rem 1.2rem' }}>
        Submit Response
      </button>
    </form>
  );
};

export default ResponseForm;
