import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineCash, HiOutlinePencil, HiOutlineX, HiOutlineTrash, HiOutlineEye, HiOutlineCalendar, HiOutlineCurrencyRupee, HiOutlineDocumentText } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CustomPagination from '../../components/shared/CustomPagination';
import ConfirmModal from '../../components/shared/ConfirmModal';
import CustomDatePicker from '../../components/shared/CustomDatePicker';

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [isViewExpenseModalOpen, setIsViewExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getTodayDate = () => {
    const today = new Date();
    // Format YYYY-MM-DD in local time
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: getTodayDate() });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/expenses', {
        params: { startDate, endDate }
      });
      if (data.success) {
        setExpenses(data.data);
      }
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset page on date filter change
    fetchExpenses();
  }, [startDate, endDate]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.date) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const { data } = await api.post('/expenses', {
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date
      });
      if (data.success) {
        toast.success('Expense added successfully');
        setIsAddExpenseModalOpen(false);
        setNewExpense({ description: '', amount: '', date: getTodayDate() });
        fetchExpenses();
      }
    } catch (err) {
      toast.error('Failed to add expense');
    }
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    if (!selectedExpense.description || !selectedExpense.amount || !selectedExpense.date) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const { data } = await api.put(`/expenses/${selectedExpense.id}`, {
        description: selectedExpense.description,
        amount: parseFloat(selectedExpense.amount),
        date: selectedExpense.date
      });
      if (data.success) {
        toast.success('Expense updated successfully');
        setIsEditExpenseModalOpen(false);
        fetchExpenses();
      }
    } catch (err) {
      toast.error('Failed to update expense');
    }
  };

  const handleDeleteExpense = async () => {
    try {
      await api.delete(`/expenses/${confirmModalData.idToDelete}`);
      toast.success('Expense deleted successfully');
      setConfirmModalData({ isOpen: false, idToDelete: null });
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const currentExpenses = expenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">My Expenses</h1>
          <p className="text-[var(--text-secondary)] mt-1">Track and manage your expenses</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0 h-[42px]"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-400/10 rounded-lg text-red-400">
              <HiOutlineCash className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)] uppercase tracking-widest">Total Expenses</p>
              <h3 className="text-2xl font-light text-red-400 mt-1">₹{Number(totalAmount).toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)]">
        {/* Filters Header */}
        <div className="p-6 border-b border-[var(--border-color)] flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[var(--bg-card)] rounded-t-xl">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-[var(--text-secondary)]">Expenses List</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 md:mt-0">
            <div className="w-full sm:w-auto z-10">
              <CustomDatePicker label="From" value={startDate} onChange={setStartDate} align="right" />
            </div>
            <span className="text-[var(--text-muted)] text-xs uppercase tracking-widest hidden sm:block">to</span>
            <div className="w-full sm:w-auto z-10">
              <CustomDatePicker label="To" value={endDate} onChange={setEndDate} align="right" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">#</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Description</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Amount</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8">Loading expenses...</td></tr>
              ) : currentExpenses.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-[var(--text-muted)]">No expenses found.</td></tr>
              ) : (
                currentExpenses.map((expense, index) => (
                  <tr 
                    key={expense.id} 
                    className="hover:bg-[var(--bg-card-hover)] transition-colors group cursor-pointer"
                   onClick={(e) => { if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; const editBtn = e.currentTarget.querySelector('button[title="View"]') || e.currentTarget.querySelector('button[title="View Details"]') || e.currentTarget.querySelector('button[title="Edit"]') || e.currentTarget.querySelector('button[title="Edit Name"]'); if(editBtn) editBtn.click(); }}>
                    <td className="px-6 py-4 font-medium text-[var(--text-muted)]">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-red-400 text-right">
                      ₹{Number(expense.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => { 
                            setSelectedExpense(expense);
                            setIsViewExpenseModalOpen(true); 
                          }} 
                          className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                          title="View"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { 
                            const dateObj = new Date(expense.date);
                            const yyyy = dateObj.getFullYear();
                            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                            const dd = String(dateObj.getDate()).padStart(2, '0');
                            setSelectedExpense({
                              ...expense, 
                              date: `${yyyy}-${mm}-${dd}`
                            }); 
                            setIsEditExpenseModalOpen(true); 
                          }} 
                          className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                          title="Edit Expense"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setConfirmModalData({ isOpen: true, idToDelete: expense.id })} 
                          className="text-red-400 hover:text-white hover:bg-red-500 transition-colors flex items-center justify-center cursor-pointer bg-red-500/10 p-2 rounded-md border border-red-500/30"
                          title="Delete Expense"
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
        {!loading && expenses.length > 0 && (
          <CustomPagination 
            page={currentPage}
            totalPages={totalPages}
            setPage={setCurrentPage}
            limit={itemsPerPage}
            setLimit={setItemsPerPage}
          />
        )}
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl overflow-visible shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Add New Expense</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Record a new expense</p>
              </div>
              <button onClick={() => setIsAddExpenseModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 overflow-visible flex-1 custom-scrollbar bg-[var(--bg-primary)] rounded-b-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Date *</label>
                  <CustomDatePicker value={newExpense.date} onChange={val => setNewExpense({...newExpense, date: val})} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Description *</label>
                  <textarea rows="4" required value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors custom-scrollbar resize-y min-h-[100px]" placeholder="e.g. Office Supplies" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Amount (₹) *</label>
                  <input type="number" required min="0" step="0.01" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="0.00" />
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {isEditExpenseModalOpen && selectedExpense && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl overflow-visible shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Edit Expense</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Update expense details</p>
              </div>
              <button onClick={() => setIsEditExpenseModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditExpense} className="p-6 overflow-visible flex-1 custom-scrollbar bg-[var(--bg-primary)] rounded-b-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Date *</label>
                  <CustomDatePicker value={selectedExpense.date} onChange={val => setSelectedExpense({...selectedExpense, date: val})} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Description *</label>
                  <textarea rows="4" required value={selectedExpense.description} onChange={e => setSelectedExpense({...selectedExpense, description: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors custom-scrollbar resize-y min-h-[100px]" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Amount (₹) *</label>
                  <input type="number" required min="0" step="0.01" value={selectedExpense.amount} onChange={e => setSelectedExpense({...selectedExpense, amount: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Update Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Expense Modal */}
      {isViewExpenseModalOpen && selectedExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-luxury-gold uppercase tracking-widest flex items-center gap-3">
                  Expense Details
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const dateObj = new Date(selectedExpense.date);
                    const yyyy = dateObj.getFullYear();
                    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const dd = String(dateObj.getDate()).padStart(2, '0');
                    setSelectedExpense({
                      ...selectedExpense, 
                      date: `${yyyy}-${mm}-${dd}`
                    }); 
                    setIsViewExpenseModalOpen(false);
                    setIsEditExpenseModalOpen(true);
                  }} 
                  className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors p-2 rounded-md border border-luxury-gold/30 bg-luxury-gold/10 flex items-center gap-2 text-sm uppercase tracking-widest font-medium"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                  Edit
                </button>
                <button onClick={() => setIsViewExpenseModalOpen(false)} className="text-[var(--text-muted)] hover:text-white transition-colors p-2 rounded-md border border-[var(--border-color)] hover:border-[var(--text-primary)]">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)]/30">
                <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-widest text-luxury-gold mb-4 border-b border-[var(--border-color)] pb-2">Expense Info</h3>
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded bg-luxury-gold/10 flex items-center justify-center text-luxury-gold shrink-0">
                      <HiOutlineCalendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Date</p>
                      <p className="text-sm text-[var(--text-primary)] font-medium">{new Date(selectedExpense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-widest text-luxury-gold mb-4 border-b border-[var(--border-color)] pb-2">Payment Info</h3>
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                      <HiOutlineCurrencyRupee className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Amount</p>
                      <p className="text-sm text-[var(--text-primary)] font-medium">{"\u20B9"}{Number(selectedExpense.amount || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-card)]/30">
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                  <h3 className="text-sm uppercase tracking-widest text-luxury-gold">Description</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{selectedExpense.description}</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ isOpen: false, idToDelete: null })}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
      />
    </div>
  );
};

export default AdminExpenses;

