import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { AssetType, AssetStock } from '../../lib/firebase/assets';
import AssetTypeForm from './AssetTypeForm';
import AssetStockForm from './AssetStockForm';
import StockTransactionForm from './StockTransactionForm';

interface AssetTypeStockProps {
  assetTypes: AssetType[];
  stock: AssetStock[];
  locations: { id: string; name: string; }[];
  onAddType: (data: Omit<AssetType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateStock: (id: string, data: Partial<AssetStock>) => Promise<void>;
  onAddLocation: (name: string) => Promise<void>;
}

const AssetTypeStock: React.FC<AssetTypeStockProps> = ({
  assetTypes,
  stock,
  locations,
  onAddType,
  onUpdateStock,
  onAddLocation,
}) => {
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedStock, setSelectedStock] = useState<AssetStock | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStockTransaction = async (data: any) => {
    try {
      await onUpdateStock(selectedStock!.id!, {
        quantity: data.type === 'in' 
          ? selectedStock!.quantity + data.quantity
          : selectedStock!.quantity - data.quantity
      });
      setShowTransactionForm(false);
      setSelectedStock(null);
    } catch (err) {
      setError('Failed to process transaction');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Asset Types & Stock</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTypeForm(true)}
            className="btn btn-secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Asset Type
          </button>
          <button
            onClick={() => setShowStockForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Stock Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stock.map((stockItem) => {
          const assetType = assetTypes.find(t => t.id === stockItem.assetTypeId);
          const location = locations.find(l => l.id === stockItem.location);
          
          return (
            <div key={stockItem.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{assetType?.name}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {location?.name}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedStock(stockItem);
                      setShowTransactionForm(true);
                    }}
                    className="text-gray-400 hover:text-brand-600"
                  >
                    <Package className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStock(stockItem);
                      setShowStockForm(true);
                    }}
                    className="text-gray-400 hover:text-brand-600"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Stock</span>
                  <span className="font-medium text-gray-900">{stockItem.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Minimum Quantity</span>
                  <span className="font-medium text-gray-900">{stockItem.minimumQuantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reorder Point</span>
                  <span className="font-medium text-gray-900">{stockItem.reorderPoint}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Unit Cost</span>
                  <span className="font-medium text-gray-900">
                    {stockItem.unitCost.toLocaleString()} {stockItem.currency}
                  </span>
                </div>
              </div>

              {/* Stock Level Indicator */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      stockItem.quantity <= stockItem.minimumQuantity
                        ? 'bg-red-600'
                        : stockItem.quantity <= stockItem.reorderPoint
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min((stockItem.quantity / stockItem.reorderPoint) * 100, 100)}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>Min: {stockItem.minimumQuantity}</span>
                  <span>Reorder: {stockItem.reorderPoint}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Forms */}
      {showTypeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Asset Type</h2>
            <AssetTypeForm
              existingCategories={[...new Set(assetTypes.map(t => t.category))]}
              existingSubCategories={[...new Set(assetTypes.map(t => t.subCategory))]}
              existingLocations={[...new Set(locations.map(l => l.name))]}
              onSubmit={onAddType}
              onCancel={() => setShowTypeForm(false)}
            />
          </div>
        </div>
      )}

      {showStockForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {selectedStock ? 'Update Stock' : 'Add Stock'}
            </h2>
            <AssetStockForm
              assetTypes={assetTypes}
              locations={locations}
              initialData={selectedStock || undefined}
              onSubmit={async (data) => {
                try {
                  if (selectedStock) {
                    await onUpdateStock(selectedStock.id!, data);
                  } else {
                    await onUpdateStock('new', data);
                  }
                  setShowStockForm(false);
                  setSelectedStock(null);
                } catch (err) {
                  setError('Failed to save stock');
                }
              }}
              onCancel={() => {
                setShowStockForm(false);
                setSelectedStock(null);
              }}
            />
          </div>
        </div>
      )}

      {showTransactionForm && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Stock Transaction</h2>
            <StockTransactionForm
              stockId={selectedStock.id!}
              currentQuantity={selectedStock.quantity}
              onSubmit={handleStockTransaction}
              onCancel={() => {
                setShowTransactionForm(false);
                setSelectedStock(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetTypeStock;