'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#e2136e20] rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#e2136e10] rounded-full blur-[100px]" />

      <main className="z-10 text-center max-w-2xl w-full">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-12 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
          <div className="mb-8 flex justify-center">
             <div className="w-20 h-20 bg-[#e2136e] rounded-2xl flex items-center justify-center shadow-lg shadow-[#e2136e40]">
                {/* Simple bKash-like logo representation */}
                <span className="text-white text-3xl font-bold italic">bk</span>
             </div>
          </div>
          
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Seamless <span className="text-[#e2136e]">Payments</span> for Your Business
          </h1>
          
          <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
            Integrate bKash effortlessly into your Next.js application. Reliable, secure, and blazing fast.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products"
              className="px-8 py-4 bg-[#e2136e] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-[#c10e5d] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#e2136e30]"
            >
              Get Started with Payment
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mt-12 text-gray-400 font-medium flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Sandbox Environment Active
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
