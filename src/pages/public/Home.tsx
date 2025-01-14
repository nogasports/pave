import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, Package, Users, Clock, Shield, Globe, 
  ArrowRight, MapPin, CheckCircle, Award
} from 'lucide-react';

const testimonials = [
  {
    name: "Abebe Kebede",
    role: "Operations Manager",
    company: "Ethiopian Trading Co.",
    image: "https://images.unsplash.com/photo-1539701938214-0d9736e1c16b?q=80&w=1974&auto=format&fit=crop",
    quote: "Pave Logistics has transformed our supply chain efficiency. Their dedication to timely delivery and professional service is unmatched."
  },
  {
    name: "Sara Mohammed",
    role: "Supply Chain Director",
    company: "East Africa Industries",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1974&auto=format&fit=crop",
    quote: "Working with Pave has been a game-changer for our business. Their innovative solutions and reliable service have helped us expand across East Africa."
  },
  {
    name: "Daniel Mekonnen",
    role: "CEO",
    company: "Addis Manufacturing",
    image: "https://images.unsplash.com/photo-1507152832244-10d45c7eda57?q=80&w=1974&auto=format&fit=crop",
    quote: "The level of expertise and commitment from Pave Logistics is exceptional. They understand the local market and deliver global standards."
  }
];

const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-brand-700">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1621955964441-c173e01c135b?q=80&w=2070&auto=format&fit=crop"
            alt="Ethiopian Logistics"
          />
          <div className="absolute inset-0 bg-brand-700 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            ንግድዎን በብቃት እናስፋፋለን<br/>
            <span className="text-brand-100">Inspiring Business Precision</span>
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-brand-100">
            Ethiopia's premier logistics solution, providing efficient and reliable services across the nation. 
            We excel at serving through land transportation for import and export, canvassing for sea freight, 
            selling air freight, and providing transportation.
          </p>
          <div className="mt-10 flex space-x-4">
            <Link to="/services" className="btn btn-primary">
              Our Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Pave Logistics</h2>
            <p className="mt-4 text-lg text-gray-500">
              We provide comprehensive logistics solutions with a focus on efficiency, reliability, and customer satisfaction.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="card group hover:shadow-lg transition-shadow duration-300">
                <Shield className="h-10 w-10 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Professionalism</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our workers undergo intensive training to enhance their ability to conduct business professionally. 
                  We work seven days a week to save our customers' invaluable time.
                </p>
              </div>

              <div className="card group hover:shadow-lg transition-shadow duration-300">
                <Globe className="h-10 w-10 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Technology</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our state-of-the-art technology serves you in reporting and tracking your shipment 24/7 
                  wherever you are in the world.
                </p>
              </div>

              <div className="card group hover:shadow-lg transition-shadow duration-300">
                <Users className="h-10 w-10 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Flexibility</h3>
                <p className="mt-2 text-base text-gray-500">
                  We are committed to being part of our customer's goals and objectives by encouraging 
                  engagement in our performance measurement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">የደንበኞቻችን ምስክርነት | Client Testimonials</h2>
            <p className="mt-4 text-lg text-gray-500">
              Hear what our valued clients have to say about their experience with Pave Logistics
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card group hover:shadow-xl transition-all duration-300">
                <div className="relative h-16 w-16 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="rounded-full object-cover"
                  />
                  <div className="absolute -right-2 -bottom-2 bg-brand-600 rounded-full p-2">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-medium text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-sm text-brand-600">{testimonial.company}</p>
                </div>
              </div>
            ))}
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

export default Home;