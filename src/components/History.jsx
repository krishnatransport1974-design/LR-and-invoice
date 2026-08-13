import { useState, useEffect } from 'react';
import { Download, RefreshCw, FileText, Lock } from 'lucide-react';
import { supabase } from '../supabase';
import * as XLSX from 'xlsx';

export default function History({ onLoadLR }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [lrs, setLrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLRs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('lorry_receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLrs(data || []);
    } catch (err) {
      console.error("Error fetching LRs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLRs();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple client-side protection. In a real app this would be server-side.
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password');
    }
  };

  const exportToExcel = () => {
    if (lrs.length === 0) return;

    // Flatten the data for Excel
    const excelData = lrs.map(lr => {
      // Create a detailed summary of goods
      let goodsSummary = '';
      if (lr.goods) {
        const goodsArray = typeof lr.goods === 'string' ? JSON.parse(lr.goods) : lr.goods;
        goodsSummary = goodsArray.map(g => 
          `[Pkgs: ${g.packages || '-'}, Desc: ${g.description || '-'}, Lorry: ${g.lorryNo || '-'}, Prod: ${g.product || '-'}, Wt: ${g.weight || '-'}, Rem: ${g.remarks || '-'}]`
        ).join(' | ');
      }

      return {
        'Date': lr.date,
        'LR Number': lr.lr_number,
        'Inv No': lr.inv_no,
        'From': lr.from_city,
        'To': lr.to_city,
        'Consignor Name': lr.consignor_name,
        'Consignor Address': lr.consignor_address || '',
        'Consignee Name': lr.consignee_name,
        'Consignee Address': lr.consignee_address || '',
        'Goods Details': goodsSummary,
        'Created At': new Date(lr.created_at).toLocaleString()
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lorry Receipts");
    
    // Generate excel file and prompt download
    XLSX.writeFile(workbook, "LR_History.xlsx");
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem' }}>
        <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <Lock size={48} style={{ color: '#64748b', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Admin Access Only</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>Enter password to view history and export data.</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              autoFocus
            />
            {authError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{authError}</p>}
            <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.75rem' }}>
              Unlock Dashboard
            </button>
          </form>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1.5rem' }}>
            Default password is <strong>admin123</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Lorry Receipt History</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={fetchLRs} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={exportToExcel} disabled={lrs.length === 0}>
            <Download size={16} /> Export to Excel
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Make sure you have created the Supabase table and set up your .env file with the correct keys.</p>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table className="doc-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Date</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>LR No.</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>From</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>To</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Consignor</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Consignee</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading history...</td>
              </tr>
            ) : lrs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <FileText size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                  No Lorry Receipts saved yet.
                </td>
              </tr>
            ) : (
              lrs.map(lr => (
                <tr key={lr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>{lr.date}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                    <button 
                      onClick={() => onLoadLR(lr)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#3b82f6', 
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: 'bold',
                        padding: 0
                      }}
                    >
                      {lr.lr_number}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{lr.from_city}</td>
                  <td style={{ padding: '12px 16px' }}>{lr.to_city}</td>
                  <td style={{ padding: '12px 16px' }}>{lr.consignor_name}</td>
                  <td style={{ padding: '12px 16px' }}>{lr.consignee_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
