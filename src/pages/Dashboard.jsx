import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useOutletContext, Link } from 'react-router-dom';
import { Loader2, FileText, Users, Truck, DollarSign, Activity } from 'lucide-react';

export default function Dashboard() {
  const { businessData } = useOutletContext();
  const [stats, setStats] = useState({
    lrs: 0,
    invoices: 0,
    customers: 0,
    vehicles: 0,
    pendingAmount: 0,
    paidAmount: 0,
    paidCount: 0,
    pendingCount: 0
  });
  const [recentLRs, setRecentLRs] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!businessData?.id) return;
      try {
        setLoading(true);
        const [lrRes, invRes, custRes, vehRes, recentLrRes, recentInvRes] = await Promise.all([
          supabase.from('lorry_receipts').select('id', { count: 'exact' }),
          supabase.from('invoices').select('total, status'),
          supabase.from('customers').select('id', { count: 'exact' }),
          supabase.from('vehicles').select('id', { count: 'exact' }),
          supabase.from('lorry_receipts').select('id, lr_number, date, consignor_name, from_city, to_city, status').order('created_at', { ascending: false }).limit(5),
          supabase.from('invoices').select('id, invoice_number, date, client_name, total, payment_status').order('created_at', { ascending: false }).limit(5)
        ]);

        const allInvoices = invRes.data || [];
        const totalInvoices = allInvoices.length;
        
        let pendingAmount = 0;
        let paidAmount = 0;
        let pendingCount = 0;
        let paidCount = 0;
        
        allInvoices.forEach(inv => {
          if (inv.payment_status === 'Paid') {
            paidAmount += Number(inv.total);
            paidCount++;
          } else {
            pendingAmount += Number(inv.total);
            pendingCount++;
          }
        });

        setStats({
          lrs: lrRes.count || 0,
          invoices: totalInvoices,
          customers: custRes.count || 0,
          vehicles: vehRes.count || 0,
          pendingAmount,
          paidAmount,
          paidCount,
          pendingCount
        });
        
        if (recentLrRes.data) setRecentLRs(recentLrRes.data);
        if (recentInvRes.data) setRecentInvoices(recentInvRes.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [businessData]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="spin" size={32} style={{ color: 'var(--accent-primary)' }} /></div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl mb-2">Welcome back, {businessData?.name}</h2>
        <p className="text-muted">Here is an overview of your transport operations.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="btn-icon" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', width: '50px', height: '50px' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-bold text-uppercase">Total LRs</div>
            <div className="text-2xl font-bold mt-1">{stats.lrs}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="btn-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea', width: '50px', height: '50px' }}>
            <Activity size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-bold text-uppercase">Total Invoices</div>
            <div className="text-2xl font-bold mt-1">{stats.invoices}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="btn-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706', width: '50px', height: '50px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-bold text-uppercase">Total Pending ({stats.pendingCount})</div>
            <div className="text-2xl font-bold mt-1 text-amber-600">₹{stats.pendingAmount.toFixed(2)}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="btn-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a', width: '50px', height: '50px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-bold text-uppercase">Total Paid ({stats.paidCount})</div>
            <div className="text-2xl font-bold mt-1 text-emerald-600">₹{stats.paidAmount.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="btn-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', width: '50px', height: '50px' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-bold text-uppercase">Customers</div>
            <div className="text-2xl font-bold mt-1">{stats.customers}</div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="btn-icon" style={{ backgroundColor: '#ffedd5', color: '#ea580c', width: '50px', height: '50px' }}>
            <Truck size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-bold text-uppercase">Vehicles</div>
            <div className="text-2xl font-bold mt-1">{stats.vehicles}</div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 text-xl">Quick Actions</h3>
        <div className="flex gap-4 flex-wrap">
          <Link to="/lrs" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
            <FileText size={18} /> Create LR
          </Link>
          <Link to="/invoices" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
            <Activity size={18} /> Create Invoice
          </Link>
          <Link to="/customers" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
            <Users size={18} /> Add Customer
          </Link>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        
        {/* Recent LRs */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="text-lg">Recent LRs</h3>
            <Link to="/lrs" className="text-sm font-bold" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>View All</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>LR No.</th>
                <th>Date</th>
                <th>Consignor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLRs.length === 0 ? (
                <tr><td colSpan="4" className="text-center text-muted py-4">No recent LRs</td></tr>
              ) : (
                recentLRs.map(lr => (
                  <tr key={lr.id}>
                    <td className="font-bold" style={{ color: 'var(--accent-primary)' }}>{lr.lr_number}</td>
                    <td>{lr.date}</td>
                    <td>{lr.consignor_name || '-'}</td>
                    <td>
                      <span className={`badge ${lr.status === 'Billed' ? 'badge-success' : 'badge-default'}`}>
                        {lr.status || 'Booked'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Invoices */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="text-lg">Recent Invoices</h3>
            <Link to="/invoices" className="text-sm font-bold" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>View All</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Inv No.</th>
                <th>Date</th>
                <th>Client</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.length === 0 ? (
                <tr><td colSpan="5" className="text-center text-muted py-4">No recent Invoices</td></tr>
              ) : (
                recentInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-bold" style={{ color: 'var(--accent-primary)' }}>{inv.invoice_number}</td>
                    <td>{inv.date.split('-').reverse().join('/')}</td>
                    <td className="truncate max-w-[150px]">{inv.client_name || '-'}</td>
                    <td className="text-right font-bold">₹{Number(inv.total).toFixed(2)}</td>
                    <td className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inv.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {inv.payment_status || 'Unpaid'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
