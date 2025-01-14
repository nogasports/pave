import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import PortalLayout from '../layouts/PortalLayout';

// Pages
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Services from '../pages/public/Services';
import Contact from '../pages/public/Contact';
import Careers from '../pages/public/Careers';
import JobDetails from '../pages/public/JobDetails';
import JobApplication from '../pages/public/JobApplication';

import Login from '../pages/auth/Login';
import Unauthorized from '../pages/auth/Unauthorized';

import BusinessDashboard from '../pages/business/Dashboard';
import Organization from '../pages/business/Organization';
import BusinessWorkManagement from '../pages/business/WorkManagement';
import Finance from '../pages/business/Finance';
import Assets from '../pages/business/Assets';
import Recruitment from '../pages/business/Recruitment';
import HeadcountDetails from '../pages/business/HeadcountDetails';
import JobPostingDetails from '../pages/business/JobPostingDetails';
import ApplicationManagement from '../pages/business/ApplicationManagement';
import ApplicationDetails from '../pages/business/ApplicationDetails';
import AddEmployee from '../pages/business/AddEmployee';
import EmployeeDetails from '../pages/business/EmployeeDetails';
import Growth from '../pages/business/Growth';
import Support from '../pages/business/Support';
import Documents from '../pages/business/Documents';

import StaffDashboard from '../pages/staff/Dashboard';
import Profile from '../pages/staff/Profile';
import StaffFinance from '../pages/staff/Finance';
import StaffSupport from '../pages/staff/Support';
import StaffWorkManagement from '../pages/staff/WorkManagement';
import StaffAssets from '../pages/staff/Assets';
import StaffGrowth from '../pages/staff/Growth';
import StaffDocuments from '../pages/staff/Documents';

import PrivateRoute from '../components/PrivateRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'services', element: <Services /> },
      { path: 'careers', element: <Careers /> },
      { path: 'careers/:id', element: <JobDetails /> },
      { path: 'careers/:id/apply', element: <JobApplication /> },
      { path: 'contact', element: <Contact /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'unauthorized', element: <Unauthorized /> },
    ],
  },
  {
    path: '/business',
    element: <PortalLayout />,
    errorElement: <Navigate to="/auth/login" state={{ portalType: 'business' }} />,
    children: [
      { 
        index: true, 
        element: <PrivateRoute portalType="business"><BusinessDashboard /></PrivateRoute> 
      },
      { 
        path: 'organization', 
        element: <PrivateRoute portalType="business">
          <Organization />
        </PrivateRoute> 
      },
      {
        path: 'organization/add-employee',
        element: <PrivateRoute portalType="business">
          <AddEmployee />
        </PrivateRoute>
      },
      {
        path: 'organization/employee/:id',
        element: <PrivateRoute portalType="business"><EmployeeDetails /></PrivateRoute>
      },
      {
        path: 'work',
        element: <PrivateRoute portalType="business"><BusinessWorkManagement /></PrivateRoute>
      },
      { 
        path: 'recruitment', 
        element: <PrivateRoute portalType="business">
          <Recruitment />
        </PrivateRoute> 
      },
      {
        path: 'recruitment/headcount/:id',
        element: <PrivateRoute portalType="business"><HeadcountDetails /></PrivateRoute>
      },
      {
        path: 'recruitment/job/:id',
        element: <PrivateRoute portalType="business"><JobPostingDetails /></PrivateRoute>
      },
      {
        path: 'recruitment/applications',
        element: <PrivateRoute portalType="business"><ApplicationManagement /></PrivateRoute>
      },
      {
        path: 'recruitment/applications/:id',
        element: <PrivateRoute portalType="business"><ApplicationDetails /></PrivateRoute>
      },
      { 
        path: 'growth', 
        element: <PrivateRoute portalType="business"><Growth /></PrivateRoute> 
      },
      { 
        path: 'finance', 
        element: <PrivateRoute portalType="business">
          <Finance />
        </PrivateRoute> 
      },
      { 
        path: 'assets', 
        element: <PrivateRoute portalType="business"><Assets /></PrivateRoute> 
      },
      { 
        path: 'documents', 
        element: <PrivateRoute portalType="business"><Documents /></PrivateRoute> 
      },
      { 
        path: 'support', 
        element: <PrivateRoute portalType="business"><Support /></PrivateRoute> 
      }
    ],
  },
  {
    path: '/staff',
    element: <PortalLayout />,
    errorElement: <Navigate to="/auth/login" state={{ portalType: 'staff' }} />,
    children: [
      { 
        index: true, 
        element: <PrivateRoute portalType="staff"><StaffDashboard /></PrivateRoute> 
      },
      { 
        path: 'profile', 
        element: <PrivateRoute portalType="staff"><Profile /></PrivateRoute> 
      },
      { 
        path: 'work', 
        element: <PrivateRoute portalType="staff"><StaffWorkManagement /></PrivateRoute> 
      },
      { 
        path: 'growth', 
        element: <PrivateRoute portalType="staff"><StaffGrowth /></PrivateRoute> 
      },
      { 
        path: 'finance', 
        element: <PrivateRoute portalType="staff"><StaffFinance /></PrivateRoute> 
      },
      { 
        path: 'assets', 
        element: <PrivateRoute portalType="staff"><StaffAssets /></PrivateRoute> 
      },
      { 
        path: 'documents', 
        element: <PrivateRoute portalType="staff"><StaffDocuments /></PrivateRoute> 
      },
      { 
        path: 'support', 
        element: <PrivateRoute portalType="staff"><StaffSupport /></PrivateRoute> 
      },
    ],
  },
]);