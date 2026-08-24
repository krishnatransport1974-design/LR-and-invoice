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
    email: '',
    default_lr_format: 'standard',
    default_invoice_format: 'standard',
    bank_name: '',
    account_name: '',
    account_number: '',
    ifsc: '',
    upi_id: '',
    show_bank_details: true,
    default_tax: 0,
    default_payment_terms: '',
    invoice_prefix: 'INV'
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
        default_invoice_format: businessData.default_invoice_format || 'standard',
        bank_name: businessData.bank_name || '',
        account_name: businessData.account_name || '',
        account_number: businessData.account_number || '',
        ifsc: businessData.ifsc || '',
        upi_id: businessData.upi_id || '',
        show_bank_details: businessData.show_bank_details !== false,
        default_tax: businessData.default_tax || 0,
        default_payment_terms: businessData.default_payment_terms || '',
        invoice_prefix: businessData.invoice_prefix || 'INV'
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
          default_invoice_format: formData.default_invoice_format,
          bank_name: formData.bank_name,
          account_name: formData.account_name,
          account_number: formData.account_number,
          ifsc: formData.ifsc,
          upi_id: formData.upi_id,
          show_bank_details: formData.show_bank_details,
          default_tax: formData.default_tax,
          default_payment_terms: formData.default_payment_terms,
          invoice_prefix: formData.invoice_prefix
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

          <div className="form-row">
            <div className="form-group">
              <label>Invoice Prefix</label>
              <input type="text" value={formData.invoice_prefix} onChange={(e) => setFormData({...formData, invoice_prefix: e.target.value})} placeholder="e.g. INV, BILL, TAX" />
            </div>
            <div className="form-group">
              <label>Default Tax Rate (%)</label>
              <input type="number" step="any" value={formData.default_tax} onChange={(e) => setFormData({...formData, default_tax: e.target.value})} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Default Payment Terms & Conditions</label>
            <textarea rows="3" value={formData.default_payment_terms} onChange={(e) => setFormData({...formData, default_payment_terms: e.target.value})} placeholder="These will appear on every new invoice by default..." />
          </div>

          <h3 className="mb-4 mt-8 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>Bank Details (For Invoices)</h3>
          
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="checkbox" 
              id="showBank"
              checked={formData.show_bank_details} 
              onChange={(e) => setFormData({...formData, show_bank_details: e.target.checked})} 
              style={{ width: 'auto' }}
            />
            <label htmlFor="showBank" style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>Show bank details on invoices</label>
          </div>

          {formData.show_bank_details && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Bank Name</label>
                  <input type="text" value={formData.bank_name} onChange={(e) => setFormData({...formData, bank_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Account Name</label>
                  <input type="text" value={formData.account_name} onChange={(e) => setFormData({...formData, account_name: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Account Number</label>
                  <input type="text" value={formData.account_number} onChange={(e) => setFormData({...formData, account_number: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input type="text" value={formData.ifsc} onChange={(e) => setFormData({...formData, ifsc: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>UPI ID (Optional)</label>
                <input type="text" value={formData.upi_id} onChange={(e) => setFormData({...formData, upi_id: e.target.value})} placeholder="example@upi" />
              </div>
            </>
          )}

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
