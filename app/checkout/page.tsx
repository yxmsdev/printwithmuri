'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useBagStore } from '@/stores/useBagStore';
import { useOrdersStore, createOrderFromCheckout } from '@/stores/useOrdersStore';

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearBag } = useBagStore();
  const addOrder = useOrdersStore((state) => state.addOrder);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'bank'>('paystack');
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  const subtotal = getSubtotal();
  const deliveryFee = 2500;
  const total = subtotal + deliveryFee;

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};
    
    if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!shippingAddress.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) newErrors.email = 'Invalid email format';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^(\+234|0)[0-9]{10}$/.test(shippingAddress.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid Nigerian phone number';
    }
    if (!shippingAddress.address.trim()) newErrors.address = 'Address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state) newErrors.state = 'State is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (items.length === 0) {
      alert('Your bag is empty');
      return;
    }

    setIsProcessing(true);

    // TODO: Integrate with actual payment gateway
    // For now, simulate payment processing
    setTimeout(() => {
      // Create payment reference (simulated)
      const paymentReference = `PAY-${Date.now().toString(36).toUpperCase()}`;
      
      // Create and save the order
      const orderData = createOrderFromCheckout(
        items,
        shippingAddress,
        subtotal,
        deliveryFee,
        paymentReference
      );
      
      const orderId = addOrder(orderData);
      
      // Clear bag and redirect to confirmation with order ID
      clearBag();
      router.push(`/checkout/confirmation?order=${orderId}`);
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center bg-[#EDEDED] p-8">
        <div className="bg-white p-8 rounded-[2px] shadow-sm text-center max-w-md">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 text-[#8D8D8D]">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2 className="text-[20px] font-medium text-[#1F1F1F] mb-2">Your bag is empty</h2>
          <p className="text-[14px] text-[#8D8D8D] mb-6">Add some items to your bag before checking out.</p>
          <Link
            href="/"
            className="rounded-[2px] inline-block px-6 py-3 text-[14px] font-medium text-white uppercase tracking-[0.28px]"
            style={{ background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)' }}
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#EDEDED]">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-[12px] text-[#8D8D8D] hover:text-[#1F1F1F] transition-colors">
            ← Back to configurator
          </Link>
          <h1 className="text-[28px] font-medium text-[#1F1F1F] mt-2">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Shipping & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-[2px] shadow-sm">
                <h2 className="text-[18px] font-medium text-[#1F1F1F] mb-6">Shipping Address</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-medium text-[#7A7A7A] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`w-full px-4 py-3 bg-[#EFEFEF] text-[14px] text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#F4008A] ${errors.fullName ? 'ring-1 ring-red-500' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[12px] font-medium text-[#7A7A7A] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-3 bg-[#EFEFEF] text-[14px] text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#F4008A] ${errors.email ? 'ring-1 ring-red-500' : ''}`}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[12px] font-medium text-[#7A7A7A] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 bg-[#EFEFEF] text-[14px] text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#F4008A] ${errors.phone ? 'ring-1 ring-red-500' : ''}`}
                      placeholder="+234 800 000 0000"
                    />
                    {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-medium text-[#7A7A7A] mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full px-4 py-3 bg-[#EFEFEF] text-[14px] text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#F4008A] ${errors.address ? 'ring-1 ring-red-500' : ''}`}
                      placeholder="Enter your street address"
                    />
                    {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-[12px] font-medium text-[#7A7A7A] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-3 bg-[#EFEFEF] text-[14px] text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#F4008A] ${errors.city ? 'ring-1 ring-red-500' : ''}`}
                      placeholder="Enter your city"
                    />
                    {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-[12px] font-medium text-[#7A7A7A] mb-1">
                      State *
                    </label>
                    <div className="relative">
                      <select
                        value={shippingAddress.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={`w-full px-4 py-3 bg-[#EFEFEF] text-[14px] text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#F4008A] appearance-none cursor-pointer ${errors.state ? 'ring-1 ring-red-500' : ''}`}
                      >
                        <option value="">Select state</option>
                        {nigerianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      <Image
                        src="/images/icons/dropdown.svg"
                        alt=""
                        width={10}
                        height={6}
                        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      />
                    </div>
                    {errors.state && <p className="text-[11px] text-red-500 mt-1">{errors.state}</p>}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-[12px] font-medium text-[#7A7A7A] mb-1">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="w-full px-4 py-3 bg-[#EFEFEF] text-[14px] text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#F4008A]"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-[2px] shadow-sm">
                <h2 className="text-[18px] font-medium text-[#1F1F1F] mb-6">Payment Method</h2>
                
                <div className="space-y-3">
                  {/* Paystack */}
                  <label className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${paymentMethod === 'paystack' ? 'border-[#F4008A] bg-pink-50' : 'border-[#E6E6E6] hover:border-[#8D8D8D]'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={() => setPaymentMethod('paystack')}
                      className="w-4 h-4 accent-[#F4008A]"
                    />
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-[#1F1F1F]">Paystack</p>
                      <p className="text-[12px] text-[#8D8D8D]">Pay with card, bank transfer, or USSD</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-5 bg-[#EFEFEF] rounded-[2px] flex items-center justify-center text-[8px] font-bold text-[#8D8D8D]">VISA</div>
                      <div className="w-8 h-5 bg-[#EFEFEF] rounded-[2px] flex items-center justify-center text-[8px] font-bold text-[#8D8D8D]">MC</div>
                    </div>
                  </label>

                  {/* Flutterwave */}
                  <label className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${paymentMethod === 'flutterwave' ? 'border-[#F4008A] bg-pink-50' : 'border-[#E6E6E6] hover:border-[#8D8D8D]'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="flutterwave"
                      checked={paymentMethod === 'flutterwave'}
                      onChange={() => setPaymentMethod('flutterwave')}
                      className="w-4 h-4 accent-[#F4008A]"
                    />
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-[#1F1F1F]">Flutterwave</p>
                      <p className="text-[12px] text-[#8D8D8D]">Pay with card, bank, mobile money</p>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-[#F4008A] bg-pink-50' : 'border-[#E6E6E6] hover:border-[#8D8D8D]'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      className="w-4 h-4 accent-[#F4008A]"
                    />
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-[#1F1F1F]">Direct Bank Transfer</p>
                      <p className="text-[12px] text-[#8D8D8D]">Transfer directly to our bank account</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-[2px] shadow-sm sticky top-24">
                <h2 className="text-[18px] font-medium text-[#1F1F1F] mb-6">Order Summary</h2>
                
                {/* Items */}
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-4 border-b border-[#E6E6E6]">
                      <div className="w-16 h-16 bg-[#EFEFEF] rounded-[2px] flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#8D8D8D]">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#1F1F1F] truncate">{item.modelName}</p>
                        <p className="text-[12px] text-[#8D8D8D]">
                          {item.config.material} • {item.config.quality} • {item.config.color}
                        </p>
                        <p className="text-[12px] text-[#8D8D8D]">Qty: {item.config.quantity}</p>
                      </div>
                      <p className="text-[14px] font-medium text-[#1F1F1F]">₦{item.price.subtotal.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-4 border-t border-[#E6E6E6]">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#8D8D8D]">Subtotal</span>
                    <span className="text-[#1F1F1F]">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#8D8D8D]">Delivery</span>
                    <span className="text-[#1F1F1F]">₦{deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[16px] font-semibold pt-3 border-t border-[#E6E6E6]">
                    <span className="text-[#1F1F1F]">Total</span>
                    <span className="text-[#1F1F1F]">₦{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-[2px] w-full mt-6 py-4 text-[14px] font-medium text-white uppercase tracking-[0.28px] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)' }}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Pay ₦${total.toLocaleString()}`
                  )}
                </button>

                <p className="text-[10px] text-[#8D8D8D] text-center mt-4">
                  By placing this order, you agree to our{' '}
                  <Link href="/terms" className="underline hover:text-[#F4008A]">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="underline hover:text-[#F4008A]">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

