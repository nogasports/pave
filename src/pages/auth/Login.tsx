import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Truck, Globe, Shield } from 'lucide-react';
import { signIn, resetPassword, createUser } from '../../lib/firebase/auth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const portalType = location.state?.portalType || 'staff';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { user, role, error } = await signIn(email, password);
    if (error || !user) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Redirect based on portal type and permissions
    if (portalType === 'business' && role === 'super_admin') {
      navigate('/business');
    } else if (portalType === 'staff' && role === 'employee') {
      navigate('/staff');
    } else {
      setError('You do not have permission to access this portal');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await resetPassword(email);
    if (error) {
      setError(error.message);
    } else {
      alert('Password reset email sent. Please check your inbox.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
          alt="Login"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-brand-700 bg-opacity-75 flex flex-col justify-center px-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            እንኳን ደህና መጡ
          </h1>
          <h2 className="text-3xl font-bold text-brand-100 mb-4">
            Welcome to Pave Logistics
          </h2>
          <p className="text-xl text-brand-100">
            Ethiopia's Leading Logistics Partner
          </p>
          <div className="mt-8 space-y-4 text-brand-100">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-none bg-brand-600 bg-opacity-25 flex items-center justify-center">
                <Truck className="h-6 w-6 text-brand-100" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-white">ዘመናዊ አገልግሎት</h3>
                <p className="text-sm">Modern Transportation Solutions</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-none bg-brand-600 bg-opacity-25 flex items-center justify-center">
                <Globe className="h-6 w-6 text-brand-100" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-white">በመላው ኢትዮጵያ</h3>
                <p className="text-sm">Nationwide Coverage & Service</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-none bg-brand-600 bg-opacity-25 flex items-center justify-center">
                <Shield className="h-6 w-6 text-brand-100" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-white">አስተማማኝ አገልግሎት</h3>
                <p className="text-sm">Secure & Reliable Service</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center text-brand-600 hover:text-brand-700 mb-8"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">Portal Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              Access the {portalType === 'business' ? 'Business' : 'Staff'} Portal
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input mt-1"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-brand-600 hover:text-brand-500"
              >
                Forgot your password?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full h-12 text-base"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <p className="mt-4 text-sm text-center text-gray-500">
              Need help? Contact IT support at support@pavelogistics.com
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;