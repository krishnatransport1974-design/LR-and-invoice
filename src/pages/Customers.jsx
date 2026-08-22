import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Loader2, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    address: '',
    gstin: '',
    phone: '',
    email: ''
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // RLS will automatically filter by company_id based on the user's mapping
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      toast.error('Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // We must pass company_id. 
      // The easiest way is to let RLS handle it if we have a trigger, 
      // or we fetch company_id from context. 
      // Wait, RLS prevents insert if company_id doesn't match, so we MUST insert it.
      // Let's get the user's company_id first.
      const { data: mapping } = await supabase
        .from('company_users')
        .select('company_id')
        .single();
        
      if (!mapping?.company_id) throw new Error('Company not found');

      const payload = {
        ...formData,
        company_id: mapping.company_id
      };

      const { error } = await supabase
        .from('customers')
        .insert([payload]);

      if (error) throw error;
      
      toast.success('Customer added successfully');
      setShowModal(false);
      setFormData({ name: '', company_name: '', address: '', gstin: '', phone: '', email: '' });
      fetchCustomers();
    } catch (err) {
      toast.error(err.message || 'Failed to add customer');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.company_name && c.company_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2>Customers</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="card">
        <div className="form-group" style={{ maxWidth: '300px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2rem' }}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-6 text-muted"><Loader2 className="spin" size={24} /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company Name</th>
                  <th>Contact</th>
                  <th>GSTIN</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-6">No customers found.</td>
                  </tr>
                ) : (
                  filteredCustomers.map(c => (
                    <tr key={c.id}>
                      <td className="font-bold">{c.name}</td>
                      <td>{c.company_name || '-'}</td>
                      <td>
                        <div>{c.phone}</div>
                        <div className="text-muted text-sm">{c.email}</div>
                      </td>
                      <td>{c.gstin || '-'}</td>
                      <td>
                        <button className="btn-icon" onClick={() => handleDelete(c.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="mb-4">Add New Customer</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Contact Person Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Company/Business Name</label>
                <input type="text" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone *</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>GSTIN</label>
                <input type="text" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spin" /> : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
