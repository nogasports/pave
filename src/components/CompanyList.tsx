import React from 'react';
import { Building2, Globe, Phone, Mail, Edit2, Trash2 } from 'lucide-react';
import { Company } from '../lib/firebase/companies';

interface CompanyListProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  onEdit,
  onDelete,
}) => {
  const parentCompanies = companies.filter(c => c.type === 'parent');
  const subsidiaries = companies.filter(c => c.type === 'subsidiary');

  const getParentName = (parentId: string) => {
    return companies.find(c => c.id === parentId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Parent Companies */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Parent Companies</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {parentCompanies.map((company) => (
            <div key={company.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-12 w-12 object-contain"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">{company.registrationNumber}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(company)}
                    className="text-gray-400 hover:text-brand-600"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => company.id && onDelete(company.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm">
                  <Globe className="h-4 w-4 text-gray-400 mr-2" />
                  <a 
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-700"
                  >
                    {company.website}
                  </a>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{company.contact.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{company.contact.email}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {subsidiaries.filter(s => s.parentId === company.id).length} subsidiaries
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subsidiaries */}
      {subsidiaries.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Subsidiaries</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subsidiaries.map((company) => (
              <div key={company.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="h-12 w-12 object-contain"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-500">
                        Subsidiary of {getParentName(company.parentId!)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(company)}
                      className="text-gray-400 hover:text-brand-600"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => company.id && onDelete(company.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 text-gray-400 mr-2" />
                    <a 
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-700"
                    >
                      {company.website}
                    </a>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{company.contact.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{company.contact.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList;