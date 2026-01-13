'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Car, User, Phone, MapPin, AlertCircle, FileText, CreditCard, IdCard } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

const VILLAGES = [
  'Vaniyambadi',
  'Alangayam',
  'Jolarpet',
  'Tirupathur',
  'Ambur',
  'Natrampalli',
  'Odugathur',
  'Pallalakuppam',
  'Vellakuttai',
  'Pernambut',
  'Yelagiri',
];

const VEHICLE_TYPES = [
  { id: 'bike', name: 'Bike', icon: '🏍️' },
  { id: 'auto', name: 'Auto', icon: '🛺' },
];

export default function PartnerRegisterPage() {
  const router = useRouter();

  // Form state
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Personal details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [village, setVillage] = useState('Vaniyambadi');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Vehicle details
  const [vehicleType, setVehicleType] = useState('bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');

  // Document numbers
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [rcNumber, setRcNumber] = useState('');

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setPhone(cleaned);
    }
  };

  const handleEmergencyContactChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setEmergencyContact(cleaned);
    }
  };

  const handleAadharChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 12) {
      setAadharNumber(cleaned);
    }
  };

  const validateStep1 = () => {
    if (!name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!address.trim()) {
      setError('Please enter your address');
      return false;
    }
    if (!emergencyContact || emergencyContact.length !== 10) {
      setError('Please enter a valid emergency contact number');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!vehicleNumber.trim()) {
      setError('Please enter your vehicle registration number');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!aadharNumber || aadharNumber.length !== 12) {
      setError('Please enter a valid 12-digit Aadhar number');
      return false;
    }
    if (!licenseNumber.trim()) {
      setError('Please enter your Driving License number');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      // Check if partner already exists
      const existingPartner = await getDoc(doc(db, 'partners', `partner_${phone}`));
      if (existingPartner.exists()) {
        setError('A registration with this phone number already exists.');
        setIsLoading(false);
        return;
      }

      // Create partner document
      const partnerData = {
        id: `partner_${phone}`,
        name: name.trim(),
        phone: `+91${phone}`,
        email: email.trim() || null,
        village,
        address: address.trim(),
        emergencyContact: `+91${emergencyContact}`,
        vehicleType,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleModel: vehicleModel.trim() || null,
        documents: {
          aadharNumber: aadharNumber,
          panNumber: panNumber.trim().toUpperCase() || null,
          licenseNumber: licenseNumber.trim().toUpperCase(),
          rcNumber: rcNumber.trim().toUpperCase() || vehicleNumber.trim().toUpperCase(),
        },
        status: 'pending',
        isActive: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, 'partners', `partner_${phone}`), partnerData);

      setSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#dcfce7',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <Check style={{ width: '40px', height: '40px', color: '#16a34a' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>Registration Submitted!</h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>
            Thank you for registering as a partner. Our team will verify your details and contact you within 24-48 hours.
          </p>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '14px 32px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px' }}>
      {/* Header */}
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Partner Registration</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Step {step} of 3</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: s <= step ? '#059669' : '#e2e8f0'
              }}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626', flexShrink: 0 }} />
            <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User style={{ width: '22px', height: '22px', color: '#2563eb' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Personal Details</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Enter your basic information</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Phone Number *
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                      width: '60px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#475569',
                      flexShrink: 0
                    }}>
                      +91
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      style={{
                        flex: 1,
                        height: '48px',
                        padding: '0 16px',
                        fontSize: '14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        color: '#1e293b',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Village */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Village/Town *
                  </label>
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    {VILLAGES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Full Address *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your complete address"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Emergency Contact *
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                      width: '60px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#475569',
                      flexShrink: 0
                    }}>
                      +91
                    </div>
                    <input
                      type="tel"
                      value={emergencyContact}
                      onChange={(e) => handleEmergencyContactChange(e.target.value)}
                      placeholder="Emergency contact number"
                      maxLength={10}
                      style={{
                        flex: 1,
                        height: '48px',
                        padding: '0 16px',
                        fontSize: '14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        color: '#1e293b',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Vehicle Details */}
          {step === 2 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Car style={{ width: '22px', height: '22px', color: '#f97316' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Vehicle Details</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Enter your vehicle information</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Vehicle Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
                    Vehicle Type *
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {VEHICLE_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setVehicleType(type.id)}
                        style={{
                          flex: 1,
                          padding: '16px',
                          backgroundColor: vehicleType === type.id ? '#f0fdf4' : '#f8fafc',
                          border: vehicleType === type.id ? '2px solid #059669' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>{type.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: vehicleType === type.id ? '600' : '500', color: '#1e293b' }}>{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicle Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="TN23AB1234"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>

                {/* Vehicle Model */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Vehicle Model (Optional)
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g., Honda Activa, Bajaj Auto"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Document Numbers */}
          {step === 3 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText style={{ width: '22px', height: '22px', color: '#16a34a' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Document Details</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Enter your document numbers for verification</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Aadhar Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IdCard style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      Aadhar Number *
                    </div>
                  </label>
                  <input
                    type="text"
                    value={aadharNumber}
                    onChange={(e) => handleAadharChange(e.target.value)}
                    placeholder="Enter 12-digit Aadhar number"
                    maxLength={12}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box',
                      letterSpacing: '2px'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0' }}>
                    {aadharNumber.length}/12 digits
                  </p>
                </div>

                {/* PAN Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CreditCard style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      PAN Number (Optional)
                    </div>
                  </label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>

                {/* Driving License */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Car style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      Driving License Number *
                    </div>
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                    placeholder="TN01 2020 0001234"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>

                {/* Vehicle RC */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      Vehicle RC Number (Optional)
                    </div>
                  </label>
                  <input
                    type="text"
                    value={rcNumber}
                    onChange={(e) => setRcNumber(e.target.value.toUpperCase())}
                    placeholder="Same as vehicle number if not different"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>

                {/* Info Box */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '16px'
                }}>
                  <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>
                    <strong>Note:</strong> Our team will verify these details. You may be asked to show original documents during verification.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div style={{ marginTop: '24px' }}>
            {step < 3 ? (
              <button
                onClick={handleNext}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? 'Submitting...' : (
                  <>
                    <Check style={{ width: '18px', height: '18px' }} />
                    Submit Registration
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '24px' }}>
          By registering, you agree to our terms and conditions
        </p>
      </div>
    </div>
  );
}
