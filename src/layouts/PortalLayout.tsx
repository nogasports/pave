import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import TopNavigation from '../components/navigation/TopNavigation';
import { businessNavigation, staffNavigation } from '../components/navigation/TopNavigation';

const PortalLayout: React.FC = () => {
  const location = useLocation();
  const isBusinessPortal = location.pathname.startsWith('/business');
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  const navigation = isAdmin ? 
    (isBusinessPortal ? businessNavigation : staffNavigation) : 
    staffNavigation;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-50">
        <Header />
        <TopNavigation items={navigation} />
      </div>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default PortalLayout;