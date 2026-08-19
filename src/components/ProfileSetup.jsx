import { useState, useRef, useEffect } from 'react';
import { Upload, Save, Loader2, Building2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function ProfileSetup({ setBusinessData, setIsProfileSetupComplete, user }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    jurisdiction_city: 'Mumbai',
    logo: null,
    signature: null
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    // Try to fetch existing data if they are editing
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data) {
          setFormData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [user.id]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signature: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        user_id: user.id,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        gstin: formData.gstin,
        jurisdiction_city: formData.jurisdiction_city,
        logo: formData.logo,
        signature: formData.signature
      };

      const { error } = await supabase
        .from('business_profiles')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      setBusinessData(payload);
      setIsProfileSetupComplete(true);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Check connection or RLS policies.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: 'white' }}>
        Loading your profile data...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-icon" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
            <Building2 size={32} />
          </div>
          <h2>Business Profile Setup</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Set up your transporter details. This will be automatically filled on all receipts.</p>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Business Name (e.g., Krishna Transport)</label>
            <input 
              type="text" 
              required
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Business Logo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                  <Upload size={16} /> {formData.logo ? 'Change Logo' : 'Upload Logo'}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
                {formData.logo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={formData.logo} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} />
                    <button 
                      type="button"
                      className="btn btn-danger" 
                      onClick={() => setFormData({...formData, logo: null})}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Authorized Signature (Transparent PNG recommended)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                  <Upload size={16} /> {formData.signature ? 'Change Sign' : 'Upload Sign'}
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} style={{ display: 'none' }} />
                </label>
                {formData.signature && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={formData.signature} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} />
                    <button 
                      type="button"
                      className="btn btn-danger" 
                      onClick={() => setFormData({...formData, signature: null})}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea 
              rows="2" 
              required
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                required
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>GSTIN</label>
              <input 
                type="text" 
                value={formData.gstin} 
                onChange={(e) => setFormData({...formData, gstin: e.target.value})} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>JURISDICTION CITY</label>
              <input 
                type="text" 
                required
                value={formData.jurisdiction_city} 
                onChange={(e) => setFormData({...formData, jurisdiction_city: e.target.value})} 
                placeholder="e.g. Mumbai"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', gap: '8px' }}
            disabled={loading}
          >
            {loading ? <Loader2 size={24} className="spinner" /> : <><Save size={24} /> Save & Continue</>}
          </button>
        </form>
      </div>
    </div>
  );
}
