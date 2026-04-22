import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudUpload, X, ArrowRight, Check } from 'lucide-react';

interface OnboardingFormProps {
  onClose: () => void;
}

export default function OnboardingForm({ onClose }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            
            <div className="input-group">
              <label>Name of Your Business</label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="e.g. Voltz Digital" />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>First Name</label>
                <input type="text" name="ownerFirstName" value={formData.ownerFirstName} onChange={handleChange} placeholder="First Name" />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input type="text" name="ownerLastName" value={formData.ownerLastName} onChange={handleChange} placeholder="Last Name" />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Personal Email</label>
                <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} placeholder="example@example.com" />
              </div>
              <div className="input-group">
                <label>Personal Number</label>
                <input type="tel" name="personalNumber" value={formData.personalNumber} onChange={handleChange} placeholder="(000) 000-0000" />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Business Email - For Customers</label>
                <input type="email" name="businessEmail" value={formData.businessEmail} onChange={handleChange} placeholder="contact@yourbusiness.com" />
              </div>
              <div className="input-group">
                <label>Business Number - For Customers</label>
                <input type="tel" name="businessNumber" value={formData.businessNumber} onChange={handleChange} placeholder="(000) 000-0000" />
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
            
            <div className="input-group">
              <label>Describe your business and history (as many sentences as you like)</label>
              <textarea name="businessDescription" value={formData.businessDescription} onChange={handleChange} rows={5} placeholder="Tell us about your company journey..." />
              <p className="field-hint">This will help us with background information and write a well articulated about section.</p>
            </div>

            <div className="input-group">
              <label>Why should someone choose you?</label>
              <textarea name="whyChooseUs" value={formData.whyChooseUs} onChange={handleChange} rows={4} placeholder="Price / Quality / Care / Local / Honest / Reviews / Guarantees..." />
              <p className="field-hint">The more things you can think of the better. Think about accreditations, ratings, etc.</p>
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

            <div className="input-group">
              <label>Your brand's special sauce. What makes you unique?</label>
              <textarea name="specialSauce" value={formData.specialSauce} onChange={handleChange} rows={4} placeholder="This could be anything. WHY are you different?" />
            </div>

            <div className="input-group">
              <label>What services do you offer?</label>
              <textarea name="servicesOffered" value={formData.servicesOffered} onChange={handleChange} rows={4} placeholder="Give a few examples here..." />
            </div>

            <div className="input-group">
              <label>Special Offers (Discounts, Credit/Finance Options?)</label>
              <textarea name="specialOffers" value={formData.specialOffers} onChange={handleChange} rows={4} placeholder="e.g. Financing as low as $97 p/m with Hearth. Any offers." />
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
            <h2 className="step-title">Deep Dive</h2>

            <div className="input-group">
              <label>2 or 3 sentences on the history of the company (dates, etc)</label>
              <textarea name="companyHistory" value={formData.companyHistory} onChange={handleChange} rows={3} placeholder="Brief history..." />
            </div>

            <div className="input-group">
              <label>Key Competitors (Please list a few)</label>
              <textarea name="competitors" value={formData.competitors} onChange={handleChange} rows={3} placeholder="List out any of your closest competitors..." />
            </div>

            <div className="input-group">
              <label>Owners / Partners & Their Vision</label>
              <textarea name="ownerVision" value={formData.ownerVision} onChange={handleChange} rows={4} placeholder="Name the owners with a small write up from each, their vision..." />
            </div>

            <div className="input-group">
              <label>Do you have frequently asked questions and answers?</label>
              <textarea name="faq" value={formData.faq} onChange={handleChange} rows={4} placeholder="List FAQs..." />
            </div>

            <div className="input-group">
              <label>Upload Assets (Logo, Team Photos, Banner Images)</label>
              <div className="upload-box">
                <CloudUpload size={32} strokeWidth={1.5} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                <p>Drag and drop or <span>Browse Files</span></p>
                <input type="file" multiple className="hidden-file-input" />
              </div>
              <p className="field-hint">Nice clear pictures, branded material, half body images of team work best.</p>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="step5"
            className="form-step"
          >
            <h2 className="step-title">Account Access & Handover</h2>

            <div className="input-group">
              <label>Existing Website Address (if any)</label>
              <input type="text" name="websiteAddress" value={formData.websiteAddress} onChange={handleChange} placeholder="e.g. greatcompany.com" />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Website Admin Username</label>
                <input type="text" name="adminUsername" value={formData.adminUsername} onChange={handleChange} placeholder="Username" />
              </div>
              <div className="input-group">
                <label>Login Code / Password</label>
                <input type="text" name="adminLoginCode" value={formData.adminLoginCode} onChange={handleChange} placeholder="Login Code" />
              </div>
            </div>

            <div className="input-group">
              <label>Additional Login Info or Notes (e.g. Hosting Provider)</label>
              <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} rows={4} placeholder="Anything else we need to know..." />
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you! Your onboarding information has been submitted. We will review it and get back to you shortly.');
    onClose();
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-overlay" onClick={onClose} />
      <motion.div 
        className="onboarding-card"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <button className="onboarding-close" onClick={onClose}>
          <X size={20} />
        </button>

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

          <div className="onboarding-footer">
            {step > 1 && (
              <button type="button" className="btn-secondary" onClick={prevStep}>
                Back
              </button>
            )}
            <div className="spacer" />
            {step < totalSteps ? (
              <button type="button" className="btn-primary" onClick={nextStep}>
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button type="submit" className="btn-primary">
                Submit <Check size={18} />
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
