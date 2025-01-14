import React, { useState } from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface DocumentViewerProps {
  document: {
    title: string;
    fileUrl: string;
    fileType: string;
    fileName: string;
  };
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = document.fileUrl;
    link.download = document.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-6xl h-[90vh] flex flex-col rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">{document.title}</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownload}
              className="text-gray-400 hover:text-gray-500"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-hidden p-6">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-600">{error}</div>
            </div>
          )}

          <iframe
            src={document.fileUrl}
            className="w-full h-full"
            onLoad={() => setLoading(false)}
            onError={() => setError('Failed to load document')}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {document.fileName}
          </div>
          <div className="flex space-x-4">
            <button className="btn btn-secondary">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </button>
            <button className="btn btn-secondary">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;