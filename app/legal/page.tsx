'use client';

import { useState } from 'react';

type Tab = 'privacy' | 'terms' | 'cookies';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<Tab>('privacy');

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Legal</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-[#E6E6E6] mb-8">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'privacy'
              ? 'text-[#F4008A]'
              : 'text-[#8D8D8D] hover:text-dark'
              }`}
          >
            Privacy Policy
            {activeTab === 'privacy' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F4008A]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'terms'
              ? 'text-[#F4008A]'
              : 'text-[#8D8D8D] hover:text-dark'
              }`}
          >
            Terms of Service
            {activeTab === 'terms' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F4008A]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('cookies')}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'cookies'
              ? 'text-[#F4008A]'
              : 'text-[#8D8D8D] hover:text-dark'
              }`}
          >
            Cookie Policy
            {activeTab === 'cookies' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F4008A]" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="prose prose-sm max-w-none">
          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
              <p className="text-medium mb-4">Last updated: December 1, 2025</p>

              <h3 className="text-lg font-semibold mt-6 mb-3">1. Information We Collect</h3>
              <p className="text-medium mb-4">
                We collect information you provide directly to us when you create an account,
                place an order, or communicate with us. This includes your name, email address,
                shipping address, and payment information.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">2. How We Use Your Information</h3>
              <p className="text-medium mb-4">
                We use the information we collect to process your orders, communicate with you
                about your orders and our services, and improve our platform.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">3. Information Sharing</h3>
              <p className="text-medium mb-4">
                We do not sell or rent your personal information to third parties. We may share
                your information with service providers who assist us in operating our platform
                and fulfilling orders.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">4. Data Security</h3>
              <p className="text-medium mb-4">
                We implement appropriate technical and organizational measures to protect your
                personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">5. Your Rights</h3>
              <p className="text-medium mb-4">
                You have the right to access, correct, or delete your personal information.
                Contact us at privacy@printwithmuri.com to exercise these rights.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>
              <p className="text-medium mb-4">Last updated: December 1, 2025</p>

              <h3 className="text-lg font-semibold mt-6 mb-3">1. Acceptance of Terms</h3>
              <p className="text-medium mb-4">
                By accessing and using Muri Press, you accept and agree to be bound by the terms
                and provision of this agreement.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">2. Use License</h3>
              <p className="text-medium mb-4">
                Permission is granted to temporarily use Muri Press for personal, non-commercial
                transitory viewing and ordering of print services only.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">3. File Upload Guidelines</h3>
              <p className="text-medium mb-4">
                You are responsible for ensuring you have the rights to print any files you upload.
                Files must be in supported formats (.stl) and comply with our size and quality requirements.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">4. Orders and Payment</h3>
              <p className="text-medium mb-4">
                All orders are subject to acceptance and availability. Prices are subject to change
                without notice. Payment must be received in full before production begins.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">5. Returns and Refunds</h3>
              <p className="text-medium mb-4">
                Due to the custom nature of our products, returns are only accepted for defective
                items or errors on our part. Contact support within 7 days of delivery.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">6. Limitation of Liability</h3>
              <p className="text-medium mb-4">
                Muri Press shall not be liable for any indirect, incidental, special, consequential,
                or punitive damages resulting from your use of our service.
              </p>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Cookie Policy</h2>
              <p className="text-medium mb-4">Last updated: December 1, 2025</p>

              <h3 className="text-lg font-semibold mt-6 mb-3">1. What Are Cookies</h3>
              <p className="text-medium mb-4">
                Cookies are small text files that are stored on your device when you visit our website.
                They help us make the site work properly and improve your experience.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">2. How We Use Cookies</h3>
              <p className="text-medium mb-4">
                We use cookies for the following purposes:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2 text-medium">
                <li>
                  <span className="font-medium">Essential Cookies:</span> Necessary for the website to function,
                  such as keeping you logged in and remembering your cart items.
                </li>
                <li>
                  <span className="font-medium">Functional Cookies:</span> Help us remember your preferences
                  and settings.
                </li>
                <li>
                  <span className="font-medium">Analytics Cookies:</span> Help us understand how visitors
                  interact with our website so we can improve it.
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3">3. Managing Cookies</h3>
              <p className="text-medium mb-4">
                Most web browsers allow you to control cookies through their settings preferences.
                However, if you limit the ability of websites to set cookies, you may worsen your
                overall user experience.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
