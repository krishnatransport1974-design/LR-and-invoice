import { useState } from 'react';
import { Upload, Save, Loader2, Building2 } from 'lucide-react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

export default function ProfileSetup({ setBusinessData, user }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    jurisdiction_city: 'Mumbai',
    logo_url: null,
    signature_url: null
  });
  const [loading, setLoading] = useState(false);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signature_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const companyId = crypto.randomUUID();

      // 1. Insert into companies (NO .select() to avoid RLS block)
      const { error: companyErr } = await supabase
        .from('companies')
        .insert([{
          id: companyId,
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          gstin: formData.gstin,
          jurisdiction_city: formData.jurisdiction_city,
          logo_url: formData.logo_url,
          signature_url: formData.signature_url
        }]);

      if (companyErr) throw companyErr;

      // 2. Insert into company_users mapping
      const { error: mappingErr } = await supabase
        .from('company_users')
        .insert([{
          company_id: companyId,
          user_id: user.id,
          role: 'Admin'
        }]);

      if (mappingErr) throw mappingErr;

      toast.success('Company profile created!');
      setBusinessData({
        id: companyId,
        ...formData
      });
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save profile. Check connection or RLS policies.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full w-full" style={{ minHeight: '100vh', padding: '2rem', backgroundColor: 'var(--bg-body)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
        <div className="text-center mb-6">
          <div className="btn-icon" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', marginBottom: '1rem', padding: '1rem' }}>
            <Building2 size={32} />
          </div>
          <h2 className="text-2xl">Company Profile Setup</h2>
          <p className="text-muted mt-2">Set up your transporter details to proceed.</p>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Company Name (e.g., Krishna Transport)</label>
            <input 
              type="text" 
              required
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Company Logo</label>
              <div className="flex items-center gap-4">
                <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                  <Upload size={16} /> {formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
                {formData.logo_url && (
                  <div className="flex items-center gap-2">
                    <img src={formData.logo_url} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} />
                    <button type="button" className="btn btn-danger btn-icon" onClick={() => setFormData({...formData, logo_url: null})}>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Authorized Sign (Transparent PNG)</label>
              <div className="flex items-center gap-4">
                <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                  <Upload size={16} /> {formData.signature_url ? 'Change Sign' : 'Upload Sign'}
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} style={{ display: 'none' }} />
                </label>
                {formData.signature_url && (
                  <div className="flex items-center gap-2">
                    <img src={formData.signature_url} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} />
                    <button type="button" className="btn btn-danger btn-icon" onClick={() => setFormData({...formData, signature_url: null})}>
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
            <div className="form-group">
              <label>Jurisdiction City</label>
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
            className="btn btn-primary w-full mt-4" 
            style={{ padding: '0.75rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? <Loader2 size={20} className="spin" /> : <><Save size={20} /> Create Company</>}
          </button>
        </form>
      </div>
    </div>
  );
}
