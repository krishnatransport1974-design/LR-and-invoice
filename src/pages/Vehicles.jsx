import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Loader2, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: '',
    driver_name: '',
    driver_phone: '',
    owner_name: ''
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('vehicle_number', { ascending: true });
        
      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
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
        .from('vehicles')
        .insert([payload]);

      if (error) throw error;
      
      toast.success('Vehicle added successfully');
      setShowModal(false);
      setFormData({ vehicle_number: '', vehicle_type: '', driver_name: '', driver_phone: '', owner_name: '' });
      fetchVehicles();
    } catch (err) {
      toast.error(err.message || 'Failed to add vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.vehicle_number.toLowerCase().includes(search.toLowerCase()) || 
    (v.driver_name && v.driver_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2>Vehicles</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      <div className="card">
        <div className="form-group" style={{ maxWidth: '300px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search vehicles..." 
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
                  <th>Vehicle Number</th>
                  <th>Type</th>
                  <th>Driver Name</th>
                  <th>Driver Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-6">No vehicles found.</td>
                  </tr>
                ) : (
                  filteredVehicles.map(v => (
                    <tr key={v.id}>
                      <td className="font-bold">{v.vehicle_number}</td>
                      <td>{v.vehicle_type || '-'}</td>
                      <td>{v.driver_name || '-'}</td>
                      <td>{v.driver_phone || '-'}</td>
                      <td>
                        <button className="btn-icon" onClick={() => handleDelete(v.id)}>
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
            <h3 className="mb-4">Add New Vehicle</h3>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Vehicle Number *</label>
                  <input required type="text" value={formData.vehicle_number} onChange={e => setFormData({...formData, vehicle_number: e.target.value})} placeholder="e.g. MH-12-AB-1234" />
                </div>
                <div className="form-group">
                  <label>Vehicle Type</label>
                  <input type="text" value={formData.vehicle_type} onChange={e => setFormData({...formData, vehicle_type: e.target.value})} placeholder="e.g. 10 Wheeler, Container" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Driver Name</label>
                  <input type="text" value={formData.driver_name} onChange={e => setFormData({...formData, driver_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Driver Phone</label>
                  <input type="text" value={formData.driver_phone} onChange={e => setFormData({...formData, driver_phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Owner Name</label>
                <input type="text" value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})} />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spin" /> : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
