import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineX, HiOutlineArrowLeft, HiOutlineTrash, HiOutlineChat, HiOutlineDownload } from 'react-icons/hi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CustomPagination from '../../components/shared/CustomPagination';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/shared/ConfirmModal';
import CustomDatePicker from '../../components/shared/CustomDatePicker';
import { shopConfig } from '../../config/shop';

const AdminPartyPurchases = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [newPurchase, setNewPurchase] = useState({ date: new Date().toISOString().split('T')[0], total: '', paid: '' });
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

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/parties/${id}/purchases`, {
        ...newPurchase,
        total: Number(newPurchase.total),
        paid: Number(newPurchase.paid)
      });
      if (data.success) {
        toast.success('Purchase added successfully');
        setIsAddModalOpen(false);
        setNewPurchase({ date: new Date().toISOString().split('T')[0], total: '', paid: '' });
        fetchParty();
      }
    } catch (err) {
      toast.error('Failed to add purchase');
    }
  };

  const handleEditPurchase = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/parties/${id}/purchases/${selectedPurchase.id}`, {
        ...selectedPurchase,
        total: Number(selectedPurchase.total),
        paid: Number(selectedPurchase.paid)
      });
      if (data.success) {
        toast.success('Purchase updated successfully');
        setIsEditModalOpen(false);
        fetchParty();
      }
    } catch (err) {
      toast.error('Failed to update purchase');
    }
  };

  const confirmDelete = (purchaseId) => {
    setConfirmModalData({ isOpen: true, idToDelete: purchaseId });
  };

  const deletePurchase = async () => {
    try {
      const { data } = await api.delete(`/parties/${id}/purchases/${confirmModalData.idToDelete}`);
      if (data.success) {
        toast.success('Purchase deleted successfully');
        fetchParty();
      }
    } catch (err) {
      toast.error('Failed to delete purchase');
    } finally {
      setConfirmModalData({ isOpen: false, idToDelete: null });
    }
  };

  const allPurchases = party?.purchases || [];
  const totalPages = Math.ceil(allPurchases.length / itemsPerPage);
  const currentPurchases = allPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleWhatsapp = (e, purchase) => {
    e.stopPropagation();
    let phone = party?.phone || party?.mobile;
    let formattedPhone = phone ? phone.toString().replace(/\D/g, '') : '';
    if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;

    if (!formattedPhone) {
      toast.error('Mobile number not found for this party');
      return;
    }

    const shopName = shopConfig?.shopName || 'Optic Palace';
    const partyName = party?.name || 'Supplier';
    const dateStr = new Date(purchase.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const due = Number(purchase.total) - Number(purchase.paid);

    const textMsg = `Hello ${partyName},

This is ${shopName}. We are sharing the details for the purchase dated ${dateStr}:

 \uD83D\uDCE6 Total Purchase: \u20B9${Number(purchase.total).toFixed(2)}
 \uD83D\uDCB3 Amount Paid: \u20B9${Number(purchase.paid).toFixed(2)}
 \uD83E\uDDFE Balance for this bill: \u20B9${due.toFixed(2)}

Total Outstanding Balance: \u20B9${Number(party.total_due).toFixed(2)}

Thank you for your business! \uD83D\uDE4F`;

    const encodedMsg = encodeURIComponent(textMsg);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const generatePDF = () => {
    if (!party || !party.purchases || party.purchases.length === 0) {
      toast.error('No purchases found to download');
      return;
    }

    const doc = new jsPDF();
    const shopName = shopConfig?.shopName || 'Optic Palace';
    const partyName = party.name || 'Supplier';

    // Title
    doc.setFontSize(18);
    doc.setTextColor(212, 175, 55);
    doc.text(shopName, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Purchase Statement - ${partyName}`, 14, 28);

    // Summary
    const totalPurchase = Number(party.total_purchase || 0);
    const totalDue = Number(party.total_due || 0);
    const totalPaid = totalPurchase - totalDue;

    doc.setFontSize(10);
    doc.text(`Date Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, 14, 36);
    
    const summaryText = `Total Purchases: Rs. ${totalPurchase.toFixed(2)}   |   Total Paid: Rs. ${totalPaid.toFixed(2)}   |   Total Due: Rs. ${totalDue.toFixed(2)}`;
    doc.text(summaryText, 14, 44);

    // Table
    const tableColumn = ["#", "Date", "Total (Rs)", "Paid (Rs)", "Due (Rs)"];
    const tableRows = [];

    allPurchases.forEach((purchase, index) => {
      const date = new Date(purchase.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const total = Number(purchase.total).toFixed(2);
      const paid = Number(purchase.paid).toFixed(2);
      const due = (Number(purchase.total) - Number(purchase.paid)).toFixed(2);

      tableRows.push([
        index + 1,
        date,
        total,
        paid,
        due
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [212, 175, 55] },
      styles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`${partyName.replace(/\s+/g, '_')}_Purchases.pdf`);
    toast.success('PDF downloaded successfully');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/parties')} className="text-[var(--text-muted)] hover:text-luxury-gold transition-colors cursor-pointer">
              <HiOutlineArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">
              {party ? `${party.name} Purchases` : 'Purchases'}
            </h1>
          </div>
          {party && (
             <div className="flex gap-6 mt-2 text-sm">
               <p className="text-[var(--text-secondary)]">Total Purchase: <strong className="text-[var(--text-primary)]">{'\u20B9'}{party.total_purchase || 0}</strong></p>
               <p className="text-[var(--text-secondary)]">Total Due: <strong className="text-red-400">{'\u20B9'}{party.total_due || 0}</strong></p>
             </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto mt-4 md:mt-0">
          <button 
            onClick={generatePDF}
            className="bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:text-luxury-gold hover:border-luxury-gold transition-colors flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center shadow-[var(--shadow-card)]"
          >
            <HiOutlineDownload className="w-5 h-5" />
            Download PDF
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center shadow-[var(--shadow-card)]"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Purchase
          </button>
        </div>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">#</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-center">Total (₹)</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-center">Paid (₹)</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-center">Due (₹)</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8">Loading purchases...</td></tr>
              ) : currentPurchases.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-[var(--text-muted)]">No purchases found.</td></tr>
              ) : (
                currentPurchases.map((purchase, index) => (
                  <tr 
                    key={purchase.id} 
                    className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                    onClick={() => { 
                      setSelectedPurchase({
                        ...purchase, 
                        date: new Date(purchase.date).toISOString().split('T')[0]
                      }); 
                      setIsEditModalOpen(true); 
                    }}
                  >
                    <td className="px-6 py-4 font-medium text-[var(--text-muted)]">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{new Date(purchase.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)] text-center">{purchase.total}</td>
                    <td className="px-6 py-4 font-medium text-green-400 text-center">{purchase.paid}</td>
                    <td className="px-6 py-4 font-medium text-red-400 text-center">{Number(purchase.total) - Number(purchase.paid)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedPurchase({
                              ...purchase, 
                              date: new Date(purchase.date).toISOString().split('T')[0]
                            }); 
                            setIsEditModalOpen(true); 
                          }}
                          className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleWhatsapp(e, purchase)}
                          className="text-green-400 hover:text-white hover:bg-green-500 transition-colors flex items-center justify-center cursor-pointer bg-green-500/10 p-2 rounded-md border border-green-500/30"
                          title="Share on WhatsApp"
                        >
                          <HiOutlineChat className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); confirmDelete(purchase.id); }}
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
        {!loading && allPurchases.length > 0 && (
          <CustomPagination 
            page={currentPage}
            totalPages={totalPages}
            setPage={setCurrentPage}
            limit={itemsPerPage}
            setLimit={setItemsPerPage}
          />
        )}
      </div>

      {/* Add Purchase Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl shadow-[var(--shadow-card)] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] rounded-t-2xl">
               <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Add Purchase</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Record a new purchase from supplier</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddPurchase} className="p-6 flex-1 bg-[var(--bg-primary)] rounded-b-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Purchase Date *</label>
                  <CustomDatePicker value={newPurchase.date} onChange={date => setNewPurchase({...newPurchase, date})} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Total Amount (₹) *</label>
                  <input type="number" step="0.01" required value={newPurchase.total} onChange={e => setNewPurchase({...newPurchase, total: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Amount Paid (₹) *</label>
                  <input type="number" step="0.01" required value={newPurchase.paid} onChange={e => setNewPurchase({...newPurchase, paid: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="0.00" />
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Save Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Purchase Modal */}
      {isEditModalOpen && selectedPurchase && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl shadow-[var(--shadow-card)] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] rounded-t-2xl">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Edit Purchase</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Update purchase details</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditPurchase} className="p-6 flex-1 bg-[var(--bg-primary)] rounded-b-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Purchase Date *</label>
                  <CustomDatePicker value={selectedPurchase.date} onChange={date => setSelectedPurchase({...selectedPurchase, date})} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Total Amount (₹) *</label>
                  <input type="number" step="0.01" required value={selectedPurchase.total} onChange={e => setSelectedPurchase({...selectedPurchase, total: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Amount Paid (₹) *</label>
                  <input type="number" step="0.01" required value={selectedPurchase.paid} onChange={e => setSelectedPurchase({...selectedPurchase, paid: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="0.00" />
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Update Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ isOpen: false, idToDelete: null })}
        onConfirm={deletePurchase}
        title="Delete Purchase"
        message="Are you sure you want to delete this purchase? This action cannot be undone and will affect the party's due balance."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default AdminPartyPurchases;

