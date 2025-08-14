import React, { useState } from 'react';
import { surveyService } from '../services/surveyService';

const AIQuestionGenerator = ({ onQuestionsGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await surveyService.generateQuestions(prompt, questionCount);
      if (result.questions && result.questions.length > 0) {
        onQuestionsGenerated(result.questions);
        setPrompt('');
      } else {
        setError('No questions were generated. Please try a different prompt.');
      }
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error('AI generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-generator">
      <h4>AI Question Generator</h4>
      <div className="generator-controls">
        <textarea
          placeholder="Describe what kind of survey questions you want..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows="3"
        />
        <div className="generator-options">
          <label>
            Number of questions:
            <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={7}>7</option>
              <option value={10}>10</option>
            </select>
          </label>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="generate-btn"
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AIQuestionGenerator;
