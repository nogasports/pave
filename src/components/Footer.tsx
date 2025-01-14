import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Building2, Users } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handlePortalAccess = (type: 'business' | 'staff') => {
    navigate('/auth/login', { state: { portalType: type } });
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">About Us</h3>
            <p className="mt-4 text-base text-gray-500">
              Ethiopia's premier logistics solution, providing efficient and reliable services across the nation.
            </p>
            <div className="space-y-3">
              <Link 
                onClick={() => handlePortalAccess('business')}
                to="#"
                className="flex items-center text-sm text-gray-500 hover:text-brand-600 group"
              >
                <Building2 className="h-5 w-5 mr-2 text-gray-400 group-hover:text-brand-600" />
                Business Portal Access
              </Link>
              <Link 
                onClick={() => handlePortalAccess('staff')}
                to="#"
                className="flex items-center text-sm text-gray-500 hover:text-brand-600 group"
              >
                <Users className="h-5 w-5 mr-2 text-gray-400 group-hover:text-brand-600" />
                Staff Portal Access
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-center text-gray-500">
                <MapPin className="h-5 w-5 mr-2" />
                Addis Ababa, Ethiopia
              </li>
              <li className="flex items-center text-gray-500">
                <Phone className="h-5 w-5 mr-2" />
                +251 11 234 5678
              </li>
              <li className="flex items-center text-gray-500">
                <Mail className="h-5 w-5 mr-2" />
                info@pavelogistics.com
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-gray-500 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-base text-gray-500 hover:text-gray-900">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-gray-500 hover:text-gray-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/faq" className="text-base text-gray-500 hover:text-gray-900">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-base text-gray-500 hover:text-gray-900">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} Pave Logistics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;