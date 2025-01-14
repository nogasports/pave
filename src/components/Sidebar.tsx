import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, ClipboardList, 
  Settings, LogOut, Briefcase, CreditCard, Package,
  GraduationCap, Clock, Calendar, FileText, MessageSquare,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { NavigationItem } from './navigation/TopNavigation';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const isBusinessPortal = location.pathname.startsWith('/business');

  const businessNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/business', icon: LayoutDashboard },
    { name: 'Organization', href: '/business/organization', icon: Building2 },
    { name: 'Work Management', href: '/business/work-management', icon: Clock },
    { name: 'Recruitment', href: '/business/recruitment', icon: Briefcase },
    { name: 'Growth', href: '/business/growth', icon: GraduationCap },
    { name: 'Finance', href: '/business/finance', icon: CreditCard },
    { name: 'Documents', href: '/business/documents', icon: FileText },
    { name: 'Support', href: '/business/support', icon: LifeBuoy }
  ];

  const staffNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/staff', icon: LayoutDashboard },
    { name: 'Profile', href: '/staff/profile', icon: Users },
    { name: 'Work Management', href: '/staff/work', icon: Clock },
    { name: 'Finance', href: '/staff/finance', icon: CreditCard },
    { name: 'Documents', href: '/staff/documents', icon: FileText },
    { name: 'Support', href: '/staff/support', icon: LifeBuoy }
  ];

  const navigation = isBusinessPortal ? businessNavigation : staffNavigation;

  return (
    <div className="flex flex-col w-64 border-r border-gray-200 bg-white sticky top-0 h-screen">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-900">
            {isBusinessPortal ? 'Business Portal' : 'Staff Portal'}
          </span>
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-brand-50 text-brand-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div>
              <Link to="/settings" className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <Settings className="text-gray-400 group-hover:text-gray-500 h-5 w-5" />
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Settings
                  </span>
                </div>
              </Link>
              <button 
                onClick={() => signOut()}
                className="flex-shrink-0 w-full group block mt-4"
              >
                <div className="flex items-center">
                  <LogOut className="text-gray-400 group-hover:text-gray-500 h-5 w-5" />
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Logout
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;