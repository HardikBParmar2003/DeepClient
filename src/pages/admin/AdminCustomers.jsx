import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineX, HiOutlineSearch } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import CustomPagination from '../../components/shared/CustomPagination';
import ConfirmModal from '../../components/shared/ConfirmModal';
import CustomerModal from '../../components/shared/CustomerModal';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [confirmState, setConfirmState] = useState({ isOpen: false, id: null });

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomerForView, setSelectedCustomerForView] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    mobile: ''
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/customers');
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', mobile: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCustomer(c);
    setFormData({ name: c.name, mobile: c.mobile });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        const { data } = await api.put(`/customers/${editingCustomer.id}`, formData);
        if (data.success) toast.success('Customer updated');
      } else {
        const { data } = await api.post('/customers', formData);
        if (data.success) toast.success('Customer added');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = (id) => {
    setConfirmState({ isOpen: true, id });
  };

  const executeDelete = async (id) => {
    try {
      const { data } = await api.delete(`/customers/${id}`);
      if (data.success) {
        toast.success('Customer deleted');
        fetchCustomers();
      }
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.mobile.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredCustomers.length / limit);
  const paginatedCustomers = filteredCustomers.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">Customers</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your customers via mobile numbers</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
            <input 
              type="text"
              placeholder="Search name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors"
            />
          </div>
          
          <button 
            onClick={openAddModal}
            className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2.5 rounded-lg uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)] whitespace-nowrap"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">#</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Name</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Mobile</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-center">Total Orders</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Total Bill</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Total Due</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-[var(--text-muted)] tracking-widest uppercase">
                    Loading customers...
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[var(--text-muted)]">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c, index) => {
                  const serialNumber = (page - 1) * limit + index + 1;
                  return (
                    <tr key={c.id} className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer" onClick={(e) => { 
                      if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; 
                      navigate(`/admin/customers/${c.id}/orders`, { state: { customer: c } });
                    }}>
                      <td className="px-6 py-4 text-[var(--text-muted)] font-medium">{serialNumber}</td>
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{c.name}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">{c.mobile}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 bg-luxury-gold/10 border border-luxury-gold/30 rounded-md text-xs font-medium tracking-wider text-luxury-gold">
                          {c.totalOrders || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-luxury-gold font-medium text-right">
                        ₹{(c.totalBill || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-red-400 font-medium text-right">
                        ₹{(c.totalDue || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedCustomerForView(c); }}
                            className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                            title="View"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(c); }}
                            className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors p-2 rounded-md border border-luxury-gold/30 bg-luxury-gold/10"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                            className="text-red-400 hover:text-white hover:bg-red-500 transition-colors p-2 rounded-md border border-red-500/30 bg-red-500/10"
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
        
        {/* Pagination Component */}
        <CustomPagination 
          page={page} 
          totalPages={totalPages} 
          setPage={setPage} 
          limit={limit} 
          setLimit={setLimit} 
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-[var(--shadow-card)]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <h2 className="text-lg uppercase tracking-widest text-luxury-gold">
                {editingCustomer ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <form id="customerForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Mobile Number *</label>
                  <input type="text" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Customer Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex justify-end">
              <button 
                type="submit" 
                form="customerForm"
                className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCustomerForView && (
        <CustomerModal 
          isOpen={!!selectedCustomerForView} 
          onClose={() => setSelectedCustomerForView(null)} 
          customer={selectedCustomerForView} 
          onUpdate={fetchCustomers}
          initialEditMode={false}
        />
      )}

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, id: null })}
        onConfirm={() => executeDelete(confirmState.id)}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? All their orders will be lost!"
        confirmText="Delete"
        isDestructive={true}
      />
        </div>
  );
};

export default AdminCustomers;
