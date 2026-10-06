import { useState, useEffect } from 'react';
import CustomPagination from '../../components/shared/CustomPagination';
import { HiOutlinePlus, HiOutlineViewGrid, HiOutlineX, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/shared/ConfirmModal';

const AdminGlasses = () => {
  const [glasses, setGlasses] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGlass, setNewGlass] = useState({ name: '', default_price: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGlass, setEditingGlass] = useState({ id: null, name: '', default_price: '' });
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });

  const fetchGlasses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/glasses');
      if (data.success) {
        setGlasses(data.data);
      }
    } catch (err) {
      toast.error('Failed to load glasses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlasses();
  }, []);

  const handleAddGlass = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/glasses', newGlass);
      if (data.success) {
        toast.success('Glass added successfully');
        setIsAddModalOpen(false);
        setNewGlass({ name: '', default_price: '' });
        fetchGlasses();
      }
    } catch (err) {
      toast.error('Failed to add glass');
    }
  };

  const handleEditGlass = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/glasses/${editingGlass.id}`, editingGlass);
      if (data.success) {
        toast.success('Glass updated successfully');
        setIsEditModalOpen(false);
        fetchGlasses();
      }
    } catch (err) {
      toast.error('Failed to update glass');
    }
  };

  const confirmDelete = (id) => {
    setConfirmModalData({ isOpen: true, idToDelete: id });
  };

  const deleteGlass = async () => {
    try {
      const { data } = await api.delete(`/glasses/${confirmModalData.idToDelete}`);
      if (data.success) {
        toast.success('Glass deleted successfully');
        fetchGlasses();
      }
    } catch (err) {
      toast.error('Failed to delete glass');
    } finally {
      setConfirmModalData({ isOpen: false, idToDelete: null });
    }
  };

  
  const totalPages = Math.ceil(glasses.length / limit);
  const paginatedGlasses = glasses.slice((page - 1) * limit, page * limit);



  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">Manage Glasses</h1>
          <p className="text-[var(--text-secondary)] mt-1">Predefined glass types and default prices</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center gap-2 cursor-pointer"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Glass
        </button>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">#</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Glass Name</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Default Price (₹)</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8">Loading glasses...</td></tr>
              ) : paginatedGlasses.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-[var(--text-muted)]">No glasses found. Add one to get started.</td></tr>
              ) : (
                paginatedGlasses.map((glass, index) => {
    const serialNumber = (page - 1) * limit + index + 1;
    return (
                  <tr 
                    key={glass.id} 
                    className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                    onClick={() => {
                      setEditingGlass(glass);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <td className="px-6 py-4 font-medium text-[var(--text-muted)]">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                      <div className="flex items-center gap-2">
                        <HiOutlineViewGrid className="text-luxury-gold w-5 h-5" />
                        {glass.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-primary)]">₹{parseFloat(glass.default_price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGlass(glass);
                            setIsEditModalOpen(true);
                          }}
                          className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(glass.id);
                          }}
                          className="text-red-400 hover:text-white hover:bg-red-500 transition-colors flex items-center justify-center cursor-pointer bg-red-500/10 p-2 rounded-md border border-red-500/30"
                          title="Delete"
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
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Add New Glass</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddGlass} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Glass Name *</label>
                  <input type="text" required value={newGlass.name} onChange={e => setNewGlass({...newGlass, name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="e.g. Single Vision Blue Cut" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Default Price (₹) *</label>
                  <input type="number" required min="0" step="0.01" value={newGlass.default_price} onChange={e => setNewGlass({...newGlass, default_price: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="e.g. 1500" />
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-md overflow-hidden shadow-[var(--shadow-card)] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Edit Glass</h2>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditGlass} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Glass Name *</label>
                  <input type="text" required value={editingGlass.name} onChange={e => setEditingGlass({...editingGlass, name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="e.g. Single Vision Blue Cut" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Default Price (₹) *</label>
                  <input type="number" required min="0" step="0.01" value={editingGlass.default_price} onChange={e => setEditingGlass({...editingGlass, default_price: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="e.g. 1500" />
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ isOpen: false, idToDelete: null })}
        onConfirm={deleteGlass}
        title="Delete Glass Type"
        message="Are you sure you want to delete this glass type? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default AdminGlasses;
