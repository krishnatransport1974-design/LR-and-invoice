import { Plus, Trash2, Database, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';

export default function LRForm({ lrData, setLrData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const { businessData } = useOutletContext();

  useEffect(() => {
    // Fetch customers and vehicles for dropdowns
    const fetchData = async () => {
      try {
        const [custRes, vehRes] = await Promise.all([
          supabase.from('customers').select('id, name, address, company_name'),
          supabase.from('vehicles').select('id, vehicle_number, driver_name, driver_phone')
        ]);
        if (custRes.data) setCustomers(custRes.data);
        if (vehRes.data) setVehicles(vehRes.data);
      } catch (err) {
        console.error("Error fetching dependencies", err);
      }
    };
    fetchData();
  }, []);

  const updateLr = (field, value) => {
    setLrData(prev => ({ ...prev, [field]: value }));
  };

  const addGood = () => {
    setLrData(prev => ({
      ...prev,
      goods: [...prev.goods, { id: Date.now(), packages: '', description: '', lorryNo: '', product: '', weight: '', remarks: '' }]
    }));
  };

  const updateGood = (id, field, value) => {
    setLrData(prev => ({
      ...prev,
      goods: prev.goods.map(g => g.id === id ? { ...g, [field]: value } : g)
    }));
  };

  const removeGood = (id) => {
    setLrData(prev => ({
      ...prev,
      goods: prev.goods.filter(g => g.id !== id)
    }));
  };

  const handleConsignorChange = (e) => {
    const id = e.target.value;
    updateLr('customer_id', id);
    const customer = customers.find(c => c.id === id);
    if (customer) {
      updateLr('consignorName', customer.company_name || customer.name);
      updateLr('consignorAddress', customer.address || '');
    } else {
      updateLr('consignorName', '');
      updateLr('consignorAddress', '');
    }
  };

  const handleConsigneeChange = (e) => {
    const id = e.target.value;
    const customer = customers.find(c => c.id === id);
    if (customer) {
      updateLr('consigneeName', customer.company_name || customer.name);
      updateLr('consigneeAddress', customer.address || '');
    }
  };

  const handleVehicleChange = (e) => {
    const id = e.target.value;
    updateLr('vehicle_id', id);
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle && lrData.goods.length > 0) {
      // Auto-fill lorry number for the first goods item
      updateGood(lrData.goods[0].id, 'lorryNo', vehicle.vehicle_number);
    }
  };

  const handleSaveToDB = async () => {
    if (!businessData?.id) {
      toast.error('Company ID not found');
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        company_id: businessData.id,
        lr_number: lrData.lrNumber,
        date: lrData.date,
        inv_no: lrData.invNo,
        from_city: lrData.from,
        to_city: lrData.to,
        consignor_name: lrData.consignorName,
        consignor_address: lrData.consignorAddress,
        consignee_name: lrData.consigneeName,
        consignee_address: lrData.consigneeAddress,
        customer_id: lrData.customer_id,
        vehicle_id: lrData.vehicle_id,
        goods: lrData.goods
      };

      // Check if updating or inserting based on existence
      const { data: existing } = await supabase.from('lorry_receipts').select('id').eq('lr_number', lrData.lrNumber).eq('company_id', businessData.id).single();
      
      let error;
      if (existing) {
        const res = await supabase.from('lorry_receipts').update(payload).eq('id', existing.id);
        error = res.error;
      } else {
        const res = await supabase.from('lorry_receipts').insert([payload]);
        error = res.error;
      }

      if (error) throw error;
      toast.success('LR Saved Successfully!');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* LR Details Section */}
      <div className="form-section">
        <div className="form-section-title">Lorry Receipt Details</div>
        <div className="form-row">
          <div className="form-group">
            <label>Bilty / LR No.</label>
            <input type="text" value={lrData.lrNumber} onChange={(e) => updateLr('lrNumber', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={lrData.date} onChange={(e) => updateLr('date', e.target.value)} />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>From (Origin)</label>
            <input type="text" value={lrData.from} onChange={(e) => updateLr('from', e.target.value)} />
          </div>
          <div className="form-group">
            <label>To (Destination)</label>
            <input type="text" value={lrData.to} onChange={(e) => updateLr('to', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Parties Section */}
      <div className="form-section">
        <div className="form-section-title">Parties & Vehicle</div>
        
        <div className="form-group">
          <label>Select Vehicle</label>
          <select value={lrData.vehicle_id || ''} onChange={handleVehicleChange}>
            <option value="">-- Select a Vehicle --</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_number} ({v.driver_name})</option>)}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Consignor (Sender)</label>
            <select value={lrData.customer_id || ''} onChange={handleConsignorChange}>
              <option value="">-- Select Consignor --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.company_name ? `(${c.company_name})` : ''}</option>)}
            </select>
            <input type="text" className="mt-2" placeholder="Consignor Name" value={lrData.consignorName} onChange={(e) => updateLr('consignorName', e.target.value)} />
            <textarea rows="2" className="mt-2" placeholder="Consignor Address" value={lrData.consignorAddress} onChange={(e) => updateLr('consignorAddress', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Consignee (Receiver)</label>
            <select onChange={handleConsigneeChange}>
              <option value="">-- Select Consignee --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.company_name ? `(${c.company_name})` : ''}</option>)}
            </select>
            <input type="text" className="mt-2" placeholder="Consignee Name" value={lrData.consigneeName} onChange={(e) => updateLr('consigneeName', e.target.value)} />
            <textarea rows="2" className="mt-2" placeholder="Consignee Address" value={lrData.consigneeAddress} onChange={(e) => updateLr('consigneeAddress', e.target.value)} />
          </div>
        </div>
      </div>
      
      {/* Shipment Details Section */}
      <div className="form-section">
        <div className="form-section-title">Shipment Details (No Charges)</div>
        <div className="flex flex-col gap-4">
          {lrData.goods.map((good, index) => (
            <div key={good.id} className="card-sm relative" style={{ padding: '1rem', backgroundColor: '#f8fafc' }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400">ITEM {index + 1}</span>
                <button className="btn-icon" onClick={() => removeGood(good.id)} disabled={lrData.goods.length === 1} style={{ padding: '0.25rem', color: 'var(--danger)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group mb-0">
                  <label>Packages</label>
                  <textarea rows="1" value={good.packages} onChange={(e) => updateGood(good.id, 'packages', e.target.value)} placeholder="388 Bags" />
                </div>
                <div className="form-group mb-0">
                  <label>Description</label>
                  <textarea rows="1" value={good.description} onChange={(e) => updateGood(good.id, 'description', e.target.value)} />
                </div>
                <div className="form-group mb-0">
                  <label>Lorry No.</label>
                  <input type="text" value={good.lorryNo} onChange={(e) => updateGood(good.id, 'lorryNo', e.target.value)} />
                </div>
                <div className="form-group mb-0">
                  <label>Product</label>
                  <input type="text" value={good.product} onChange={(e) => updateGood(good.id, 'product', e.target.value)} />
                </div>
                <div className="form-group mb-0">
                  <label>Weight</label>
                  <input type="text" value={good.weight} onChange={(e) => updateGood(good.id, 'weight', e.target.value)} />
                </div>
                <div className="form-group mb-0">
                  <label>Remarks</label>
                  <textarea rows="1" value={good.remarks} onChange={(e) => updateGood(good.id, 'remarks', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={addGood}>
            <Plus size={16} /> Add Goods / Package
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="form-section no-print mt-4 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
        <button className="btn btn-primary w-full" onClick={handleSaveToDB} disabled={isSaving}>
          {isSaving ? <Loader2 size={20} className="spin" /> : <Database size={20} />}
          Save LR to Database
        </button>
      </div>
    </div>
  );
}
