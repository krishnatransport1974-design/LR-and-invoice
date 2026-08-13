import { Plus, Trash2 } from 'lucide-react';

export default function InvoiceForm({ invoiceData, setInvoiceData }) {
  const updateInvoice = (field, value) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), description: '', quantity: 1, price: 0 }
      ]
    }));
  };

  const updateItem = (id, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
      )
    }));
  };

  const removeItem = (id) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  return (
    <div className="form-container">

      {/* Invoice Details Section */}
      <div className="form-section">
        <h3>Invoice Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Invoice Number</label>
            <input 
              type="text" 
              value={invoiceData.invoiceNumber} 
              onChange={(e) => updateInvoice('invoiceNumber', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              value={invoiceData.date} 
              onChange={(e) => updateInvoice('date', e.target.value)} 
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Client Name</label>
          <input 
            type="text" 
            value={invoiceData.clientName} 
            onChange={(e) => updateInvoice('clientName', e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Client Address</label>
          <textarea 
            rows="2" 
            value={invoiceData.clientAddress} 
            onChange={(e) => updateInvoice('clientAddress', e.target.value)} 
          />
        </div>
      </div>

      {/* Line Items Section */}
      <div className="form-section">
        <h3>Line Items</h3>
        <div className="items-list">
          {invoiceData.items.map((item, index) => (
            <div key={item.id} className="item-row">
              <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                <label>Description</label>
                <input 
                  type="text" 
                  value={item.description} 
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)} 
                  placeholder="Item description"
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Qty</label>
                <input 
                  type="number" 
                  min="1"
                  value={item.quantity} 
                  onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} 
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Price</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={item.price} 
                  onChange={(e) => updateItem(item.id, 'price', e.target.value)} 
                />
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <button 
                  className="icon-btn" 
                  onClick={() => removeItem(item.id)}
                  disabled={invoiceData.items.length === 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          <button className="btn btn-secondary w-full" onClick={addItem} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Add Item
          </button>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Tax Rate (%)</label>
            <input 
              type="number" 
              min="0"
              value={invoiceData.taxRate} 
              onChange={(e) => updateInvoice('taxRate', Number(e.target.value))} 
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Notes / Terms</label>
          <textarea 
            rows="2" 
            value={invoiceData.notes} 
            onChange={(e) => updateInvoice('notes', e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
}
