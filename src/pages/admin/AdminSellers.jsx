import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineX, HiOutlineTrash, HiOutlineUserGroup } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CustomPagination from '../../components/shared/CustomPagination';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { useNavigate } from 'react-router-dom';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddSellerModalOpen, setIsAddSellerModalOpen] = useState(false);
  const [isEditSellerModalOpen, setIsEditSellerModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const navigate = useNavigate();

  const [newSeller, setNewSeller] = useState({ name: '', mobile: '', address: '' });

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/sellers');
      if (data.success) {
        setSellers(data.data);
      }
    } catch (err) {
      toast.error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleAddSeller = async (e) => {
    e.preventDefault();
    if (!newSeller.name) {
      toast.error('Please fill in the required name field');
      return;
    }
    try {
      const { data } = await api.post('/sellers', {
        name: newSeller.name,
        mobile: newSeller.mobile,
        address: newSeller.address
      });
      if (data.success) {
        toast.success('Seller added successfully');
        setIsAddSellerModalOpen(false);
        setNewSeller({ name: '', mobile: '', address: '' });
        fetchSellers();
      }
    } catch (err) {
      toast.error('Failed to add seller');
    }
  };

  const handleEditSeller = async (e) => {
    e.preventDefault();
    if (!selectedSeller.name) {
      toast.error('Please fill in the required name field');
      return;
    }
    try {
      const { data } = await api.put(`/sellers/${selectedSeller.id}`, {
        name: selectedSeller.name,
        mobile: selectedSeller.mobile,
        address: selectedSeller.address
      });
      if (data.success) {
        toast.success('Seller updated successfully');
        setIsEditSellerModalOpen(false);
        fetchSellers();
      }
    } catch (err) {
      toast.error('Failed to update seller');
    }
  };

  const handleDeleteSeller = async () => {
    try {
      await api.delete(`/sellers/${confirmModalData.idToDelete}`);
      toast.success('Seller deleted successfully');
      fetchSellers();
    } catch (err) {
      toast.error('Failed to delete seller');
    } finally {
      setConfirmModalData({ isOpen: false, idToDelete: null });
    }
  };

  const totalPages = Math.ceil(sellers.length / itemsPerPage);
  const currentSellers = sellers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-[0.2em] uppercase text-gradient">Sellers</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your suppliers and their details</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsAddSellerModalOpen(true)}
            className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0 h-[42px]"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Seller
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-luxury-gold/20 flex items-center justify-center">
            <HiOutlineUserGroup className="w-6 h-6 text-luxury-gold" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)] uppercase tracking-widest">Total Sellers</p>
            <p className="text-2xl font-light">{sellers.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Total Bill</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Due</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-[var(--text-muted)]">
                    Loading sellers...
                  </td>
                </tr>
              ) : currentSellers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <p className="text-[var(--text-muted)] mb-4">No sellers found.</p>
                    <button 
                      onClick={() => setIsAddSellerModalOpen(true)}
                      className="text-luxury-gold hover:text-luxury-gold-dark transition-colors uppercase tracking-widest text-sm"
                    >
                      Add your first seller
                    </button>
                  </td>
                </tr>
              ) : (
                currentSellers.map((seller, index) => (
                  <tr 
                    key={seller.id} 
                    className="hover:bg-[var(--bg-card-hover)] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/admin/sellers/${seller.id}`)}
                  >
                    <td className="px-6 py-4 font-medium text-[var(--text-muted)]">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                      {seller.name || 'Unnamed Seller'}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {seller.mobile || '-'}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {seller.address || '-'}
                    </td>
                      <td className="px-6 py-4 text-[var(--text-primary)] font-medium text-right">
                        ₹{Number(seller.totalBill || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-red-400 font-medium text-right">
                        ₹{Number(seller.totalDue || 0).toFixed(2)}
                      </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => { 
                            setSelectedSeller(seller);
                            setIsEditSellerModalOpen(true); 
                          }} 
                          className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                          title="Edit Seller"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setConfirmModalData({ isOpen: true, idToDelete: seller.id })} 
                          className="text-red-400 hover:text-white hover:bg-red-500 transition-colors flex items-center justify-center cursor-pointer bg-red-500/10 p-2 rounded-md border border-red-500/30"
                          title="Delete Seller"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && sellers.length > 0 && (
          <CustomPagination 
            page={currentPage}
            totalPages={totalPages}
            setPage={setCurrentPage}
            limit={itemsPerPage}
            setLimit={setItemsPerPage}
          />
        )}
      </div>

      {/* Add Seller Modal */}
      {isAddSellerModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl overflow-visible shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Add New Seller</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Record a new supplier</p>
              </div>
              <button onClick={() => setIsAddSellerModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddSeller} className="p-6 overflow-visible flex-1 custom-scrollbar bg-[var(--bg-primary)] rounded-b-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Name *</label>
                  <input type="text" required value={newSeller.name} onChange={e => setNewSeller({...newSeller, name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="Supplier Name" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Mobile (Optional)</label>
                  <input type="text" value={newSeller.mobile} onChange={e => setNewSeller({...newSeller, mobile: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="e.g. +1 234 567 890" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Address (Optional)</label>
                  <textarea value={newSeller.address} onChange={e => setNewSeller({...newSeller, address: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors min-h-[100px]" placeholder="Supplier Address"></textarea>
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Save Seller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Seller Modal */}
      {isEditSellerModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl overflow-visible shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Edit Seller</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Update supplier details</p>
              </div>
              <button onClick={() => setIsEditSellerModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditSeller} className="p-6 overflow-visible flex-1 custom-scrollbar bg-[var(--bg-primary)] rounded-b-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Name *</label>
                  <input type="text" required value={selectedSeller.name} onChange={e => setSelectedSeller({...selectedSeller, name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Mobile (Optional)</label>
                  <input type="text" value={selectedSeller.mobile || ''} onChange={e => setSelectedSeller({...selectedSeller, mobile: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Address (Optional)</label>
                  <textarea value={selectedSeller.address || ''} onChange={e => setSelectedSeller({...selectedSeller, address: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors min-h-[100px]"></textarea>
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Update Seller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ isOpen: false, idToDelete: null })}
        onConfirm={handleDeleteSeller}
        title="Delete Seller"
        message="Are you sure you want to delete this seller? This action cannot be undone."
      />
    </div>
  );
};

export default AdminSellers;
