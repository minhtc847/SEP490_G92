import React from 'react';
import MaterialList from '../../../components/materials/MaterialList';

/**
 * Material Management Page
 * Displays a list of materials and actions to manage them.
 */
const MaterialsPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Material Management</h1>
      <div className="bg-white rounded shadow p-4">
        <MaterialList />
      </div>
    </div>
  );
};

export default MaterialsPage; 