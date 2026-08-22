import { Plus, Trash2, Database, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';

export default function InvoiceForm({ invoiceData, setInvoiceData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [lrs, setLrs] = useState([]);
  const { businessData } = useOutletContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, lrRes] = await Promise.all([
          supabase.from('customers').select('id, name, address, company_name'),
          supabase.from('lorry_receipts').select('id, lr_number, date, customer_id, from_city, to_city, goods, consignor_name, consignor_address')
            .is('status', null) // We can filter for non-invoiced LRs if needed
        ]);
        if (custRes.data) setCustomers(custRes.data);
        if (lrRes.data) setLrs(lrRes.data);
      } catch (err) {
        console.error("Error fetching dependencies", err);
      }
    };
    fetchData();
  }, []);

  const updateInvoice = (field, value) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), description: '', quantity: 1, price: 0 }]
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

  const handleCustomerChange = (e) => {
    const id = e.target.value;
    updateInvoice('customer_id', id);
    const customer = customers.find(c => c.id === id);
    if (customer) {
      updateInvoice('clientName', customer.company_name || customer.name);
      updateInvoice('clientAddress', customer.address || '');
    }
  };

  const handleLRChange = (e) => {
    const id = e.target.value;
    updateInvoice('lr_id', id);
    const lr = lrs.find(l => l.id === id);
    if (lr) {
      // Auto-fill from LR
      updateInvoice('clientName', lr.consignor_name || '');
      updateInvoice('clientAddress', lr.consignor_address || '');
      updateInvoice('customer_id', lr.customer_id || '');
      
      let newItems = [];
      const goodsArray = typeof lr.goods === 'string' ? JSON.parse(lr.goods) : lr.goods;
      
      if (goodsArray && goodsArray.length > 0) {
        newItems = goodsArray.map((g, idx) => ({
          id: Date.now() + idx,
          description: `Freight for ${g.product || 'Goods'} (${lr.from_city} to ${lr.to_city}) - LR: ${lr.lr_number}`,
          quantity: g.weight ? Number(g.weight) : 1,
          price: 0 // User must input price
        }));
      } else {
        newItems = [{
          id: Date.now(),
          description: `Freight Charges - LR: ${lr.lr_number}`,
          quantity: 1,
          price: 0
        }];
      }
      updateInvoice('items', newItems);
    }
  };

  const handleSaveToDB = async () => {
    if (!businessData?.id) {
      toast.error('Company ID not found');
      return;
    }
    
    setIsSaving(true);
    try {
      // Calculate totals
      const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const tax_amount = subtotal * (invoiceData.taxRate / 100);
      const total = subtotal + tax_amount;

      const payload = {
        company_id: businessData.id,
        invoice_number: invoiceData.invoiceNumber,
        date: invoiceData.date,
        due_date: invoiceData.dueDate || null,
        customer_id: invoiceData.customer_id,
        client_name: invoiceData.clientName,
        client_address: invoiceData.clientAddress,
        subtotal: subtotal,
        tax_rate: invoiceData.taxRate,
        tax_amount: tax_amount,
        total: total,
        notes: invoiceData.notes,
        status: invoiceData.status || 'Pending',
        items: invoiceData.items,
        lr_id: invoiceData.lr_id || null
      };

      const { data: existing } = await supabase.from('invoices').select('id').eq('invoice_number', invoiceData.invoiceNumber).eq('company_id', businessData.id).single();
      
      let error;
      if (existing) {
        const res = await supabase.from('invoices').update(payload).eq('id', existing.id);
        error = res.error;
      } else {
        const res = await supabase.from('invoices').insert([payload]);
        error = res.error;
      }

      if (error) throw error;
      
      // Update LR status if an LR was linked
      if (invoiceData.lr_id) {
        await supabase.from('lorry_receipts').update({ status: 'Billed' }).eq('id', invoiceData.lr_id);
      }

      toast.success('Invoice Saved Successfully!');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Import from LR */}
      <div className="form-section bg-blue-50 border-blue-200" style={{ backgroundColor: 'var(--accent-light)', borderColor: '#bfdbfe', borderWidth: '1px', borderStyle: 'solid', borderRadius: 'var(--radius-lg)' }}>
        <h3 className="mb-4" style={{ color: 'var(--accent-hover)' }}>Generate from existing LR (Optional)</h3>
        <div className="form-group mb-0">
          <select value={invoiceData.lr_id || ''} onChange={handleLRChange}>
            <option value="">-- Select a Lorry Receipt --</option>
            {lrs.map(lr => (
              <option key={lr.id} value={lr.id}>
                {lr.lr_number} - {lr.consignor_name} ({lr.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <h3 className="mb-4">Invoice Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Invoice Number</label>
            <input type="text" value={invoiceData.invoiceNumber} onChange={(e) => updateInvoice('invoiceNumber', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={invoiceData.date} onChange={(e) => updateInvoice('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={invoiceData.dueDate || ''} onChange={(e) => updateInvoice('dueDate', e.target.value)} />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Select Customer</label>
            <select value={invoiceData.customer_id || ''} onChange={handleCustomerChange}>
              <option value="">-- Select Customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.company_name ? `(${c.company_name})` : ''}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Billing Name</label>
          <input type="text" value={invoiceData.clientName} onChange={(e) => updateInvoice('clientName', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Billing Address</label>
          <textarea rows="2" value={invoiceData.clientAddress} onChange={(e) => updateInvoice('clientAddress', e.target.value)} />
        </div>
      </div>

      <div className="form-section">
        <h3 className="mb-4">Line Items</h3>
        <div className="flex flex-col gap-4">
          {invoiceData.items.map((item) => (
            <div key={item.id} className="grid" style={{ gridTemplateColumns: '3fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
              <div className="form-group mb-0">
                <label>Description</label>
                <input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
              </div>
              <div className="form-group mb-0">
                <label>Qty / Weight</label>
                <input type="number" min="1" step="any" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} />
              </div>
              <div className="form-group mb-0">
                <label>Rate (₹)</label>
                <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(item.id, 'price', e.target.value)} />
              </div>
              <button className="btn-icon mb-2" onClick={() => removeItem(item.id)} disabled={invoiceData.items.length === 1}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={addItem}>
            <Plus size={16} /> Add Item
          </button>
        </div>
        
        <div className="form-row mt-6">
          <div className="form-group" style={{ maxWidth: '200px' }}>
            <label>Tax Rate (%)</label>
            <input type="number" min="0" value={invoiceData.taxRate} onChange={(e) => updateInvoice('taxRate', Number(e.target.value))} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Notes / Terms</label>
            <textarea rows="2" value={invoiceData.notes} onChange={(e) => updateInvoice('notes', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="form-section no-print mt-4 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
        <button className="btn btn-primary w-full" onClick={handleSaveToDB} disabled={isSaving}>
          {isSaving ? <Loader2 size={20} className="spin" /> : <Database size={20} />}
          Save Invoice to Database
        </button>
      </div>
    </div>
  );
}
