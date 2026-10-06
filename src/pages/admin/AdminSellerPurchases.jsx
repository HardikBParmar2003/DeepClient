import { useState, useEffect, useMemo } from 'react';
import CustomPagination from '../../components/shared/CustomPagination';
import { useParams, Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineX, HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CustomDatePicker from '../../components/shared/CustomDatePicker';
import ConfirmModal from '../../components/shared/ConfirmModal';

const AdminSellerPurchases = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [purchases, setPurchases] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddPurchaseModalOpen, setIsAddPurchaseModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });
  
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const initialFormState = {
    date: getTodayDate(),
    shirt_qty: '', shirt_amount: '',
    tshirt_qty: '', tshirt_amount: '',
    pant_qty: '', pant_amount: '',
    advance: '', description: ''
  };

  const [newPurchase, setNewPurchase] = useState(initialFormState);

  // Calculate readable total amount
  const totalAmount = useMemo(() => {
    const s_amt = parseFloat(newPurchase.shirt_amount) || 0;
    const ts_amt = parseFloat(newPurchase.tshirt_amount) || 0;
    const p_amt = parseFloat(newPurchase.pant_amount) || 0;
    return s_amt + ts_amt + p_amt;
  }, [newPurchase.shirt_amount, newPurchase.tshirt_amount, newPurchase.pant_amount]);

  const fetchSellerAndPurchases = async () => {
    try {
      setLoading(true);
      const [sellerRes, purchasesRes] = await Promise.all([
        api.get(`/sellers/${id}`),
        api.get(`/sellers/${id}/purchases`)
      ]);
      if (sellerRes.data.success) setSeller(sellerRes.data.data);
      if (purchasesRes.data.success) setPurchases(purchasesRes.data.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerAndPurchases();
  }, [id]);

  const openAddModal = () => {
    setEditingId(null);
    setNewPurchase(initialFormState);
    setIsAddPurchaseModalOpen(true);
  };

  const openEditModal = (purchase) => {
    setEditingId(purchase.id);
    const d = new Date(purchase.date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setNewPurchase({
      date: dateStr,
      shirt_qty: purchase.shirt_qty || '',
      shirt_amount: purchase.shirt_amount || '',
      tshirt_qty: purchase.tshirt_qty || '',
      tshirt_amount: purchase.tshirt_amount || '',
      pant_qty: purchase.pant_qty || '',
      pant_amount: purchase.pant_amount || '',
      advance: purchase.advance || '',
      description: purchase.description || ''
    });
    setIsAddPurchaseModalOpen(true);
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    if (!newPurchase.date) {
      toast.error('Date is compulsory');
      return;
    }
    try {
      if (editingId) {
        const { data } = await api.put(`/sellers/${id}/purchases/${editingId}`, {
          ...newPurchase,
          total_amount: totalAmount
        });
        if (data.success) {
          toast.success('Purchase updated successfully');
          setIsAddPurchaseModalOpen(false);
          setNewPurchase(initialFormState);
          setEditingId(null);
          fetchSellerAndPurchases();
        }
      } else {
        const { data } = await api.post(`/sellers/${id}/purchases`, {
          ...newPurchase,
          total_amount: totalAmount
        });
        if (data.success) {
          toast.success('Purchase recorded successfully');
          setIsAddPurchaseModalOpen(false);
          setNewPurchase(initialFormState);
          fetchSellerAndPurchases();
        }
      }
    } catch (err) {
      toast.error(`Failed to ${editingId ? 'update' : 'record'} purchase`);
    }
  };

  const handleDelete = async () => {
    try {
      const { data } = await api.delete(`/sellers/${id}/purchases/${confirmModalData.idToDelete}`);
      if (data.success) {
        toast.success('Purchase deleted successfully');
        fetchSellerAndPurchases();
      }
    } catch (err) {
      toast.error('Failed to delete purchase');
    } finally {
      setConfirmModalData({ isOpen: false, idToDelete: null });
    }
  };


  const totalBill = purchases.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
  const totalAdvance = purchases.reduce((sum, p) => sum + Number(p.advance || 0), 0);
  const totalDue = totalBill - totalAdvance;

  
  
  const filteredPurchases = purchases.filter(p => {
    if(!startDate && !endDate) return true;
    const pDate = new Date(p.date).getTime();
    if(startDate && pDate < new Date(startDate).getTime()) return false;
    if(endDate && pDate > new Date(endDate).getTime()) return false;
    return true;
  });
  
  const totalPages = Math.ceil(filteredPurchases.length / limit);
  const paginatedPurchases = filteredPurchases.slice((page - 1) * limit, page * limit);




  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <Link to="/admin/sellers" className="text-luxury-gold hover:text-luxury-gold-dark transition-colors flex items-center gap-2 mb-2 uppercase tracking-widest text-xs">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Sellers
          </Link>
          <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">
            {seller ? seller.name : 'Loading...'}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage purchases for this seller</p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-4 rounded-xl shadow-[var(--shadow-card)]">
              <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block mb-1 font-medium">Total Bill</span>
              <span className="text-2xl font-semibold text-luxury-gold">{"\u20B9"}{totalBill.toFixed(2)}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-4 rounded-xl shadow-[var(--shadow-card)]">
              <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block mb-1 font-medium">Total Advance</span>
              <span className="text-2xl font-semibold text-green-400">{"\u20B9"}{totalAdvance.toFixed(2)}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-4 rounded-xl shadow-[var(--shadow-card)]">
              <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block mb-1 font-medium">Total Due</span>
              <span className="text-2xl font-semibold text-red-400">{"\u20B9"}{totalDue.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <CustomDatePicker 
              label="From"
              value={startDate}
              onChange={(date) => { setStartDate(date || ''); setPage(1); }}
            />
            <CustomDatePicker 
              label="To"
              value={endDate}
              onChange={(date) => { setEndDate(date || ''); setPage(1); }}
            />
          </div>
          <button 
            onClick={openAddModal}
            className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0 h-[42px]"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Purchase
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center border-b border-[var(--border-color)] pb-4 mt-8">
        <h2 className="text-sm tracking-widest uppercase text-[var(--text-secondary)]">Purchase History</h2>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-center">Shirts (Qty / Amt)</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-center">T-Shirts (Qty / Amt)</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-center">Pants (Qty / Amt)</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Advance</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-[var(--text-muted)]">
                    Loading purchases...
                  </td>
                </tr>
              ) : paginatedPurchases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <p className="text-[var(--text-muted)] mb-4">No purchases found for this seller.</p>
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((purchase, index) => {
    const serialNumber = (page - 1) * limit + index + 1;
    return (
                  <tr key={purchase.id} className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer" onClick={(e) => { if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; const editBtn = e.currentTarget.querySelector('button[title="View"]') || e.currentTarget.querySelector('button[title="View Details"]') || e.currentTarget.querySelector('button[title="Edit"]') || e.currentTarget.querySelector('button[title="Edit Name"]'); if(editBtn) editBtn.click(); }}>
                    <td className="px-6 py-4 font-medium text-[var(--text-muted)]">{index + 1}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] whitespace-nowrap">
                      {new Date(purchase.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--text-primary)]">
                      {purchase.shirt_qty || 0} / ₹{Number(purchase.shirt_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--text-primary)]">
                      {purchase.tshirt_qty || 0} / ₹{Number(purchase.tshirt_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--text-primary)]">
                      {purchase.pant_qty || 0} / ₹{Number(purchase.pant_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-luxury-gold">
                      ₹{Number(purchase.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-[var(--text-secondary)]">
                      ₹{Number(purchase.advance || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(purchase); }}
                          className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmModalData({ isOpen: true, idToDelete: purchase.id }); }}
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


      {/* Add/Edit Purchase Modal */}
      {isAddPurchaseModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-3xl overflow-visible shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] shrink-0">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">
                  {editingId ? 'Edit Purchase' : 'Record Purchase'}
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {editingId ? `Update stock received from ${seller?.name}` : `Enter stock received from ${seller?.name}`}
                </p>
              </div>
              <button onClick={() => setIsAddPurchaseModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddPurchase} className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--bg-primary)] rounded-b-2xl">
              <div className="space-y-4">
                
                {/* Date and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">Date *</label>
                    <CustomDatePicker value={newPurchase.date} onChange={val => setNewPurchase({...newPurchase, date: val})} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">Description</label>
                    <input type="text" value={newPurchase.description} onChange={e => setNewPurchase({...newPurchase, description: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors h-[38px]" placeholder="Optional details..." />
                  </div>
                </div>

                {/* Shirts & T-Shirts */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">Shirt Qty</label>
                    <input type="number" min="0" value={newPurchase.shirt_qty} onChange={e => setNewPurchase({...newPurchase, shirt_qty: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors h-[38px]" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">Shirt Amount</label>
                    <input type="number" min="0" step="0.01" value={newPurchase.shirt_amount} onChange={e => setNewPurchase({...newPurchase, shirt_amount: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors h-[38px]" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">T-Shirt Qty</label>
                    <input type="number" min="0" value={newPurchase.tshirt_qty} onChange={e => setNewPurchase({...newPurchase, tshirt_qty: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors h-[38px]" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">T-Shirt Amount</label>
                    <input type="number" min="0" step="0.01" value={newPurchase.tshirt_amount} onChange={e => setNewPurchase({...newPurchase, tshirt_amount: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors h-[38px]" placeholder="0.00" />
                  </div>
                </div>

                {/* Pants & Advance & Total */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">Pant Qty</label>
                    <input type="number" min="0" value={newPurchase.pant_qty} onChange={e => setNewPurchase({...newPurchase, pant_qty: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors h-[38px]" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">Pant Amount</label>
                    <input type="number" min="0" step="0.01" value={newPurchase.pant_amount} onChange={e => setNewPurchase({...newPurchase, pant_amount: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors h-[38px]" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">Advance Paid</label>
                    <input type="number" min="0" step="0.01" value={newPurchase.advance} onChange={e => setNewPurchase({...newPurchase, advance: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors h-[38px]" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-luxury-gold mb-1">Total (Read-Only)</label>
                    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded px-3 py-1.5 text-sm font-medium text-luxury-gold h-[38px] flex items-center shadow-inner cursor-not-allowed">
                      ₹{totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
                
              </div>
              
              <div className="pt-6 flex justify-end shrink-0 sticky bottom-0 bg-[var(--bg-primary)] border-t border-transparent mt-2">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer w-full md:w-auto">
                  {editingId ? 'Update Purchase' : 'Save Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ isOpen: false, idToDelete: null })}
        onConfirm={handleDelete}
        title="Delete Purchase"
        message="Are you sure you want to delete this purchase? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default AdminSellerPurchases;

