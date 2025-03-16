'use client';
import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactMarkdown from 'react-markdown';

const RecommendationPage = () => {
  const [inputs, setInputs] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // GEMINI SECTION
  const genAI = new GoogleGenerativeAI("");

  const sendToGemini = async (message) => {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: 'Provide crop recommendations based on the given environmental and soil parameters. Suggest what crop should be grown on the soil',
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: 'text/plain',
        },
      });

      const chat = model.startChat({
        history: [],
        generationConfig: { temperature: 0.9 },
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse('');
    toast.info('Generating recommendations...');

    const message = `Provide crop recommendations based on these values:
      - Nitrogen (N): ${inputs.N} ppm
      - Phosphorus (P): ${inputs.P} ppm
      - Potassium (K): ${inputs.K} ppm
      - Temperature: ${inputs.temperature}°C
      - Humidity: ${inputs.humidity}%
      - pH: ${inputs.ph}
      - Rainfall: ${inputs.rainfall} mm`;

    try {
      const result = await sendToGemini(message);
      setResponse(result);
      toast.success('Recommendations generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while fetching recommendations.');
      toast.error('Failed to generate recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClear = () => {
    setInputs({
      N: '',
      P: '',
      K: '',
      temperature: '',
      humidity: '',
      ph: '',
      rainfall: ''
    });
    setResponse('');
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Plant Disease Prediction Recommendations</h1>
      
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="N" className="block mb-2">Nitrogen (N) (ppm):</label>
          <input
            type="number"
            id="N"
            name="N"
            value={inputs.N}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., 90"
            required
          />
        </div>

        <div>
          <label htmlFor="P" className="block mb-2">Phosphorus (P) (ppm):</label>
          <input
            type="number"
            id="P"
            name="P"
            value={inputs.P}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., 42"
            required
          />
        </div>

        <div>
          <label htmlFor="K" className="block mb-2">Potassium (K) (ppm):</label>
          <input
            type="number"
            id="K"
            name="K"
            value={inputs.K}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., 43"
            required
          />
        </div>

        <div>
          <label htmlFor="temperature" className="block mb-2">Temperature (°C):</label>
          <input
            type="number"
            step="0.01"
            id="temperature"
            name="temperature"
            value={inputs.temperature}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., 20.88"
            required
          />
        </div>

        <div>
          <label htmlFor="humidity" className="block mb-2">Humidity (%):</label>
          <input
            type="number"
            step="0.01"
            id="humidity"
            name="humidity"
            value={inputs.humidity}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., 82.00"
            required
          />
        </div>

        <div>
          <label htmlFor="ph" className="block mb-2">pH:</label>
          <input
            type="number"
            step="0.01"
            id="ph"
            name="ph"
            value={inputs.ph}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., 6.50"
            required
          />
        </div>

        <div>
          <label htmlFor="rainfall" className="block mb-2">Rainfall (mm):</label>
          <input
            type="number"
            step="0.01"
            id="rainfall"
            name="rainfall"
            value={inputs.rainfall}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., 202.94"
            required
          />
        </div>

        <div className="md:col-span-2 flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:bg-gray-400 transition"
          >
            {isLoading ? 'Generating...' : 'Get Recommendations'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Clear
          </button>
        </div>
      </form>

      {response && (
        <div className="mt-6 max-w-2xl">
          <h2 className="text-xl font-semibold mb-2 text-blue-600">Recommendations:</h2>
          <div className="p-4 bg-white border rounded">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationPage;