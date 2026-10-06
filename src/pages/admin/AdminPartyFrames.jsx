import { useState, useEffect } from 'react';
import CustomSelect from '../../components/shared/CustomSelect';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineX, HiOutlineArrowLeft, HiOutlineTrash } from 'react-icons/hi';
import CustomPagination from '../../components/shared/CustomPagination';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/shared/ConfirmModal';

const AdminPartyFrames = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [newFrame, setNewFrame] = useState({ frame_number: '', status: 'in_stock' });
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });

  const fetchParty = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/parties/${id}`);
      if (data.success) {
        setParty(data.data);
      }
    } catch (err) {
      toast.error('Failed to load party details');
      navigate('/admin/parties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParty();
  }, [id]);

  const handleAddFrame = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/parties/${id}/frames`, newFrame);
      if (data.success) {
        toast.success('Frame added successfully');
        setIsAddModalOpen(false);
        setNewFrame({ frame_number: '', status: 'in_stock' });
        fetchParty();
      }
    } catch (err) {
      toast.error('Failed to add frame');
    }
  };

  const handleEditFrame = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/parties/${id}/frames/${selectedFrame.id}`, selectedFrame);
      if (data.success) {
        toast.success('Frame updated successfully');
        setIsEditModalOpen(false);
        fetchParty();
      }
    } catch (err) {
      toast.error('Failed to update frame');
    }
  };

  const confirmDelete = (frameId) => {
    setConfirmModalData({ isOpen: true, idToDelete: frameId });
  };

  const deleteFrame = async () => {
    try {
      const { data } = await api.delete(`/parties/${id}/frames/${confirmModalData.idToDelete}`);
      if (data.success) {
        toast.success('Frame deleted successfully');
        fetchParty();
      }
    } catch (err) {
      toast.error('Failed to delete frame');
    } finally {
      setConfirmModalData({ isOpen: false, idToDelete: null });
    }
  };

  const allFrames = party?.frames || [];
  const filteredFrames = allFrames.filter(f => f.frame_number.toLowerCase().includes(searchQuery.toLowerCase()) || f.status.replace('_', ' ').toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredFrames.length / itemsPerPage);
  const currentFrames = filteredFrames.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/parties')} className="text-[var(--text-muted)] hover:text-luxury-gold transition-colors cursor-pointer">
              <HiOutlineArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">
              {party ? `${party.name} Frames` : 'Frames'}
            </h1>
          </div>
          {party && (
             <div className="flex gap-6 mt-2 text-sm">
               <p className="text-[var(--text-secondary)]">In Stock: <strong className="text-green-400">{party.in_stock_count || 0}</strong></p>
               <p className="text-[var(--text-secondary)]">Sold: <strong className="text-red-400">{party.sold_count || 0}</strong></p>
             </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto mt-4 md:mt-0">
          <input 
            type="text" 
            placeholder="Search frames..." 
            value={searchQuery}
            onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors w-full md:w-64"
          />
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Frame
          </button>
        </div>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">#</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Added Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Frame Number</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Status</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8">Loading frames...</td></tr>
              ) : currentFrames.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-[var(--text-muted)]">No frames found.</td></tr>
              ) : (
                currentFrames.map((frame, index) => (
                  <tr 
                    key={frame.id} 
                    className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                    onClick={() => { setSelectedFrame(frame); setIsEditModalOpen(true); }}
                  >
                    <td className="px-6 py-4 font-medium text-[var(--text-muted)]">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{new Date(frame.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{frame.frame_number}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider font-bold ${frame.status === 'in_stock' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {frame.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedFrame(frame); setIsEditModalOpen(true); }}
                          className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); confirmDelete(frame.id); }}
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
        {!loading && allFrames.length > 0 && (
          <CustomPagination 
            page={currentPage}
            totalPages={totalPages}
            setPage={setCurrentPage}
            limit={itemsPerPage}
            setLimit={setItemsPerPage}
          />
        )}
      </div>

      {/* Add Frame Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Add Frame</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Record a new frame in inventory</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddFrame} className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--bg-primary)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Frame Number *</label>
                  <input type="text" required value={newFrame.frame_number} onChange={e => setNewFrame({...newFrame, frame_number: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="e.g. F-10024" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Status</label>
                  <CustomSelect 
                      name="status"
                      value={newFrame.status} 
                      onChange={e => setNewFrame({...newFrame, status: e.target.value})} 
                      options={[
                        {value: 'in_stock', label: 'In Stock'},
                        {value: 'sold', label: 'Sold'}
                      ]}
                    />
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Save Frame
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Frame Modal */}
      {isEditModalOpen && selectedFrame && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Edit Frame</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Update frame details</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditFrame} className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--bg-primary)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Frame Number *</label>
                  <input type="text" required value={selectedFrame.frame_number} onChange={e => setSelectedFrame({...selectedFrame, frame_number: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Status</label>
                  <CustomSelect 
                      name="status"
                      value={selectedFrame.status} 
                      onChange={e => setSelectedFrame({...selectedFrame, status: e.target.value})} 
                      options={[
                        {value: 'in_stock', label: 'In Stock'},
                        {value: 'sold', label: 'Sold'}
                      ]}
                    />
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Update Frame
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ isOpen: false, idToDelete: null })}
        onConfirm={deleteFrame}
        title="Delete Frame"
        message="Are you sure you want to delete this frame? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default AdminPartyFrames;

