import React, { useState, useEffect, useRef } from 'react';

const SurveyInput = ({ question, onChange }) => {
  const [text, setText] = useState('');
  const [number, setNumber] = useState('');
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (question.type === 'audio') {
      navigator.mediaDevices.getUserMedia({ audio: true }).catch(error => {
        console.error('Mic permission error:', error);
      });
    }
    setText('');
    setNumber('');
    setRecording(false);
    setAudioUrl(null);
  }, [question.type, question.text]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    onChange(val);
  };

  const handleNumberChange = (e) => {
    const val = e.target.value;
    setNumber(val);
    onChange(val);
  };

  const handleRadioChange = (e) => {
    onChange(e.target.value);
  };

  const handleRatingChange = (e) => {
    onChange(e.target.value);
  };

  const startRecording = async () => {
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = e => {
        audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrlLocal = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrlLocal);
        audioChunksRef.current = [];

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result;
          onChange(base64data);
        };
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setRecording(false);
      alert("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  switch (question.type) {
    case 'text':
      return (
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          required={question.required}
          placeholder="Your answer"
          aria-label={question.text}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={number}
          onChange={handleNumberChange}
          required={question.required}
          placeholder="Enter a number"
          aria-label={question.text}
        />
      );

    case 'multiple_choice':
      return (
        <div>
          {Array.isArray(question && question.options) && (question.options || []).map((option, idx) => (
            <label key={idx} style={{ display: 'block', marginBottom: '0.25rem' }}>
              <input
                type="radio"
                name={question.text}
                value={option}
                onChange={handleRadioChange}
                style={{ marginRight: '0.5rem' }}
              />
              {option}
            </label>
          ))}
        </div>
      );

    case 'rating':
      return (
        <select onChange={handleRatingChange} required={question.required} defaultValue="">
          <option value="" disabled>Select rating</option>
          {[1, 2, 3, 4, 5].map(score => (
            <option key={score} value={score}>{score}</option>
          ))}
        </select>
      );

    case 'yes_no':
      return (
        <div>
          <label style={{ marginRight: '1rem' }}>
            <input
              type="radio"
              name={question.text}
              value="Yes"
              onChange={handleRadioChange}
              required={question.required}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name={question.text}
              value="No"
              onChange={handleRadioChange}
              required={question.required}
            />
            No
          </label>
        </div>
      );

    case 'audio':
      return (
        <div>
          <button type="button" disabled={recording} onClick={startRecording}>
            Start Recording
          </button>
          <button type="button" disabled={!recording} onClick={stopRecording}>
            Stop Recording
          </button>
          {audioUrl && <audio controls src={audioUrl} style={{ display: 'block', marginTop: '10px' }} />}
        </div>
      );

    default:
      return <p>Unsupported question type: {question.type}</p>;
  }
};

export default SurveyInput;
