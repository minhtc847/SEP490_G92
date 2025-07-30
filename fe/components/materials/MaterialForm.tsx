"use client";

import React, { useState } from 'react';

interface MaterialFormProps {
  onSubmit: (data: {
    name: string;
    description?: string;
    file?: File;
    text?: string;
  }) => void;
  onCancel: () => void;
}

const MaterialForm: React.FC<MaterialFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      if (mode === 'file' && !file) {
        setError('Please upload a PDF or .txt file');
        return;
      }
      if (mode === 'text' && !text.trim()) {
        setError('Please enter the material content');
        return;
      }

      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        file: mode === 'file' ? file || undefined : undefined,
        text: mode === 'text' ? text.trim() : undefined,
      });
    } catch (err) {
      setError('Failed to submit material. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Add Material</h2>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      
      <div>
        <label className="block font-medium mb-1">Name <span className="text-red-500">*</span></label>
        <input
          className="w-full border rounded px-3 py-2"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      
      <div>
        <label className="block font-medium mb-1">Description</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label className="block font-medium mb-1">Content Source <span className="text-red-500">*</span></label>
        <div className="flex items-center gap-4 mb-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="mode"
              value="file"
              checked={mode === 'file'}
              onChange={() => setMode('file')}
              disabled={loading}
            />
            Upload file
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="mode"
              value="text"
              checked={mode === 'text'}
              onChange={() => setMode('text')}
              disabled={loading}
            />
            Manual text
          </label>
        </div>
        
        {mode === 'file' && (
          <div>
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, TXT, DOCX (max 10MB)</p>
          </div>
        )}
        
        {mode === 'text' && (
          <div>
            <textarea
              className="w-full border rounded px-3 py-2 mt-2"
              rows={8}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter material content here..."
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Enter the material content that will be used for AI processing</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          className="px-4 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default MaterialForm; 