import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Company } from '../lib/firebase/companies';

interface CompanyFormProps {
  companies?: Company[]; // For selecting parent company
  initialData?: Partial<Company>;
  onSubmit: (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  companies,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    registrationNumber: initialData?.registrationNumber || '',
    type: initialData?.type || 'parent',
    parentId: initialData?.parentId || '',
    industry: initialData?.industry || '',
    foundedYear: initialData?.foundedYear || new Date().getFullYear(),
    description: initialData?.description || '',
    website: initialData?.website || '',
    contact: {
      address: initialData?.contact?.address || '',
      phone: initialData?.contact?.phone || '',
      email: initialData?.contact?.email || '',
    },
    socialMedia: {
      linkedin: initialData?.socialMedia?.linkedin || '',
      twitter: initialData?.socialMedia?.twitter || '',
      facebook: initialData?.socialMedia?.facebook || '',
    },
    active: initialData?.active ?? true,
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Logo must be less than 2MB');
        return;
      }
      setLogo(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert logo to base64 if present
      let logoData;
      if (logo) {
        logoData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(logo);
        });
      }

      await onSubmit({
        ...formData,
        logo: logoData || initialData?.logo,
      } as Company);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
          Company Logo
        </label>
        <div className="mt-1 flex items-center space-x-4">
          {(initialData?.logo || logo) && (
            <img
              src={logo ? URL.createObjectURL(logo) : initialData?.logo}
              alt="Company logo"
              className="h-12 w-12 object-contain"
            />
          )}
          <label className="btn btn-secondary cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Upload Logo
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
            Registration Number
          </label>
          <input
            type="text"
            id="registrationNumber"
            value={formData.registrationNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Company Type
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              type: e.target.value as 'parent' | 'subsidiary',
              parentId: e.target.value === 'parent' ? '' : prev.parentId
            }))}
            className="input mt-1"
            required
          >
            <option value="parent">Parent Company</option>
            <option value="subsidiary">Subsidiary</option>
          </select>
        </div>

        {formData.type === 'subsidiary' && companies && (
          <div>
            <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
              Parent Company
            </label>
            <select
              id="parentId"
              value={formData.parentId}
              onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
              className="input mt-1"
              required
            >
              <option value="">Select parent company...</option>
              {companies
                .filter(c => c.type === 'parent')
                .map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))
              }
            </select>
          </div>
        )}

        <div>
          <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700">
            Founded Year
          </label>
          <input
            type="number"
            id="foundedYear"
            value={formData.foundedYear}
            onChange={(e) => setFormData(prev => ({ ...prev, foundedYear: parseInt(e.target.value) }))}
            className="input mt-1"
            required
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="input mt-1"
          rows={3}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              value={formData.contact.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contact: { ...prev.contact, address: e.target.value }
              }))}
              className="input mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.contact.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contact: { ...prev.contact, phone: e.target.value }
              }))}
              className="input mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.contact.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contact: { ...prev.contact, email: e.target.value }
              }))}
              className="input mt-1"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Social Media</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              value={formData.socialMedia.linkedin}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
              }))}
              className="input mt-1"
              placeholder="https://linkedin.com/company/..."
            />
          </div>

          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
              Twitter
            </label>
            <input
              type="url"
              id="twitter"
              value={formData.socialMedia.twitter}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                socialMedia: { ...prev.socialMedia, twitter: e.target.value }
              }))}
              className="input mt-1"
              placeholder="https://twitter.com/..."
            />
          </div>

          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
              Facebook
            </label>
            <input
              type="url"
              id="facebook"
              value={formData.socialMedia.facebook}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                socialMedia: { ...prev.socialMedia, facebook: e.target.value }
              }))}
              className="input mt-1"
              placeholder="https://facebook.com/..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
          className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
        />
        <label htmlFor="active" className="ml-2 text-sm text-gray-700">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : initialData ? 'Update Company' : 'Add Company'}
        </button>
      </div>
    </form>
  );
};

export default CompanyForm;