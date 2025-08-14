import React, { useState } from 'react';
import AIQuestionGenerator from './AIQuestionGenerator';

const defaultQuestion = { text: '', type: 'text', options: [], required: true };

const SurveyForm = ({ initialData = {}, onSubmit, isEditing = false }) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [questions, setQuestions] = useState(initialData.questions || []);

  const addQuestion = (question = defaultQuestion) => {
    setQuestions([...questions, question]);
  };

  const updateQuestion = (index, updated) => {
    const qCopy = [...questions];
    qCopy[index] = updated;
    setQuestions(qCopy);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Each question must have all required fields!
    const prepared = questions.map(q => ({
      text: (q && q.text) != null ? q.text : '',
      type: (q && q.type) != null ? q.type : 'text',
      options: Array.isArray(q && q.options) ? q.options : [],
      required: (q && q.required) != null ? q.required : true,
    }));
    onSubmit({
      title,
      description,
      questions: prepared
    });
  };

  const handleGenerated = (genQuestions) => {
    setQuestions([...questions, ...genQuestions]);
  };

  return (
    <form className="survey-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Survey Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>
      <AIQuestionGenerator onQuestionsGenerated={handleGenerated} />
      <div className="questions-section">
        <h3>Questions</h3>
        {questions.map((q, idx) => (
          <div key={idx} className="question-form">
            <input
              type="text"
              value={q.text}
              placeholder="Question text"
              required
              onChange={e => updateQuestion(idx, { ...q, text: e.target.value })}
            />
            <select
              value={q.type}
              onChange={e => updateQuestion(idx, { ...q, type: e.target.value })}
            >
              <option value="text">Text</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="rating">Rating</option>
              <option value="number">Number</option>
              <option value="yes_no">Yes/No</option>
              <option value="audio">Audio</option>
            </select>
            {q.type === 'multiple_choice' && (
              <input
                type="text"
                value={q.options.join(', ')}
                placeholder="Options (comma separated)"
                onChange={e =>
                  updateQuestion(idx, {
                    ...q,
                    options: e.target.value.split(',').map(opt => opt.trim()),
                  })
                }
              />
            )}
            <label>
              <input
                type="checkbox"
                checked={q.required}
                onChange={e => updateQuestion(idx, { ...q, required: e.target.checked })}
              />
              Required
            </label>
            <button type="button" onClick={() => removeQuestion(idx)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addQuestion()}>
          Add Question
        </button>
      </div>
      <button type="submit" className="submit-btn">
        {isEditing ? 'Update Survey' : 'Create Survey'}
      </button>
    </form>
  );
};

export default SurveyForm;
