import { Plus, Trash2, Database, Loader2, FilePlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function LRForm({ lrData, setLrData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const updateLr = (field, value) => {
    setLrData(prev => ({ ...prev, [field]: value }));
  };

  const addGood = () => {
    setLrData(prev => ({
      ...prev,
      goods: [
        ...prev.goods,
        { id: Date.now(), packages: '', description: '', lorryNo: '', product: '', weight: '', remarks: '' }
      ]
    }));
  };

  const updateGood = (id, field, value) => {
    setLrData(prev => ({
      ...prev,
      goods: prev.goods.map(good => 
        good.id === id ? { ...good, [field]: value } : good
      )
    }));
  };

  const removeGood = (id) => {
    setLrData(prev => ({
      ...prev,
      goods: prev.goods.filter(good => good.id !== id)
    }));
  };

  const handleSaveToDB = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const { error } = await supabase
        .from('lorry_receipts')
        .insert([{
          lr_number: lrData.lrNumber,
          date: lrData.date,
          inv_no: lrData.invNo,
          from_city: lrData.from,
          to_city: lrData.to,
          consignor_name: lrData.consignorName,
          consignor_address: lrData.consignorAddress,
          consignee_name: lrData.consigneeName,
          consignee_address: lrData.consigneeAddress,
          goods: lrData.goods
        }]);

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error saving to DB:", error);
      alert(`Database Error: ${error.message || 'Unknown error occurred. Please check keys.'}`);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Automatically fetch next LR on initial load if it's currently the default '0001'
    if (lrData.lrNumber === '0001' && !lrData.consignorName) {
      handleCreateNewLR();
    }
  }, []);

  const handleCreateNewLR = async () => {
    try {
      const { data, error } = await supabase
        .from('lorry_receipts')
        .select('lr_number')
        .order('created_at', { ascending: false })
        .limit(1);

      let nextLrStr = '0001';
      
      if (data && data.length > 0 && data[0].lr_number) {
        // Extract numbers from the last LR (e.g., "0014" -> 14, "LR-100" -> 100)
        const lastLrStr = data[0].lr_number;
        const match = lastLrStr.match(/(\d+)$/);
        
        if (match) {
          const numPart = match[1];
          const nextNum = parseInt(numPart, 10) + 1;
          // Pad with same number of zeros
          const paddedNextNum = String(nextNum).padStart(numPart.length, '0');
          nextLrStr = lastLrStr.slice(0, -numPart.length) + paddedNextNum;
        } else {
          nextLrStr = lastLrStr + '-1'; // Fallback if no numbers found
        }
      }

      setLrData({
        lrNumber: nextLrStr,
        date: new Date().toISOString().split('T')[0],
        invNo: '',
        from: '',
        to: '',
        consignorName: '',
        consignorAddress: '',
        consigneeName: '',
        consigneeAddress: '',
        goods: [{ id: Date.now(), packages: '', description: '', lorryNo: '', product: '', weight: '', remarks: '' }]
      });
      
    } catch (err) {
      console.error("Error fetching next LR:", err);
      // Fallback
      setLrData(prev => ({ ...prev, lrNumber: '0001' }));
    }
  };

  return (
    <div className="form-container">
      
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={handleCreateNewLR}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <FilePlus size={16} /> Auto-Fill Next LR
        </button>
      </div>

      {/* LR Details Section */}
      <div className="form-section">
        <h3>Lorry Receipt Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Bilty / LR No.</label>
            <input 
              type="text" 
              value={lrData.lrNumber} 
              onChange={(e) => updateLr('lrNumber', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              value={lrData.date} 
              onChange={(e) => updateLr('date', e.target.value)} 
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>From (Origin)</label>
            <input 
              type="text" 
              value={lrData.from} 
              onChange={(e) => updateLr('from', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>To (Destination)</label>
            <input 
              type="text" 
              value={lrData.to} 
              onChange={(e) => updateLr('to', e.target.value)} 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Inv. No.</label>
          <input 
            type="text" 
            value={lrData.invNo} 
            onChange={(e) => updateLr('invNo', e.target.value)} 
            placeholder="e.g. 26MH2700026175"
          />
        </div>
      </div>

      {/* Parties Section */}
      <div className="form-section">
        <h3>Parties Involved</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Consignor M/s. (Sender)</label>
            <input 
              type="text" 
              value={lrData.consignorName} 
              onChange={(e) => updateLr('consignorName', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Consignor Address</label>
            <textarea 
              rows="1"
              value={lrData.consignorAddress} 
              onChange={(e) => updateLr('consignorAddress', e.target.value)} 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Consignee M/s. (Receiver)</label>
            <input 
              type="text" 
              value={lrData.consigneeName} 
              onChange={(e) => updateLr('consigneeName', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Consignee Address</label>
            <textarea 
              rows="1"
              value={lrData.consigneeAddress} 
              onChange={(e) => updateLr('consigneeAddress', e.target.value)} 
            />
          </div>
        </div>
      </div>
      
      {/* Shipment Details Section */}
      <div className="form-section">
        <h3>Shipment Details (No Charges)</h3>
        <div className="items-list" style={{ overflowX: 'auto' }}>
          {lrData.goods.map((good, index) => (
            <div key={good.id} className="item-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr) auto', gap: '0.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Packages</label>
                <textarea 
                  rows="3"
                  value={good.packages} 
                  onChange={(e) => updateGood(good.id, 'packages', e.target.value)} 
                  placeholder="Drum: 388..."
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Description</label>
                <textarea 
                  rows="3"
                  value={good.description} 
                  onChange={(e) => updateGood(good.id, 'description', e.target.value)} 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Tank/Lorry No.</label>
                <input 
                  type="text" 
                  value={good.lorryNo} 
                  onChange={(e) => updateGood(good.id, 'lorryNo', e.target.value)} 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Product</label>
                <input 
                  type="text" 
                  value={good.product} 
                  onChange={(e) => updateGood(good.id, 'product', e.target.value)} 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Weight</label>
                <input 
                  type="text" 
                  value={good.weight} 
                  onChange={(e) => updateGood(good.id, 'weight', e.target.value)} 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Remarks</label>
                <textarea 
                  rows="3"
                  value={good.remarks} 
                  onChange={(e) => updateGood(good.id, 'remarks', e.target.value)} 
                />
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <button 
                  className="icon-btn" 
                  onClick={() => removeGood(good.id)}
                  disabled={lrData.goods.length === 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          <button className="btn btn-secondary w-full" onClick={addGood} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Add Goods / Package
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="form-section no-print" style={{ marginTop: '2rem' }}>
        <button 
          className="btn btn-primary w-full" 
          onClick={handleSaveToDB} 
          disabled={isSaving}
          style={{ padding: '1rem', fontSize: '1rem', backgroundColor: saveStatus === 'success' ? '#10b981' : undefined }}
        >
          {isSaving ? <Loader2 size={20} className="spin" /> : <Database size={20} />}
          {saveStatus === 'success' ? 'Saved Successfully!' : saveStatus === 'error' ? 'Error Saving to DB' : 'Save LR to Database'}
        </button>
        {saveStatus === 'error' && (
          <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>
            Check your Supabase connection and .env keys.
          </p>
        )}
      </div>

    </div>
  );
}
