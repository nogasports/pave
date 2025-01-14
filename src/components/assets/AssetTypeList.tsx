import React from 'react';
import { Edit2, Trash2, MapPin } from 'lucide-react';
import { AssetType } from '../../lib/firebase/assets';

interface AssetTypeListProps {
  assetTypes: AssetType[];
  onEdit: (type: AssetType) => void;
  onDelete: (id: string) => void;
}

const AssetTypeList: React.FC<AssetTypeListProps> = ({
  assetTypes,
  onEdit,
  onDelete,
}) => {
  // Group asset types by category
  const groupedTypes = assetTypes.reduce((acc, type) => {
    const category = type.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(type);
    return acc;
  }, {} as Record<string, AssetType[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedTypes).map(([category, types]) => (
        <div key={category} className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{category}</h3>
          <div className="space-y-4">
            {types.map((type) => (
              <div key={type.id} className="border-t border-gray-200 pt-4 first:border-0 first:pt-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-medium text-gray-900">{type.name}</h4>
                    <p className="mt-1 text-sm text-gray-500">{type.description}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="font-medium mr-2">Sub-category:</span>
                      {type.subCategory}
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {type.location}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(type)}
                      className="text-gray-400 hover:text-brand-600"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => type.id && onDelete(type.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {type.photo && (
                  <div className="mt-4">
                    <img 
                      src={type.photo} 
                      alt={type.name}
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetTypeList;