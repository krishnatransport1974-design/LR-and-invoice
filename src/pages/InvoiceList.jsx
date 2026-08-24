import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Loader2, Plus, Search, FileText, Printer, FileDown, ArrowLeft, Database, Copy, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePreview from '../components/InvoicePreview';
import { useOutletContext, useLocation } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { calculateInvoiceTotals } from '../utils/invoiceCalculations';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Editor State
  const [isEditing, setIsEditing] = useState(() => {
    return localStorage.getItem('inv_isEditing') === 'true';
  });
  const [isSaving, setIsSaving] = useState(false);
  const { businessData } = useOutletContext();
  const location = useLocation();
  
  const [invoiceData, setInvoiceData] = useState(() => {
    const saved = localStorage.getItem('inv_draft');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      customer_id: null,
      clientName: '',
      clientAddress: '',
      items: [{ id: Date.now(), description: '', hsn_sac: '', quantity: 1, unit: 'PCS', price: 0, discount: 0, tax_rate: businessData?.default_tax || 0 }],
      global_discount: 0,
      taxRate: businessData?.default_tax || 0,
      includeTax: true,
      notes: '',
      terms: businessData?.default_payment_terms || '',
      lr_id: null,
      payment_status: 'Unpaid',
      payment_mode: '',
      invoice_type: 'Standard Invoice'
    };
  });

  useEffect(() => {
    localStorage.setItem('inv_isEditing', isEditing);
    if (isEditing) {
      localStorage.setItem('inv_draft', JSON.stringify(invoiceData));
    }
  }, [isEditing, invoiceData]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      toast.error('Failed to load Invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEditing) fetchInvoices();
  }, [isEditing]);

  useEffect(() => {
    if (location.state?.sourceLr) {
      const lr = location.state.sourceLr;
      setInvoiceData({
        invoiceNumber: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        customer_id: lr.customer_id,
        clientName: lr.consignorName || lr.consigneeName || '',
        clientAddress: lr.consignorAddress || lr.consigneeAddress || '',
        items: [{ 
          id: Date.now(), 
          description: `Freight Charges for LR No. ${lr.lrNumber} from ${lr.from} to ${lr.to}`, 
          quantity: 1, 
          price: lr.freight || 0,
          unit: 'trip',
          discount: 0,
          tax_rate: businessData?.default_tax || 0
        }],
        global_discount: 0,
        taxRate: businessData?.default_tax || 0,
        includeTax: true,
        notes: `Reference LR: ${lr.lrNumber}`,
        terms: businessData?.default_payment_terms || '',
        lr_id: lr.id,
        payment_status: 'Unpaid',
        payment_mode: '',
        invoice_type: 'Standard Invoice'
      });
      setIsEditing(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCreateNew = () => {
    setInvoiceData({
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      customer_id: null,
      clientName: '',
      clientAddress: '',
      items: [{ id: Date.now(), description: '', hsn_sac: '', quantity: 1, unit: 'PCS', price: 0, discount: 0, tax_rate: businessData?.default_tax || 0 }],
      global_discount: 0,
      taxRate: businessData?.default_tax || 0,
      includeTax: true,
      notes: '',
      terms: businessData?.default_payment_terms || '',
      lr_id: null,
      payment_status: 'Unpaid',
      payment_mode: '',
      invoice_type: 'Standard Invoice'
    });
    setIsEditing(true);
  };

  const handleDuplicate = (inv) => {
    setInvoiceData({
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      customer_id: inv.customer_id,
      clientName: inv.client_name,
      clientAddress: inv.client_address,
      items: typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items,
      global_discount: inv.discount || 0,
      taxRate: inv.tax_rate,
      includeTax: true,
      notes: inv.notes || '',
      terms: inv.terms || '',
      lr_id: null,
      payment_status: 'Unpaid',
      payment_mode: '',
      invoice_type: inv.invoice_type || 'Standard Invoice'
    });
    setIsEditing(true);
  };

  const handleView = (inv) => {
    setInvoiceData({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      date: inv.date,
      dueDate: inv.due_date || '',
      customer_id: inv.customer_id,
      clientName: inv.client_name,
      clientAddress: inv.client_address,
      items: typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items,
      global_discount: inv.discount || 0,
      taxRate: inv.tax_rate,
      includeTax: true,
      notes: inv.notes || '',
      terms: inv.terms || '',
      lr_id: inv.lr_id,
      payment_status: inv.payment_status || 'Unpaid',
      payment_mode: inv.payment_mode || '',
      invoice_type: inv.invoice_type || 'Standard Invoice'
    });
    setIsEditing(true);
  };

  const generatePDF = () => {
    const element = document.getElementById('invoice-preview-content');
    if (!element) return;
    const opt = {
      margin:       0,
      filename:     `Invoice_${invoiceData.invoiceNumber}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: 'css', before: '.page-break' }
    };
    toast.promise(
      html2pdf().set(opt).from(element).save(),
      {
        loading: 'Generating PDF...',
        success: 'PDF downloaded!',
        error: 'Failed to generate PDF',
      }
    );
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) || 
    (inv.client_name && inv.client_name.toLowerCase().includes(search.toLowerCase()))
  );

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      // 260px main sidebar + 420px form sidebar + 64px padding (p-8 is 2rem = 32px each side)
      const availableWidth = window.innerWidth - 260 - 420 - 64; 
      if (availableWidth > 0) {
        // 794px is the base width of A4 Portrait. Subtract 20px for visual padding.
        const newScale = Math.max((availableWidth - 20) / 794, 0.1);
        setScale(Math.min(newScale, 2.0)); 
      }
    };
    
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const handleSaveToDB = async () => {
    if (!businessData?.id) {
      toast.error('Company ID not found');
      return;
    }
    
    setIsSaving(true);
    try {
      const totals = calculateInvoiceTotals(
        invoiceData.items,
        invoiceData.global_discount,
        invoiceData.taxRate,
        invoiceData.includeTax !== false
      );

      const payload = {
        company_id: businessData.id,
        invoice_number: invoiceData.invoiceNumber,
        date: invoiceData.date,
        due_date: invoiceData.dueDate || null,
        customer_id: invoiceData.customer_id,
        client_name: invoiceData.clientName,
        client_address: invoiceData.clientAddress,
        subtotal: totals.subtotal,
        discount: totals.discount,
        taxable_amount: totals.taxableAmount,
        tax_rate: invoiceData.taxRate,
        tax_amount: totals.taxAmount,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        round_off: totals.roundOff,
        total: totals.grandTotal,
        payment_status: invoiceData.payment_status || 'Unpaid',
        payment_mode: invoiceData.payment_mode || null,
        invoice_type: invoiceData.invoice_type || 'Standard Invoice',
        notes: invoiceData.notes,
        terms: invoiceData.terms,
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
      fetchInvoices();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        {/* Editor Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10 shadow-sm no-print" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-4">
            <button className="btn btn-secondary" onClick={() => {
              setIsEditing(false);
              localStorage.removeItem('inv_draft');
              localStorage.removeItem('inv_isEditing');
            }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="text-lg">Invoice Editor: {invoiceData.invoiceNumber} <span style={{fontSize: '0.7rem', color: 'var(--success)', marginLeft: '10px', fontWeight: 'normal'}}>✓ Draft Auto-Saved</span></h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-success shrink-0 whitespace-nowrap shadow-sm" 
              onClick={handleSaveToDB}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={16} className="spin" /> : <Database size={16} />}
              Save Invoice
            </button>
            <button 
              className="btn btn-primary shrink-0 whitespace-nowrap shadow-sm" 
              onClick={generatePDF}
            >
              <FileDown size={16} /> Download PDF
            </button>
            <button 
              className="btn btn-secondary shrink-0 whitespace-nowrap shadow-sm" 
              onClick={() => window.print()}
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Editor Workspace */}
        <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 73px)', backgroundColor: '#e2e8f0' }}>
          <div className="overflow-y-auto p-6 border-r z-10 no-print" style={{ width: '420px', flexShrink: 0, borderColor: 'var(--border-color)', backgroundColor: 'white', boxShadow: '4px 0 15px -3px rgb(0 0 0 / 0.1)' }}>
            <InvoiceForm invoiceData={invoiceData} setInvoiceData={setInvoiceData} />
          </div>
          <div 
            className="flex-1 overflow-auto bg-slate-200 flex p-8 print-container" 
            style={{ minWidth: 0 }}
          >
            <div style={{ margin: 'auto', width: `${794 * scale}px`, height: `${1123 * scale}px`, position: 'relative', flexShrink: 0 }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: '794px', height: '1123px', position: 'absolute', top: 0, left: 0 }}>
                <div id="invoice-preview-content" style={{ width: '794px', minWidth: '794px', minHeight: '1123px', backgroundColor: 'white', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <InvoicePreview businessData={businessData} invoiceData={invoiceData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2>Invoices</h2>
        <button className="btn btn-primary" onClick={handleCreateNew}>
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      <div className="card">
        <div className="form-group" style={{ maxWidth: '300px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by Invoice number, client..." 
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
                  <th>Date</th>
                  <th>Invoice No.</th>
                  <th>Client</th>
                  <th>Subtotal</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Origin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-6">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={32} style={{ opacity: 0.5 }} />
                        No Invoices found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => (
                    <tr key={inv.id}>
                      <td>{inv.date.split('-').reverse().join('/')}</td>
                      <td className="font-bold text-blue-600" style={{ color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => handleView(inv)}>
                        {inv.invoice_number}
                      </td>
                      <td className="truncate max-w-[200px]">{inv.client_name}</td>
                      <td>₹{Number(inv.subtotal).toFixed(2)}</td>
                      <td className="font-bold">₹{Number(inv.total).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                          {inv.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          inv.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          inv.payment_status === 'Partially Paid' ? 'bg-amber-100 text-amber-800' :
                          inv.payment_status === 'Overdue' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {inv.payment_status || 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        {inv.lr_id ? (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200">From LR</span>
                        ) : (
                          <span className="text-xs text-slate-500">Standalone</span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-icon" onClick={() => handleView(inv)} title="Edit">
                            <FileText size={16} />
                          </button>
                          <button className="btn-icon text-blue-600" onClick={() => handleDuplicate(inv)} title="Duplicate">
                            <Plus size={16} />
                          </button>
                          <button className="btn-icon text-red-500" onClick={() => {
                            if(window.confirm('Delete this invoice?')) {
                              supabase.from('invoices').delete().eq('id', inv.id).then(() => fetchInvoices());
                            }
                          }} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
