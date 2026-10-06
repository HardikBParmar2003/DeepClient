import { useState, useEffect } from 'react';
import { HiOutlineUsers, HiOutlineShoppingBag, HiOutlineCurrencyRupee, HiOutlineEye, HiTrendingUp, HiTrendingDown, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import OrderDetailsModal from '../../components/shared/OrderDetailsModal';
import ConfirmModal from '../../components/shared/ConfirmModal';
import CustomSelect from '../../components/shared/CustomSelect';
import CustomDatePicker from '../../components/shared/CustomDatePicker';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ pendingOrders: 0, orders: 0, revenue: 0, changes: { pendingOrders: '+0.00%', orders: '+0.00%', revenue: '+0.00%' } });
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });

  // Filters
  const [filterType, setFilterType] = useState('date'); // 'date', 'month', 'year', 'custom'
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterStartDate, setFilterStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterEndDate, setFilterEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filterTypeOptions = [
    { value: 'date', label: 'By Date' },
    { value: 'month', label: 'By Month' },
    { value: 'year', label: 'By Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({
    value: m.toString().padStart(2, '0'),
    label: new Date(0, m - 1).toLocaleString('default', { month: 'long' })
  }));

  const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => ({
    value: y.toString(),
    label: y.toString()
  }));

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      let queryParams = new URLSearchParams();
      if (filterType === 'date' && filterDate) {
        queryParams.append('date', filterDate);
      } else if (filterType === 'month' && filterMonth && filterYear) {
        queryParams.append('month', filterMonth);
        queryParams.append('year', filterYear);
      } else if (filterType === 'year' && filterYear) {
        queryParams.append('year', filterYear);
      } else if (filterType === 'custom' && filterStartDate && filterEndDate) {
        queryParams.append('startDate', filterStartDate);
        queryParams.append('endDate', filterEndDate);
      }

      const { data } = await api.get(`/admin/dashboard?${queryParams.toString()}`);
      if (data.success) {
        setStats(data.data.stats);
        setRecentOrders(data.data.recentOrders);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    }
  };

  const confirmDelete = (id) => {
    setConfirmModalData({ isOpen: true, idToDelete: id });
  };

  const deleteOrder = async () => {
    try {
      await api.delete(`/orders/${confirmModalData.idToDelete}`);
      toast.success('Order deleted successfully');
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to delete order');
    } finally {
      setConfirmModalData({ isOpen: false, idToDelete: null });
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filterType, filterDate, filterMonth, filterYear, filterStartDate, filterEndDate]);

  const handleStatClick = (id) => {
    let queryParams = new URLSearchParams();
    if (id === 'pending') {
      queryParams.append('status', 'Pending');
    }
    
    // Always append the current filter so Orders page shows the correct data
    if (filterType === 'date' && filterDate) {
      queryParams.append('date', filterDate);
    } else if (filterType === 'month' && filterMonth && filterYear) {
      queryParams.append('month', filterMonth);
      queryParams.append('year', filterYear);
    } else if (filterType === 'year' && filterYear) {
      queryParams.append('year', filterYear);
    } else if (filterType === 'custom' && filterStartDate && filterEndDate) {
      queryParams.append('startDate', filterStartDate);
      queryParams.append('endDate', filterEndDate);
    }

    navigate(`/admin/orders?${queryParams.toString()}`);
  };

  const statCards = [
    { id: 'pending', name: 'Pending Orders', value: stats.pendingOrders || 0, icon: HiOutlineUsers, change: stats.changes?.pendingOrders || '+0.00%' },
    { id: 'orders', name: 'Orders', value: stats.orders || 0, icon: HiOutlineShoppingBag, change: stats.changes?.orders || '+0.00%' },
    { id: 'revenue', name: 'Revenue', value: `₹${stats.revenue?.toLocaleString() || 0}`, icon: HiOutlineCurrencyRupee, change: stats.changes?.revenue || '+0.00%' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">Dashboard Overview</h1>
          <p className="text-[var(--text-secondary)] mt-1">Monitor your shop's performance</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-color)]">
          <CustomSelect 
            name="filterType"
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            options={filterTypeOptions}
            className="w-40 z-20"
          />

          {filterType === 'date' && (
            <CustomDatePicker 
              value={filterDate}
              onChange={(val) => setFilterDate(val)}
              align="right"
            />
          )}

          {filterType === 'custom' && (
            <div className="flex items-center gap-2">
              <CustomDatePicker 
                label="From"
                value={filterStartDate}
                onChange={(val) => setFilterStartDate(val)}
                align="right"
              />
              <span className="text-[var(--text-muted)] text-xs px-2">-</span>
              <CustomDatePicker 
                label="To"
                value={filterEndDate}
                onChange={(val) => setFilterEndDate(val)}
                align="right"
              />
            </div>
          )}

          {filterType === 'month' && (
            <>
              <CustomSelect 
                name="filterMonth"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                options={monthOptions}
                className="w-36 z-20"
              />
              <CustomSelect 
                name="filterYear"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                options={yearOptions}
                className="w-32 z-20"
              />
            </>
          )}

          {filterType === 'year' && (
            <CustomSelect 
              name="filterYear"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              options={yearOptions}
              className="w-32 z-20"
            />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {statCards.map((stat, idx) => (
          <div 
            key={idx} 
            onClick={() => handleStatClick(stat.id)}
            className="glassmorphism p-6 rounded-xl border border-[var(--border-color)] relative overflow-hidden group cursor-pointer hover:border-luxury-gold transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase mb-1">{stat.name}</p>
                <h3 className="text-3xl font-light text-[var(--text-primary)]">{stat.value}</h3>
              </div>
              <div className="p-3 bg-luxury-gold/20 rounded-lg transition-colors">
                <stat.icon className="w-6 h-6 text-luxury-gold" />
              </div>
            </div>

          </div>
        ))}
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden relative">
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card)]">
          <div>
            <h2 className="text-sm font-semibold tracking-widest uppercase text-luxury-gold">Recent Orders</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Latest transactions from your customers</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Customer</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Amount</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Order Status</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Payment</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {recentOrders.map((order, index) => (
                <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--text-primary)]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 min-w-[120px]">
                    <div className="font-medium text-[var(--text-primary)]">
                      {order.customerName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--text-primary)]">
                      ₹{order.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium tracking-wider uppercase border ${
                      order.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 
                      order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 
                      order.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                      order.status === 'cancelled' ? 'bg-gray-500/10 text-gray-400 border-gray-500/30' : 
                      'bg-gray-500/10 text-gray-400 border-gray-500/30'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium tracking-wider uppercase border ${
                      order.pay_status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 
                      order.pay_status === 'pending' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                      order.pay_status === 'partially' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 
                      'bg-gray-500/10 text-gray-400 border-gray-500/30'
                    }`}>
                      {order.pay_status}
                    </span>
                  </td>
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
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-[var(--text-muted)]">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isEditing && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
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

export default AdminDashboard;
