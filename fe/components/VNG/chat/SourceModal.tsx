import React from 'react';
import { Source } from '@/services/chatService';

interface SourceModalProps {
  sources: Source[];
  isOpen: boolean;
  onClose: () => void;
}

const SourceModal: React.FC<SourceModalProps> = ({ sources, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Nguồn tham khảo</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          {sources.map((source, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-blue-600">
                  {source.metadata?.filename || 'Tài liệu không xác định'}
                </h3>
                {source.relevance_score && (
                  <span className="text-sm text-gray-500">
                    Độ liên quan: {(1 - source.relevance_score).toFixed(2)}
                  </span>
                )}
              </div>
              
              {source.metadata?.file_type && (
                <div className="text-sm text-gray-500 mb-2">
                  Loại file: {source.metadata.file_type.toUpperCase()}
                </div>
              )}
              
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium mb-1">Nội dung:</div>
                <div className="whitespace-pre-wrap text-gray-700">
                  {source.chunk}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SourceModal; 