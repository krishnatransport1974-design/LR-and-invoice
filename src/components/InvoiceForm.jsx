import { Plus, Trash2, Link as LinkIcon, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useOutletContext } from 'react-router-dom';
import { calculateInvoiceTotals } from '../utils/invoiceCalculations';

export default function InvoiceForm({ invoiceData, setInvoiceData }) {
  const [customers, setCustomers] = useState([]);
  const [lrs, setLrs] = useState([]);
  const [products, setProducts] = useState([]);
  const [showLRImport, setShowLRImport] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    billing: true,
    items: true,
    payment: true,
    notes: true
  });
  const { businessData } = useOutletContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, lrRes, prodRes] = await Promise.all([
          supabase.from('customers').select('id, name, address, company_name'),
          supabase.from('lorry_receipts').select('id, lr_number, date, customer_id, from_city, to_city, goods, consignor_name, consignor_address')
            .is('status', null),
          supabase.from('products').select('*')
        ]);
        if (custRes.data) setCustomers(custRes.data);
        if (lrRes.data) setLrs(lrRes.data);
        if (prodRes.data) setProducts(prodRes.data);
      } catch (err) {
        console.error("Error fetching dependencies", err);
      }
    };
    fetchData();
  }, []);

  const updateInvoice = (field, value) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: Date.now(), 
        description: '', 
        hsn_sac: '',
        quantity: 1, 
        unit: 'PCS',
        price: 0,
        discount: 0,
        tax_rate: businessData?.default_tax || 0
      }]
    }));
  };

  const updateItem = (id, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          return { ...item, [field]: ['description', 'hsn_sac', 'unit'].includes(field) ? value : Number(value) };
        }
        return item;
      })
    }));
  };

  const applyProductToItem = (id, productId) => {
    if (!productId) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          return {
            ...item,
            description: product.name + (product.description ? ` - ${product.description}` : ''),
            hsn_sac: product.hsn_sac || '',
            unit: product.unit || 'PCS',
            price: product.default_rate || 0,
            tax_rate: product.tax_rate || businessData?.default_tax || 0
          };
        }
        return item;
      })
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
      updateInvoice('clientName', lr.consignor_name || '');
      updateInvoice('clientAddress', lr.consignor_address || '');
      updateInvoice('customer_id', lr.customer_id || '');
      
      let newItems = [];
      const goodsArray = typeof lr.goods === 'string' ? JSON.parse(lr.goods) : lr.goods;
      
      if (goodsArray && goodsArray.length > 0) {
        newItems = goodsArray.map((g, idx) => ({
          id: Date.now() + idx,
          description: `Freight for ${g.product || 'Goods'} (${lr.from_city} to ${lr.to_city}) - LR: ${lr.lr_number}`,
          hsn_sac: '996511', // default SAC for freight
          quantity: g.weight ? Number(g.weight) : 1,
          unit: 'KG',
          price: 0,
          discount: 0,
          tax_rate: businessData?.default_tax || 0
        }));
      } else {
        newItems = [{
          id: Date.now(),
          description: `Freight Charges - LR: ${lr.lr_number}`,
          hsn_sac: '996511',
          quantity: 1,
          unit: 'TRIP',
          price: 0,
          discount: 0,
          tax_rate: businessData?.default_tax || 0
        }];
      }
      updateInvoice('items', newItems);
      setShowLRImport(false);
    }
  };

  const SectionHeader = ({ title, section }) => (
    <div 
      className="flex justify-between items-center mb-4 pb-2 border-b cursor-pointer hover:bg-slate-50 transition-colors" 
      style={{ borderColor: 'var(--border-color)', marginTop: '20px' }}
      onClick={() => toggleSection(section)}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</div>
      <button className="text-slate-400">
        {expandedSections[section] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      
      <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-3 rounded-lg mb-2">
        <div className="text-sm text-blue-800 font-medium">Standalone Invoice Mode</div>
        <button 
          className={`text-xs flex items-center gap-1 font-medium transition-colors px-3 py-1.5 rounded-md ${invoiceData.lr_id ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-100'}`}
          onClick={() => setShowLRImport(!showLRImport)}
        >
          {invoiceData.lr_id ? <><LinkIcon size={14} /> LR Linked</> : <><LinkIcon size={14} /> Import from LR (Optional)</>}
        </button>
      </div>

      {showLRImport && (
        <div className="mb-4 p-4 bg-white border border-blue-200 rounded-md shadow-sm relative">
          <button 
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
            onClick={() => setShowLRImport(false)}
          >
            <X size={16} />
          </button>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Select Lorry Receipt to Auto-fill Invoice</label>
          <select 
            value={invoiceData.lr_id || ''} 
            onChange={handleLRChange}
            className="w-full text-sm"
          >
            <option value="">-- No LR Linked --</option>
            {lrs.map(lr => (
              <option key={lr.id} value={lr.id}>
                {lr.lr_number} - {lr.consignor_name} ({lr.date})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Invoice Details Section */}
      <SectionHeader title="Invoice Details" section="details" />
      {expandedSections.details && (
        <div className="form-section pt-0">
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
            <div className="form-group">
              <label>Invoice Type</label>
              <select value={invoiceData.invoice_type || 'Standard Invoice'} onChange={(e) => updateInvoice('invoice_type', e.target.value)}>
                <option value="Standard Invoice">Standard Invoice</option>
                <option value="Tax Invoice">Tax Invoice</option>
                <option value="Proforma Invoice">Proforma Invoice</option>
                <option value="Bill of Supply">Bill of Supply</option>
              </select>
            </div>
            <div className="form-group flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={invoiceData.includeTax !== false} 
                  onChange={(e) => updateInvoice('includeTax', e.target.checked)}
                  style={{ width: 'auto' }}
                />
                Enable Tax Calculations (GST)
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Billing Section */}
      <SectionHeader title="Bill To" section="billing" />
      {expandedSections.billing && (
        <div className="form-section pt-0">
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Select Customer Profile (Optional)</label>
              <select value={invoiceData.customer_id || ''} onChange={handleCustomerChange}>
                <option value="">-- Manual Entry --</option>
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
      )}

      {/* Line Items Section */}
      <SectionHeader title="Line Items" section="items" />
      {expandedSections.items && (
        <div className="form-section pt-0">
          <div className="flex flex-col gap-4">
            {invoiceData.items.map((item, index) => (
              <div key={item.id} className="card-sm relative border border-slate-200" style={{ padding: '1rem', backgroundColor: '#fcfcfc' }}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">ITEM {index + 1}</span>
                  <div className="flex items-center gap-3">
                    <select 
                      className="text-xs py-1"
                      onChange={(e) => applyProductToItem(item.id, e.target.value)}
                      value=""
                    >
                      <option value="">+ Load from Inventory</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button className="text-red-500 hover:text-red-700" onClick={() => removeItem(item.id)} disabled={invoiceData.items.length === 1}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="form-group mb-3">
                  <label className="text-xs">Description</label>
                  <input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Product or service description" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="form-group mb-0">
                    <label className="text-xs">HSN/SAC</label>
                    <input type="text" value={item.hsn_sac || ''} onChange={(e) => updateItem(item.id, 'hsn_sac', e.target.value)} />
                  </div>
                  <div className="form-group mb-0">
                    <label className="text-xs">Quantity</label>
                    <input type="number" min="0" step="any" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} />
                  </div>
                  <div className="form-group mb-0">
                    <label className="text-xs">Unit</label>
                    <input type="text" className="uppercase" value={item.unit || ''} onChange={(e) => updateItem(item.id, 'unit', e.target.value.toUpperCase())} />
                  </div>
                  <div className="form-group mb-0">
                    <label className="text-xs">Rate (₹)</label>
                    <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(item.id, 'price', e.target.value)} />
                  </div>
                  <div className="form-group mb-0">
                    <label className="text-xs">Discount (₹)</label>
                    <input type="number" min="0" step="0.01" value={item.discount || 0} onChange={(e) => updateItem(item.id, 'discount', e.target.value)} />
                  </div>
                  <div className="form-group mb-0">
                    <label className="text-xs">Tax Rate (%)</label>
                    <input type="number" min="0" step="any" value={item.tax_rate !== undefined ? item.tax_rate : (businessData?.default_tax || 0)} onChange={(e) => updateItem(item.id, 'tax_rate', e.target.value)} disabled={invoiceData.includeTax === false} />
                  </div>
                  <div className="form-group mb-0 col-span-2 md:col-span-2 bg-slate-50 p-2 rounded border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Item Total (Net):</span>
                    <span className="font-bold text-slate-800">
                      ₹{(((Number(item.quantity) || 0) * (Number(item.price) || 0)) - (Number(item.discount) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary border-dashed border-2" onClick={addItem}>
              <Plus size={16} /> Add New Row
            </button>
          </div>
        </div>
      )}

      {/* Payment & Totals Section */}
      <SectionHeader title="Payment & Discounts" section="payment" />
      {expandedSections.payment && (
        <div className="form-section pt-0">
          <div className="form-row">
            <div className="form-group">
              <label>Payment Status</label>
              <select value={invoiceData.payment_status || 'Unpaid'} onChange={(e) => updateInvoice('payment_status', e.target.value)}>
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Mode</label>
              <select value={invoiceData.payment_mode || ''} onChange={(e) => updateInvoice('payment_mode', e.target.value)}>
                <option value="">-- None --</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Global Discount (₹)</label>
              <input type="number" min="0" step="0.01" value={invoiceData.global_discount || 0} onChange={(e) => updateInvoice('global_discount', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Global Tax Rate (%) - Applies to all if no item tax</label>
              <input type="number" min="0" value={invoiceData.taxRate} onChange={(e) => updateInvoice('taxRate', Number(e.target.value))} disabled={invoiceData.includeTax === false} />
            </div>
          </div>
        </div>
      )}

      {/* Notes & Terms Section */}
      <SectionHeader title="Notes & Terms" section="notes" />
      {expandedSections.notes && (
        <div className="form-section pt-0">
          <div className="form-group">
            <label>Notes (Thank you message)</label>
            <textarea rows="2" value={invoiceData.notes} onChange={(e) => updateInvoice('notes', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Terms & Conditions</label>
            <textarea rows="3" value={invoiceData.terms || ''} onChange={(e) => updateInvoice('terms', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}
