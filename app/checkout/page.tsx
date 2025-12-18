'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useBagStore } from '@/stores/useBagStore';
import { useOrdersStore, createOrderFromCheckout } from '@/stores/useOrdersStore';

// Dynamically import PaystackButton to avoid SSR issues
const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { ssr: false }
);

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

import { nigerianStates, nigerianCities } from '@/lib/nigerian-states';

import { deliveryPrices, defaultDeliveryPrice } from '@/lib/delivery-pricing';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearBag } = useBagStore();
  const addOrder = useOrdersStore((state) => state.addOrder);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paystack'>('paystack');
  const [deliveryMethod, setDeliveryMethod] = useState<'dispatch' | 'pickup'>('dispatch');

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
  });

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  const subtotal = getSubtotal();

  // Calculate delivery fee
  const getDeliveryFee = () => {
    if (deliveryMethod === 'pickup') return 0;

    if (shippingAddress.state) {
      return deliveryPrices[shippingAddress.state] || defaultDeliveryPrice;
    }

    return defaultDeliveryPrice;
  };

  const deliveryFee = getDeliveryFee();
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
    if (!shippingAddress.country) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => {
      // If state changes, reset city
      if (field === 'state') {
        return { ...prev, [field]: value, city: '' };
      }
      return { ...prev, [field]: value };
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // If state changed, also clear city error
    if (field === 'state' && errors.city) {
      setErrors(prev => ({ ...prev, city: undefined }));
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

    // For Paystack, validation is done, payment will be triggered by PaystackButton
    // Reset processing state to allow button click
    setIsProcessing(false);
  };

  // Paystack configuration
  const paystackConfig = {
    reference: `MUR-${Date.now()}`,
    email: shippingAddress.email,
    amount: total * 100, // Paystack expects amount in kobo (smallest currency unit)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    metadata: {
      custom_fields: [
        {
          display_name: 'Customer Name',
          variable_name: 'customer_name',
          value: shippingAddress.fullName,
        },
        {
          display_name: 'Phone Number',
          variable_name: 'phone_number',
          value: shippingAddress.phone,
        },
      ],
    },
  };

  // Paystack payment callbacks
  const handlePaystackSuccess = async (reference: any) => {
    setIsProcessing(true);

    try {
      // Verify payment with our backend
      const response = await fetch('/api/payments/paystack/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: reference.reference,
        }),
      });

      const data = await response.json();

      if (data.success && data.verified) {
        // Create and save the order
        const orderData = createOrderFromCheckout(
          items,
          shippingAddress,
          subtotal,
          deliveryFee,
          reference.reference
        );

        const orderId = addOrder(orderData);

        // Clear bag and redirect to confirmation
        clearBag();
        router.push(`/checkout/confirmation?order=${orderId}`);
      } else {
        alert('Payment verification failed. Please contact support.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support.');
      setIsProcessing(false);
    }
  };

  const handlePaystackClose = () => {
    console.log('Payment popup closed');
    setIsProcessing(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center bg-white p-8">
        <div className="bg-white p-8 rounded-[2px] text-center max-w-md">
          <Image
            src="/images/Bag_icon.svg"
            alt="Empty bag"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <h2 className="text-[20px] font-medium text-[#1F1F1F] mb-2">Your bag is empty</h2>
          <p className="text-[14px] text-[#8D8D8D] mb-6">Add some items to your bag before checking out.</p>
          <Link
            href="/"
            className="rounded-[2px] inline-block px-8 py-[8px] text-[14px] font-medium tracking-[0.28px] text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)' }}
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Get material icon based on material type
  const getMaterialIcon = (material: string) => {
    const materialLower = material.toLowerCase();
    const iconMap: Record<string, string> = {
      'pla': '/images/pla-icon.svg',
      'abs': '/images/abs-icon.svg',
      'petg': '/images/petg-icon.svg',
      'tpu': '/images/tpu-icon.svg',
      'resin': '/images/resin-icon.svg',
    };
    return iconMap[materialLower] || '/images/pla-icon.svg';
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 py-8 pb-64">
        <h1 className="text-[32px] font-semibold text-[#1F1F1F] mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-8">

              {/* Delivery Method */}
              <div className="bg-white p-6 rounded-[2px] border-[0.5px] border-[#B7B7B7]">
                <h2 className="text-[16px] font-medium text-[#1F1F1F] mb-6">Delivery Method</h2>
                <div className="space-y-3">
                  {/* Dispatch */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-[2px] cursor-pointer transition-all border ${deliveryMethod === 'dispatch'
                      ? 'bg-[#EFEFEF] border-transparent'
                      : 'bg-[#EFEFEF] border-transparent hover:border-[#F4008A]'
                      }`}
                    onClick={() => setDeliveryMethod('dispatch')}
                  >
                    <div className="mt-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {deliveryMethod === 'dispatch' ? (
                          <>
                            <rect x="1" y="1" width="22" height="22" rx="2" stroke="#F4008A" strokeWidth="1" fill="none" />
                            <circle cx="12" cy="12" r="6" fill="#F4008A" className="transition-all duration-200" />
                          </>
                        ) : (
                          <>
                            <rect x="1" y="1" width="22" height="22" rx="2" stroke="#8D8D8D" strokeWidth="1" fill="none" />
                            <circle cx="12" cy="12" r="4" fill="#8D8D8D" className="transition-all duration-200" />
                          </>
                        )}
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`text-[14px] font-medium tracking-[-0.28px] leading-[1.8] ${deliveryMethod === 'dispatch' ? 'text-[#1F1F1F]' : 'text-[#8D8D8D]'}`}>Dispatch</p>
                      <p className="text-[12px] text-[#8D8D8D]">Delivery to your doorstep</p>
                    </div>
                    <div className={`text-[14px] font-medium ${deliveryMethod === 'dispatch' ? 'text-[#1F1F1F]' : 'text-[#8D8D8D]'}`}>
                      ₦{getDeliveryFee().toLocaleString()}
                    </div>
                  </label>

                  {/* Pickup */}
                  <label className="flex items-start gap-4 p-4 rounded-[2px] border border-transparent bg-[#EFEFEF] opacity-60 cursor-not-allowed">
                    <div className="mt-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="22" height="22" rx="2" stroke="#8D8D8D" strokeWidth="1" fill="none" />
                        <circle cx="12" cy="12" r="4" fill="#8D8D8D" className="transition-all duration-200" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-medium text-[#8D8D8D] tracking-[-0.28px] leading-[1.8]">Pickup</p>
                        <span className="px-2 py-0.5 bg-pink-100 text-[#F4008A] text-[10px] font-medium rounded-full">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-[12px] text-[#8D8D8D]">Pick up from our station</p>
                    </div>
                    <div className="text-[14px] font-medium text-[#8D8D8D]">
                      Free
                    </div>
                  </label>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-[2px] border-[0.5px] border-[#B7B7B7]">
                <h2 className="text-[16px] font-medium text-[#1F1F1F] mb-6">Shipping Address</h2>

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
                      className={`w-full px-[8px] py-[8px] bg-[#EFEFEF] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 focus:ring-[#F4008A] rounded-[2px] ${errors.fullName ? 'ring-1 ring-red-500' : ''}`}
                      placeholder="Enter your full name"
                      autoComplete="name"
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
                      className={`w-full px-[8px] py-[8px] bg-[#EFEFEF] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 focus:ring-[#F4008A] rounded-[2px] ${errors.email ? 'ring-1 ring-red-500' : ''}`}
                      placeholder="you@example.com"
                      autoComplete="email"
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
                      className={`w-full px-[8px] py-[8px] bg-[#EFEFEF] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 focus:ring-[#F4008A] rounded-[2px] ${errors.phone ? 'ring-1 ring-red-500' : ''}`}
                      placeholder="+234 800 000 0000"
                      autoComplete="tel"
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
                      className={`w-full px-[8px] py-[8px] bg-[#EFEFEF] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 focus:ring-[#F4008A] rounded-[2px] ${errors.address ? 'ring-1 ring-red-500' : ''}`}
                      placeholder="Enter your street address"
                      autoComplete="street-address"
                    />
                    {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-[12px] font-medium text-[#7A7A7A] mb-1">
                      City *
                    </label>
                    <div className="relative">
                      <select
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={!shippingAddress.state}
                        className={`w-full px-[8px] py-[8px] bg-[#EFEFEF] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 focus:ring-[#F4008A] rounded-[2px] appearance-none cursor-pointer ${errors.city ? 'ring-1 ring-red-500' : ''} ${!shippingAddress.state ? 'opacity-50 cursor-not-allowed' : ''}`}
                        autoComplete="address-level2"
                      >
                        <option value="">Select city</option>
                        {shippingAddress.state && nigerianCities[shippingAddress.state]?.map(city => (
                          <option key={city} value={city}>{city}</option>
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
                        className={`w-full px-[8px] py-[8px] bg-[#EFEFEF] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 focus:ring-[#F4008A] rounded-[2px] appearance-none cursor-pointer ${errors.state ? 'ring-1 ring-red-500' : ''}`}
                        autoComplete="address-level1"
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
                      className="w-full px-[8px] py-[8px] bg-[#EFEFEF] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 focus:ring-[#F4008A] rounded-[2px]"
                      placeholder="Enter postal code"
                      autoComplete="postal-code"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-[12px] font-medium text-[#7A7A7A] mb-1">
                      Country *
                    </label>
                    <div className="relative">
                      <select
                        value={shippingAddress.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-[8px] py-[8px] bg-[#EFEFEF] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 focus:ring-[#F4008A] rounded-[2px] appearance-none cursor-pointer"
                        autoComplete="country"
                      >
                        <option value="Nigeria">Nigeria</option>
                      </select>
                      <Image
                        src="/images/icons/dropdown.svg"
                        alt=""
                        width={10}
                        height={6}
                        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-[2px] border-[0.5px] border-[#B7B7B7]">
                <h2 className="text-[16px] font-medium text-[#1F1F1F] mb-6">Payment Method</h2>

                <div className="space-y-3">
                  {/* Paystack */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-[2px] cursor-pointer transition-all border ${paymentMethod === 'paystack'
                      ? 'bg-[#EFEFEF] border-transparent'
                      : 'bg-[#EFEFEF] border-transparent hover:border-[#F4008A]'
                      }`}
                    onClick={() => setPaymentMethod('paystack')}
                  >
                    <div className="mt-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {paymentMethod === 'paystack' ? (
                          <>
                            <rect x="1" y="1" width="22" height="22" rx="2" stroke="#F4008A" strokeWidth="1" fill="none" />
                            <circle cx="12" cy="12" r="6" fill="#F4008A" className="transition-all duration-200" />
                          </>
                        ) : (
                          <>
                            <rect x="1" y="1" width="22" height="22" rx="2" stroke="#8D8D8D" strokeWidth="1" fill="none" />
                            <circle cx="12" cy="12" r="4" fill="#8D8D8D" className="transition-all duration-200" />
                          </>
                        )}
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`text-[14px] font-medium tracking-[-0.28px] leading-[1.8] ${paymentMethod === 'paystack' ? 'text-[#1F1F1F]' : 'text-[#8D8D8D]'}`}>Paystack</p>
                      <p className="text-[12px] text-[#8D8D8D]">Pay with card, bank transfer, or USSD</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-5 bg-white rounded-[2px] flex items-center justify-center border border-[#E6E6E6]">
                        <Image src="/images/visa.svg" alt="Visa" width={24} height={8} className="object-contain" />
                      </div>
                      <div className="w-8 h-5 bg-white rounded-[2px] flex items-center justify-center border border-[#E6E6E6]">
                        <Image src="/images/mastercard.svg" alt="Mastercard" width={24} height={15} className="object-contain" />
                      </div>
                    </div>
                  </label>

                  {/* Crypto - Coming Soon */}
                  <label className="flex items-start gap-4 p-4 rounded-[2px] border border-transparent bg-[#EFEFEF] opacity-60 cursor-not-allowed">
                    <div className="mt-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="22" height="22" rx="2" stroke="#8D8D8D" strokeWidth="1" fill="none" />
                        <circle cx="12" cy="12" r="4" fill="#8D8D8D" className="transition-all duration-200" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-medium text-[#8D8D8D] tracking-[-0.28px] leading-[1.8]">Pay with Crypto</p>
                        <span className="px-2 py-0.5 bg-pink-100 text-[#F4008A] text-[10px] font-medium rounded-full">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-[12px] text-[#8D8D8D]">Pay with Base, Ethereum, USDC, and more</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-[2px] border-[0.5px] border-[#B7B7B7] sticky top-24">
                <h2 className="text-[16px] font-medium text-[#1F1F1F] mb-6">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-4 border-b border-[#E6E6E6]">
                      <div className="w-16 h-16 rounded-[2px] flex items-center justify-center flex-shrink-0">
                        <Image
                          src={getMaterialIcon(item.config.material)}
                          alt={item.config.material}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
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
                {paymentMethod === 'paystack' ? (
                  <div className="w-full mt-6">
                    <PaystackButton
                      {...paystackConfig}
                      text={isProcessing ? 'Processing...' : `Pay ₦${total.toLocaleString()}`}
                      onSuccess={handlePaystackSuccess}
                      onClose={handlePaystackClose}
                      disabled={isProcessing}
                      className="rounded-[2px] w-full py-[8px] text-[14px] font-medium text-white tracking-[0.28px] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed btn-bounce paystack-button"
                    />
                    <style jsx>{`
                      :global(.paystack-button) {
                        background: linear-gradient(180deg, #464750 21.275%, #000000 100%);
                      }
                    `}</style>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="rounded-[2px] w-full mt-6 py-[8px] text-[14px] font-medium text-white tracking-[0.28px] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed btn-bounce"
                    style={{ background: 'linear-gradient(180deg, #464750 21.275%, #000000 100%)' }}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Pay ₦${total.toLocaleString()}`
                    )}
                  </button>
                )}

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

