import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiX, HiOutlineEye, HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import OrderDetailsModal from '../../components/shared/OrderDetailsModal';
import ConfirmModal from '../../components/shared/ConfirmModal';

const AdminCustomerOrders = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initialCustomer = state?.customer;
  const [customer, setCustomer] = useState(initialCustomer);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!customer?.id) return;
    try {
      const { data } = await api.get(`/orders?customerId=${customer.id}`);
      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [customer?.id]);

  const confirmDelete = (id) => {
    setConfirmModalData({ isOpen: true, idToDelete: id });
  };

  const deleteOrder = async () => {
    try {
      await api.delete(`/orders/${confirmModalData.idToDelete}`);
      toast.success('Order deleted successfully');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to delete order');
    } finally {
      setConfirmModalData({ isOpen: false, idToDelete: null });
    }
  };

  if (!customer) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--text-muted)] mb-4">Customer details not found.</p>
        <button 
          onClick={() => navigate('/admin/customers')}
          className="text-luxury-gold hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest text-sm border border-luxury-gold/30 px-6 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-[var(--border-color)] pb-6">
        <div>
          <button 
            onClick={() => navigate('/admin/customers')}
            className="flex items-center text-sm text-[var(--text-secondary)] hover:text-luxury-gold transition-colors mb-2 uppercase tracking-widest"
          >
            <HiOutlineArrowLeft className="mr-2" /> Back to Customers
          </button>
          <h1 className="text-2xl font-light tracking-widest uppercase text-luxury-gold">{customer.name}'s Orders</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">{customer.mobile} • {orders.length} total orders</p>
        </div>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--text-muted)]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="text-xs text-[var(--text-faint)] uppercase bg-[var(--input-bg)]">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">#</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Order Date</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Delivery Date</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Order Status</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Payment</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">Total</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">Due Balance</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {orders.map((order, index) => (
                  <tr className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer" key={order.id} onClick={(e) => { 
                      if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; 
                      setSelectedOrder(order); 
                    }} className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-medium text-[var(--text-muted)]">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(order.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.deliverDate ? new Date(order.deliverDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider border w-fit ${
                        order.orderStatus?.toLowerCase() === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        order.orderStatus?.toLowerCase() === 'pending' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        order.orderStatus?.toLowerCase() === 'processing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                        order.orderStatus?.toLowerCase() === 'cancelled' ? 'bg-gray-500/10 text-gray-500 border-gray-500/20' : 
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider border w-fit ${
                        order.paymentStatus?.toLowerCase() === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        order.paymentStatus?.toLowerCase() === 'pending' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        order.paymentStatus?.toLowerCase() === 'partially' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                        'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-luxury-gold">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-medium text-red-400">₹{Math.max(0, parseFloat(order.totalAmount || 0) - parseFloat(order.advance || 0)).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} 
                          className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                          title="View Details"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders?edit=${order.id}`); }} 
                          className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                          title="Edit Order"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); confirmDelete(order.id); }} 
                          className="text-red-400 hover:text-white hover:bg-red-500 transition-colors flex items-center justify-center cursor-pointer bg-red-500/10 p-2 rounded-md border border-red-500/30"
                          title="Delete Order"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Order Deep Details Modal */}
      {selectedOrder && !isEditing && (
        <OrderDetailsModal 
          order={{...selectedOrder, customerName: customer.name, mobile: customer.mobile}} 
          onClose={() => setSelectedOrder(null)} 
          onEdit={() => setIsEditing(true)} 
        />
      )}

      

      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ isOpen: false, idToDelete: null })}
        onConfirm={deleteOrder}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
      />
    </div>
  );
};

export default AdminCustomerOrders;
