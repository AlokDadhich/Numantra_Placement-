import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Home, Eye } from 'lucide-react';

const Success = () => {
  const location = useLocation();
  const name = location.state?.name || 'there';

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Successful!
            </h1>
            <p className="text-gray-600">
              Thank you, <span className="font-semibold text-teal-600">{name}</span>, for registering with Numantra Placement!
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>• Your application has been submitted successfully</li>
              <li>• You'll receive a confirmation email shortly</li>
              <li>• Our team will review your profile</li>
              <li>• We'll contact you when suitable opportunities arise</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Return to Home
            </Link>
            
            <Link
              to="/openings"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg border-2 border-teal-600 hover:bg-teal-50 transition-colors"
            >
              <Eye className="h-5 w-5 mr-2" />
              View Job Openings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;