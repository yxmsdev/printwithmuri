'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // TODO: Implement contact form submission (email service or database)
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setMessage('Failed to send message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-medium mb-8">
          Have a question or need assistance? We&apos;re here to help!
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] rounded-[2px]"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] rounded-[2px]"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] rounded-[2px]"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Question</option>
                  <option value="technical">Technical Support</option>
                  <option value="pricing">Pricing & Quotes</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] rounded-[2px] resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="text-white text-[14px] font-medium tracking-[0.28px] px-8 py-[8px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed w-full rounded-[2px]"
                  style={{
                    background: 'linear-gradient(180deg, #464750 21.275%, #000000 100%)'
                  }}
                >
                  {loading ? 'SENDING...' : 'Send Message'}
                </button>

                {message && (
                  <p
                    className={`text-sm ${message.includes('Thank you')
                      ? 'text-green-600'
                      : 'text-red-600'
                      }`}
                  >
                    {message}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-light p-6 rounded-[2px]">
              <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-[#8D8D8D] mb-1">Email</p>
                  <a
                    href="mailto:support@printwithmuri.com"
                    className="text-medium hover:text-[#F4008A] transition-colors"
                  >
                    support@printwithmuri.com
                  </a>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#8D8D8D] mb-1">Response Time</p>
                  <p className="text-medium">Within 24 hours</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#8D8D8D] mb-1">Business Hours</p>
                  <p className="text-medium">
                    Monday - Friday<br />
                    10:00 AM - 5:00 PM GMT
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-light p-6 rounded-[2px]">
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="space-y-3">
                <a
                  href="https://instagram.com/muripress"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-medium hover:text-[#F4008A] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </a>

                <a
                  href="https://twitter.com/muripress"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-medium hover:text-[#F4008A] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </a>

                <a
                  href="https://linkedin.com/company/muripress"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-medium hover:text-[#F4008A] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="bg-[#F4008A] text-white p-6 rounded-[2px]">
              <h3 className="text-lg font-semibold mb-2">Need Immediate Help?</h3>
              <p className="text-sm mb-4">
                Check our support page for answers to common questions.
              </p>
              <a
                href="/legal"
                className="inline-block px-4 py-2 bg-white text-[#F4008A] rounded-[2px] text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Visit Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
