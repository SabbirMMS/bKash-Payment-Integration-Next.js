'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';

function StatusContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  const trxID = searchParams.get('trxID');
  const amount = searchParams.get('amount');
  const [mode, setMode] = useState<'sandbox' | 'live'>('sandbox');

  useEffect(() => {
    const savedMode = document.cookie
      .split('; ')
      .find((row) => row.startsWith('bkash_mode='))
      ?.split('=')[1];
    
    if (savedMode === 'live' || savedMode === 'sandbox') {
      setMode(savedMode as 'sandbox' | 'live');
    }
  }, []);

  const isSuccess = status === 'success';
  const themeClass = mode === 'live' ? 'bg-[#e2136e] hover:bg-[#c10e5d]' : 'bg-blue-500 hover:bg-blue-600';
  const textClass = mode === 'live' ? 'text-[#e2136e]' : 'text-blue-500';

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center animate-in fade-in zoom-in duration-500">
        <div className={`w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center ${
          isSuccess 
            ? 'bg-green-100 text-green-500' 
            : mode === 'live' ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-500'
        }`}>
          {isSuccess ? (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h1 className={`text-3xl font-black mb-4 ${isSuccess ? 'text-gray-900' : 'text-gray-800'}`}>
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h1>
        
        <p className="text-gray-500 mb-8 font-medium">
          {isSuccess 
            ? `Your transaction was processed successfully. Thank you for your purchase.`
            : message || 'Something went wrong during the transaction. Please try again.'}
        </p>

        {isSuccess && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-3 border border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Transaction ID</span>
              <span className="font-bold text-gray-700">{trxID}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
              <span className="text-gray-400">Amount Paid</span>
              <span className={`font-bold ${textClass}`}>{amount} BDT</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link 
            href="/products"
            className={`block w-full py-4 rounded-xl font-bold transition-all shadow-sm active:scale-95 ${
              isSuccess 
                ? 'bg-gray-900 text-white hover:bg-black' 
                : `${themeClass} text-white shadow-lg shadow-black/5`
            }`}
          >
            {isSuccess ? 'Continue Shopping' : 'Try Again'}
          </Link>
          <Link 
            href="/"
            className="block w-full py-4 text-gray-400 font-semibold hover:text-gray-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
        </div>
    }>
      <StatusContent />
    </Suspense>
  );
}
