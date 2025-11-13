'use client';

import { Shield } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import WalletConnect from './WalletConnect';
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">TranscriptChain</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/verifier" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Verify
            </Link>
            <Link href="/student" className="text-gray-700 hover:text-blue-600 font-medium transition">
              My Credentials
            </Link>
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  );
}