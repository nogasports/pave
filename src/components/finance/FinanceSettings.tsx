import React, { useState, useEffect } from 'react';
import { Settings, Calculator, Percent, CreditCard } from 'lucide-react';
import { FinanceSettings as FinanceSettingsType, getFinanceSettings, updateFinanceSettings } from '../../lib/firebase/finance';
import { wrapFirebaseOperation } from '../../lib/utils/errorHandling';

const FinanceSettings: React.FC = () => {
  const [settings, setSettings] = useState<FinanceSettingsType | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await wrapFirebaseOperation(
        () => getFinanceSettings(),
        'Error loading finance settings'
      );
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings?.id) return;
    setLoading(true);
    try {
      await wrapFirebaseOperation(
        () => updateFinanceSettings(settings.id!, settings),
        'Error updating finance settings'
      );
      setEditing(false);
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!settings) return <div>No settings found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Finance Settings</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn btn-primary"
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit Settings
          </button>
        ) : (
          <div className="space-x-3">
            <button
              onClick={() => setEditing(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tax Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Calculator className="h-5 w-5 text-brand-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Income Tax Brackets</h3>
          </div>
          <div className="space-y-4">
            {settings.taxBrackets.map((bracket, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-gray-500">
                    {bracket.from.toLocaleString()} - {bracket.to === Infinity ? '∞' : bracket.to.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={bracket.rate}
                    onChange={(e) => {
                      const newBrackets = [...settings.taxBrackets];
                      newBrackets[index].rate = Number(e.target.value);
                      setSettings({ ...settings, taxBrackets: newBrackets });
                    }}
                    className="input w-20 text-right"
                    disabled={!editing}
                    min="0"
                    max="100"
                  />
                  <span className="ml-1 text-gray-500">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pension Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Percent className="h-5 w-5 text-brand-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Pension Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Employee Contribution</span>
              <div className="flex items-center">
                <input
                  type="number"
                  value={settings.pensionRate}
                  onChange={(e) => setSettings({ ...settings, pensionRate: Number(e.target.value) })}
                  className="input w-20 text-right"
                  disabled={!editing}
                  min="0"
                  max="100"
                />
                <span className="ml-1 text-gray-500">%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Employer Contribution</span>
              <div className="flex items-center">
                <input
                  type="number"
                  value={settings.employerPensionRate}
                  onChange={(e) => setSettings({ ...settings, employerPensionRate: Number(e.target.value) })}
                  className="input w-20 text-right"
                  disabled={!editing}
                  min="0"
                  max="100"
                />
                <span className="ml-1 text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Allowances Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-brand-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Default Allowances</h3>
          </div>
          <div className="space-y-6">
            {/* Transport Allowance */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Transport Allowance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500">Base Amount</label>
                  <div className="flex items-center mt-1">
                    <input
                      type="number"
                      value={settings.allowances.transport.default}
                      onChange={(e) => setSettings({
                        ...settings,
                        allowances: {
                          ...settings.allowances,
                          transport: {
                            ...settings.allowances.transport,
                            default: Number(e.target.value)
                          }
                        }
                      })}
                      className="input flex-1"
                      disabled={!editing}
                    />
                    <span className="ml-2 text-gray-500">ETB</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Manager Bonus</label>
                  <div className="flex items-center mt-1">
                    <input
                      type="number"
                      value={settings.allowances.transport.managerBonus}
                      onChange={(e) => setSettings({
                        ...settings,
                        allowances: {
                          ...settings.allowances,
                          transport: {
                            ...settings.allowances.transport,
                            managerBonus: Number(e.target.value)
                          }
                        }
                      })}
                      className="input flex-1"
                      disabled={!editing}
                    />
                    <span className="ml-2 text-gray-500">ETB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Housing Allowance */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Housing Allowance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500">Base Amount</label>
                  <div className="flex items-center mt-1">
                    <input
                      type="number"
                      value={settings.allowances.housing.default}
                      onChange={(e) => setSettings({
                        ...settings,
                        allowances: {
                          ...settings.allowances,
                          housing: {
                            ...settings.allowances.housing,
                            default: Number(e.target.value)
                          }
                        }
                      })}
                      className="input flex-1"
                      disabled={!editing}
                    />
                    <span className="ml-2 text-gray-500">ETB</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Manager Bonus</label>
                  <div className="flex items-center mt-1">
                    <input
                      type="number"
                      value={settings.allowances.housing.managerBonus}
                      onChange={(e) => setSettings({
                        ...settings,
                        allowances: {
                          ...settings.allowances,
                          housing: {
                            ...settings.allowances.housing,
                            managerBonus: Number(e.target.value)
                          }
                        }
                      })}
                      className="input flex-1"
                      disabled={!editing}
                    />
                    <span className="ml-2 text-gray-500">ETB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Position Allowance */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Position Allowance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500">Base Amount</label>
                  <div className="flex items-center mt-1">
                    <input
                      type="number"
                      value={settings.allowances.position.default}
                      onChange={(e) => setSettings({
                        ...settings,
                        allowances: {
                          ...settings.allowances,
                          position: {
                            ...settings.allowances.position,
                            default: Number(e.target.value)
                          }
                        }
                      })}
                      className="input flex-1"
                      disabled={!editing}
                    />
                    <span className="ml-2 text-gray-500">ETB</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Manager Bonus</label>
                  <div className="flex items-center mt-1">
                    <input
                      type="number"
                      value={settings.allowances.position.managerBonus}
                      onChange={(e) => setSettings({
                        ...settings,
                        allowances: {
                          ...settings.allowances,
                          position: {
                            ...settings.allowances.position,
                            managerBonus: Number(e.target.value)
                          }
                        }
                      })}
                      className="input flex-1"
                      disabled={!editing}
                    />
                    <span className="ml-2 text-gray-500">ETB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advance & Reimbursement Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-brand-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Advance & Reimbursement</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500">Maximum Advance Amount</label>
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  value={settings.maxAdvanceAmount}
                  onChange={(e) => setSettings({ ...settings, maxAdvanceAmount: Number(e.target.value) })}
                  className="input flex-1"
                  disabled={!editing}
                />
                <span className="ml-2 text-gray-500">ETB</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500">Maximum Installments</label>
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  value={settings.maxAdvanceInstallments}
                  onChange={(e) => setSettings({ ...settings, maxAdvanceInstallments: Number(e.target.value) })}
                  className="input flex-1"
                  disabled={!editing}
                />
                <span className="ml-2 text-gray-500">months</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500">Max Medical Reimbursement</label>
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  value={settings.maxMedicalReimbursement}
                  onChange={(e) => setSettings({ ...settings, maxMedicalReimbursement: Number(e.target.value) })}
                  className="input flex-1"
                  disabled={!editing}
                />
                <span className="ml-2 text-gray-500">ETB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceSettings;