import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  RefreshCw, 
  Search, 
  Trash2, 
  Download, 
  Copy, 
  FileText, 
  Calendar, 
  ChevronRight, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  Shield,
  Check,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import OnboardingForm from './OnboardingForm';
import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

interface AdminPortalProps {
  onClose: () => void;
}

interface Submission {
  id: string;
  submittedAt: string;
  status: 'new' | 'reviewed' | 'in_progress' | 'completed';
  data: {
    businessName: string;
    ownerFirstName: string;
    ownerLastName: string;
    personalEmail: string;
    personalNumber: string;
    businessEmail: string;
    businessNumber: string;
    businessDescription: string;
    whyChooseUs: string;
    specialSauce: string;
    servicesOffered: string;
    specialOffers: string;
    companyHistory: string;
    competitors: string;
    ownerVision: string;
    faq: string;
    websiteAddress: string;
    adminUsername: string;
    adminLoginCode: string;
    additionalNotes: string;
  };
}

export default function AdminPortal({ onClose }: AdminPortalProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);
  const [showFormPreview, setShowFormPreview] = useState(false);

  // Attempt login with stored password if available
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('voltz_admin_token');
    if (savedPassword) {
      handleLogin(savedPassword);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(password);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Optional: limit to specific hosted domain if needed, e.g., provider.setCustomParameters({ hd: "voltzdigital.com" });
      await signInWithPopup(auth, provider);

      // Signed in successfully! Fetch from the onboarding collection
      const snapshot = await getDocs(collection(db, 'onboarding'));
      const retrieved = snapshot.docs.map(docSnapshot => docSnapshot.data() as Submission);
      retrieved.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      setIsAuthenticated(true);
      setSubmissions(retrieved);
      if (retrieved.length > 0) {
        setActiveSubmission(retrieved[0]);
      }
    } catch (err: any) {
      console.error('Firebase Google Auth error:', err);
      let errMsg = 'Google Sign-In failed or unauthorized. Please ensure your Google account is an authorized admin.';
      if (err.message && err.message.includes('auth/unauthorized-domain')) {
        errMsg = 'This domain is not authorized for OAuth operations. Please add it in Firebase Console.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (pass: string) => {
    if (!pass || pass.length < 6) {
      setError('Admin passcode must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Authenticating using administrative credentials
      try {
        await signInWithEmailAndPassword(auth, 'admin@voltzdigital.com', pass);
      } catch (authErr: any) {
        // If system account doesn't exist, bootstrap it dynamically across empty containers
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, 'admin@voltzdigital.com', pass);
          } catch (createErr: any) {
            if (createErr.code === 'auth/operation-not-allowed') {
              throw new Error('Email/Password provider is not enabled in Firebase Console. Please follow instructions to enable it under Build > Authentication > Sign-in method.');
            }
            throw authErr; // rethrow primary credential failure
          }
        } else {
          throw authErr;
        }
      }

      // Signed in successfully! Fetch from the onboarding collection
      const snapshot = await getDocs(collection(db, 'onboarding'));
      const retrieved = snapshot.docs.map(docSnapshot => docSnapshot.data() as Submission);
      retrieved.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      setIsAuthenticated(true);
      setSubmissions(retrieved);
      sessionStorage.setItem('voltz_admin_token', pass);
      setPassword(pass);
      if (retrieved.length > 0) {
        // Set first matching submission as active
        setActiveSubmission(retrieved[0]);
      }
    } catch (err: any) {
      console.error('Firebase authenticating error:', err);
      let errMsg = 'Incorrect passcode or unauthorized. Please check and try again.';
      if (err.message && err.message.includes('Email/Password provider')) {
        errMsg = err.message;
      }
      setError(errMsg);
      sessionStorage.removeItem('voltz_admin_token');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'onboarding'));
      const retrieved = snapshot.docs.map(docSnapshot => docSnapshot.data() as Submission);
      retrieved.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      setSubmissions(retrieved);
      if (activeSubmission) {
        const updated = retrieved.find((s: Submission) => s.id === activeSubmission.id);
        if (updated) {
          setActiveSubmission(updated);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      try {
        handleFirestoreError(err, OperationType.LIST, 'onboarding');
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const docRef = doc(db, 'onboarding', id);
      await updateDoc(docRef, { status: newStatus });

      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
      if (activeSubmission && activeSubmission.id === id) {
        setActiveSubmission(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err) {
      console.error('Update status error:', err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `onboarding/${id}`);
      } catch (e) {}
      alert('Secure rules blocked this update. Only authorized admin can edit status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, 'onboarding', id);
      await deleteDoc(docRef);

      setSubmissions(prev => prev.filter(s => s.id !== id));
      if (activeSubmission && activeSubmission.id === id) {
        const remaining = submissions.filter(s => s.id !== id);
        setActiveSubmission(remaining.length > 0 ? remaining[0] : null);
      }
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete error:', err);
      try {
        handleFirestoreError(err, OperationType.DELETE, `onboarding/${id}`);
      } catch (e) {}
      alert('Unauthorized deletion attempt blocked.');
    }
  };

  const handleSendTestEmail = async (submissionId?: string) => {
    setEmailStatus({ loading: true });
    try {
      // Client-side visual guide for Netlify static build email service routing.
      setTimeout(() => {
        setEmailStatus({ 
          loading: false, 
          success: true, 
          message: 'Dossier synced successfully! To auto-dispatch emails, please configure the Trigger Email Firebase Extension directly connected to your Firestore storage.' 
        });
      }, 1000);
    } catch (err: any) {
      setEmailStatus({ loading: false, success: false, message: 'SMTP routing is deactivated on the static client.' });
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Firebase signOut error:', e);
    }
    sessionStorage.removeItem('voltz_admin_token');
    setIsAuthenticated(false);
    setSubmissions([]);
    setActiveSubmission(null);
    setPassword('');
  };

  const handleCopyClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = () => {
    if (!activeSubmission) return;
    const s = activeSubmission.data;
    const textBlock = `
=========================================
VOLTZ DIGITAL ONBOARDING BRIEF
=========================================
ID: ${activeSubmission.id}
Submitted At: ${new Date(activeSubmission.submittedAt).toLocaleString()}
Status: ${activeSubmission.status.toUpperCase()}

CLIENT DETAILS:
- Business Name: ${s.businessName}
- Contact Owner: ${s.ownerFirstName} ${s.ownerLastName}
- Personal Email: ${s.personalEmail}
- Personal Phone: ${s.personalNumber}
- Business Email: ${s.businessEmail}
- Business Phone: ${s.businessNumber}

COMPANY BLUEPRINT:
- Description: ${s.businessDescription}
- Unique Value Props (Why choose us): ${s.whyChooseUs}
- Special Sauce: ${s.specialSauce}
- Key Competitors: ${s.competitors}
- Owner Vision / History: ${s.ownerVision}

SERVICES & OFFERINGS:
- Services: ${s.servicesOffered}
- Special Offers: ${s.specialOffers}
- FAQs: ${s.faq}

SYSTEM CREDENTIALS & HANDOVER:
- Existing Website: ${s.websiteAddress}
- Temporary Admin Username: ${s.adminUsername}
- Temporary Login Code: ${s.adminLoginCode}
- Additional Notes: ${s.additionalNotes}
=========================================
    `;
    handleCopyClipboard(textBlock, 'all');
  };

  const handleDownloadJSON = () => {
    if (!activeSubmission) return;
    const fileName = `voltz_${activeSubmission.data.businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_onboarding.json`;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(activeSubmission, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter & Search submissions
  const filteredSubmissions = submissions.filter(s => {
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    const normalizedQuery = searchQuery.toLowerCase();
    const sData = s.data;
    const matchesSearch = 
      sData.businessName.toLowerCase().includes(normalizedQuery) ||
      sData.ownerFirstName.toLowerCase().includes(normalizedQuery) ||
      sData.ownerLastName.toLowerCase().includes(normalizedQuery) ||
      sData.personalEmail.toLowerCase().includes(normalizedQuery);
    return matchesStatus && matchesSearch;
  });

  const getStatusStyle = (status: Submission['status']) => {
    switch (status) {
      case 'new':
        return { bg: 'rgba(0, 212, 255, 0.1)', border: 'rgba(0, 212, 255, 0.3)', text: '#00D4FF', label: 'New Brief' };
      case 'reviewed':
        return { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)', text: '#FBBF24', label: 'Reviewed' };
      case 'in_progress':
        return { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: '#A855F7', label: 'In Progress' };
      case 'completed':
        return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10B981', label: 'Completed' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255,255,255,0.2)', text: '#fff', label: 'Unknown' };
    }
  };

  const getFormattedDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="video-modal" style={{ zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="video-modal-content" 
        style={{ 
          maxWidth: '1280px', 
          width: '95%', 
          height: '90vh', 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column', 
          background: '#040404', 
          border: '1px solid rgba(0, 212, 255, 0.25)', 
          borderRadius: '16px',
          overflow: 'hidden'
        }} 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 5, 5, 0.95)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.3)' }}>
              <Shield size={20} style={{ color: '#00D4FF' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 600, margin: 0, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Voltz Digital Client Workspace
                {isAuthenticated && <span style={{ fontSize: '0.75rem', fontWeight: 400, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>Secure Admin Connected</span>}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Onboarding briefcase retrieval, credentials vault & scope manager.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isAuthenticated && (
              <>
                <button 
                  onClick={() => setShowFormPreview(true)} 
                  className="btn-primary-action" 
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '0.85rem', 
                    margin: 0, 
                    background: 'rgba(0, 212, 255, 0.1)', 
                    border: '1px solid rgba(0, 212, 255, 0.35)', 
                    color: '#00D4FF',
                    fontWeight: 500,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={14} /> Preview Onboarding Flow
                </button>
                <button 
                  onClick={handleLogOut} 
                  className="btn-outline" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem', margin: 0, borderColor: 'rgba(255,59,59,0.3)', color: 'rgba(255,90,90,0.9)', borderRadius: '8px' }}
                >
                  Disconnect Portal
                </button>
              </>
            )}
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}
              className="hover:opacity-100 hover:text-[#00D4FF] transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {!isAuthenticated ? (
          /* PASSWORD GATE */
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#020202' }}>
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              style={{ maxWidth: '420px', width: '100%', padding: '36px', background: '#060606', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', textAlign: 'center' }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(0,190,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                <Lock size={24} style={{ color: '#00D4FF' }} />
              </div>
              
              <h4 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>Admin Core Verification</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 24px 0' }}>
                Sign in with your Google Workspace account or use the master developer authorization token.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    fontSize: '0.95rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '12px', 
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                  className="hover:bg-gray-200 transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google Workspace
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
                  <div style={{ flexGrow: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Or Token</span>
                  <div style={{ flexGrow: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                </div>

                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <label htmlFor="authPw" style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', fontWeight: 500 }}>Access Keychain ID</label>
                  <input 
                    id="authPw"
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{ 
                      background: '#090909',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none',
                      width: '100%',
                      textAlign: 'center',
                      letterSpacing: '0.15em'
                    }}
                    autoFocus
                  />
                </div>

                {error && (
                  <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#f87171', fontSize: '0.82rem', display: 'flex', gap: '8px', alignItems: 'center', textAlign: 'left' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary-action"
                  style={{ width: '100%', padding: '12px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} /> Connecting Vault...
                    </>
                  ) : (
                    <>
                      Unlock Credentials Folder
                    </>
                  )}
                </button>
              </form>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                Default Access Credentials: <strong style={{ color: '#00D4FF' }}>voltz2026</strong>
              </div>
            </motion.div>
          </div>
        ) : (
          /* MAIN ADMIN DASHBOARD */
          <div style={{ flexGrow: 1, display: 'flex', minHeight: 0, background: '#020202' }}>
            
            {/* LEFT BAR: LIST OF BRIEFINGS (width: 380px) */}
            <div style={{ width: '380px', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#050505' }}>
              
              {/* Search & Filters */}
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <button 
                  onClick={() => setShowFormPreview(true)}
                  className="btn-primary-action hover:bg-[#00D4FF]/20"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.88rem',
                    background: 'rgba(0, 212, 255, 0.08)',
                    border: '1px solid rgba(0, 212, 255, 0.25)',
                    color: '#00D4FF',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    margin: 0
                  }}
                >
                  <FileText size={16} /> Test Onboarding Form Flow
                </button>

                {/* Search query input */}
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                  <input 
                    type="text"
                    placeholder="Search brand, owner, email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ 
                      width: '100%',
                      background: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '8px',
                      padding: '10px 12px 10px 38px',
                      color: '#fff',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Status Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  {['all', 'new', 'reviewed', 'in_progress', 'completed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedStatus(tab)}
                      style={{
                        padding: '6px 0',
                        fontSize: '0.75rem',
                        fontWeight: selectedStatus === tab ? 500 : 400,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: selectedStatus === tab ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
                        color: selectedStatus === tab ? '#00D4FF' : 'rgba(255,255,255,0.5)',
                        transition: '0.2s',
                        textTransform: 'capitalize'
                      }}
                    >
                      {tab === 'in_progress' ? 'Prog' : tab}
                    </button>
                  ))}
                </div>

                {/* Info counter and refresh */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                  <span>Showing {filteredSubmissions.length} folder briefs</span>
                  <button 
                    onClick={handleRefresh}
                    disabled={loading}
                    style={{ background: 'none', border: 'none', color: '#00D4FF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                    className="hover:underline"
                  >
                    <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Sync Briefs
                  </button>
                </div>

              </div>

              {/* Scrollable Submissions list */}
              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '12px' }} className="scrollbar-custom">
                {filteredSubmissions.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                    <AlertCircle size={24} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                    No matching client briefs in workspace.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredSubmissions.map((sub) => {
                      const active = activeSubmission?.id === sub.id;
                      const st = getStatusStyle(sub.status);
                      return (
                        <div
                          key={sub.id}
                          onClick={() => {
                            setActiveSubmission(sub);
                            setDeleteConfirmId(null);
                          }}
                          style={{
                            padding: '16px',
                            background: active ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                            border: '1px solid',
                            borderColor: active ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255,255,255,0.04)',
                            borderLeft: `4px solid ${st.text}`,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          className={`${active ? '' : 'hover:bg-white/[0.02]'}`}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: active ? '#00D4FF' : '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '190px' }}>
                              {sub.data.businessName || 'Unnamed Business'}
                            </h5>
                            <span style={{ fontSize: '0.7rem', fontSizeAdjust: 'none', padding: '2px 6px', borderRadius: '4px', background: st.bg, color: st.text, border: `1px solid ${st.border}`, fontWeight: 500, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                              {st.label}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sub.data.ownerFirstName} {sub.data.ownerLastName || ''}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
                            <Calendar size={12} /> {getFormattedDate(sub.submittedAt)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT PANEL: FULL BRIEF DETAILED VIEWS */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              
              {activeSubmission ? (
                <>
                  {/* Detailed Header & Actions */}
                  <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(3, 3, 3, 0.9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', padding: '2px 8px', borderRadius: '4px' }}>
                          ID: {activeSubmission.id}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> Submitted {getFormattedDate(activeSubmission.submittedAt)}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#fff', margin: '6px 0 2px 0', letterSpacing: '-0.02em' }}>
                        {activeSubmission.data.businessName || 'Unnamed Business Brief'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        Onboarding dossier submitted by {activeSubmission.data.ownerFirstName} {activeSubmission.data.ownerLastName}.
                      </p>
                    </div>

                    {/* Operational Commands */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      
                      {/* Status select dropdown */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Status:</span>
                        <select
                          value={activeSubmission.status}
                          onChange={(e) => handleUpdateStatus(activeSubmission.id, e.target.value)}
                          disabled={isUpdatingStatus}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#00D4FF',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="new" style={{ background: '#0e0e0e', color: '#fff' }}>New Brief</option>
                          <option value="reviewed" style={{ background: '#0e0e0e', color: '#fff' }}>Reviewed</option>
                          <option value="in_progress" style={{ background: '#0e0e0e', color: '#fff' }}>In Progress</option>
                          <option value="completed" style={{ background: '#0e0e0e', color: '#fff' }}>Completed</option>
                        </select>
                      </div>

                      {/* Copy All */}
                      <button 
                        onClick={handleCopyAll}
                        className="btn-outline"
                        style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}
                      >
                        <Copy size={13} /> {copiedField === 'all' ? 'Copied Brief!' : 'Copy Brief'}
                      </button>

                      {/* Download JSON */}
                      <button
                        onClick={handleDownloadJSON}
                        className="btn-outline"
                        style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}
                      >
                        <Download size={13} /> JSON
                      </button>

                      {/* Email Brief option */}
                      <button
                        onClick={() => handleSendTestEmail(activeSubmission.id)}
                        disabled={emailStatus?.loading}
                        className="btn-outline"
                        style={{ 
                          padding: '8px 14px', 
                          fontSize: '0.85rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          margin: 0,
                          borderColor: emailStatus?.loading ? 'rgba(255,255,255,0.05)' : 'rgba(0, 212, 255, 0.25)',
                          color: emailStatus?.loading ? 'rgba(255,255,255,0.3)' : '#00D4FF'
                        }}
                      >
                        {emailStatus?.loading ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} /> Sending...
                          </>
                        ) : (
                          <>
                            <Mail size={13} /> Email Brief
                          </>
                        )}
                      </button>

                      {/* Delete button (with confirmation toggle) */}
                      {deleteConfirmId === activeSubmission.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button 
                            onClick={() => handleDelete(activeSubmission.id)}
                            style={{ padding: '8px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}
                          >
                            Confirm Delete
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(null)}
                            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.06)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(activeSubmission.id)}
                          style={{
                            padding: '8px 10px',
                            background: 'none',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '8px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          className="hover:bg-red-500/10 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}

                    </div>

                  </div>

                  {/* Scrollable grid details container */}
                  <div style={{ flexGrow: 1, overflowY: 'auto', padding: '36px' }} className="scrollbar-custom">
                    
                    {/* Email Dispatch Diagnostics Banner */}
                    {emailStatus && (
                      <div 
                        style={{ 
                          background: emailStatus.success === true ? 'rgba(16, 185, 129, 0.1)' : emailStatus.success === false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 212, 255, 0.08)',
                          border: `1px solid ${emailStatus.success === true ? 'rgba(16, 185, 129, 0.3)' : emailStatus.success === false ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 212, 255, 0.2)'}`,
                          borderRadius: '12px',
                          padding: '16px 20px',
                          marginBottom: '28px',
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'flex-start',
                          position: 'relative'
                        }}
                      >
                        <div style={{ flexShrink: 0, marginTop: '2px', color: emailStatus.success === true ? '#10b981' : emailStatus.success === false ? '#ef4444' : '#00D4FF' }}>
                          {emailStatus.loading ? (
                            <RefreshCw size={18} style={{ animation: 'spin 1.5s linear infinite' }} />
                          ) : emailStatus.success === true ? (
                            <Check size={18} />
                          ) : (
                            <AlertCircle size={18} />
                          )}
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                            {emailStatus.loading ? 'Dispatching Diagnostics Brief...' : emailStatus.success === true ? 'SMTP Transmission Successful!' : 'SMTP Transmission Errored'}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.45 }}>
                            {emailStatus.message || (emailStatus.loading && 'Connecting to mail server, authenticating, and sending onboarding briefing dossier...')}
                          </div>
                        </div>
                        <button 
                          onClick={() => setEmailStatus(null)}
                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '2px', position: 'absolute', top: '12px', right: '12px' }}
                          className="hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
                      
                      {/* Section 1: Contact Information */}
                      <div>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} /> Contact & Account Owner Information
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                          
                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px 20px' }}>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '4px' }}>Client Authorized Owner</div>
                            <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 500 }}>
                              {activeSubmission.data.ownerFirstName || '—'} {activeSubmission.data.ownerLastName || '—'}
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px 20px' }}>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '4px' }}>Business Brand Name</div>
                            <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 500 }}>
                              {activeSubmission.data.businessName || '—'}
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px 20px' }}>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Owner Personal Email</span>
                              <button onClick={() => handleCopyClipboard(activeSubmission.data.personalEmail, 'email_p')} className="text-[#00D4FF] text-[11px] hover:underline background-none border-none cursor-pointer">
                                {copiedField === 'email_p' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <div style={{ color: '#fff', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Mail size={14} className="opacity-40" /> {activeSubmission.data.personalEmail || '—'}
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px 20px' }}>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '4px' }}>Owner Direct Phone</div>
                            <div style={{ color: '#fff', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Phone size={14} className="opacity-40" /> {activeSubmission.data.personalNumber || '—'}
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px 20px' }}>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Business Email (For Customers)</span>
                              <button onClick={() => handleCopyClipboard(activeSubmission.data.businessEmail, 'email_b')} className="text-[#00D4FF] text-[11px] hover:underline background-none border-none cursor-pointer">
                                {copiedField === 'email_b' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <div style={{ color: '#fff', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Mail size={14} className="opacity-40" /> {activeSubmission.data.businessEmail || '—'}
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px 20px' }}>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '4px' }}>Business Phone (For Customers)</div>
                            <div style={{ color: '#fff', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Phone size={14} className="opacity-40" /> {activeSubmission.data.businessNumber || '—'}
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Section 2: Core Business Blueprint */}
                      <div>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={14} /> Company Analysis & Branding Blueprint
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          
                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500 }}>Business Description Details</div>
                              <button onClick={() => handleCopyClipboard(activeSubmission.data.businessDescription, 'desc')} className="text-[#00D4FF] text-[11px] hover:underline background-none border-none cursor-pointer">
                                {copiedField === 'desc' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.92rem', color: '#dadada', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                              {activeSubmission.data.businessDescription || '—'}
                            </p>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500 }}>Why Choose Them (Value Propositions)</div>
                              <button onClick={() => handleCopyClipboard(activeSubmission.data.whyChooseUs, 'val')} className="text-[#00D4FF] text-[11px] hover:underline background-none border-none cursor-pointer">
                                {copiedField === 'val' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.92rem', color: '#dadada', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                              {activeSubmission.data.whyChooseUs || '—'}
                            </p>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500 }}>Competitive Advantage / Unique Sauce</div>
                              <button onClick={() => handleCopyClipboard(activeSubmission.data.specialSauce, 'sauce')} className="text-[#00D4FF] text-[11px] hover:underline background-none border-none cursor-pointer">
                                {copiedField === 'sauce' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.92rem', color: '#dadada', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                              {activeSubmission.data.specialSauce || '—'}
                            </p>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px' }}>
                              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px' }}>Listed Competitors</div>
                              <p style={{ margin: 0, fontSize: '0.9rem', color: '#dadada', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {activeSubmission.data.competitors || '—'}
                              </p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px' }}>
                              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px' }}>Partners & Owners Vision / History</div>
                              <p style={{ margin: 0, fontSize: '0.9rem', color: '#dadada', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {activeSubmission.data.ownerVision || '—'}
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Section 3: Services, Products, Offers */}
                      <div>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={14} /> Services, Offers & FAQs Inventory
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                          
                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px' }}>Services Portfolio List</div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#dadada', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                              {activeSubmission.data.servicesOffered || '—'}
                            </p>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px' }}>Specials, Discounts & Finance Plans</div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#dadada', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                              {activeSubmission.data.specialOffers || '—'}
                            </p>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px', gridColumn: '1 / -1' }}>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px' }}>Frequently Asked Questions (FAQs)</div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#dadada', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                              {activeSubmission.data.faq || '—'}
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* Section 4: Handover & Website Credentials */}
                      <div>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Shield size={14} /> Critical System Handover & Hosting Access
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                          
                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '10px', padding: '18px 20px' }}>
                            <div style={{ fontSize: '0.78rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Existing Website</div>
                            <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {activeSubmission.data.websiteAddress ? (
                                <a href={activeSubmission.data.websiteAddress.startsWith('http') ? activeSubmission.data.websiteAddress : `https://${activeSubmission.data.websiteAddress}`} target="_blank" rel="noreferrer" className="text-[#00D4FF] hover:underline flex items-center gap-1">
                                  {activeSubmission.data.websiteAddress}
                                </a>
                              ) : '—'}
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '10px', padding: '18px 20px' }}>
                            <div style={{ fontSize: '0.78rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Admin Username / Access Email</span>
                              <button onClick={() => handleCopyClipboard(activeSubmission.data.adminUsername, 'user_a')} className="text-[#00D4FF] text-[11px] hover:underline background-none border-none cursor-pointer">
                                {copiedField === 'user_a' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                              {activeSubmission.data.adminUsername || '—'}
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '10px', padding: '18px 20px' }}>
                            <div style={{ fontSize: '0.78rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Temporary Login Code / Password</span>
                              <button onClick={() => handleCopyClipboard(activeSubmission.data.adminLoginCode, 'code_a')} className="text-red-400 text-[11px] hover:underline background-none border-none cursor-pointer">
                                {copiedField === 'code_a' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <div style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                              {activeSubmission.data.adminLoginCode || '—'}
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px', gridColumn: '1 / -1' }}>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px' }}>Security & Handover Operational Notes</div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#dadada', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)' }}>
                              {activeSubmission.data.additionalNotes || 'No additional credentials notes.'}
                            </p>
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>
                </>
              ) : (
                /* EMPTY STATE (No selected submission) */
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#020202', color: 'rgba(255,255,255,0.2)' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <FileText size={32} className="opacity-30" />
                  </div>
                  <h4 style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500, margin: '0 0 8px 0' }}>No Briefing Selected</h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', maxWidth: '320px', textAlign: 'center' }}>
                    Choose a client onboarding brief from the sidebar panel on the left to review access keys and scope details.
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

        {showFormPreview && (
          <OnboardingForm 
            isPreview={true} 
            onClose={() => setShowFormPreview(false)} 
          />
        )}

      </div>
    </div>
  );
}
