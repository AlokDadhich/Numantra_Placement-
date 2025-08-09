import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Briefcase, Award, TrendingUp } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Numantra <span className="text-teal-600">Placement</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Your pathway to dream placements. Connect talented individuals with exceptional opportunities 
                through our comprehensive placement management platform.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/form"
                className="group inline-flex items-center px-8 py-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Register Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/openings"
                className="inline-flex items-center px-8 py-4 bg-white text-teal-600 font-semibold rounded-xl border-2 border-teal-600 hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View Openings
                <Briefcase className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Numantra Placement?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide a comprehensive platform that streamlines the placement process for both candidates and employers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Registration</h3>
              <p className="text-gray-600">
                Simple and intuitive registration process with comprehensive biodata collection and resume upload.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-xl mb-6">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Opportunities</h3>
              <p className="text-gray-600">
                Access to verified job openings from reputable companies across various industries and locations.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Career Growth</h3>
              <p className="text-gray-600">
                Professional guidance and support to help you advance your career and achieve your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join thousands of successful placements through our platform.
          </p>
          <Link
            to="/form"
            className="inline-flex items-center px-8 py-4 bg-white text-teal-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;