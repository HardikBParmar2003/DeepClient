import React, { useRef, useState, useContext } from 'react';
import { HiOutlineX, HiOutlinePencil, HiOutlineUser, HiOutlinePhone, HiOutlineCalendar, HiOutlinePrinter } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import PdfGenerator from '../../templates/PdfGenerator';
import toast from 'react-hot-toast';

const OrderDetailsModal = ({ order, onClose, onEdit }) => {
  const pdfRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!order) return null;

  const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
  
  const totalAmount = parseFloat(order.totalAmount || 0);
  const advance = parseFloat(order.advance || 0);
  const dueAmount = Math.max(0, totalAmount - advance);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleDownloadInvoice = async () => {
    if (pdfRef.current) {
      setIsGenerating(true);
      toast.loading('Generating invoice...', { id: 'pdf-toast' });
      const result = await pdfRef.current.generatePdf();
      if (result?.success) {
        toast.success('Invoice downloaded successfully!', { id: 'pdf-toast' });
      } else {
        toast.error('Failed to generate invoice.', { id: 'pdf-toast' });
      }
      setIsGenerating(false);
    }
  };

  const { user } = useContext(AuthContext) || {};
  const shopName = user?.shopName || 'Our Shop';

  const handleWhatsApp = () => {
    const customerName = order.name || order.customer?.name || order.customerName || 'Customer';
    const mobile = order.customer?.mobile || order.mobile;
    
    if (!mobile) {
      toast.error('Customer mobile number is missing');
      return;
    }

    let message = `Hello ${customerName} 👋,\n\nGreetings from *${shopName}* ✨!\n\nHere are your order details 🛍️:\n\n`;
    
    items.forEach((item) => {
      message += `🔹 ${item.qty} x ${item.category} - Rs. ${item.amount}\n`;
    });
    
    message += `\n💰 *Total Amount:* Rs. ${totalAmount.toFixed(2)}`;
    
    if (advance > 0) {
      message += `\n💵 *Advance Paid:* Rs. ${advance.toFixed(2)}`;
    }
    
    if (dueAmount > 0) {
      message += `\n❗ *Due Balance:* Rs. ${dueAmount.toFixed(2)}`;
    }
    
    message += `\n\nThank you for shopping with us! 🙏`;

    let formattedMobile = mobile.replace(/\D/g, '');
    if (formattedMobile.length === 10) {
      formattedMobile = '91' + formattedMobile;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedMobile}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[var(--shadow-card)] animate-fade-in">
        
        {/* Hidden PDF Generator */}
        <PdfGenerator ref={pdfRef} order={order} />

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <div>
            <h2 className="text-xl font-medium text-luxury-gold uppercase tracking-widest flex items-center gap-3">
              Order Details
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleWhatsApp} 
              className="text-green-500 hover:text-white hover:bg-green-600 transition-colors p-2 rounded-md border border-green-500/30 bg-green-500/10 flex items-center gap-2 text-sm uppercase tracking-widest font-medium"
              title="Send via WhatsApp"
            >
              <FaWhatsapp className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDownloadInvoice} 
              disabled={isGenerating}
              className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors p-2 rounded-md border border-luxury-gold/30 bg-luxury-gold/10 flex items-center gap-2 text-sm uppercase tracking-widest font-medium disabled:opacity-50"
              title="Download Invoice"
            >
              <HiOutlinePrinter className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Invoice'}
            </button>
            <button onClick={onEdit} className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors p-2 rounded-md border border-luxury-gold/30 bg-luxury-gold/10 flex items-center gap-2 text-sm uppercase tracking-widest font-medium">
              <HiOutlinePencil className="w-4 h-4" />
              Edit
            </button>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition-colors p-2 rounded-md border border-[var(--border-color)] hover:border-[var(--text-primary)]">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Client & Status Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)]/30">
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-widest text-luxury-gold mb-4 border-b border-[var(--border-color)] pb-2">Customer Info</h3>
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
                  <HiOutlineUser className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Name</p>
                  <p className="text-sm text-[var(--text-primary)] font-medium">{order.name || order.customer?.name || order.customerName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
                  <HiOutlinePhone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Mobile</p>
                  <p className="text-sm text-[var(--text-primary)] font-medium">{order.customer?.mobile || order.mobile || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-widest text-luxury-gold mb-4 border-b border-[var(--border-color)] pb-2">Order Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
                    <HiOutlineCalendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Order Date</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium">{formatDate(order.orderDate)}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
                    <HiOutlineCalendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Delivery Date</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium">{formatDate(order.deliverDate)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Order Status</p>
                  <span className={order.orderStatus === 'Completed' ? 'inline-block px-3 py-1 rounded text-xs uppercase tracking-widest font-medium bg-green-500/10 text-green-400 border border-green-500/20' : 'inline-block px-3 py-1 rounded text-xs uppercase tracking-widest font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}>
                    {order.orderStatus || 'Pending'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Payment Status</p>
                  <span className={order.paymentStatus === 'Completed' ? 'inline-block px-3 py-1 rounded text-xs uppercase tracking-widest font-medium bg-green-500/10 text-green-400 border border-green-500/20' : 'inline-block px-3 py-1 rounded text-xs uppercase tracking-widest font-medium bg-red-500/10 text-red-400 border border-red-500/20'}>
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-card)]/30">
            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
              <h3 className="text-sm uppercase tracking-widest text-luxury-gold">Order Items ({items.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-xs uppercase tracking-widest text-[var(--text-secondary)]">
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Unique Code</th>
                    <th className="p-4 font-medium">Quantity</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-card)] transition-colors">
                      <td className="p-4 text-sm text-[var(--text-primary)]">{item.category}</td>
                      <td className="p-4 text-sm font-medium text-luxury-gold">{item.uniqueCode}</td>
                      <td className="p-4 text-sm text-[var(--text-primary)]">{item.qty}</td>
                      <td className="p-4 text-sm text-[var(--text-primary)] text-right font-medium">{"\u20B9"}{parseFloat(item.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-[var(--text-muted)] text-sm">No items found in this order.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col md:flex-row justify-end gap-6 pt-4">
            <div className="bg-luxury-gold/10 border border-luxury-gold/30 p-5 rounded-xl min-w-[240px] flex items-center justify-between">
              <span className="block text-xs uppercase tracking-widest text-luxury-gold">Total Amount</span>
              <span className="text-xl font-bold text-luxury-gold">{"\u20B9"}{totalAmount.toFixed(2)}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-xl min-w-[240px] flex items-center justify-between">
              <span className="block text-xs uppercase tracking-widest text-[var(--text-secondary)]">Advance Paid</span>
              <span className="text-xl font-medium text-[var(--text-primary)]">{"\u20B9"}{advance.toFixed(2)}</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-xl min-w-[240px] flex items-center justify-between">
              <span className="block text-xs uppercase tracking-widest text-red-400/70">Total Due</span>
              <span className="text-xl font-bold text-red-400">{"\u20B9"}{dueAmount.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
