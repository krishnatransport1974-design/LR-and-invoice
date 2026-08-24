import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, X, Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Products() {
  const { businessData } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    sku: '',
    hsn_sac: '',
    unit: 'PCS',
    default_rate: 0,
    tax_rate: 0,
    description: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [businessData]);

  const fetchProducts = async () => {
    if (!businessData?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast.error('Error loading products');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        id: null,
        name: '',
        sku: '',
        hsn_sac: '',
        unit: 'PCS',
        default_rate: 0,
        tax_rate: 0,
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, name: '', sku: '', hsn_sac: '', unit: 'PCS', default_rate: 0, tax_rate: 0, description: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Product name is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        company_id: businessData.id,
        name: formData.name,
        sku: formData.sku,
        hsn_sac: formData.hsn_sac,
        unit: formData.unit,
        default_rate: formData.default_rate,
        tax_rate: formData.tax_rate,
        description: formData.description
      };

      if (formData.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', formData.id);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        toast.success('Product created');
      }
      
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      toast.error('Error saving product');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Error deleting product');
      console.error(error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-content">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products & Services</h1>
          <p className="text-sm text-slate-500">Manage your inventory and reusable invoice items</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-center bg-slate-100 rounded-md px-3 py-2 w-full max-w-md border focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
          <Search size={18} className="text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center text-slate-400">
            <Loader2 className="spin" size={24} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <Package size={48} className="mb-4 text-slate-300" />
            <p className="mb-4">No products found. Add your first product to speed up invoicing.</p>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={16} /> Add Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Name / Description</th>
                  <th className="px-6 py-4 font-semibold">SKU / HSN</th>
                  <th className="px-6 py-4 font-semibold text-right">Default Rate</th>
                  <th className="px-6 py-4 font-semibold text-center">Tax</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{p.name}</div>
                      {p.description && <div className="text-xs text-slate-500 mt-1 truncate max-w-xs">{p.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {p.sku && <span className="mr-2 text-slate-600">SKU: {p.sku}</span>}
                        {p.hsn_sac && <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">HSN: {p.hsn_sac}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium">₹{Number(p.default_rate).toFixed(2)}</div>
                      <div className="text-xs text-slate-500">per {p.unit}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">{p.tax_rate}%</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="btn-icon text-blue-600 mr-2" onClick={() => handleOpenModal(p)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon text-red-500" onClick={() => handleDelete(p.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg">{formData.id ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="text-slate-400 hover:text-slate-600" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 flex flex-col gap-4">
              <div className="form-group mb-0">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Product / Service Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group mb-0">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">SKU / Item Code</label>
                  <input type="text" className="w-full" value={formData.sku || ''} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div className="form-group mb-0">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">HSN / SAC Code</label>
                  <input type="text" className="w-full" value={formData.hsn_sac || ''} onChange={e => setFormData({...formData, hsn_sac: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="form-group mb-0">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Unit (e.g. PCS, KG)</label>
                  <input type="text" className="w-full uppercase" value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value.toUpperCase()})} />
                </div>
                <div className="form-group mb-0">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Default Rate (₹)</label>
                  <input type="number" step="0.01" min="0" className="w-full" value={formData.default_rate} onChange={e => setFormData({...formData, default_rate: e.target.value})} />
                </div>
                <div className="form-group mb-0">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Tax Rate (%)</label>
                  <input type="number" step="any" min="0" className="w-full" value={formData.tax_rate} onChange={e => setFormData({...formData, tax_rate: e.target.value})} />
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Description (Optional)</label>
                <textarea 
                  rows="2" 
                  className="w-full" 
                  value={formData.description || ''} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="spin" /> : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
