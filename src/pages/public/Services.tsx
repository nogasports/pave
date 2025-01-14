import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, Package, BarChart, Warehouse, 
  ShieldCheck, Headphones, ArrowRight,
  Globe, Clock, CheckCircle, Ship, Plane
} from 'lucide-react';

const Services: React.FC = () => {
  const coreServices = [
    {
      icon: Truck,
      title: "Land Transportation",
      description: "Nationwide freight transportation with modern fleet and real-time tracking capabilities.",
      features: [
        "Full truckload services",
        "Less than truckload (LTL)",
        "Temperature-controlled transport",
        "GPS tracking"
      ],
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7"
    },
    {
      icon: Ship,
      title: "Sea Freight",
      description: "Comprehensive sea freight management from major ports including Djibouti and Berbera.",
      features: [
        "Container shipping",
        "Break bulk cargo",
        "Port handling",
        "Custom clearance"
      ],
      image: "https://images.unsplash.com/photo-1577289184648-dca5d25e527b"
    },
    {
      icon: Plane,
      title: "Air Freight",
      description: "Express air freight services through Ethiopian Airlines and major international carriers.",
      features: [
        "Express delivery",
        "Cargo consolidation",
        "Temperature sensitive cargo",
        "Door-to-door service"
      ],
      image: "https://images.unsplash.com/photo-1583511640128-7b2c8469c947"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-brand-700">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
            alt="Ethiopian Logistics Services"
          />
          <div className="absolute inset-0 bg-brand-700 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            የእኛ አገልግሎቶች<br/>
            <span className="text-brand-100">Our Services</span>
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-brand-100">
            Comprehensive logistics solutions tailored to your business needs. From transportation to warehousing, 
            we've got you covered.
          </p>
        </div>
      </div>

      {/* Core Services */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Core Services</h2>
            <p className="mt-4 text-lg text-gray-500">
              Our comprehensive range of logistics services designed to meet your business needs
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {coreServices.map((service, index) => (
                <div key={index} className="card group hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 mb-6 overflow-hidden">
                    <img 
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-brand-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </div>
                  <service.icon className="h-10 w-10 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">{service.title}</h3>
                  <p className="mt-2 text-base text-gray-500">{service.description}</p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-500">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-brand-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link 
                    to="/contact" 
                    className="mt-6 inline-flex items-center text-brand-600 hover:text-brand-700"
                  >
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Value Added Services */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Value Added Services</h2>
            <p className="mt-4 text-lg text-gray-500">
              Additional services to optimize your supply chain
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="card group hover:shadow-lg transition-all duration-300">
              <Warehouse className="h-10 w-10 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Warehousing</h3>
              <p className="mt-2 text-base text-gray-500">
                Modern warehousing facilities across major Ethiopian cities.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li>Storage solutions</li>
                <li>Inventory management</li>
                <li>Pick and pack services</li>
                <li>Distribution centers</li>
              </ul>
            </div>

            <div className="card group hover:shadow-lg transition-all duration-300">
              <ShieldCheck className="h-10 w-10 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Security Services</h3>
              <p className="mt-2 text-base text-gray-500">
                Enhanced security measures for valuable cargo.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li>24/7 surveillance</li>
                <li>Armed escorts</li>
                <li>Secure facilities</li>
                <li>Insurance coverage</li>
              </ul>
            </div>

            <div className="card group hover:shadow-lg transition-all duration-300">
              <BarChart className="h-10 w-10 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Supply Chain Solutions</h3>
              <p className="mt-2 text-base text-gray-500">
                End-to-end supply chain management and optimization.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li>Supply chain consulting</li>
                <li>Network optimization</li>
                <li>Inventory management</li>
                <li>Performance analytics</li>
              </ul>
            </div>

            <div className="card group hover:shadow-lg transition-all duration-300">
              <Headphones className="h-10 w-10 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Customer Support</h3>
              <p className="mt-2 text-base text-gray-500">
                Dedicated support team for all your logistics needs.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li>24/7 customer service</li>
                <li>Real-time tracking</li>
                <li>Dedicated account managers</li>
                <li>Quick issue resolution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-brand-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Ready to optimize your logistics?</h2>
            <p className="mt-4 text-xl text-brand-100">
              Contact us today to discuss how we can help streamline your supply chain
            </p>
            <div className="mt-8">
              <Link to="/contact" className="btn btn-secondary">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;