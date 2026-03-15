'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
}

const PRODUCTS: Product[] = [
  { id: '1', name: 'Starter Pack', price: 10, description: 'Basic features for beginners', icon: '🚀' },
  { id: '2', name: 'Pro Data', price: 50, description: 'Advanced analytics and tools', icon: '💎' },
  { id: '3', name: 'Enterprise Bundle', price: 150, description: 'Unlimited access and support', icon: '🏢' },
  { id: '4', name: 'Custom Insight', price: 25, description: 'Tailored reports for your niche', icon: '📊' },
];

export default function ProductsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handlePayment = async (product: Product) => {
    setLoading(product.id);
    try {
      const response = await fetch('/api/bkash/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: product.price.toString(),
          invoiceNumber: `INV-${Date.now()}`,
          productId: product.id,
        }),
      });

      const data = await response.json();

      if (data.bkashURL) {
        window.location.href = data.bkashURL;
      } else {
        alert(data.error || 'Failed to initiate payment');
        setLoading(null);
      }
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Something went wrong');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Select Your Plan</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Choose the data package that fits your needs. Secure payment powered by bKash.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map((product) => (
            <div 
              key={product.id}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center group"
            >
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">
                {product.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-6 grow">{product.description}</p>
              
              <div className="text-3xl font-black text-[#e2136e] mb-8">
                {product.price} <span className="text-sm font-medium text-gray-400">BDT</span>
              </div>

              <button
                onClick={() => handlePayment(product)}
                disabled={loading !== null}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  loading === product.id 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#e2136e] text-white hover:bg-[#c10e5d] active:scale-95 shadow-md hover:shadow-[#e2136e30]'
                }`}
              >
                {loading === product.id ? (
                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    Pay with bKash
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
            <Link href="/" className="text-gray-500 hover:text-[#e2136e] font-semibold flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
