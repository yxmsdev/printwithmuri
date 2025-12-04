'use client';

import { useState } from 'react';

type Tab = 'privacy' | 'terms' | 'support';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<Tab>('privacy');

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Legal & Support</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-[#E6E6E6] mb-8">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'privacy'
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
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'terms'
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
          onClick={() => setActiveTab('support')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'support'
              ? 'text-[#F4008A]'
              : 'text-[#8D8D8D] hover:text-dark'
          }`}
        >
          Support
          {activeTab === 'support' && (
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

        {activeTab === 'support' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Support</h2>
            <p className="text-medium mb-6">
              Need help? We&apos;re here for you!
            </p>

            <div className="bg-light p-6 rounded-[2px] mb-6">
              <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
              <div className="space-y-2">
                <p className="text-medium">
                  <span className="font-medium">Email:</span> support@printwithmuri.com
                </p>
                <p className="text-medium">
                  <span className="font-medium">Response Time:</span> Within 24 hours
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-3">Frequently Asked Questions</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">What file formats do you accept?</h4>
                <p className="text-medium">
                  We currently accept .stl files for 3D printing. Your files should be properly
                  manifold and free of errors for best results.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">How long does production take?</h4>
                <p className="text-medium">
                  Production time varies based on the complexity and size of your print.
                  Typical orders are completed within 3-5 business days.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">What materials do you use?</h4>
                <p className="text-medium">
                  We offer a variety of materials including PLA, PETG, and specialty filaments.
                  Material selection affects pricing and durability.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Can I track my order?</h4>
                <p className="text-medium">
                  Yes! Once your order is placed, you can track its status from your orders page.
                  You&apos;ll receive email notifications at each stage of production.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Do you offer shipping?</h4>
                <p className="text-medium">
                  We offer both standard and express shipping options. Shipping costs are
                  calculated at checkout based on your location and order size.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
