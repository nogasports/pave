import React from 'react';
import { MapPin, Phone, Mail, Clock, Building2, Globe, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const localOffices = [
    {
      name: "ADDIS ABABA (HEAD QUARTERS)",
      address: "Churchill Road, Tracon Tower, 2nd floor, Addis Ababa, Ethiopia",
      phone: "+251-111-262-622",
      email: "pave@pave-logistics.com"
    },
    {
      name: "BOLE LEMI",
      address: "Bole LEmi Industry Park, Addis Ababa, Ethiopia",
      phone: "+251-902-491-225",
      email: "Gizachew.G@pave-logistics.com"
    },
    {
      name: "ETHIOPIA AIRLINES (CARGO & LOGISTICS)",
      address: "Ethiopian Airlines, Addis Ababa, Ethiopia",
      phone: "+251-920-856-021",
      email: "yonas.a@pave-logistics.com"
    },
    {
      name: "KALITY",
      address: "Kality, Addis Ababa, Ethiopia",
      phone: "+251-900-896-020"
    },
    {
      name: "DUKEM",
      address: "Eastern Industry Park, Dukem, Oromia, Ethiopia",
      phone: "+251-900-896-017"
    },
    {
      name: "ADAMA",
      address: "Yegara Logo Woreda, Adama, Oromia, Ethiopia",
      phone: "+251-931-260-160"
    },
    {
      name: "MODJO",
      address: "Modjo City, Oromia, Ethiopia",
      phone: "+251-900-896-018"
    },
    {
      name: "DIREDAWA",
      address: "DireDawa Industry Park, DireDawa, Ethiopia",
      phone: "+251-948-076-742"
    },
    {
      name: "HAWASSA",
      address: "East Subcity, Tesso Woreda, Hawassa, Ethiopia",
      phone: "+251-912-293-221"
    }
  ];

  const internationalOffices = [
    {
      name: "CHINA",
      address: "Room 152, No.1866 Bohai 12th Road, Lingang Economic Zone, Binhai New Area, Tianjin Municipality",
      phone: "+86-138-2197-3543",
      email: ["Luchengyi@pave-logistics.com", "james@pave-logistics.com"]
    },
    {
      name: "DUBAI",
      address: "World Trade Center, Sheikh Zayed Road Nassima Towers, 3rd Floor Office No 302, Dubai, UAE",
      phone: "+971-58-503-8854"
    },
    {
      name: "DJIBOUTI",
      address: "Boulvard De La Rebublique, Djibouti",
      phone: "+253-21-35-0100",
      email: ["bassoma@chabgroup.com", "bourhan@chabgroup.com"]
    },
    {
      name: "KENYA",
      address: "KOFISI Building, Eden Square, Westlands, Nairobi, Kenya",
      phone: "+254-706-362-822",
      email: ["operations.ke@pave-logistics.com"]
    },
    {
      name: "UGANDA",
      address: "Kampala, Uganda",
      email: ["bereket.a@pave-logistics.com"]
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-brand-700">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2070&auto=format&fit=crop"
            alt="Contact Us"
          />
          <div className="absolute inset-0 bg-brand-700 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            ያግኙን<br/>
            <span className="text-brand-100">Get in Touch</span>
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-brand-100">
            We're here to help with all your logistics needs. Contact us today to discuss how we can support your business.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Contact Information */}
          <div>
            {/* Local Offices */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Local Branch Offices</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {localOffices.map((office, index) => (
                  <div key={index} className="card group hover:shadow-lg transition-all duration-300">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Building2 className="h-5 w-5 text-brand-600 mr-2" />
                      {office.name}
                    </h3>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                        <MapPin className="h-5 w-5 text-brand-600 flex-shrink-0" />
                        <span className="ml-3 text-gray-500">{office.address}</span>
                      </div>
                      <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                        <Phone className="h-5 w-5 text-brand-600 flex-shrink-0" />
                        <span className="ml-3 text-gray-500">{office.phone}</span>
                      </div>
                      {office.email && (
                        <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                          <Mail className="h-5 w-5 text-brand-600 flex-shrink-0" />
                          <span className="ml-3 text-gray-500">{office.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* International Offices */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">International Offices</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {internationalOffices.map((office, index) => (
                  <div key={index} className="card group hover:shadow-lg transition-all duration-300">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Globe className="h-5 w-5 text-brand-600 mr-2" />
                      {office.name}
                    </h3>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                        <MapPin className="h-5 w-5 text-brand-600 flex-shrink-0" />
                        <span className="ml-3 text-gray-500">{office.address}</span>
                      </div>
                      {office.phone && (
                        <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                          <Phone className="h-5 w-5 text-brand-600 flex-shrink-0" />
                          <span className="ml-3 text-gray-500">{office.phone}</span>
                        </div>
                      )}
                      {office.email && (
                        <div className="flex flex-col space-y-2 group-hover:translate-x-1 transition-transform duration-300">
                          <div className="flex items-center">
                            <Mail className="h-5 w-5 text-brand-600 flex-shrink-0" />
                            <div className="ml-3 space-y-1">
                              {Array.isArray(office.email) ? (
                                office.email.map((email, idx) => (
                                  <div key={idx} className="text-gray-500">{email}</div>
                                ))
                              ) : (
                                <div className="text-gray-500">{office.email}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Clock className="h-5 w-5 text-brand-600 mr-2" />
                Business Hours
              </h3>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-gray-500">
                  <span>Monday - Friday</span>
                  <span>8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Saturday</span>
                  <span>9:00 AM - 3:00 PM</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-12">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Send us a message</h3>
              <form className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    className="input mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    id="company"
                    className="input mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="input mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    className="input mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    className="input mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="input mt-1"
                  ></textarea>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn btn-primary w-full group">
                    <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Map */}
            <div className="mt-8 card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Our Location</h3>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5277324911814!2d38.7476889!3d9.0334824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDInMDAuNSJOIDM4wrA0NCc1MS43IkU!5e0!3m2!1sen!2sus!4v1635789876543!5m2!1sen!2sus"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;