'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

interface ComingSoonContentProps {
  type: 'paper' | 'merch';
  onClose: () => void;
}

const ComingSoonContent: React.FC<ComingSoonContentProps> = ({ type, onClose }) => {
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement actual email capture logic (e.g., save to Supabase)
    await new Promise(resolve => setTimeout(resolve, 1000));

    setShowToast(true);
    setEmail('');
    setIsSubmitting(false);

    // Close modal after showing toast
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const content = {
    paper: {
      title: 'Paper Printing Coming Soon!',
      description: 'Business cards, flyers, posters, and packaging prints coming soon.',
      icon: '📄',
    },
    merch: {
      title: 'Merchandise Coming Soon!',
      description: 'Custom t-shirts, tote bags, and branded merchandise prints coming soon.',
      icon: '👕',
    },
  };

  return (
    <>
      <div className="text-center p-8">
        <div className="text-6xl mb-4">{content[type].icon}</div>
        <h2 className="text-3xl font-bold mb-4">{content[type].title}</h2>
        <p className="text-medium mb-8 text-lg">
          {content[type].description}
        </p>

        <p className="text-dark mb-6 font-medium">
          Be the first to know when we launch!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className="flex-1"
          />
          <Button type="submit" disabled={isSubmitting || !email}>
            {isSubmitting ? 'Submitting...' : 'Notify Me'}
          </Button>
        </form>
      </div>

      <Toast
        message="Thanks! We'll notify you when it's ready."
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

export default ComingSoonContent;
