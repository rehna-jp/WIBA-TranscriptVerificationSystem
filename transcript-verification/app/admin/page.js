'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { Shield, ArrowLeft, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { registerInstitutionInDb, getAllInstitutions, suspendInstitution, reactivateInstitution } from '@/services/institutionService';
import { registerInstitution, verifyInstitution } from '@/lib/contracts'; // Import blockchain functions
import { isAddress } from 'viem';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const { account, isConnected } = useWeb3();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [formData, setFormData] = useState({
    address: '',
    name: '',
    country: '',
    accreditedURL: '',
    email: ''
  });

  useEffect(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    
    // Check if user is admin
    const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();
    const userIsAdmin = account?.toLowerCase() === adminAddress;
    setIsAdmin(userIsAdmin);
    
    if (!userIsAdmin) {
      toast.error('Access denied: Admin only');
      router.push('/');
      return;
    }

    loadInstitutions();
  }, [isConnected, account, router]);

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
    
    if (!isAddress(formData.address)) {
      toast.error('Invalid wallet address');
      return;
    }

    if (!formData.name.trim() || !formData.country.trim() || !formData.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Registering institution on blockchain...');

    try {
      // Step 1: Register on blockchain (this should be done by the institution themselves)
      // But for admin setup, we might need a different approach
      console.log('Attempting to register institution:', formData);

      // Note: In your smart contract, registerInstitution can only be called by the institution itself (msg.sender)
      // So the admin cannot register an institution on behalf of someone else
      // You might need to change your contract or workflow

      // For now, let's just register in the database and show a message
      console.warn('Admin cannot register institutions on blockchain - institution must register themselves');

      // Step 2: Register in database
      // await registerInstitutionInDb(
      //   formData.address,
      //   formData.name,
      //   formData.country,
      //   formData.accreditedURL || '',
      //   formData.email,
      //   account
      // );

      toast.success('Institution registered in database! Institution must complete blockchain registration.', { id: toastId });
      setShowForm(false);
      setFormData({ address: '', name: '', country: '', accreditedURL: '', email: '' });
      loadInstitutions();
    } catch (error) {
      console.error('Error registering institution:', error);
      let errorMessage = 'Failed to register institution';
      
      if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOnChain = async (institutionAddress) => {
    if (!confirm('Are you sure you want to verify this institution on blockchain?')) return;

    const toastId = toast.loading('Verifying institution on blockchain...');
    try {
      // Verify institution on blockchain
      const receipt = await verifyInstitution(institutionAddress);
      console.log('Verification transaction receipt:', receipt);
      
      toast.success('Institution verified on blockchain!', { id: toastId });
    } catch (error) {
      console.error('Error verifying institution on blockchain:', error);
      let errorMessage = 'Failed to verify institution on blockchain';
      
      if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message?.includes('InstitutionAlreadyVerified')) {
        errorMessage = 'Institution is already verified';
      } else if (error.message?.includes('InstitutionDoesNotExist')) {
        errorMessage = 'Institution not found on blockchain';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleSuspend = async (institutionId, institutionAddress) => {
    if (!confirm('Are you sure you want to suspend this institution?')) return;

    const toastId = toast.loading('Suspending institution...');
    try {
      await suspendInstitution(institutionId);
      toast.success('Institution suspended in database', { id: toastId });
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

  // Show loading while checking admin status
  if (isConnected && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <Loader2 className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

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

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="w-8 h-8 text-purple-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Portal</h1>
              </div>
              <p className="text-gray-600">Register and manage educational institutions</p>
              <p className="text-sm text-orange-600 mt-1">
                Note: Institutions must register themselves on blockchain. Admin can only verify existing registrations.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center space-x-2 w-full md:w-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add to Database</span>
            </button>
          </div>

          {/* Registration Form
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-purple-50 p-6 rounded-xl mb-8 border border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Institution to Database</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Wallet Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    placeholder="0x..."
                    required
                  />
                </div>
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Accredited URL
                  </label>
                  <input
                    type="url"
                    name="accreditedURL"
                    value={formData.accreditedURL}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="contact@institution.edu"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{submitting ? 'Adding...' : 'Add to Database'}</span>
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
          )} */}

          {/* Institutions Table */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading institutions...</p>
            </div>
          ) : institutions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No institutions registered yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Add First Institution
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6 md:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Wallet Address</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {institutions.map((inst) => (
                        <tr key={inst.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{inst.name}</div>
                            <div className="text-gray-500 text-sm">{inst.email}</div>
                            <div className="text-gray-500 text-sm font-mono md:hidden">
                              {inst.address.slice(0, 6)}...{inst.address.slice(-4)}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-500 font-mono text-sm hidden md:table-cell">
                            {inst.address.slice(0, 8)}...{inst.address.slice(-6)}
                          </td>
                          <td className="px-4 py-4 text-gray-600">{inst.country}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                inst.status === 'Active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {inst.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 space-y-2 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => handleVerifyOnChain(inst.address)}
                              className="text-blue-600 hover:text-blue-900 font-semibold text-sm block sm:inline-block mb-2 sm:mb-0"
                            >
                              Verify on Chain
                            </button>
                            {inst.status === 'Active' ? (
                              <button
                                onClick={() => handleSuspend(inst.id, inst.address)}
                                className="text-red-600 hover:text-red-900 font-semibold text-sm block sm:inline-block"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(inst.id)}
                                className="text-green-600 hover:text-green-900 font-semibold text-sm block sm:inline-block"
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
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Institutions</p>
                  <p className="text-2xl font-bold text-purple-600">{institutions.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {institutions.filter((i) => i.status === 'Active').length}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                  <p className="text-sm text-gray-600 mb-1">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">
                    {institutions.filter((i) => i.status === 'Suspended').length}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}