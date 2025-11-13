'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { Shield, ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { registerInstitutionInDb, getAllInstitutions, suspendInstitution, reactivateInstitution } from '@/services/institutionService';
import { isValidAddress } from '@/lib/web3';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const { account, isConnected } = useWeb3();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    address: '',
    name: '',
    country: '',
  });

  useEffect(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    
    // Check if user is admin
    const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();
    if (account?.toLowerCase() !== adminAddress) {
      toast.error('Access denied: Admin only');
      router.push('/');
      return;
    }

    loadInstitutions();
  }, [isConnected, account]);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const data = await getAllInstitutions();
      setInstitutions(data);
    } catch (error) {
      console.error('Error loading institutions:', error);
      toast.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidAddress(formData.address)) {
      toast.error('Invalid wallet address');
      return;
    }

    if (!formData.name.trim() || !formData.country.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Registering institution...');

    try {
      await registerInstitution(
        formData.address,
        formData.name,
        formData.country,
        account
      );

      toast.success('Institution registered successfully!', { id: toastId });
      setShowForm(false);
      setFormData({ address: '', name: '', country: '' });
      loadInstitutions();
    } catch (error) {
      console.error('Error registering institution:', error);
      toast.error(error.message || 'Failed to register institution', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspend = async (institutionId) => {
    if (!confirm('Are you sure you want to suspend this institution?')) return;

    const toastId = toast.loading('Suspending institution...');
    try {
      await suspendInstitution(institutionId);
      toast.success('Institution suspended', { id: toastId });
      loadInstitutions();
    } catch (error) {
      toast.error('Failed to suspend institution', { id: toastId });
    }
  };

  const handleReactivate = async (institutionId) => {
    const toastId = toast.loading('Reactivating institution...');
    try {
      await reactivateInstitution(institutionId);
      toast.success('Institution reactivated', { id: toastId });
      loadInstitutions();
    } catch (error) {
      toast.error('Failed to reactivate institution', { id: toastId });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to access the admin portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center space-x-2 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="w-8 h-8 text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
              </div>
              <p className="text-gray-600">Register and manage educational institutions</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Register Institution</span>
            </button>
          </div>

          {/* Registration Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-purple-50 p-6 rounded-xl mb-8 border border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Register New Institution</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Harvard University"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., USA"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Wallet Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                    placeholder="0x..."
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Registering...' : 'Register Institution'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Institutions Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading institutions...</p>
            </div>
          ) : institutions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No institutions registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Institution</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Wallet Address</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Country</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Registered</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map((inst) => (
                    <tr key={inst.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{inst.name}</td>
                      <td className="py-4 px-4 text-gray-600 font-mono text-sm">
                        {inst.address.slice(0, 6)}...{inst.address.slice(-4)}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{inst.country}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            inst.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(inst.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        {inst.status === 'Active' ? (
                          <button
                            onClick={() => handleSuspend(inst.id)}
                            className="text-red-600 hover:text-red-700 font-semibold"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(inst.id)}
                            className="text-green-600 hover:text-green-700 font-semibold"
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stats */}
          {!loading && institutions.length > 0 && (
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Total Institutions</p>
                <p className="text-2xl font-bold text-purple-600">{institutions.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {institutions.filter((i) => i.status === 'Active').length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600 mb-1">Suspended</p>
                <p className="text-2xl font-bold text-red-600">
                  {institutions.filter((i) => i.status === 'Suspended').length}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}