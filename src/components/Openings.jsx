import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Mail, Phone, Calendar, Users, Building2 } from 'lucide-react';
import { getJobOpenings } from '../lib/supabase';

const Openings = () => {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOpenings();
  }, []);

  const loadOpenings = async () => {
    setLoading(true);
    const { data, error } = await getJobOpenings();
    
    if (error) {
      setError('Failed to load job openings');
    } else {
      setOpenings(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">
            Job Openings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore current opportunities from our partner companies
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {openings.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-lg border p-12 max-w-md mx-auto">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No openings available</h3>
              <p className="text-gray-600">Please check back later for new opportunities</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {openings.map((opening) => (
              <div
                key={opening.sl_no}
                className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                {/* Company Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {opening.company}
                        </h3>
                        {opening.qualification && (
                          <p className="text-sm text-gray-600 mt-1">{opening.qualification}</p>
                        )}
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                </div>

                {/* Job Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    {opening.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{opening.location}</span>
                      </div>
                    )}

                    {opening.timing && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{opening.timing}</span>
                      </div>
                    )}

                    {opening.salary_band && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{opening.salary_band}</span>
                      </div>
                    )}

                    {opening.target && (
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">Target: {opening.target}</span>
                      </div>
                    )}
                  </div>

                  {opening.posted && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Posted by</p>
                      <p className="text-sm font-medium text-gray-900">{opening.posted}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-6 pt-0">
                  <div className="flex gap-3">
                    {opening.email && (
                      <a
                        href={`mailto:${opening.email}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </a>
                    )}

                    {opening.mobile && (
                      <a
                        href={`tel:${opening.mobile}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-green-200 text-green-700 rounded-md text-sm font-medium hover:bg-green-50 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                    )}
                  </div>

                  {opening.created_at && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        Posted on {new Date(opening.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Ready to apply?
            </h3>
            <p className="text-gray-600 mb-6">
              Register with us to get matched with opportunities that fit your profile.
            </p>
            <a
              href="/form"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Register Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Openings;