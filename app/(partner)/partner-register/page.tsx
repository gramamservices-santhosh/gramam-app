'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Camera, Check, FileText, Car, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

interface DocumentUpload {
  file: File | null;
  preview: string;
  uploading: boolean;
  url: string;
}

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

  // Document uploads
  const [aadharFront, setAadharFront] = useState<DocumentUpload>({ file: null, preview: '', uploading: false, url: '' });
  const [aadharBack, setAadharBack] = useState<DocumentUpload>({ file: null, preview: '', uploading: false, url: '' });
  const [panCard, setPanCard] = useState<DocumentUpload>({ file: null, preview: '', uploading: false, url: '' });
  const [drivingLicense, setDrivingLicense] = useState<DocumentUpload>({ file: null, preview: '', uploading: false, url: '' });
  const [vehicleRC, setVehicleRC] = useState<DocumentUpload>({ file: null, preview: '', uploading: false, url: '' });
  const [selfiePhoto, setSelfiePhoto] = useState<DocumentUpload>({ file: null, preview: '', uploading: false, url: '' });
  const [vehiclePhoto, setVehiclePhoto] = useState<DocumentUpload>({ file: null, preview: '', uploading: false, url: '' });

  // File input refs
  const aadharFrontRef = useRef<HTMLInputElement>(null);
  const aadharBackRef = useRef<HTMLInputElement>(null);
  const panCardRef = useRef<HTMLInputElement>(null);
  const drivingLicenseRef = useRef<HTMLInputElement>(null);
  const vehicleRCRef = useRef<HTMLInputElement>(null);
  const selfiePhotoRef = useRef<HTMLInputElement>(null);
  const vehiclePhotoRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<DocumentUpload>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setter({ file, preview, uploading: false, url: '' });
  };

  const uploadDocument = async (doc: DocumentUpload, folder: string): Promise<string> => {
    if (!doc.file) return '';

    const timestamp = Date.now();
    const fileName = `partners/${phone}/${folder}/${timestamp}_${doc.file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, doc.file);
    const url = await getDownloadURL(storageRef);
    return url;
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
    if (!aadharFront.file) {
      setError('Please upload Aadhar card front');
      return false;
    }
    if (!aadharBack.file) {
      setError('Please upload Aadhar card back');
      return false;
    }
    if (!drivingLicense.file) {
      setError('Please upload Driving License');
      return false;
    }
    if (!selfiePhoto.file) {
      setError('Please upload a selfie photo');
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

      // Upload all documents
      const [
        aadharFrontUrl,
        aadharBackUrl,
        panCardUrl,
        drivingLicenseUrl,
        vehicleRCUrl,
        selfieUrl,
        vehiclePhotoUrl,
      ] = await Promise.all([
        uploadDocument(aadharFront, 'aadhar'),
        uploadDocument(aadharBack, 'aadhar'),
        uploadDocument(panCard, 'pan'),
        uploadDocument(drivingLicense, 'license'),
        uploadDocument(vehicleRC, 'vehicle'),
        uploadDocument(selfiePhoto, 'selfie'),
        uploadDocument(vehiclePhoto, 'vehicle'),
      ]);

      // Create partner document
      const partnerId = `partner_${phone}`;
      const now = Timestamp.now();

      const partnerData: Record<string, any> = {
        id: partnerId,
        name: name.trim(),
        phone: `+91${phone}`,
        village: village,
        address: address.trim(),
        emergencyContact: `+91${emergencyContact}`,
        vehicleType: vehicleType,
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        status: 'pending', // pending, approved, rejected
        isActive: false,
        documents: {
          aadharFront: aadharFrontUrl,
          aadharBack: aadharBackUrl,
          drivingLicense: drivingLicenseUrl,
          selfie: selfieUrl,
        },
        createdAt: now,
        updatedAt: now,
      };

      // Add optional fields only if they exist
      if (email.trim()) partnerData.email = email.trim();
      if (vehicleModel.trim()) partnerData.vehicleModel = vehicleModel.trim();
      if (panCardUrl) partnerData.documents.panCard = panCardUrl;
      if (vehicleRCUrl) partnerData.documents.vehicleRC = vehicleRCUrl;
      if (vehiclePhotoUrl) partnerData.documents.vehiclePhoto = vehiclePhotoUrl;

      await setDoc(doc(db, 'partners', partnerId), partnerData);

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
        <div style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#d1fae5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Check style={{ width: '40px', height: '40px', color: '#059669' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>Registration Submitted!</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            Thank you for registering as a partner. Our team will review your documents and contact you within 24-48 hours.
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '14px 32px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Partner Registration</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Step {step} of 3</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
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
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ maxWidth: '600px', margin: '16px auto 0', padding: '0 16px' }}>
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px', paddingBottom: '120px' }}>
        {/* Step 1: Personal Details */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#ecfdf5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User style={{ width: '20px', height: '20px', color: '#059669' }} />
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Personal Information</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Name */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#1e293b',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Phone Number *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
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
                      color: '#64748b'
                    }}>
                      +91
                    </div>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      maxLength={10}
                      inputMode="numeric"
                      style={{
                        flex: 1,
                        padding: '14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '15px',
                        color: '#1e293b',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Email <span style={{ color: '#94a3b8' }}>(Optional)</span></label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#1e293b',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Village */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Village / Town *</label>
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#1e293b',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    {VILLAGES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Full Address *</label>
                  <textarea
                    placeholder="House no., Street, Landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#1e293b',
                      resize: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Emergency Contact *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
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
                      color: '#64748b'
                    }}>
                      +91
                    </div>
                    <input
                      type="tel"
                      placeholder="Family member contact"
                      value={emergencyContact}
                      onChange={(e) => handleEmergencyContactChange(e.target.value)}
                      maxLength={10}
                      inputMode="numeric"
                      style={{
                        flex: 1,
                        padding: '14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '15px',
                        color: '#1e293b',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle Details */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#ecfdf5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Car style={{ width: '20px', height: '20px', color: '#059669' }} />
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Vehicle Information</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Vehicle Type */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '10px' }}>Vehicle Type *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {VEHICLE_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setVehicleType(type.id)}
                        style={{
                          padding: '16px',
                          border: vehicleType === type.id ? '2px solid #059669' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          backgroundColor: vehicleType === type.id ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>{type.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicle Number */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Registration Number *</label>
                  <input
                    type="text"
                    placeholder="TN 23 AB 1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#1e293b',
                      textTransform: 'uppercase',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Vehicle Model */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Vehicle Model <span style={{ color: '#94a3b8' }}>(Optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Honda Activa, Bajaj RE"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#1e293b',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Documents Section */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#ecfdf5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText style={{ width: '20px', height: '20px', color: '#059669' }} />
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Identity Documents</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Aadhar Front */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Aadhar Card (Front) *</label>
                  <input
                    ref={aadharFrontRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, setAadharFront)}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => aadharFrontRef.current?.click()}
                    style={{
                      height: '100px',
                      border: aadharFront.file ? '2px solid #059669' : '2px dashed #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: aadharFront.file ? '#ecfdf5' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    {aadharFront.preview ? (
                      <img src={aadharFront.preview} alt="Aadhar Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <Upload style={{ width: '24px', height: '24px', color: '#94a3b8', margin: '0 auto 4px' }} />
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Upload</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aadhar Back */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Aadhar Card (Back) *</label>
                  <input
                    ref={aadharBackRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, setAadharBack)}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => aadharBackRef.current?.click()}
                    style={{
                      height: '100px',
                      border: aadharBack.file ? '2px solid #059669' : '2px dashed #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: aadharBack.file ? '#ecfdf5' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    {aadharBack.preview ? (
                      <img src={aadharBack.preview} alt="Aadhar Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <Upload style={{ width: '24px', height: '24px', color: '#94a3b8', margin: '0 auto 4px' }} />
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Upload</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* PAN Card */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>PAN Card <span style={{ color: '#94a3b8' }}>(Optional)</span></label>
                  <input
                    ref={panCardRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, setPanCard)}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => panCardRef.current?.click()}
                    style={{
                      height: '100px',
                      border: panCard.file ? '2px solid #059669' : '2px dashed #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: panCard.file ? '#ecfdf5' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    {panCard.preview ? (
                      <img src={panCard.preview} alt="PAN Card" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <Upload style={{ width: '24px', height: '24px', color: '#94a3b8', margin: '0 auto 4px' }} />
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Upload</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Driving License */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Driving License *</label>
                  <input
                    ref={drivingLicenseRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, setDrivingLicense)}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => drivingLicenseRef.current?.click()}
                    style={{
                      height: '100px',
                      border: drivingLicense.file ? '2px solid #059669' : '2px dashed #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: drivingLicense.file ? '#ecfdf5' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    {drivingLicense.preview ? (
                      <img src={drivingLicense.preview} alt="Driving License" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <Upload style={{ width: '24px', height: '24px', color: '#94a3b8', margin: '0 auto 4px' }} />
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Upload</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Documents */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Vehicle Documents</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Vehicle RC */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Vehicle RC <span style={{ color: '#94a3b8' }}>(Optional)</span></label>
                  <input
                    ref={vehicleRCRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, setVehicleRC)}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => vehicleRCRef.current?.click()}
                    style={{
                      height: '100px',
                      border: vehicleRC.file ? '2px solid #059669' : '2px dashed #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: vehicleRC.file ? '#ecfdf5' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    {vehicleRC.preview ? (
                      <img src={vehicleRC.preview} alt="Vehicle RC" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <Upload style={{ width: '24px', height: '24px', color: '#94a3b8', margin: '0 auto 4px' }} />
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Upload</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Photo */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Vehicle Photo <span style={{ color: '#94a3b8' }}>(Optional)</span></label>
                  <input
                    ref={vehiclePhotoRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, setVehiclePhoto)}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => vehiclePhotoRef.current?.click()}
                    style={{
                      height: '100px',
                      border: vehiclePhoto.file ? '2px solid #059669' : '2px dashed #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: vehiclePhoto.file ? '#ecfdf5' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    {vehiclePhoto.preview ? (
                      <img src={vehiclePhoto.preview} alt="Vehicle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <Upload style={{ width: '24px', height: '24px', color: '#94a3b8', margin: '0 auto 4px' }} />
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Upload</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Selfie Photo */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px' }}>Your Photo *</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>Upload a clear photo of yourself for verification</p>

              <input
                ref={selfiePhotoRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => handleFileSelect(e, setSelfiePhoto)}
                style={{ display: 'none' }}
              />
              <div
                onClick={() => selfiePhotoRef.current?.click()}
                style={{
                  height: '160px',
                  border: selfiePhoto.file ? '2px solid #059669' : '2px dashed #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: selfiePhoto.file ? '#ecfdf5' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                {selfiePhoto.preview ? (
                  <img src={selfiePhoto.preview} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <Camera style={{ width: '40px', height: '40px', color: '#94a3b8', margin: '0 auto 8px' }} />
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Take or upload photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
                By submitting, you confirm that all information provided is accurate. False information may lead to rejection of your application.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {step < 3 ? (
            <button
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
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
                padding: '16px',
                backgroundColor: isLoading ? '#94a3b8' : '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Submitting...' : 'Submit Registration'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
