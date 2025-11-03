"use client";
import React, { useState, useEffect } from 'react';
import MaterialForm from './MaterialForm';
import documentService, { DocumentMaterial } from '../../services/documentService';

/**
 * MaterialList component
 * Displays a table of materials with actions.
 */
const MaterialList: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [materials, setMaterials] = useState<DocumentMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load materials on component mount
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getAllDocuments();
      setMaterials(data);
    } catch (err) {
      setError('Failed to load materials');
      console.error('Error loading materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (data: any) => {
    try {
      if (data.file) {
        // Upload file
        await documentService.uploadDocument({
          file: data.file,
          name: data.name,
          description: data.description
        });
      } else if (data.text) {
        // Create from text
        await documentService.createDocumentFromText({
          name: data.name,
          description: data.description,
          content: data.text
        });
      }
      
      setShowModal(false);
      loadMaterials(); // Reload the list
    } catch (err) {
      console.error('Error adding material:', err);
      alert('Failed to add material. Please try again.');
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await documentService.deleteDocument(id);
      loadMaterials(); // Reload the list
    } catch (err) {
      console.error('Error deleting material:', err);
      alert('Failed to delete material. Please try again.');
    }
  };

  const handleSyncMaterial = async (id: number) => {
    try {
      await documentService.updateDocumentStatus(id, 'syncing');
      // Simulate processing time
      setTimeout(() => {
        documentService.updateDocumentStatus(id, 'ready');
        loadMaterials();
      }, 2000);
      loadMaterials(); // Reload to show syncing status
    } catch (err) {
      console.error('Error syncing material:', err);
      alert('Failed to sync material. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-600';
      case 'syncing':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading materials...</div>
      </div>
    );
  }

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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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
          {materials.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No materials found. Add your first material to get started.
              </td>
            </tr>
          ) : (
            materials.map((mat) => (
              <tr key={mat.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{mat.name}</td>
                <td className="px-4 py-2">{mat.description || '-'}</td>
                <td className="px-4 py-2">{new Date(mat.created_at).toLocaleString()}</td>
                <td className={`px-4 py-2 capitalize ${getStatusColor(mat.status)}`}>
                  {mat.status}
                </td>
                <td className="px-4 py-2 text-center">{mat.chunk_count}</td>
                <td className="px-4 py-2 space-x-2">
                  <button 
                    className="text-blue-600 hover:underline"
                    onClick={() => alert('Edit functionality coming soon')}
                  >
                    Edit
                  </button>
                  <button 
                    className="text-red-600 hover:underline"
                    onClick={() => handleDeleteMaterial(mat.id)}
                  >
                    Delete
                  </button>
                  <button 
                    className="text-green-600 hover:underline"
                    onClick={() => handleSyncMaterial(mat.id)}
                    disabled={mat.status === 'syncing'}
                  >
                    {mat.status === 'syncing' ? 'Syncing...' : 'Sync'}
                  </button>
                </td>
              </tr>
            ))
          )}
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