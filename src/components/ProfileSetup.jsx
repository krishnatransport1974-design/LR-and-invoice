import { useState } from 'react';
import { Upload, Save, Truck } from 'lucide-react';

export default function ProfileSetup({ onSave, initialData }) {
  const [profile, setProfile] = useState(initialData || {
    name: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    city: 'Mumbai', // Default to Mumbai as requested
    logo: null
  });

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(profile);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-icon" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
            <Truck size={32} />
          </div>
          <h2>Business Profile Setup</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Set up your transporter details. This will be automatically filled on all receipts.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name (e.g., Krishna Transport)</label>
            <input 
              type="text" 
              required
              value={profile.name} 
              onChange={(e) => handleChange('name', e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Business Logo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                <Upload size={16} /> {profile.logo ? 'Change Logo' : 'Upload Logo'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </label>
              {profile.logo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={profile.logo} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} />
                  <button 
                    type="button"
                    className="btn btn-danger" 
                    onClick={() => handleChange('logo', null)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea 
              rows="2" 
              required
              value={profile.address} 
              onChange={(e) => handleChange('address', e.target.value)} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                required
                value={profile.phone} 
                onChange={(e) => handleChange('phone', e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={profile.email} 
                onChange={(e) => handleChange('email', e.target.value)} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>GSTIN</label>
              <input 
                type="text" 
                value={profile.gstin} 
                onChange={(e) => handleChange('gstin', e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Jurisdiction City</label>
              <input 
                type="text" 
                required
                value={profile.city} 
                onChange={(e) => handleChange('city', e.target.value)} 
                placeholder="e.g. Mumbai"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem', padding: '0.75rem' }}>
            <Save size={18} /> Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
