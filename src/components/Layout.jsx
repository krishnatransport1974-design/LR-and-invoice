import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Truck, FileText, Users, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

export default function Layout({ businessData, setBusinessData }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      setBusinessData(null);
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar no-print">
        <div className="sidebar-header">
          <div className="btn-icon" style={{ backgroundColor: 'var(--accent-primary)', color: 'white', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Truck size={24} />
          </div>
          <div>
            <h2 className="text-lg" style={{ color: 'white', lineHeight: '1' }}>DocuGen</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pro Transporter</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/lrs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Truck size={18} /> Lorry Receipts
          </NavLink>
          <NavLink to="/invoices" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={18} /> Invoices
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={18} /> Customers
          </NavLink>
          <NavLink to="/vehicles" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Truck size={18} /> Vehicles
          </NavLink>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={18} /> Settings
          </NavLink>
          <button onClick={handleLogout} className="nav-item w-full" style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: '0.25rem' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="top-header no-print">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {businessData?.name || 'Company Name'}
          </h2>
          <div className="flex items-center gap-4">
            {businessData?.logo && (
              <img src={businessData.logo} alt="Logo" style={{ height: '32px', borderRadius: '4px' }} />
            )}
            <div style={{ textAlign: 'right' }}>
              <div className="font-bold text-sm">{businessData?.name || 'Admin'}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Administrator</div>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet context={{ businessData }} />
        </main>
      </div>
    </div>
  );
}
