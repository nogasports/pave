import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Truck, Building2 } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Careers', href: '/careers' },
  { name: 'Contact', href: '/contact' },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePortalAccess = (type: 'business' | 'staff') => {
    navigate('/auth/login', { state: { portalType: type } });
  };
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 justify-between items-center">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Truck className="h-8 w-8 text-brand-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Pave Logistics</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 ${
                    location.pathname === item.href ? 'border-b-2 border-brand-600' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <button 
              onClick={() => handlePortalAccess('business')} 
              className="btn btn-secondary mr-2"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Business Portal
            </button>
            <button
              onClick={() => handlePortalAccess('staff')}
              className="btn btn-primary"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;