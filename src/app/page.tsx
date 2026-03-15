'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mode, setMode] = useState<'sandbox' | 'live'>('sandbox');

  useEffect(() => {
    const savedMode = document.cookie
      .split('; ')
      .find((row) => row.startsWith('bkash_mode='))
      ?.split('=')[1];
    
    if (savedMode === 'live' || savedMode === 'sandbox') {
      setMode(savedMode as 'sandbox' | 'live');
    } else {
      document.cookie = 'bkash_mode=sandbox; path=/; max-age=31536000';
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'sandbox' ? 'live' : 'sandbox';
    setMode(newMode);
    document.cookie = `bkash_mode=${newMode}; path=/; max-age=31536000`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] transition-colors duration-700 ${
        mode === 'live' ? 'bg-[#e2136e20]' : 'bg-blue-500/10'
      }`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] transition-colors duration-700 ${
        mode === 'live' ? 'bg-[#e2136e10]' : 'bg-blue-400/10'
      }`} />

      {/* Environment Switcher */}
      <div className="absolute top-8 right-8 z-20">
        <label className="flex items-center gap-3 cursor-pointer group">
          <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${mode === 'sandbox' ? 'text-blue-500' : 'text-gray-400'}`}>
            Sandbox
          </span>
          <div 
            onClick={toggleMode}
            className="w-14 h-7 bg-gray-200 rounded-full p-1 transition-all duration-300 relative border border-gray-100 shadow-inner group-hover:shadow-md"
          >
            <div className={`w-5 h-5 rounded-full shadow-sm transform transition-all duration-300 ${
              mode === 'live' ? 'translate-x-7 bg-[#e2136e]' : 'translate-x-0 bg-blue-500'
            }`} />
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${mode === 'live' ? 'text-[#e2136e]' : 'text-gray-400'}`}>
            Live
          </span>
        </label>
      </div>

      <main className="z-10 text-center max-w-2xl w-full">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-12 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
          <div className="mb-8 flex justify-center">
             <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
               mode === 'live' ? 'bg-[#e2136e] shadow-[#e2136e40]' : 'bg-blue-500 shadow-blue-500/40'
             }`}>
                <span className="text-white text-3xl font-bold italic">bk</span>
             </div>
          </div>
          
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Seamless <span className={mode === 'live' ? 'text-[#e2136e]' : 'text-blue-500'}>Payments</span> for Your Business
          </h1>
          
          <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
            Integrate bKash effortlessly into your Next.js application. Reliable, secure, and blazing fast.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products"
              className={`px-8 py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                mode === 'live' ? 'bg-[#e2136e] hover:bg-[#c10e5d] shadow-[#e2136e30]' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30'
              }`}
            >
              Get Started with {mode === 'live' ? 'Live' : 'Sandbox'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mt-12 text-gray-400 font-medium flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${mode === 'live' ? 'bg-[#e2136e]' : 'bg-blue-500'}`} />
            {mode === 'live' ? 'Live Production' : 'Sandbox Environment'} Active
          </div>
          <div>Secure 256-bit SSL</div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Plus+Jakarta+Sans', sans-serif;
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }
      `}</style>
    </div>
  );
}
