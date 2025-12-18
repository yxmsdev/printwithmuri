'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useProfileImageStore } from '@/stores/useProfileImageStore';
import Image from 'next/image';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { nigerianStates, nigerianCities } from '@/lib/nigerian-states';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'delivery'>('personal');
  const [isEditMode, setIsEditMode] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [savedAddressId, setSavedAddressId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user type from user metadata (defaults to 'creator')
  const userType = (user?.user_metadata?.user_type as 'business' | 'creator') || 'creator';
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      street: '27, Kogbagidi street,Iyana Oworo',
      city: 'Kosofe',
      state: 'Lagos',
      postalCode: '123132',
      country: 'Adegbite',
      isDefault: true,
    },
  ]);
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    email: '',
    phone: '',
    companyName: '',
    taxId: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    linkedin: '',
    measurementPreference: 'mm',
    profession: '',
    customProfession: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get profile image from store
  const profileImage = useProfileImageStore((state) => state.profileImage);
  const setProfileImage = useProfileImageStore((state) => state.setProfileImage);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Load user profile data
    const fullName = user.user_metadata?.full_name || '';
    const [firstName, ...rest] = fullName.split(' ');
    const surname = rest.join(' ');

    setFormData({
      firstName: firstName || '',
      surname: surname || '',
      email: user.email || '',
      phone: '',
      companyName: '',
      taxId: '',
      instagram: '',
      twitter: '',
      tiktok: '',
      linkedin: '',
      measurementPreference: 'mm',
      profession: '',
      customProfession: '',
    });
  }, [user, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Save changes
      setLoading(true);
      setTimeout(() => {
        setMessage('Profile updated successfully!');
        setIsEditMode(false);
        setLoading(false);
      }, 500);
    } else {
      // Enter edit mode
      setIsEditMode(true);
      setMessage('');
    }
  };

  const handleAddAddress = () => {
    if (addresses.length >= 3) {
      return; // Maximum 3 addresses
    }
    const newAddress: Address = {
      id: Date.now().toString(),
      label: `Address ${addresses.length + 1}`,
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false,
    };
    setAddresses([...addresses, newAddress]);
    setEditingAddressId(newAddress.id); // Automatically enter edit mode for new address
  };

  const handleAddressChange = (id: string, field: keyof Address, value: string | boolean) => {
    setAddresses(addresses.map(addr => {
      if (addr.id === id) {
        // If state changes, reset city
        if (field === 'state') {
          return { ...addr, [field]: value as string, city: '' };
        }
        return { ...addr, [field]: value };
      }
      return addr;
    }));
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };

  const handleDeleteAddress = (id: string) => {
    if (addresses.length > 1) {
      const addressToDelete = addresses.find(addr => addr.id === id);
      const remainingAddresses = addresses.filter(addr => addr.id !== id);

      // If deleting the default address, make the first remaining address default
      if (addressToDelete?.isDefault && remainingAddresses.length > 0) {
        remainingAddresses[0].isDefault = true;
      }

      setAddresses(remainingAddresses);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white antialiased overflow-x-clip">
      <div className="w-full max-w-[1440px] mx-auto flex px-[115px]">
        {/* Left Sidebar Navigation Component */}
        <ProfileSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userType={userType}
        />

        {/* Main Content - Right Aligned (aligns with nav profile icon) */}
        <div className="flex-1 flex justify-end">
          <div className={`${userType === 'business' ? 'w-[939px]' : 'w-[703px]'} mt-[56px] mb-[120px] flex flex-col gap-[48px]`}>
            {/* Page Title Section */}
            <div className="flex flex-col gap-[4px]">
              <div className="flex items-start justify-between w-full">
                <h1 className="font-semibold text-[32px] leading-none text-black">
                  {activeTab === 'personal' ? 'Edit Profile' : 'Edit Delivery Details'}
                </h1>
                {activeTab === 'personal' ? (
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    disabled={loading}
                    className="border border-black px-[24px] py-[8px] rounded-[2px] text-[#1F1F1F] text-[14px] font-medium tracking-[0.28px] leading-[1.37] uppercase w-[207px] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-b hover:from-[#464750] hover:to-black hover:text-white hover:border-transparent btn-bounce"
                  >
                    {loading ? 'Saving...' : isEditMode ? 'Save Details' : 'Edit Details'}
                  </button>
                ) : (
                  <button
                    onClick={handleAddAddress}
                    disabled={addresses.length >= 3}
                    className="border border-black px-[24px] py-[8px] rounded-[2px] text-[#1F1F1F] text-[14px] font-medium tracking-[0.28px] leading-[1.37] uppercase w-[207px] transition-all hover:bg-gradient-to-b hover:from-[#464750] hover:to-black hover:text-white hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#1F1F1F] btn-bounce"
                  >
                    + New address
                  </button>
                )}
              </div>
              {/* Success Message - Shown under button */}
              {activeTab === 'personal' && message && (
                <p className="text-[12px] text-green-600 mt-2">
                  {message}
                </p>
              )}
            </div>

            {activeTab === 'personal' ? (
              <form className="flex flex-col gap-[48px]">
                {/* Profile Picture/Logo and Measurement Preference Row */}
                <div className="flex gap-[48px] items-start">
                  {/* Profile Picture / Company Logo */}
                  <div className="flex flex-col gap-[12px] w-[187.88px]">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className={`relative w-[187.88px] h-[187.88px] rounded-[8px] overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#F4008A] focus:ring-offset-2 ${profileImage ? '' : (userType === 'business' ? '' : 'bg-[#FF8DCD]')
                        }`}
                    >
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt={userType === 'business' ? 'Company Logo' : 'Profile'}
                          width={188}
                          height={188}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={userType === 'business' ? '/images/Company_profile.svg' : '/images/Account profile.svg'}
                          alt={userType === 'business' ? 'Company Logo' : 'Profile'}
                          width={188}
                          height={188}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="text-[14px] font-semibold text-[#8D8D8D] tracking-[-0.2px] leading-none text-left hover:text-[#F4008A] transition-colors cursor-pointer"
                    >
                      {userType === 'business' ? 'Change Company Logo' : 'Change Profile Photo'}
                    </button>
                  </div>

                  {/* Measurement Preference */}
                  <div className="flex flex-col gap-[4px] justify-center">
                    <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8] capitalize">
                      Measurement preference
                    </label>
                    <div className="relative w-[66px]">
                      <select
                        name="measurementPreference"
                        value={formData.measurementPreference}
                        onChange={handleChange}
                        disabled={!isEditMode}
                        className="bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#1F1F1F] tracking-[-0.28px] leading-[1.8] rounded-[2px] w-full appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#F4008A] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <option value="mm">mm</option>
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                      </select>
                      <svg
                        className="absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M3 4.5L6 7.5L9 4.5"
                          stroke={isEditMode ? "#1F1F1F" : "#8D8D8D"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Contact's Details, Social Details, and Company Details Section */}
                <div className="flex flex-col gap-[48px]">
                  {/* Two/Three Column Layout: Contact's Details + Social Details + Company Details (business only) */}
                  <div className="flex flex-row flex-wrap gap-[48px] items-start w-full">
                    {/* Contact's Details */}
                    <div className="flex flex-col gap-[16px] w-[281px] shrink-0">
                      <h2 className="text-[16px] font-semibold leading-none text-black">
                        Contact&apos;s Details
                      </h2>
                      <div className="flex flex-col gap-[12px]">
                        {/* First Name */}
                        <div className="flex flex-col gap-[4px]">
                          <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder={userType === 'business' ? 'Muri' : 'Eyiyemi'}
                            disabled={!isEditMode}
                            className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] w-full rounded-[2px] ${isEditMode ? 'text-[#1F1F1F]' : 'text-[#8D8D8D] cursor-not-allowed'
                              }`}
                          />
                        </div>

                        {/* Surname */}
                        <div className="flex flex-col gap-[4px]">
                          <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                            Surname
                          </label>
                          <input
                            type="text"
                            name="surname"
                            value={formData.surname}
                            onChange={handleChange}
                            placeholder={userType === 'business' ? 'Printa' : 'Adegbite'}
                            disabled={!isEditMode}
                            className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] w-full rounded-[2px] ${isEditMode ? 'text-[#1F1F1F]' : 'text-[#8D8D8D] cursor-not-allowed'
                              }`}
                          />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-[4px]">
                          <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium text-[#8D8D8D] tracking-[-0.28px] leading-[1.8] w-full cursor-not-allowed rounded-[2px]"
                          />
                        </div>

                        {/* Phone Number */}
                        <div className="flex flex-col gap-[4px]">
                          <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+234 XXX XXX XXXX"
                            disabled={!isEditMode}
                            className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] w-full rounded-[2px] ${isEditMode ? 'text-[#1F1F1F]' : 'text-[#8D8D8D] cursor-not-allowed'
                              }`}
                          />
                        </div>

                        {/* Profession - Creator Only */}
                        {userType === 'creator' && (
                          <>
                            <div className="flex flex-col gap-[4px]">
                              <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                                profession(optional)
                              </label>
                              <div className="relative">
                                <select
                                  name="profession"
                                  value={formData.profession}
                                  onChange={handleChange}
                                  disabled={!isEditMode}
                                  className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 focus:ring-[#F4008A] w-full appearance-none rounded-[2px] ${isEditMode ? 'text-[#1F1F1F] cursor-pointer' : 'text-[#8D8D8D] cursor-not-allowed'
                                    }`}
                                >
                                  <option value="">Select profession</option>
                                  <option value="3D Artist">3D Artist</option>
                                  <option value="Graphic Designer">Graphic Designer</option>
                                  <option value="Product Designer">Product Designer</option>
                                  <option value="Architect">Architect</option>
                                  <option value="Industrial Designer">Industrial Designer</option>
                                  <option value="Jewelry Designer">Jewelry Designer</option>
                                  <option value="Fashion Designer">Fashion Designer</option>
                                  <option value="Miniature Artist">Miniature Artist</option>
                                  <option value="Prop Maker">Prop Maker</option>
                                  <option value="Game Developer">Game Developer</option>
                                  <option value="Animator">Animator</option>
                                  <option value="Sculptor">Sculptor</option>
                                  <option value="Model Maker">Model Maker</option>
                                  <option value="Prototype Engineer">Prototype Engineer</option>
                                  <option value="Hobbyist">Hobbyist</option>
                                  <option value="Other">Other</option>
                                </select>
                                <svg
                                  className="absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                >
                                  <path
                                    d="M3 4.5L6 7.5L9 4.5"
                                    stroke={isEditMode ? "#1F1F1F" : "#8D8D8D"}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>

                            {/* Custom Profession Input (shown when "Other" is selected) */}
                            {formData.profession === 'Other' && (
                              <div className="flex flex-col gap-[4px]">
                                <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                                  Specify Profession
                                </label>
                                <input
                                  type="text"
                                  name="customProfession"
                                  value={formData.customProfession}
                                  onChange={handleChange}
                                  placeholder="Enter your profession"
                                  disabled={!isEditMode}
                                  className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] w-full rounded-[2px] ${isEditMode ? 'text-[#1F1F1F]' : 'text-[#8D8D8D] cursor-not-allowed'
                                    }`}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Social Details - Right Column */}
                    <div className="flex flex-col gap-[16px] w-[281px] shrink-0">
                      <h2 className="text-[16px] font-semibold leading-none text-black">
                        Social Details
                      </h2>
                      <div className="flex flex-col gap-[12px]">
                        {/* Instagram */}
                        <div className="flex flex-col gap-[4px]">
                          <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                            Instagram
                          </label>
                          <div className="bg-[#EFEFEF] flex items-center gap-[8px] px-[8px] py-[8px] rounded-[2px]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                              <rect x="2" y="2" width="20" height="20" rx="5" stroke="#8D8D8D" strokeWidth="1.5" />
                              <circle cx="12" cy="12" r="4" stroke="#8D8D8D" strokeWidth="1.5" />
                              <circle cx="18" cy="6" r="1" fill="#8D8D8D" />
                            </svg>
                            <input
                              type="text"
                              name="instagram"
                              value={formData.instagram}
                              onChange={handleChange}
                              placeholder="printwithmuri"
                              disabled={!isEditMode}
                              className={`bg-transparent text-[14px] font-medium tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none flex-1 min-w-0 ${isEditMode ? 'text-[#1F1F1F]' : 'text-[#8D8D8D] cursor-not-allowed'
                                }`}
                            />
                          </div>
                        </div>

                        {/* TikTok */}
                        <div className="flex flex-col gap-[4px]">
                          <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                            TikTok
                          </label>
                          <div className="bg-[#EFEFEF] flex items-center gap-[8px] px-[8px] py-[8px] rounded-[2px]">
                            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="shrink-0">
                              <path fill="#8D8D8D" d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z"/>
                            </svg>
                            <input
                              type="text"
                              name="tiktok"
                              value={formData.tiktok}
                              onChange={handleChange}
                              placeholder="printwithmuri"
                              disabled={!isEditMode}
                              className={`bg-transparent text-[14px] font-medium tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none flex-1 min-w-0 ${isEditMode ? 'text-[#1F1F1F]' : 'text-[#8D8D8D] cursor-not-allowed'
                                }`}
                            />
                          </div>
                        </div>

                        {/* LinkedIn */}
                        <div className="flex flex-col gap-[4px]">
                          <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                            LinkedIn
                          </label>
                          <div className="bg-[#EFEFEF] flex items-center gap-[8px] px-[8px] py-[8px] rounded-[2px]">
                            <svg width="20" height="20" viewBox="0 0 382 382" fill="none" className="shrink-0">
                              <path fill="#8D8D8D" d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889 C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056 H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806 c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1 s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73 c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079 c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426 c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472 L341.91,330.654L341.91,330.654z"/>
                            </svg>
                            <input
                              type="text"
                              name="linkedin"
                              value={formData.linkedin}
                              onChange={handleChange}
                              placeholder="printwithmuri"
                              disabled={!isEditMode}
                              className={`bg-transparent text-[14px] font-medium tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none flex-1 min-w-0 ${isEditMode ? 'text-[#1F1F1F]' : 'text-[#8D8D8D] cursor-not-allowed'
                                }`}
                            />
                          </div>
                        </div>

                        {/* Twitter/X */}
                        <div className="flex flex-col gap-[4px]">
                          <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                            X (Twitter)
                          </label>
                          <div className="bg-[#EFEFEF] flex items-center gap-[8px] px-[8px] py-[8px] rounded-[2px]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#8D8D8D" />
                            </svg>
                            <input
                              type="text"
                              name="twitter"
                              value={formData.twitter}
                              onChange={handleChange}
                              placeholder="printwithmuri"
                              disabled={!isEditMode}
                              className={`bg-transparent text-[14px] font-medium tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none flex-1 min-w-0 ${isEditMode ? 'text-[#1F1F1F]' : 'text-[#8D8D8D] cursor-not-allowed'
                                }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company Details - Third Column (Business Only) */}
                    {userType === 'business' && (
                      <div className="flex flex-col gap-[16px] w-[281px] shrink-0">
                        <h2 className="text-[16px] font-semibold leading-none text-black">
                          Company Details
                        </h2>
                        <div className="flex flex-col gap-[12px]">
                          {/* Company Name */}
                          <div className="flex flex-col gap-[4px]">
                            <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                              Company Name
                            </label>
                            <input
                              type="text"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                              placeholder="TheWildOnes Ltd."
                              disabled={!isEditMode}
                              className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] w-full rounded-[2px] ${isEditMode ? 'text-[#1F1F1F]' : 'text-[#8D8D8D] cursor-not-allowed'
                                }`}
                            />
                          </div>

                          {/* Tax ID */}
                          <div className="flex flex-col gap-[4px]">
                            <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                              Tax ID (TIN)
                            </label>
                            <input
                              type="text"
                              name="taxId"
                              value={formData.taxId}
                              onChange={handleChange}
                              placeholder="432836468"
                              disabled={!isEditMode}
                              className={`bg-[#EFEFEF] px-[8px] py-[8px] text-[14px] font-medium tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] w-full rounded-[2px] ${isEditMode ? 'text-[#1F1F1F]' : 'text-[#8D8D8D] cursor-not-allowed'
                                }`}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            ) : (
              /* Delivery Details Tab */
              <div className="flex flex-col gap-[48px]">
                <div className="flex flex-col gap-[48px]">
                  {/* Address List */}
                  <div className="flex flex-col gap-[48px]">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border-[0.5px] border-[#B7B7B7] rounded-[2px] p-[24px] flex flex-col gap-[48px]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-[8px]">
                            <div className="flex items-center gap-[4px]">
                              <h3 className="text-[24px] font-semibold leading-none text-black">
                                {address.city}, {address.state}
                              </h3>
                              {address.isDefault && (
                                <span className="text-[8px] font-light leading-none text-[#F4008A] bg-[#FFDAEF] px-[4px] py-[2px] rounded-[2px]">
                                  Default
                                </span>
                              )}
                            </div>
                            {/* Success Message for this address */}
                            {savedAddressId === address.id && (
                              <p className="text-[12px] text-green-600">
                                Address saved successfully!
                              </p>
                            )}
                          </div>
                          {/* Three-dot menu */}
                          <div className="relative" ref={openDropdownId === address.id ? dropdownRef : null}>
                            <button
                              type="button"
                              onClick={() => setOpenDropdownId(openDropdownId === address.id ? null : address.id)}
                              className="text-[#B7B7B7] hover:text-[#1F1F1F] transition-colors p-1 btn-bounce"
                              title="More options"
                            >
                              <svg width="20" height="4" viewBox="0 0 20 4" fill="currentColor">
                                <circle cx="2" cy="2" r="2" />
                                <circle cx="10" cy="2" r="2" />
                                <circle cx="18" cy="2" r="2" />
                              </svg>
                            </button>
                            {/* Dropdown Menu */}
                            {openDropdownId === address.id && (
                              <div className="absolute right-0 top-full mt-2 bg-white rounded-[2px] shadow-[0px_8px_86.4px_0px_rgba(0,0,0,0.15)] p-1 z-50 min-w-[148px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAddressId(editingAddressId === address.id ? null : address.id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-8 py-[8px] rounded-[2px] text-[14px] font-medium text-black text-center capitalize hover:bg-[#E6E6E6] transition-colors whitespace-nowrap btn-bounce"
                                >
                                  Edit address
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSetDefaultAddress(address.id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-8 py-[8px] rounded-[2px] text-[14px] font-medium text-black text-center capitalize hover:bg-[#E6E6E6] transition-colors mt-2 whitespace-nowrap btn-bounce"
                                >
                                  Make Default
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteAddress(address.id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-8 py-[8px] text-[14px] font-medium text-[#FF3333] text-center capitalize hover:bg-[#FFF5F5] transition-colors mt-2 whitespace-nowrap btn-bounce"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-[16px]">
                          {/* Street Address */}
                          <div className="flex flex-col gap-[4px]">
                            <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                              Street Address
                            </label>
                            <input
                              type="text"
                              value={address.street}
                              onChange={(e) => handleAddressChange(address.id, 'street', e.target.value)}
                              placeholder="27, Kogbagidi street,Iyana Oworo"
                              disabled={editingAddressId !== address.id}
                              className={`bg-[#EFEFEF] rounded-[2px] px-[8px] py-[8px] text-[14px] font-medium tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] w-full ${editingAddressId === address.id ? 'text-[#1F1F1F]' : 'text-[#8D8D8D] cursor-not-allowed'
                                }`}
                              autoComplete="street-address"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-[16px]">
                            {/* City */}
                            <div className="flex flex-col gap-[4px]">
                              <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                                City
                              </label>
                              <div className="relative">
                                <select
                                  value={address.city}
                                  onChange={(e) => handleAddressChange(address.id, 'city', e.target.value)}
                                  disabled={editingAddressId !== address.id || !address.state}
                                  className={`bg-[#EFEFEF] rounded-[2px] px-[8px] py-[8px] text-[14px] font-medium tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 focus:ring-[#F4008A] w-full appearance-none ${editingAddressId === address.id && address.state ? 'text-[#1F1F1F] cursor-pointer' : 'text-[#8D8D8D] cursor-not-allowed'
                                    }`}
                                  autoComplete="address-level2"
                                >
                                  <option value="">Select city</option>
                                  {address.state && nigerianCities[address.state]?.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                  ))}
                                </select>
                                <svg
                                  className="absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                >
                                  <path
                                    d="M3 4.5L6 7.5L9 4.5"
                                    stroke={editingAddressId === address.id && address.state ? "#1F1F1F" : "#8D8D8D"}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>

                            {/* State */}
                            <div className="flex flex-col gap-[4px]">
                              <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                                State
                              </label>
                              <div className="relative">
                                <select
                                  value={address.state}
                                  onChange={(e) => handleAddressChange(address.id, 'state', e.target.value)}
                                  disabled={editingAddressId !== address.id}
                                  className={`bg-[#EFEFEF] rounded-[2px] px-[8px] py-[8px] text-[14px] font-medium tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 focus:ring-[#F4008A] w-full appearance-none ${editingAddressId === address.id ? 'text-[#1F1F1F] cursor-pointer' : 'text-[#8D8D8D] cursor-not-allowed'
                                    }`}
                                  autoComplete="address-level1"
                                >
                                  <option value="">Select state</option>
                                  {nigerianStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                  ))}
                                </select>
                                <svg
                                  className="absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                >
                                  <path
                                    d="M3 4.5L6 7.5L9 4.5"
                                    stroke={editingAddressId === address.id ? "#1F1F1F" : "#8D8D8D"}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>

                            {/* Country */}
                            <div className="flex flex-col gap-[4px]">
                              <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                                Country
                              </label>
                              <div className="relative">
                                <select
                                  value={address.country}
                                  onChange={(e) => handleAddressChange(address.id, 'country', e.target.value)}
                                  disabled={editingAddressId !== address.id}
                                  className={`bg-[#EFEFEF] rounded-[2px] px-[8px] py-[4px] text-[14px] font-medium tracking-[-0.28px] leading-[1.8] focus:outline-none focus:ring-1 focus:ring-[#F4008A] w-full appearance-none ${editingAddressId === address.id ? 'text-[#1F1F1F] cursor-pointer' : 'text-[#8D8D8D] cursor-not-allowed'
                                    }`}
                                  autoComplete="country"
                                >
                                  <option value="Nigeria">Nigeria</option>
                                </select>
                                <svg
                                  className="absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                >
                                  <path
                                    d="M3 4.5L6 7.5L9 4.5"
                                    stroke={editingAddressId === address.id ? "#1F1F1F" : "#8D8D8D"}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>

                            {/* Postal Code */}
                            <div className="flex flex-col gap-[4px]">
                              <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
                                Postal Code
                              </label>
                              <input
                                type="text"
                                value={address.postalCode}
                                onChange={(e) => handleAddressChange(address.id, 'postalCode', e.target.value)}
                                placeholder="123132"
                                disabled={editingAddressId !== address.id}
                                className={`bg-[#EFEFEF] rounded-[2px] px-[8px] py-[4px] text-[14px] font-medium tracking-[-0.28px] leading-[1.8] placeholder:text-[#8D8D8D] focus:outline-none focus:ring-1 focus:ring-[#F4008A] w-full ${editingAddressId === address.id ? 'text-[#1F1F1F]' : 'text-[#8D8D8D] cursor-not-allowed'
                                  }`}
                                autoComplete="postal-code"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Save Address Button - Only shown when editing */}
                        {editingAddressId === address.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddressId(null);
                              setSavedAddressId(address.id);
                              setTimeout(() => setSavedAddressId(null), 3000);
                            }}
                            className="border border-black px-[24px] py-[8px] rounded-[2px] text-[#1F1F1F] text-[14px] font-medium tracking-[0.28px] leading-[1.37] uppercase transition-all hover:bg-gradient-to-b hover:from-[#464750] hover:to-black hover:text-white hover:border-transparent self-end btn-bounce"
                          >
                            Save address
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
