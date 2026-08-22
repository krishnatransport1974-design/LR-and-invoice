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
    pendingAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!businessData?.id) return;
      try {
        setLoading(true);
        const [lrRes, invRes, custRes, vehRes] = await Promise.all([
          supabase.from('lorry_receipts').select('id', { count: 'exact' }),
          supabase.from('invoices').select('total, status'),
          supabase.from('customers').select('id', { count: 'exact' }),
          supabase.from('vehicles').select('id', { count: 'exact' })
        ]);

        const totalInvoices = invRes.data?.length || 0;
        const pendingAmount = invRes.data?.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + Number(i.total), 0) || 0;

        setStats({
          lrs: lrRes.count || 0,
          invoices: totalInvoices,
          customers: custRes.count || 0,
          vehicles: vehRes.count || 0,
          pendingAmount
        });
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
          <div className="btn-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444', width: '50px', height: '50px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-bold text-uppercase">Pending Payments</div>
            <div className="text-2xl font-bold mt-1 text-danger">₹{stats.pendingAmount.toFixed(2)}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="btn-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a', width: '50px', height: '50px' }}>
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
        <h3 className="mb-4">Quick Actions</h3>
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
    </div>
  );
}
