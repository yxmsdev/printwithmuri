'use client';

import { useState } from 'react';
import SwiperGallery from '@/components/ui/SwiperGallery';
import Toast from '@/components/ui/Toast';

export default function SignagePage() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const paperImages = [
    '/images/paper/1-elementor-io-optimized.webp',
    '/images/paper/2-elementor-io-optimized.webp',
    '/images/paper/3-elementor-io-optimized.webp',
    '/images/paper/4-elementor-io-optimized.webp',
    '/images/paper/5-elementor-io-optimized.webp',
    '/images/paper/6-elementor-io-optimized.webp',
    '/images/paper/7-elementor-io-optimized.webp',
    '/images/paper/8-elementor-io-optimized.webp',
    '/images/paper/9-elementor-io-optimized.webp',
    '/images/paper/10-elementor-io-optimized.webp',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      setToastMessage('Please enter your email');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          source: 'signage_coming_soon',
        }),
      });

      if (response.ok) {
        setToastMessage("Thanks! We'll notify you when paper printing launches.");
        setToastType('success');
        setFormData({ name: '', email: '' });
      } else {
        const data = await response.json();
        setToastMessage(data.error || 'Something went wrong');
        setToastType('error');
      }
    } catch {
      setToastMessage('Something went wrong. Please try again.');
      setToastType('error');
    } finally {
      setIsSubmitting(false);
      setShowToast(true);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Swiper Gallery */}
      <div className="w-full h-[500px] pt-[40px]">
        <SwiperGallery
          images={paperImages}
          autoplayDelay={3000}
          rotate={35}
          depth={150}
        />
      </div>

      {/* Waitlist Section */}
      <div className="flex flex-col items-center px-4 pb-[60px] mt-[30px]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#41D4EA]/20 to-[#00A8D2]/20 text-[#00A8D2] text-[12px] font-semibold rounded-[4px] mb-4 border border-[#41D4EA]/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A8D2] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A8D2]"></span>
            </span>
            Coming Soon
          </div>
          <h2 className="text-[24px] sm:text-[30px] font-bold text-black mb-3 leading-tight">
            Produce High Quality<br />Custom Print Media
          </h2>
          <p className="text-[14px] text-[#6B6B6B] leading-[22px] max-w-[380px] mx-auto">
            From stickers to signage and souvenir needs, upload your files and make high-quality items easily.
          </p>
        </div>

        {/* Newsletter Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[500px]">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1">
              <label className="block text-[10px] text-[#8D8D8D] font-medium leading-[1.8] mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Muri Printa"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 bg-[#EFEFEF] text-[14px] text-[#8D8D8D] tracking-[-0.28px] focus:outline-none focus:text-[#1F1F1F]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-[#8D8D8D] font-medium leading-[1.8] mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="muripress@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full p-2 bg-[#EFEFEF] text-[14px] text-[#8D8D8D] tracking-[-0.28px] focus:outline-none focus:text-[#1F1F1F]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-6 text-white text-[14px] tracking-[0.28px] rounded-[2px] transition-all hover:opacity-90 btn-bounce disabled:opacity-50"
            style={{
              background: 'linear-gradient(180deg, #464750 0%, #000000 100%)',
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Notify Me'}
          </button>
        </form>

        <p className="text-[12px] text-black capitalize mt-4">
          Be the first to know when we launch!
        </p>
      </div>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
