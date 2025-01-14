import React from 'react';
import { Shield, Target, Award, Users, Truck, Globe } from 'lucide-react';

const About: React.FC = () => {
  const leaders = [
    { name: 'Anteneh Alemu', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1539701938214-0d9736e1c16b' },
    { name: 'Fikadu Anbesu', role: 'Co-founder & CMO', image: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57' },
    { name: 'Getachew Gemitie', role: 'Deputy Chief Executive', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce' },
    { name: 'Cherinet Tessema', role: 'Chief Operating Officer', image: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6' },
    { name: 'Abel Shibru', role: 'Chief Human Resources', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7' },
    { name: 'Dagnaw Alemneh', role: 'Chief Finance', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-brand-700">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1621955964441-c173e01c135b?q=80&w=2070&auto=format&fit=crop"
            alt="About Pave Logistics"
          />
          <div className="absolute inset-0 bg-brand-700 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            ስለ ፓቭ ሎጂስቲክስ<br/>
            <span className="text-brand-100">About Pave Logistics</span>
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-brand-100">
            Leading the way in Ethiopian logistics with innovation and reliability since 2015.
          </p>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="card text-center group hover:shadow-lg transition-all duration-300">
              <div className="flex justify-center">
                <Shield className="h-12 w-12 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Our Mission</h3>
              <p className="mt-2 text-base text-gray-500">
                To provide reliable, efficient, and innovative logistics solutions that empower Ethiopian businesses.
              </p>
            </div>
            <div className="card text-center group hover:shadow-lg transition-all duration-300">
              <div className="flex justify-center">
                <Target className="h-12 w-12 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Our Vision</h3>
              <p className="mt-2 text-base text-gray-500">
                To be Ethiopia's most trusted and preferred logistics partner, setting industry standards for excellence.
              </p>
            </div>
            <div className="card text-center group hover:shadow-lg transition-all duration-300">
              <div className="flex justify-center">
                <Award className="h-12 w-12 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Our Values</h3>
              <p className="mt-2 text-base text-gray-500">
                Integrity, reliability, innovation, and commitment to customer satisfaction guide everything we do.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Leadership</h2>
            <p className="mt-4 text-lg text-gray-500">
              Meet the team driving our vision forward
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {leaders.map((leader) => (
              <div key={leader.name} className="text-center group">
                <div className="relative mx-auto w-40 h-40 mb-4 overflow-hidden">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-brand-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">{leader.name}</h3>
                  <p className="text-sm text-gray-500">{leader.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-brand-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-white">200+</p>
              <p className="mt-2 text-xl text-brand-100">Employees</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-white">30+</p>
              <p className="mt-2 text-xl text-brand-100">Owned Vehicles</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-white">125+</p>
              <p className="mt-2 text-xl text-brand-100">Partner Trucks</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-white">10+</p>
              <p className="mt-2 text-xl text-brand-100">Branch Offices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;