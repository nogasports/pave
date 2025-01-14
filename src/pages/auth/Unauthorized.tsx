import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <ShieldOff className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this portal.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link 
            to="/"
            className="btn btn-primary w-full flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Return to Home
          </Link>
          <Link
            to="/auth/login"
            className="btn btn-secondary w-full"
          >
            Try Different Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;