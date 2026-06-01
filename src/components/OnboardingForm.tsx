import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudUpload, X, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface OnboardingFormProps {
  onClose: () => void;
  isPreview?: boolean;
}

export default function OnboardingForm({ onClose, isPreview = false }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [stepTransitionTime, setStepTransitionTime] = useState<number>(Date.now());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setStepTransitionTime(Date.now());
  }, [step]);

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const [formData, setFormData] = useState({
    businessName: '',
    ownerFirstName: '',
    ownerLastName: '',
    personalEmail: '',
    personalNumber: '',
    businessEmail: '',
    businessNumber: '',
    businessDescription: '',
    whyChooseUs: '',
    specialSauce: '',
    servicesOffered: '',
    specialOffers: '',
    companyHistory: '',
    competitors: '',
    ownerVision: '',
    faq: '',
    websiteAddress: '',
    adminUsername: '',
    adminLoginCode: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const RequiredMarker = () => (
    <span style={{ color: '#ff4444', marginLeft: '4px', fontWeight: 'bold' }}>*</span>
  );

  const OptionalMarker = () => (
    <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.78rem', fontWeight: 'normal', marginLeft: '6px' }}>(Optional)</span>
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).map((file: any) => ({
        name: file.name,
        size: file.size
      }));
      setUploadedFiles(prev => {
        const next = [...prev, ...filesArray];
        if (errors.uploadedFiles) {
          setErrors(errs => {
            const updated = { ...errs };
            delete updated.uploadedFiles;
            return updated;
          });
        }
        return next;
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).map((file: any) => ({
        name: file.name,
        size: file.size
      }));
      setUploadedFiles(prev => {
        const next = [...prev, ...filesArray];
        if (errors.uploadedFiles) {
          setErrors(errs => {
            const updated = { ...errs };
            delete updated.uploadedFiles;
            return updated;
          });
        }
        return next;
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0 && !isPreview) {
        setErrors(errs => ({
          ...errs,
          uploadedFiles: 'Please upload at least one brand asset (logo, photos, or materials) to proceed.'
        }));
      }
      return next;
    });
  };

  const validateStep = (currentStep: number): boolean => {
    if (isPreview) return true;
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.ownerFirstName.trim()) newErrors.ownerFirstName = 'First name is required';
      if (!formData.ownerLastName.trim()) newErrors.ownerLastName = 'Last name is required';
      
      if (!formData.personalEmail.trim()) {
        newErrors.personalEmail = 'Personal email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.personalEmail)) {
        newErrors.personalEmail = 'Please enter a valid email address';
      }
      
      if (!formData.personalNumber.trim()) newErrors.personalNumber = 'Personal phone number is required';
      
      if (!formData.businessEmail.trim()) {
        newErrors.businessEmail = 'Business email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
        newErrors.businessEmail = 'Please enter a valid email address';
      }
      
      if (!formData.businessNumber.trim()) newErrors.businessNumber = 'Business phone number is required';
    }

    if (currentStep === 2) {
      if (!formData.businessDescription.trim()) newErrors.businessDescription = 'Description of your business is required';
      if (!formData.whyChooseUs.trim()) newErrors.whyChooseUs = 'Please state why someone should choose your business';
    }

    if (currentStep === 3) {
      if (!formData.specialSauce.trim()) newErrors.specialSauce = 'Your unique special sauce is required';
      if (!formData.servicesOffered.trim()) newErrors.servicesOffered = 'Services offered are required';
      if (!formData.specialOffers.trim()) newErrors.specialOffers = 'Special offers are required (state N/A if none)';
    }

    if (currentStep === 4) {
      if (uploadedFiles.length === 0) {
        newErrors.uploadedFiles = 'Please upload at least one brand asset (logo, photos, or materials) to proceed.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      nextStep();
    } else {
      const card = document.querySelector('.onboarding-card');
      if (card) {
        card.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="step1"
            className="form-step"
          >
            <h2 className="step-title">Your Details</h2>
            <p className="step-desc">Please allocate a good 10 to 20 minutes to complete this onboarding process.</p>
            
            {Object.keys(errors).length > 0 && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b6b', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>Please fill in all required fields indicated with * to continue.</span>
              </div>
            )}

            <div className="input-group">
              <label>Name of Your Business <RequiredMarker /></label>
              <input 
                type="text" 
                name="businessName" 
                value={formData.businessName} 
                onChange={handleChange} 
                placeholder="e.g. Voltz Digital" 
                style={{ borderColor: errors.businessName ? '#ff4444' : undefined }}
              />
              {errors.businessName && (
                <span style={{ color: '#ff4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <AlertCircle size={12} /> {errors.businessName}
                </span>
              )}
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>First Name <RequiredMarker /></label>
                <input 
                  type="text" 
                  name="ownerFirstName" 
                  value={formData.ownerFirstName} 
                  onChange={handleChange} 
                  placeholder="First Name" 
                  style={{ borderColor: errors.ownerFirstName ? '#ff4444' : undefined }}
                />
                {errors.ownerFirstName && (
                  <span style={{ color: '#ff4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <AlertCircle size={12} /> {errors.ownerFirstName}
                  </span>
                )}
              </div>
              <div className="input-group">
                <label>Last Name <RequiredMarker /></label>
                <input 
                  type="text" 
                  name="ownerLastName" 
                  value={formData.ownerLastName} 
                  onChange={handleChange} 
                  placeholder="Last Name" 
                  style={{ borderColor: errors.ownerLastName ? '#ff4444' : undefined }}
                />
                {errors.ownerLastName && (
                  <span style={{ color: '#ff4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <AlertCircle size={12} /> {errors.ownerLastName}
                  </span>
                )}
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Personal Email <RequiredMarker /></label>
                <input 
                  type="email" 
                  name="personalEmail" 
                  value={formData.personalEmail} 
                  onChange={handleChange} 
                  placeholder="example@example.com" 
                  style={{ borderColor: errors.personalEmail ? '#ff4444' : undefined }}
                />
                {errors.personalEmail && (
                  <span style={{ color: '#ff4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <AlertCircle size={12} /> {errors.personalEmail}
                  </span>
                )}
              </div>
              <div className="input-group">
                <label>Personal Number <RequiredMarker /></label>
                <input 
                  type="tel" 
                  name="personalNumber" 
                  value={formData.personalNumber} 
                  onChange={handleChange} 
                  placeholder="(000) 000-0000" 
                  style={{ borderColor: errors.personalNumber ? '#ff4444' : undefined }}
                />
                {errors.personalNumber && (
                  <span style={{ color: '#ff4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <AlertCircle size={12} /> {errors.personalNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Business Email - For Customers <RequiredMarker /></label>
                <input 
                  type="email" 
                  name="businessEmail" 
                  value={formData.businessEmail} 
                  onChange={handleChange} 
                  placeholder="contact@yourbusiness.com" 
                  style={{ borderColor: errors.businessEmail ? '#ff4444' : undefined }}
                />
                {errors.businessEmail && (
                  <span style={{ color: '#ff4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <AlertCircle size={12} /> {errors.businessEmail}
                  </span>
                )}
              </div>
              <div className="input-group">
                <label>Business Number - For Customers <RequiredMarker /></label>
                <input 
                  type="tel" 
                  name="businessNumber" 
                  value={formData.businessNumber} 
                  onChange={handleChange} 
                  placeholder="(000) 000-0000" 
                  style={{ borderColor: errors.businessNumber ? '#ff4444' : undefined }}
                />
                {errors.businessNumber && (
                  <span style={{ color: '#ff4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <AlertCircle size={12} /> {errors.businessNumber}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="step2"
            className="form-step"
          >
            <h2 className="step-title">Understanding Your Company</h2>
            
            {Object.keys(errors).length > 0 && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b6b', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>Please fill in all required fields indicated with * to continue.</span>
              </div>
            )}

            <div className="input-group">
              <label>Describe your business and history (as many sentences as you like) <RequiredMarker /></label>
              <textarea 
                name="businessDescription" 
                value={formData.businessDescription} 
                onChange={handleChange} 
                rows={5} 
                placeholder="Tell us about your company journey..." 
                style={{ borderColor: errors.businessDescription ? '#ff4444' : undefined }}
              />
              {errors.businessDescription ? (
                <span style={{ color: '#ff4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <AlertCircle size={12} /> {errors.businessDescription}
                </span>
              ) : (
                <p className="field-hint">This will help us gather background information and write a well-articulated "About Us" section.</p>
              )}
            </div>

            <div className="input-group">
              <label>Why should someone choose you? <RequiredMarker /></label>
              <textarea 
                name="whyChooseUs" 
                value={formData.whyChooseUs} 
                onChange={handleChange} 
                rows={4} 
                placeholder="Price / Quality / Care / Local / Honest / Reviews / Guarantees..." 
                style={{ borderColor: errors.whyChooseUs ? '#ff4444' : undefined }}
              />
              {errors.whyChooseUs ? (
                <span style={{ color: '#ff4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <AlertCircle size={12} /> {errors.whyChooseUs}
                </span>
              ) : (
                <p className="field-hint">The more details you can recall, the better. Consider accreditations, certifications, and industry ratings.</p>
              )}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="step3"
            className="form-step"
          >
            <h2 className="step-title">Brand & Offerings</h2>

            {Object.keys(errors).length > 0 && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b6b', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>Please fill in all required fields indicated with * to continue.</span>
              </div>
            )}

            <div className="input-group">
              <label>Your brand's special sauce. What makes you unique? <RequiredMarker /></label>
              <textarea 
                name="specialSauce" 
                value={formData.specialSauce} 
                onChange={handleChange} 
                rows={4} 
                placeholder="This could be anything. WHY are you different?" 
                style={{ borderColor: errors.specialSauce ? '#ff4444' : undefined }}
              />
              {errors.specialSauce && (
                <span style={{ color: '#ff4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <AlertCircle size={12} /> {errors.specialSauce}
                </span>
              )}
            </div>

            <div className="input-group">
              <label>What services do you offer? <RequiredMarker /></label>
              <textarea 
                name="servicesOffered" 
                value={formData.servicesOffered} 
                onChange={handleChange} 
                rows={4} 
                placeholder="Give a few examples here..." 
                style={{ borderColor: errors.servicesOffered ? '#ff4444' : undefined }}
              />
              {errors.servicesOffered && (
                <span style={{ color: '#ff4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <AlertCircle size={12} /> {errors.servicesOffered}
                </span>
              )}
            </div>

            <div className="input-group">
              <label>Special Offers (Discounts, Credit/Finance Options?) <RequiredMarker /></label>
              <textarea 
                name="specialOffers" 
                value={formData.specialOffers} 
                onChange={handleChange} 
                rows={4} 
                placeholder="e.g. Financing as low as $97 p/m with Hearth. Any offers (type N/A if none)." 
                style={{ borderColor: errors.specialOffers ? '#ff4444' : undefined }}
              />
              {errors.specialOffers && (
                <span style={{ color: '#ff4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <AlertCircle size={12} /> {errors.specialOffers}
                </span>
              )}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="step4"
            className="form-step"
          >
            <h2 className="step-title">Deep Dive & Brand Assets</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '24px' }}>
              The text fields below are optional, but uploading at least one brand asset is required.
            </p>
            
            {errors.uploadedFiles && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b6b', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{errors.uploadedFiles}</span>
              </div>
            )}

            <div className="input-group">
              <label>2 or 3 sentences on the history of the company (dates, etc) <OptionalMarker /></label>
              <textarea name="companyHistory" value={formData.companyHistory} onChange={handleChange} rows={3} placeholder="Brief history..." />
            </div>

            <div className="input-group">
              <label>Key Competitors (Please list a few) <OptionalMarker /></label>
              <textarea name="competitors" value={formData.competitors} onChange={handleChange} rows={3} placeholder="List out any of your closest competitors..." />
            </div>

            <div className="input-group">
              <label>Owners / Partners & Their Vision <OptionalMarker /></label>
              <textarea name="ownerVision" value={formData.ownerVision} onChange={handleChange} rows={4} placeholder="Name the owners with a small write up from each, their vision..." />
            </div>

            <div className="input-group">
              <label>Do you have frequently asked questions and answers? <OptionalMarker /></label>
              <textarea name="faq" value={formData.faq} onChange={handleChange} rows={4} placeholder="List FAQs..." />
            </div>

            <div className="input-group">
              <label>Upload Brand Assets (Logo, Team Photos, Banner Images) <RequiredMarker /></label>
              <div 
                className="upload-box"
                style={{
                  border: isDragging ? '2px dashed var(--primary)' : '2px dashed rgba(255, 255, 255, 0.1)',
                  background: isDragging ? 'rgba(0, 212, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: errors.uploadedFiles ? 'rgba(255, 68, 68, 0.4)' : undefined,
                  cursor: 'pointer',
                  padding: '36px 20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  transition: 'all 0.3s'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <CloudUpload size={32} strokeWidth={1.5} style={{ color: 'var(--primary)', marginBottom: '12px', display: 'inline-block' }} />
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                  Drag and drop files here or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Browse Files</span>
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  multiple 
                  onChange={handleFileChange}
                  className="hidden-file-input" 
                  style={{ display: 'none' }}
                />
              </div>
              <p className="field-hint">High-resolution pictures, branded materials, and half-body team photos work best.</p>
              
              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Selected Files ({uploadedFiles.length})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {uploadedFiles.map((file, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <Check size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.88rem', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {file.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate final step before allowing submission
    if (!validateStep(step)) {
      const card = document.querySelector('.onboarding-card');
      if (card) {
        card.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // Prevent accidental double clicks from carrying over between Step 3 Next and Step 4 Submit
    if (Date.now() - stepTransitionTime < 600) {
      return;
    }
    setIsSubmitting(true);
    if (isPreview) {
      setTimeout(() => {
        setIsSubmitted(true);
        setIsSubmitting(false);
      }, 800);
      return;
    }
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert('There was a slight issue submitting your onboarding details. Please try again or download a copy of your info.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('A network issue occurred. Your onboarding data has been saved to your browser session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-overlay" onClick={onClose} />
      <motion.div 
        className="onboarding-card"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ minHeight: isSubmitted ? 'auto' : undefined }}
      >
        <button className="onboarding-close" onClick={onClose}>
          <X size={20} />
        </button>

        {isPreview && (
          <div style={{
            background: 'rgba(0, 212, 255, 0.08)',
            border: '1px solid rgba(0, 212, 255, 0.25)',
            borderRadius: '10px',
            padding: '10px 16px',
            marginTop: '20px',
            marginBottom: '4px',
            fontSize: '0.8rem',
            color: '#00D4FF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span><strong>Preview Mode</strong>: Testing the onboarding form flow. No real data will be submitted.</span>
          </div>
        )}

        {isSubmitted ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
              <Check size={32} style={{ color: 'var(--primary)' }} />
            </div>
            
            <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              Onboarding Received!
            </h2>
            
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0, maxWidth: '500px' }}>
              Thank you, <strong>{formData.ownerFirstName || 'there'}</strong>! Your briefing for <strong>{formData.businessName || 'your company'}</strong> has been securely logged into our project system.
            </p>

            <div style={{ width: '100%', maxWidth: '500px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px', textAlign: 'left', marginTop: '12px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What happens next?</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: 0, paddingLeft: '16px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', listStyleType: 'disc' }}>
                <li>Your assigned development lead will review your materials and assets within 24 hours.</li>
                <li>We will establish your design workspace and send introductory access details.</li>
                <li>If you haven't proceeded with checkout yet, you can complete payment via the portal below.</li>
              </ul>
            </div>

            <button 
              onClick={onClose} 
              className="btn-primary-action"
              style={{ marginTop: '16px', padding: '12px 40px', fontSize: '1rem', width: '100%', maxWidth: '300px' }}
            >
              Back to Home
            </button>
          </motion.div>
        ) : (
          <>
            <div className="onboarding-header">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
              </div>
              <span className="step-counter">Step {step} of {totalSteps}</span>
            </div>

            <form onSubmit={step === totalSteps ? handleSubmit : (e) => e.preventDefault()} className="onboarding-form">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>

              {step === totalSteps ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isSubmitting}
                    style={{ 
                      width: '100%', 
                      justifyContent: 'center', 
                      padding: '16px 24px', 
                      fontSize: '1.05rem', 
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, var(--primary) 0%, #0099ff 100%)',
                      boxShadow: '0 8px 24px rgba(0, 212, 255, 0.2)',
                      letterSpacing: '0.02em',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{isSubmitting ? 'Sending Onboarding Dossier...' : 'Submit Onboarding & Initialize Project'}</span>
                    <Check size={18} style={{ marginLeft: '8px' }} />
                  </button>
                  {step > 1 && (
                    <button 
                      type="button" 
                      onClick={prevStep} 
                      disabled={isSubmitting}
                      style={{ 
                        border: 'none', 
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.5)', 
                        padding: '8px', 
                        fontSize: '0.9rem',
                        alignSelf: 'center',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                    >
                      Go Back to Previous Step
                    </button>
                  )}
                </div>
              ) : (
                <div className="onboarding-footer">
                  {step > 1 && (
                    <button type="button" className="btn-secondary" onClick={prevStep} disabled={isSubmitting}>
                      Back
                    </button>
                  )}
                  <div className="spacer" />
                  <button type="button" className="btn-primary" onClick={handleNext}>
                    Next <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
