import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Loader2, Plus, Search, FileText, Printer, FileDown, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import LRForm from '../components/LRForm';
import LRPreview from '../components/LRPreview';
import { useOutletContext, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

export default function LRList() {
  const [lrs, setLrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Editor State
  const [isEditing, setIsEditing] = useState(() => {
    return localStorage.getItem('lr_isEditing') === 'true';
  });
  const { businessData } = useOutletContext();
  const navigate = useNavigate();
  
  const [lrData, setLrData] = useState(() => {
    const saved = localStorage.getItem('lr_draft');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      lrNumber: '',
      date: new Date().toISOString().split('T')[0],
      invNo: '',
      from: '',
      to: '',
      consignorName: '',
      consignorAddress: '',
      consigneeName: '',
      consigneeAddress: '',
      goods: [{ id: Date.now(), packages: '', description: '', lorryNo: '', product: '', weight: '', remarks: '' }]
    };
  });

  useEffect(() => {
    localStorage.setItem('lr_isEditing', isEditing);
    if (isEditing) {
      localStorage.setItem('lr_draft', JSON.stringify(lrData));
    }
  }, [isEditing, lrData]);

  const fetchLRs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lorry_receipts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setLrs(data || []);
    } catch (err) {
      toast.error('Failed to load Lorry Receipts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEditing) fetchLRs();
  }, [isEditing]);

  const handleCreateNew = () => {
    // Generate next LR number based on history
    let nextLrStr = 'LR-0001';
    if (lrs.length > 0 && lrs[0].lr_number) {
      const match = lrs[0].lr_number.match(/(\d+)$/);
      if (match) {
        const numPart = match[1];
        const nextNum = parseInt(numPart, 10) + 1;
        nextLrStr = lrs[0].lr_number.slice(0, -numPart.length) + String(nextNum).padStart(numPart.length, '0');
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
      customer_id: null,
      vehicle_id: null,
      goods: [{ id: Date.now(), packages: '', description: '', lorryNo: '', product: '', weight: '', remarks: '' }]
    });
    setIsEditing(true);
  };

  const handleView = (lr) => {
    setLrData({
      id: lr.id,
      lrNumber: lr.lr_number,
      date: lr.date,
      invNo: lr.inv_no,
      from: lr.from_city,
      to: lr.to_city,
      consignorName: lr.consignor_name,
      consignorAddress: lr.consignor_address,
      consigneeName: lr.consignee_name,
      consigneeAddress: lr.consignee_address,
      customer_id: lr.customer_id,
      vehicle_id: lr.vehicle_id,
      goods: typeof lr.goods === 'string' ? JSON.parse(lr.goods) : lr.goods
    });
    setIsEditing(true);
  };

  const generatePDF = () => {
    const element = document.getElementById('lr-preview-content');
    if (!element) return;
    const opt = {
      margin:       0.5,
      filename:     `LR_${lrData.lrNumber}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
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

  const filteredLRs = lrs.filter(lr => 
    lr.lr_number.toLowerCase().includes(search.toLowerCase()) || 
    (lr.consignor_name && lr.consignor_name.toLowerCase().includes(search.toLowerCase())) ||
    (lr.consignee_name && lr.consignee_name.toLowerCase().includes(search.toLowerCase()))
  );

  if (isEditing) {
    return (
      <div className="flex flex-col h-full" style={{ margin: '-2rem' }}>
        {/* Editor Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10 shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-4">
            <button className="btn btn-secondary" onClick={() => {
              setIsEditing(false);
              localStorage.removeItem('lr_draft');
              localStorage.removeItem('lr_isEditing');
            }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="text-lg">LR Editor: {lrData.lrNumber}</h2>
          </div>
          <div className="flex items-center gap-2">
            {lrData.id && (
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/invoices', { state: { sourceLr: lrData } })}
                style={{ color: 'var(--success)' }}
              >
                <FileText size={16} /> Generate Invoice
              </button>
            )}
            <button className="btn btn-primary" onClick={generatePDF}>
              <FileDown size={16} /> Download PDF
            </button>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Editor Workspace */}
        <div className="flex flex-1 overflow-hidden bg-gray-50" style={{ height: 'calc(100vh - 128px)' }}>
          <div className="flex-1 overflow-y-auto p-4 border-r" style={{ borderColor: 'var(--border-color)', backgroundColor: 'white' }}>
            <LRForm lrData={lrData} setLrData={setLrData} />
          </div>
          <div className="flex-1 overflow-y-auto p-8 bg-gray-100 flex justify-center no-print">
            <div id="lr-preview-content" style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', padding: '20mm', boxShadow: 'var(--shadow-md)' }}>
              <LRPreview businessData={businessData} lrData={lrData} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2>Lorry Receipts</h2>
        <button className="btn btn-primary" onClick={handleCreateNew}>
          <Plus size={16} /> Create LR
        </button>
      </div>

      <div className="card">
        <div className="form-group" style={{ maxWidth: '300px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by LR number, consignor..." 
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
                  <th>LR No.</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Consignor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLRs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-6">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={32} style={{ opacity: 0.5 }} />
                        No Lorry Receipts found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLRs.map(lr => (
                    <tr key={lr.id}>
                      <td>{lr.date}</td>
                      <td className="font-bold text-blue-600" style={{ color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => handleView(lr)}>
                        {lr.lr_number}
                      </td>
                      <td>{lr.from_city}</td>
                      <td>{lr.to_city}</td>
                      <td>{lr.consignor_name}</td>
                      <td>
                        <span className={`badge ${lr.status === 'Billed' ? 'badge-success' : 'badge-default'}`}>
                          {lr.status || 'Booked'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon" onClick={() => handleView(lr)}>
                          <FileText size={16} />
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
    </div>
  );
}
