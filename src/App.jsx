import { useState, useEffect } from 'react';
import { FileText, Truck, Printer, Settings } from 'lucide-react';
import './App.css';

import InvoiceForm from './components/InvoiceForm';
import LRForm from './components/LRForm';
import InvoicePreview from './components/InvoicePreview';
import LRPreview from './components/LRPreview';
import ProfileSetup from './components/ProfileSetup';
import History from './components/History';
import Auth from './components/Auth';
import { supabase } from './supabase';

function App() {
  const [session, setSession] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  
  const [printMode, setPrintMode] = useState('both'); // 'both', 'main', or 'driver'
  const [docType, setDocType] = useState('lr'); // Default to LR as requested
  
  // State for Invoice
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    clientName: 'Client Co.',
    clientAddress: '456 Client St, City',
    items: [
      { id: 1, description: 'Transport Services', quantity: 1, price: 1500 }
    ],
    taxRate: 18,
    notes: 'Thank you for your business!'
  });

  // State for Lorry Receipt (LR)
  const [lrData, setLrData] = useState({
    lrNumber: '0014',
    date: new Date().toISOString().split('T')[0],
    invNo: '',
    from: 'Bhiwandi',
    to: 'Gujarat',
    consignorName: '',
    consignorAddress: '',
    consigneeName: '',
    consigneeAddress: '',
    goods: [
      { id: Date.now(), packages: '', description: '', lorryNo: '', product: '', weight: '', remarks: '' }
    ],
    driverName: '',
    driverPhone: '',
    includeDriverCopy: true
  });

  useEffect(() => {
    // 1. Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkBusinessProfile(session.user.id);
      else setIsCheckingProfile(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkBusinessProfile(session.user.id);
      } else {
        setBusinessData(null);
        setIsProfileSetupComplete(false);
        setIsCheckingProfile(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkBusinessProfile = async (userId) => {
    try {
      setIsCheckingProfile(true);
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setBusinessData(data);
        setIsProfileSetupComplete(true);
      } else {
        setBusinessData(null);
        setIsProfileSetupComplete(false);
      }
    } catch (error) {
      console.log('No profile found or error fetching:', error.message);
      setIsProfileSetupComplete(false);
    } finally {
      setIsCheckingProfile(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLoadLR = (historicalLR) => {
    const parsedGoods = typeof historicalLR.goods === 'string' ? JSON.parse(historicalLR.goods) : historicalLR.goods;
    
    setLrData({
      lrNumber: historicalLR.lr_number || '',
      date: historicalLR.date || new Date().toISOString().split('T')[0],
      invNo: historicalLR.inv_no || '',
      from: historicalLR.from_city || '',
      to: historicalLR.to_city || '',
      consignorName: historicalLR.consignor_name || '',
      consignorAddress: historicalLR.consignor_address || '',
      consigneeName: historicalLR.consignee_name || '',
      consigneeAddress: historicalLR.consignee_address || '',
      goods: parsedGoods || [{ id: Date.now(), packages: '', description: '', lorryNo: '', product: '', weight: '', remarks: '' }]
    });
    setDocType('lr');
  };

  const handlePrint = (mode) => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
      setPrintMode('both');
    }, 100);
  };

  if (!session) {
    return <Auth />;
  }

  if (isCheckingProfile) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: 'white' }}>
        Loading your profile...
      </div>
    );
  }

  if (!isProfileSetupComplete) {
    return <ProfileSetup 
             setBusinessData={setBusinessData} 
             setIsProfileSetupComplete={setIsProfileSetupComplete} 
             user={session.user}
           />;
  }

  return (
    <div className="app-container">
      <header className="app-header no-print glass-panel">
        <div className="header-brand">
          <div className="logo-icon">
            <Truck size={24} />
          </div>
          <h1>{businessData.name || 'DocuGen'} <span className="text-muted">| DocuGen</span></h1>
        </div>
        
        <div className="doc-type-selector">
          <button 
            className={`tab-btn ${docType === 'history' ? 'active' : ''}`}
            onClick={() => setDocType('history')}
          >
            <FileText size={18} /> History & DB
          </button>
          <button 
            className={`tab-btn ${docType === 'lr' ? 'active' : ''}`}
            onClick={() => setDocType('lr')}
          >
            <Truck size={18} /> Lorry Receipt
          </button>
          <button 
            className={`tab-btn ${docType === 'invoice' ? 'active' : ''}`}
            onClick={() => setDocType('invoice')}
          >
            <FileText size={18} /> Invoice
          </button>
        </div>
        
        <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setIsProfileSetupComplete(false)}>
            <Settings size={18} /> Profile
          </button>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white' }}>
            Log Out
          </button>
          
          {docType === 'lr' ? (
            <>
              <button className="btn btn-primary" onClick={() => handlePrint('main')}>
                <Printer size={18} /> Print Main Copy
              </button>
              <button className="btn btn-secondary" style={{ backgroundColor: '#fefce8', color: '#854d0e', borderColor: '#fef08a' }} onClick={() => handlePrint('driver')}>
                <Printer size={18} /> Print Driver Copy
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => handlePrint('both')}>
              <Printer size={18} /> Print / PDF
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="workspace">
        {docType === 'history' ? (
          <div style={{ padding: '2rem', flex: 1 }}>
            <History onLoadLR={handleLoadLR} user={session.user} />
          </div>
        ) : (
          <>
            {/* Editor Panel - Hidden on Print */}
            <div className="editor-panel no-print">
              <div className="panel-header">
                <h2>{docType === 'invoice' ? 'Invoice Details' : 'LR Details'}</h2>
              </div>
              
              <div className="editor-content glass-panel">
                {docType === 'invoice' ? (
                  <InvoiceForm 
                    invoiceData={invoiceData}
                    setInvoiceData={setInvoiceData}
                    user={session.user}
                  />
                ) : (
                  <LRForm 
                    lrData={lrData}
                    setLrData={setLrData}
                  />
                )}
              </div>
            </div>

            {/* Preview Panel - This is what gets printed */}
            <div className="preview-panel">
              <div className={docType === 'invoice' ? 'preview-container' : 'preview-container-landscape'}>
                {docType === 'invoice' ? (
                  <InvoicePreview businessData={businessData} invoiceData={invoiceData} />
                ) : (
                  <LRPreview businessData={businessData} lrData={lrData} printMode={printMode} />
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
