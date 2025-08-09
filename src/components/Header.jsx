import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Briefcase, Home, Settings } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Numantra Placement</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-teal-600 bg-teal-50' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/openings"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/openings') 
                  ? 'text-teal-600 bg-teal-50' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Job Openings</span>
            </Link>
            
            <Link
              to="/admin"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin') 
                  ? 'text-teal-600 bg-teal-50' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </nav>
          
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-teal-600">
              <Users className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;