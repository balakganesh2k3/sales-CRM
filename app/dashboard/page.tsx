'use client';

import React from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import DashboardStats from '@/components/layout/DashboardStats';

const DashboardPage: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['manager']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor team performance and overall sales metrics</p>
          </div>
          
          <DashboardStats />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;