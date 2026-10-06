import { useState, useEffect, useRef } from 'react';
import CustomPagination from '../../components/shared/CustomPagination';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { HiOutlineUpload, HiOutlineSearch, HiOutlineX, HiChevronLeft, HiChevronRight, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminGallery = () => {
  const [designs, setDesigns] = useState([]);
  const [confirmState, setConfirmState] = useState({ isOpen: false, id: null });

  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editId, setEditId] = useState(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/designs');
      if (data.success) {
        setDesigns(data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch designs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('name', uploadName);
    formData.append('image', uploadFile);

    try {
      setIsUploading(true);
      const { data } = await api.post('/designs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (data.success) {
        toast.success('Design uploaded successfully');
        setIsUploadOpen(false);
        setUploadName('');
        setUploadFile(null);
        fetchDesigns();
      }
    } catch (err) {
      toast.error('Failed to upload design');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/designs/${editId}`, { name: editName });
      if (data.success) {
        toast.success('Design name updated');
        setIsEditOpen(false);
        setEditName('');
        setEditId(null);
        fetchDesigns();
      }
    } catch (err) {
      toast.error('Failed to update name');
    }
  };

  const openEditModal = (design, e) => {
    e.stopPropagation();
    setEditId(design.id);
    setEditName(design.name || '');
    setIsEditOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this design?')) return;
    
    try {
      const { data } = await api.delete(`/designs/${id}`);
      if (data.success) {
        toast.success('Design deleted successfully');
        fetchDesigns();
      }
    } catch (err) {
      toast.error('Failed to delete design');
    }
  };

  const filteredDesigns = designs.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredDesigns.length / limit);
  const paginatedFilteredDesigns = filteredDesigns.slice((page - 1) * limit, page * limit);

  // Lightbox Navigation
  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(-1);
  const goPrev = () => setLightboxIndex(prev => (prev > 0 ? prev - 1 : paginatedFilteredDesigns.length - 1));
  const goNext = () => setLightboxIndex(prev => (prev < paginatedFilteredDesigns.length - 1 ? prev + 1 : 0));

  // Keyboard support for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === -1) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, paginatedFilteredDesigns]);

  const getImageUrl = (url) => {
    if (!url) return '';
    return `http://localhost:5000${url}`;
  };



  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">Gallery</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage and showcase your designs</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:min-w-[250px]">
            <input 
              type="text" 
              placeholder="Search designs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-luxury-gold transition-colors"
            />
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          </div>
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2.5 rounded-lg uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <HiOutlineUpload className="w-5 h-5" />
            Upload Design
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-[var(--text-muted)] tracking-widest uppercase">
          Loading gallery...
        </div>
      ) : paginatedFilteredDesigns.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
          <p className="text-[var(--text-muted)] mb-4">{searchTerm ? 'No designs match your search.' : 'Your gallery is empty.'}</p>
          {!searchTerm && (
            <button onClick={() => setIsUploadOpen(true)} className="text-luxury-gold hover:underline">
              Upload your first design
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginatedFilteredDesigns.map((design, index) => (
            <div 
              key={design.id} 
              className="group relative aspect-[3/4] bg-[var(--bg-card)] rounded-xl overflow-hidden border border-[var(--border-color)] cursor-pointer shadow-[var(--shadow-card)] hover:border-luxury-gold transition-all duration-300"
              onClick={() => openLightbox(index)}
            >
              <img 
                src={getImageUrl(design.image_url)} 
                alt={design.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              {design.name && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <h3 className="text-white font-medium truncate drop-shadow-md">{design.name}</h3>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => openEditModal(design, e)}
                  className="bg-luxury-gold/80 hover:bg-luxury-gold text-black p-2 rounded-full backdrop-blur-sm"
                  title="Edit Name"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => handleDelete(design.id, e)}
                  className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm"
                  title="Delete Design"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Component */}
      <CustomPagination 
        page={page} 
        totalPages={totalPages} 
        setPage={setPage} 
        limit={limit} 
        setLimit={setLimit} 
      />

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-md shadow-[var(--shadow-card)]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
              <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Upload Design</h2>
              <button onClick={() => { setIsUploadOpen(false); setUploadFile(null); setUploadName(''); }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Design Name (Optional)</label>
                <input 
                  type="text" 
                  value={uploadName} 
                  onChange={e => setUploadName(e.target.value)} 
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" 
                  placeholder="e.g. Summer Collection 01"
                  />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Image File *</label>
                <div 
                  className="w-full border-2 border-dashed border-[var(--border-color)] rounded-xl p-8 text-center hover:border-luxury-gold transition-colors cursor-pointer relative"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  {uploadFile ? (
                    <div className="text-[var(--text-primary)]">
                      <p className="font-medium truncate">{uploadFile.name}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-[var(--text-muted)] flex flex-col items-center">
                      <HiOutlineUpload className="w-8 h-8 mb-2 opacity-50" />
                      <p>Click to browse image</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full bg-luxury-gold text-[var(--bg-primary)] py-3 rounded-lg uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Save Design'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-sm shadow-[var(--shadow-card)]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
              <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Edit Design Name</h2>
              <button onClick={() => { setIsEditOpen(false); setEditName(''); setEditId(null); }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Design Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" 
                  placeholder="e.g. Summer Collection 01"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-luxury-gold text-[var(--bg-primary)] py-3 rounded-lg uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-md z-[60] flex items-center justify-center p-4 select-none">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
            <h3 className="text-white text-lg tracking-wider font-light drop-shadow-md">
              {filteredDesigns[lightboxIndex].name}
              <span className="text-white/50 text-sm ml-4">({lightboxIndex + 1} of {filteredDesigns.length})</span>
            </h3>
            <button onClick={closeLightbox} className="text-white/70 hover:text-white p-2 transition-colors">
              <HiOutlineX className="w-8 h-8" />
            </button>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 transition-colors"
          >
            <HiChevronLeft className="w-12 h-12 drop-shadow-lg" />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 transition-colors"
          >
            <HiChevronRight className="w-12 h-12 drop-shadow-lg" />
          </button>

          {/* Main Image */}
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center mt-8">
            <img 
              src={getImageUrl(filteredDesigns[lightboxIndex].image_url)} 
              alt={filteredDesigns[lightboxIndex].name}
              className="max-w-full max-h-full object-contain rounded drop-shadow-2xl animate-fade-in"
            />
          </div>
        </div>
      )}


      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, id: null })}
        onConfirm={() => executeDelete(confirmState.id)}
        title="Delete Design"
        message="Are you sure you want to delete this design? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
        </div>
  );
};

export default AdminGallery;
