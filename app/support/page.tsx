'use client';

import { useState } from 'react';
import Link from 'next/link';

type FAQItem = {
  question: string;
  answer: string;
};

type FAQCategory = {
  title: string;
  items: FAQItem[];
};

const faqData: FAQCategory[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I place an order?',
        answer: 'Upload your 3D model file (STL format), configure your print settings (quality, material, color, infill), add to bag, and proceed to checkout. You\'ll receive a confirmation email with your order number once the order is placed.',
      },
      {
        question: 'What file formats do you accept?',
        answer: 'We currently accept STL files. Make sure your model is manifold (watertight) for best results. You can check if your model is manifold using the preview feature on our configurator.',
      },
      {
        question: 'How do I know if my model is printable?',
        answer: 'Our configurator automatically analyzes your model and displays key information including whether it\'s manifold, the dimensions, volume, and surface area. We\'ll also notify you during the review process if there are any issues.',
      },
    ],
  },
  {
    title: 'Pricing & Payments',
    items: [
      {
        question: 'How is pricing calculated?',
        answer: 'Pricing is based on material weight (calculated from volume and infill), print time, quality level, and a setup fee per unique model. All prices are in Nigerian Naira (₦). You\'ll see a detailed price breakdown before adding items to your bag.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept payments via Paystack, Flutterwave, and bank transfer. All major debit and credit cards are supported through our payment providers.',
      },
      {
        question: 'Can I get a quote before ordering?',
        answer: 'Yes! The configurator provides instant pricing as you adjust your settings. You can also save your configuration as a draft to review later.',
      },
    ],
  },
  {
    title: 'Materials & Quality',
    items: [
      {
        question: 'What materials are available?',
        answer: 'We offer PLA, PETG, ABS, and Resin. PLA is eco-friendly and great for most prints. PETG offers higher durability. ABS is heat-resistant. Resin provides the highest detail for small models.',
      },
      {
        question: 'What print quality levels do you offer?',
        answer: 'We offer four quality levels: Draft (fast, 0.3mm layers), Standard (balanced, 0.2mm), High (detailed, 0.15mm), and Ultra (finest detail, 0.1mm). Higher quality takes longer but produces smoother surfaces.',
      },
      {
        question: 'What is infill and how does it affect my print?',
        answer: 'Infill is the internal structure of your print. Higher infill (up to 100% solid) makes prints stronger and heavier but uses more material and costs more. For decorative items, 10-20% is usually sufficient. For functional parts, 40-60% is recommended.',
      },
    ],
  },
  {
    title: 'Orders & Delivery',
    items: [
      {
        question: 'How long does printing take?',
        answer: 'Print time depends on model size, quality level, and infill. The configurator shows estimated print time. After placing an order, we review your files (1-2 days), print (varies by model), perform quality checks, and ship. Total time is typically 5-7 business days.',
      },
      {
        question: 'How can I track my order?',
        answer: 'Log in to your account and visit "My Orders" to see your order status. We provide updates at each stage: Received → Reviewing → Printing → Quality Check → Ready for Delivery → Out for Delivery → Delivered.',
      },
      {
        question: 'Where do you deliver?',
        answer: 'We currently deliver within Nigeria to all 36 states and FCT. Delivery typically takes 2-5 business days after printing is complete. Delivery fee is ₦2,500.',
      },
      {
        question: 'Can I modify or cancel my order?',
        answer: 'You can cancel or modify your order before it enters the "Printing" stage. Contact us immediately at support@printwithmuri.com with your order number if you need to make changes.',
      },
    ],
  },
  {
    title: 'Account & Drafts',
    items: [
      {
        question: 'Do I need an account to order?',
        answer: 'Yes, you need to create an account to place orders. This allows you to track orders, save drafts, and manage your print history.',
      },
      {
        question: 'What are drafts?',
        answer: 'Drafts let you save your model configuration (quality, material, infill, color) without placing an order. You can access them later from the "Drafts" menu to continue working or place an order.',
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page, enter your email, and we\'ll send you a password reset link. Check your spam folder if you don\'t receive it within a few minutes.',
      },
    ],
  },
  {
    title: 'Technical Support',
    items: [
      {
        question: 'My model file is too large. What should I do?',
        answer: 'Try reducing the polygon count in your 3D modeling software, or use a file compression tool. We support files up to 50MB. If your file is larger, contact us at support@printwithmuri.com.',
      },
      {
        question: 'Why was my print rejected during review?',
        answer: 'Common reasons include: non-manifold models (holes in the mesh), models that are too thin to print, or unsupported overhangs. We\'ll contact you with specific feedback and suggestions for fixing your model.',
      },
      {
        question: 'Can you help me design or fix my 3D model?',
        answer: 'While we don\'t offer design services, we can provide basic feedback on printability issues. For complex model fixes, we can recommend trusted 3D modeling professionals.',
      },
    ],
  },
];

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFAQ = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  // Filter FAQ based on search
  const filteredFAQ = faqData.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0);

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Support Center</h1>
        <p className="text-lg text-[#7A7A7A] mb-8">
          Find answers to common questions or get in touch with our team
        </p>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 border border-[#E6E6E6] rounded-[2px] text-[16px] focus:outline-none focus:border-[#F4008A]"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link
          href="/contact"
          className="bg-white border border-[#E6E6E6] p-6 rounded-[2px] hover:border-[#F4008A] transition-colors text-center group"
        >
          <div className="w-12 h-12 bg-[#F4008A] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#D4007A] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
          <p className="text-sm text-[#7A7A7A]">Send us a message and we'll respond within 24 hours</p>
        </Link>

        <Link
          href="/orders"
          className="bg-white border border-[#E6E6E6] p-6 rounded-[2px] hover:border-[#F4008A] transition-colors text-center group"
        >
          <div className="w-12 h-12 bg-[#F4008A] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#D4007A] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Track Orders</h3>
          <p className="text-sm text-[#7A7A7A]">Check the status of your current orders</p>
        </Link>

        <Link
          href="/"
          className="bg-white border border-[#E6E6E6] p-6 rounded-[2px] hover:border-[#F4008A] transition-colors text-center group"
        >
          <div className="w-12 h-12 bg-[#F4008A] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#D4007A] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Start Printing</h3>
          <p className="text-sm text-[#7A7A7A]">Upload a model and get an instant quote</p>
        </Link>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

        {filteredFAQ.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-[#7A7A7A] mb-4">No results found for "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#F4008A] hover:underline font-medium"
            >
              Clear search
            </button>
          </div>
        )}

        {filteredFAQ.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-[#1F1F1F]">{category.title}</h3>
            <div className="space-y-3">
              {category.items.map((item, itemIndex) => {
                const key = `${categoryIndex}-${itemIndex}`;
                const isOpen = openIndex === key;

                return (
                  <div
                    key={itemIndex}
                    className="bg-white border border-[#E6E6E6] rounded-[2px] overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(categoryIndex, itemIndex)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#F6F6F6] transition-colors"
                    >
                      <span className="font-medium text-[#1F1F1F] pr-4">{item.question}</span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`flex-shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 text-[#7A7A7A] border-t border-[#E6E6E6] pt-4">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Still Need Help */}
      <div className="mt-12 bg-[#F6F6F6] p-8 rounded-[2px] text-center">
        <h3 className="text-2xl font-semibold mb-4">Still Need Help?</h3>
        <p className="text-[#7A7A7A] mb-6">
          Can't find what you're looking for? Our team is here to help!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="px-6 py-3 bg-[#F4008A] text-white rounded-[2px] font-medium hover:bg-[#D4007A] transition-colors"
          >
            Contact Support
          </Link>
          <a
            href="mailto:support@printwithmuri.com"
            className="px-6 py-3 border border-[#E6E6E6] bg-white rounded-[2px] font-medium hover:border-[#F4008A] transition-colors"
          >
            Email Us Directly
          </a>
        </div>
      </div>
    </div>
  );
}
