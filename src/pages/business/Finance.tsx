import React, { useState } from 'react';
import { BanknoteIcon, CreditCard, Settings } from 'lucide-react';
import PayrollManagement from '../../components/finance/PayrollManagement';
import SalaryAdvances from '../../components/finance/SalaryAdvances';
import FinanceSettings from '../../components/finance/FinanceSettings';

type TabType = 'payroll' | 'advances' | 'settings';

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('payroll');
  const [error, setError] = useState<string | null>(null);

  const handleAddAdvance = async (data: Omit<SalaryAdvance, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addSalaryAdvance(data);
    } catch (err) {
      setError('Failed to add salary advance');
      throw err;
    }
  };

  const tabs = [
    { id: 'payroll', name: 'Payroll Management', icon: BanknoteIcon },
    { id: 'advances', name: 'Salary Advances', icon: CreditCard },
    { id: 'settings', name: 'Finance Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Finance Management</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === tab.id ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {activeTab === 'payroll' && <PayrollManagement />}
        {activeTab === 'advances' && (
          <SalaryAdvances onAddAdvance={handleAddAdvance} />
        )}
        {activeTab === 'settings' && <FinanceSettings />}
      </div>
    </div>
  );
};

export default Finance;