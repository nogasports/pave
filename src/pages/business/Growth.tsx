import React, { useState } from 'react';
import { Star, BookOpen, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import ObjectivesSection from '../../components/growth/ObjectivesSection';
import ReviewsSection from '../../components/growth/ReviewsSection';
import LearningSection from '../../components/growth/LearningSection';
import PromotionSection from '../../components/growth/PromotionSection';
import DisciplinarySection from '../../components/growth/DisciplinarySection';

type TabType = 'objectives' | 'reviews' | 'learning' | 'promotion' | 'disciplinary';

const Growth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('objectives');

  const tabs = [
    { id: 'objectives', name: 'Objectives', icon: Target },
    { id: 'reviews', name: 'Reviews', icon: Star },
    { id: 'learning', name: 'Learning', icon: BookOpen },
    { id: 'promotion', name: 'Promotion', icon: TrendingUp },
    { id: 'disciplinary', name: 'Disciplinary', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Growth & Development</h1>
      </div>

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

      {/* Content */}
      <div>
        {activeTab === 'objectives' && <ObjectivesSection />}
        {activeTab === 'reviews' && <ReviewsSection />}
        {activeTab === 'learning' && <LearningSection />}
        {activeTab === 'promotion' && <PromotionSection />}
        {activeTab === 'disciplinary' && <DisciplinarySection />}
      </div>
    </div>
  );
};

export default Growth;