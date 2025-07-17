"use client";
import React, { useState } from 'react';
import MaterialForm from './MaterialForm';

/**
 * MaterialList component
 * Displays a table of materials with actions.
 */
const mockMaterials = [
  {
    id: '1',
    name: 'Sample Material',
    description: 'A sample document',
    createdAt: '2024-07-15T10:00:00Z',
    status: 'ready',
    chunkCount: 5,
  },
];

const MaterialList: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const handleAddMaterial = (data: any) => {
    // For now, just log the data. Later, call API and update list.
    console.log('Material submitted:', data);
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-lg">Materials</span>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          Add Material
        </button>
      </div>
      {/* Table */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Created At</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Chunks</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockMaterials.map((mat) => (
            <tr key={mat.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium">{mat.name}</td>
              <td className="px-4 py-2">{mat.description}</td>
              <td className="px-4 py-2">{new Date(mat.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2 capitalize">{mat.status}</td>
              <td className="px-4 py-2 text-center">{mat.chunkCount}</td>
              <td className="px-4 py-2 space-x-2">
                <button className="text-blue-600 hover:underline">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
                <button className="text-green-600 hover:underline">Sync</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal for Add Material */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <MaterialForm onSubmit={handleAddMaterial} onCancel={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialList; 