import React, { useState, useEffect } from 'react';
import CustomSelect from '../../components/shared/CustomSelect';
import CustomPagination from '../../components/shared/CustomPagination';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { HiOutlinePlus, HiOutlineX, HiOutlineTrash, HiOutlinePencil, HiOutlineSearch } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [confirmState, setConfirmState] = useState({ isOpen: false, id: null });


  // Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    uniqueCode: '',
    category: 'Shirt',
    qty: '',
    price: ''
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/inventory');
      if (data.success) {
        setInventory(data.data);
      }
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Ensure uniqueCode is uppercase
    if (name === 'uniqueCode') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
      if (editingItem) setEditingItem(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (editingItem) setEditingItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/inventory', formData);
      if (data.success) {
        toast.success('Inventory added successfully!');
        setIsAddModalOpen(false);
        setFormData({ uniqueCode: '',
    category: 'Shirt',
    qty: '', price: '' });
        fetchInventory();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add inventory');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/inventory/${editingItem.id}`, {
        uniqueCode: editingItem.uniqueCode,
          category: editingItem.category,
          qty: editingItem.qty,
        price: editingItem.price
      });
      if (data.success) {
        toast.success('Inventory updated successfully!');
        setIsEditModalOpen(false);
        setEditingItem(null);
        fetchInventory();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update inventory');
    }
  };

  const handleDelete = (id) => {
    setConfirmState({ isOpen: true, id });
  };

  const executeDelete = async (id) => {
    try {
      const { data } = await api.delete(`/inventory/${id}`);
      if (data.success) {
        toast.success('Inventory deleted successfully');
        fetchInventory();
      }
    } catch (err) {
      toast.error('Failed to delete inventory');
    }
  };

  
  
  const filteredInventory = inventory.filter(item => 
    item.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredInventory.length / limit);
  const paginatedInventory = filteredInventory.slice((page - 1) * limit, page * limit);



  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest text-gradient uppercase">Inventory</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your inventory stock</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ uniqueCode: '',
    category: 'Shirt',
    qty: '', price: '' });
            setIsAddModalOpen(true);
          }}
          className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center gap-2 cursor-pointer"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Inventory
        </button>
      </div>

            {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-[var(--shadow-card)]">
        <div className="relative md:col-span-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
          <input 
            type="text"
            placeholder="Search unique code or category..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">#</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Unique Code</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Category</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Qty</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Price (₹)</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8">Loading inventory...</td></tr>
              ) : paginatedInventory.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-[var(--text-muted)]">No inventory found. Add one to get started.</td></tr>
              ) : (
                paginatedInventory.map((item, index) => {
    const serialNumber = (page - 1) * limit + index + 1;
    return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                   onClick={(e) => { if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; const editBtn = e.currentTarget.querySelector('button[title="View"]') || e.currentTarget.querySelector('button[title="View Details"]') || e.currentTarget.querySelector('button[title="Edit"]') || e.currentTarget.querySelector('button[title="Edit Name"]'); if(editBtn) editBtn.click(); }}>
                    <td className="px-6 py-4 font-medium text-[var(--text-muted)]">{serialNumber}</td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                      {item.uniqueCode}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                        <span className="px-2 py-1 bg-luxury-gold/10 border border-luxury-gold/30 rounded-md text-xs font-medium tracking-wider uppercase text-luxury-gold">{item.category || 'Shirt'}</span>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-primary)]">{item.qty}</td>
                    <td className="px-6 py-4 text-[var(--text-primary)]">₹{parseFloat(item.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingItem({
                              id: item.id,
                              uniqueCode: item.uniqueCode,
                                category: item.category || 'Shirt',
                                qty: item.qty,
                              price: item.price
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-white hover:bg-red-500 transition-colors flex items-center justify-center cursor-pointer bg-red-500/10 p-2 rounded-md border border-red-500/30"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomPagination 
        page={page} 
        totalPages={totalPages} 
        setPage={setPage} 
        limit={limit} 
        setLimit={setLimit} 
      />

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-md overflow-hidden shadow-[var(--shadow-card)] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Add Inventory</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Enter stock details below</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Unique Code *</label>
                <input 
                  type="text" 
                  name="uniqueCode"
                  required 
                  value={formData.uniqueCode} 
                  onChange={handleChange} 
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors font-mono" 
                  placeholder="E.G. ITEM-001" 
                />
              </div>
              
              <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Category *</label>
                  <CustomSelect 
                      name="category"
                      value={formData.category || 'Shirt'} 
                      onChange={e => setFormData({...formData, category: e.target.value})} 
                      options={[
                        {value: 'Shirt', label: 'Shirt'},
                        {value: 'T-Shirt', label: 'T-Shirt'},
                        {value: 'Pant', label: 'Pant'}
                      ]}
                    />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Quantity *</label>
                <input 
                  type="number" 
                  name="qty"
                  required 
                  min="0"
                  value={formData.qty} 
                  onChange={handleChange} 
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" 
                  placeholder="0" 
                />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Cost Price *</label>
                <input 
                  type="number" 
                  name="price"
                  required 
                  min="0" 
                  step="0.01" 
                  value={formData.price} 
                  onChange={handleChange} 
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" 
                  placeholder="0.00" 
                />
              </div>

              <div className="pt-8 flex justify-end">
                <button 
                  type="submit" 
                  className="bg-luxury-gold text-black px-8 py-3 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-md overflow-hidden shadow-[var(--shadow-card)] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Edit Inventory</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Update stock details</p>
              </div>
              <button onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Unique Code *</label>
                <input 
                  type="text" 
                  name="uniqueCode"
                  required 
                  value={editingItem.uniqueCode} 
                  onChange={handleChange} 
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors font-mono" 
                />
              </div>
              
              <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Category *</label>
                  <CustomSelect 
                      name="category"
                      value={editingItem.category || 'Shirt'} 
                      onChange={e => setEditingItem({...editingItem, category: e.target.value})} 
                      options={[
                        {value: 'Shirt', label: 'Shirt'},
                        {value: 'T-Shirt', label: 'T-Shirt'},
                        {value: 'Pant', label: 'Pant'}
                      ]}
                    />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Quantity *</label>
                <input 
                  type="number" 
                  name="qty"
                  required 
                  min="0"
                  value={editingItem.qty} 
                  onChange={handleChange} 
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Cost Price *</label>
                <input 
                  type="number" 
                  name="price"
                  required 
                  min="0" 
                  step="0.01" 
                  value={editingItem.price} 
                  onChange={handleChange} 
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" 
                />
              </div>

              <div className="pt-8 flex justify-end">
                <button 
                  type="submit" 
                  className="bg-luxury-gold text-black px-8 py-3 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer"
                >
                  Update Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, id: null })}
        onConfirm={() => executeDelete(confirmState.id)}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
        </div>
  );
};

export default AdminInventory;
