import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        
        {/* Icon Animasi */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
            <AlertTriangle size={64} className="text-indigo-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900">404</h1>
          <h2 className="text-xl font-semibold text-gray-700">Halaman Tidak Ditemukan</h2>
          <p className="text-gray-500">
            Ups! Sepertinya Anda tersesat. Halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:-translate-y-1"
        >
          <Home size={20} />
          Kembali ke Dashboard
        </button>
      </div>

      <div className="mt-12 text-gray-300 text-sm">
        Restaurant Management System v1.0
      </div>
    </div>
  );
};

export default NotFound;