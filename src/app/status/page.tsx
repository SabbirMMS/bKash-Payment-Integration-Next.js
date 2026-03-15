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

  console.log(searchParams);

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
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center animate-in fade-in zoom-in duration-500 relative overflow-hidden">
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

      {/* Developer Debug Block */}
      <div className="max-w-md w-full mt-8">
        <details className="group bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/80 transition-colors">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Developer Debug Info</span>
            </div>
            <svg 
              className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180" 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="p-4 pt-0 text-left">
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-[10px] sm:text-xs font-mono text-green-400 leading-relaxed">
                {JSON.stringify({
                  environment: mode,
                  status: status,
                  paymentID: searchParams.get('paymentID'),
                  trxID: trxID,
                  amount: amount,
                  message: message,
                  token: searchParams.get('token'),
                  raw_params: Object.fromEntries(searchParams.entries())
                }, null, 2)}
              </pre>
            </div>
            <p className="mt-4 text-[10px] text-gray-400 font-medium">
              Note: This block is only for development/testing visibility.
            </p>
          </div>
        </details>
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
