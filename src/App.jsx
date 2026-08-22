import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import { supabase } from './supabase';

import Layout from './components/Layout';
import Auth from './components/Auth';
import ProfileSetup from './components/ProfileSetup';

import Dashboard from './pages/Dashboard';
import LRList from './pages/LRList';
import InvoiceList from './pages/InvoiceList';
import Customers from './pages/Customers';
import Vehicles from './pages/Vehicles';
import Settings from './pages/Settings';

function App() {
  const [session, setSession] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkBusinessProfile(session.user.id);
      else setIsCheckingProfile(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        if (_event === 'SIGNED_IN') {
          checkBusinessProfile(session.user.id);
        }
      } else {
        setBusinessData(null);
        setIsCheckingProfile(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkBusinessProfile = async (userId) => {
    try {
      setIsCheckingProfile(true);
      // Fetch the company mapping for this user
      const { data: mapping, error: mapErr } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userId)
        .single();
      
      if (mapping && mapping.company_id) {
        // Fetch the company details
        const { data: company, error: compErr } = await supabase
          .from('companies')
          .select('*')
          .eq('id', mapping.company_id)
          .single();
        
        if (company) {
          setBusinessData(company);
        } else {
          setBusinessData(null);
        }
      } else {
        setBusinessData(null);
      }
    } catch (error) {
      console.log('No profile found or error fetching:', error.message);
      setBusinessData(null);
    } finally {
      setIsCheckingProfile(false);
    }
  };

  if (isCheckingProfile) {
    return (
      <div className="flex justify-center items-center h-full w-full" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Toaster position="top-right" />
        <Auth />
      </>
    );
  }

  if (!businessData) {
    return (
      <>
        <Toaster position="top-right" />
        <ProfileSetup setBusinessData={setBusinessData} user={session.user} />
      </>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout businessData={businessData} setBusinessData={setBusinessData} />}>
          <Route index element={<Dashboard />} />
          <Route path="lrs" element={<LRList />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="customers" element={<Customers />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
