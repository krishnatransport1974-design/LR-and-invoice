import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';

export default function Settings() {
  const { businessData, setBusinessData } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    address: '',
    gstin: '',
    phone: '',
    email: '',
    default_lr_format: 'standard',
    default_invoice_format: 'standard'
  });

  useEffect(() => {
    if (businessData) {
      setFormData({
        name: businessData.name || '',
        company_name: businessData.company_name || '',
        address: businessData.address || '',
        gstin: businessData.gstin || '',
        phone: businessData.phone || '',
        email: businessData.email || '',
        default_lr_format: businessData.default_lr_format || 'standard',
        default_invoice_format: businessData.default_invoice_format || 'standard'
      });
    }
  }, [businessData]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          address: formData.address,
          gstin: formData.gstin,
          phone: formData.phone,
          email: formData.email,
          default_lr_format: formData.default_lr_format,
          default_invoice_format: formData.default_invoice_format
        })
        .eq('id', businessData.id);

      if (error) throw error;
      
      toast.success('Settings updated successfully');
      // Update context
      setBusinessData({ ...businessData, ...formData });
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2>Company Settings</h2>
      
      <div className="card max-w-3xl">
        <form onSubmit={handleSave}>
          <h3 className="mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>Business Profile</h3>
          <div className="form-group">
            <label>Company Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          
          <div className="form-group">
            <label>Address</label>
            <textarea rows="2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label>GSTIN</label>
            <input type="text" value={formData.gstin} onChange={(e) => setFormData({...formData, gstin: e.target.value})} />
          </div>

          <h3 className="mb-4 mt-8 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>Document Preferences</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Default LR Format</label>
              <select value={formData.default_lr_format} onChange={(e) => setFormData({...formData, default_lr_format: e.target.value})}>
                <option value="standard">Standard Professional</option>
                <option value="modern">Modern Clean</option>
                <option value="compact">Compact (Saves Paper)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Default Invoice Format</label>
              <select value={formData.default_invoice_format} onChange={(e) => setFormData({...formData, default_invoice_format: e.target.value})}>
                <option value="standard">Standard Professional</option>
                <option value="modern">Modern Clean</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
