import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon, LayoutDashboard, Users, Building2, ClipboardList, 
  Settings, Briefcase, CreditCard, Package, GraduationCap, Clock,
  FileText, LifeBuoy } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon?: LucideIcon;
}

export interface TopNavigationProps {
  items: NavigationItem[];
}

export const businessNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/business', icon: LayoutDashboard },
  { name: 'Organization', href: '/business/organization', icon: Building2 },
  { name: 'Work', href: '/business/work', icon: Clock },
  { name: 'Recruitment', href: '/business/recruitment', icon: Briefcase },
  { name: 'Growth', href: '/business/growth', icon: GraduationCap },
  { name: 'Finance', href: '/business/finance', icon: CreditCard },
  { name: 'Assets', href: '/business/assets', icon: Package },
  { name: 'Documents', href: '/business/documents', icon: FileText },
  { name: 'Support', href: '/business/support', icon: LifeBuoy }
];

export const staffNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/staff', icon: LayoutDashboard },
  { name: 'Profile', href: '/staff/profile', icon: Users },
  { name: 'Work', href: '/staff/work', icon: Clock },
  { name: 'Finance', href: '/staff/finance', icon: CreditCard },
  { name: 'Assets', href: '/staff/assets', icon: Package },
  { name: 'Documents', href: '/staff/documents', icon: FileText },
  { name: 'Support', href: '/staff/support', icon: LifeBuoy }
];
const TopNavigation: React.FC<TopNavigationProps> = ({ items }) => {
  const location = useLocation();

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex space-x-8">
              {items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      isActive
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.icon && (
                      <item.icon className={`mr-2 h-5 w-5 ${
                        isActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                    )}
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;