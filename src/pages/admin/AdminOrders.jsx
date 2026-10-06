import { useState, useEffect } from 'react';
import CustomSelect from '../../components/shared/CustomSelect';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineSearch } from 'react-icons/hi';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CustomDatePicker from '../../components/shared/CustomDatePicker';

const initialItemState = { category: 'Shirt', uniqueCode: '', qty: '', amount: '' };

import CustomPagination from '../../components/shared/CustomPagination';
import ConfirmModal from '../../components/shared/ConfirmModal';
import OrderDetailsModal from '../../components/shared/OrderDetailsModal';
import { HiOutlineEye } from 'react-icons/hi';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [confirmState, setConfirmState] = useState({ isOpen: false, id: null });

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrderForView, setSelectedOrderForView] = useState(null);

  // Filters
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState(searchParams.get('status') || 'All');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('All');
  const dateParam = searchParams.get('date');
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    orderDate: '',
    deliverDate: '',
    advance: '',
    orderStatus: 'Pending',
    paymentStatus: 'Pending',
    items: [{ ...initialItemState }]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, invRes] = await Promise.all([
        api.get('/orders'),
        api.get('/inventory')
      ]);
      
      if (ordersRes.data.success) setOrders(ordersRes.data.data);
      if (invRes.data.success) setInventory(invRes.data.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  // Check for edit param in URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && orders.length > 0) {
      const orderToEdit = orders.find(o => String(o.id) === String(editId));
      if (orderToEdit && !isModalOpen) {
        openEditModal(orderToEdit);
      }
    }
  }, [searchParams, orders]);

  // Reset page when filters change
  const handleStartDateChange = (date) => {
    const newParams = new URLSearchParams(searchParams);
    if (date) {
      newParams.set('startDate', date);
      newParams.delete('date');
      newParams.delete('month');
      newParams.delete('year');
    } else {
      newParams.delete('startDate');
    }
    setSearchParams(newParams);
  };

  const handleEndDateChange = (date) => {
    const newParams = new URLSearchParams(searchParams);
    if (date) {
      newParams.set('endDate', date);
      newParams.delete('date');
      newParams.delete('month');
      newParams.delete('year');
    } else {
      newParams.delete('endDate');
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterOrderStatus, filterPaymentStatus]);

  const totalAmount = formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const dueAmount = totalAmount - (parseFloat(formData.advance) || 0);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'category') {
      newItems[index].uniqueCode = '';
      newItems[index].amount = '';
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({ ...formData, items: [...formData.items, { ...initialItemState }] });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const openAddModal = () => {
    setEditingOrder(null);
    setFormData({
      customerName: '',
      mobile: '',
      orderDate: '',
      deliverDate: '',
      advance: '',
      orderStatus: 'Pending',
      paymentStatus: 'Pending',
      items: [{ ...initialItemState }]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    
    let orderDate = '';
    if (order.orderDate) {
      const d = new Date(order.orderDate);
      orderDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    
    let deliverDate = '';
    if (order.deliverDate) {
      const d = new Date(order.deliverDate);
      deliverDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    setFormData({
      customerName: order.name || order.customer?.name || '',
      mobile: order.customer?.mobile || '',
      orderDate,
      deliverDate,
      advance: order.advance || '',
      orderStatus: order.orderStatus || 'Pending',
      paymentStatus: order.paymentStatus || 'Pending',
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const invalidItem = formData.items.find(i => !i.uniqueCode || !i.qty || !i.amount);
    if (invalidItem) {
      toast.error('Please fill all item fields');
      return;
    }

    const payload = {
      ...formData,
      name: formData.customerName, // Use the customer name for the order name
      totalAmount
    };

    try {
      if (editingOrder) {
        const { data } = await api.put(`/orders/${editingOrder.id}`, payload);
        if (data.success) toast.success('Order updated');
      } else {
        const { data } = await api.post('/orders', payload);
        if (data.success) toast.success('Order created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save order');
    }
  };

  const handleDelete = (id) => {
    setConfirmState({ isOpen: true, id });
  };

  const executeDelete = async (id) => {
    try {
      const { data } = await api.delete(`/orders/${id}`);
      if (data.success) {
        toast.success('Order deleted');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete order');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.mobile?.includes(searchTerm);
    
    const matchesOrder = filterOrderStatus === 'All' || order.orderStatus === filterOrderStatus;
    const matchesPayment = filterPaymentStatus === 'All' || order.paymentStatus === filterPaymentStatus;

    let matchesDate = true;
    if (order.orderDate) {
      const d = new Date(order.orderDate);
      if (startDateParam || endDateParam) {
        if (startDateParam) {
          const start = new Date(`${startDateParam}T00:00:00.000Z`);
          matchesDate = matchesDate && d >= start;
        }
        if (endDateParam) {
          const end = new Date(`${endDateParam}T23:59:59.999Z`);
          matchesDate = matchesDate && d <= end;
        }
      } else if (dateParam) {
        const queryDate = new Date(dateParam);
        matchesDate = d.getFullYear() === queryDate.getFullYear() &&
                      d.getMonth() === queryDate.getMonth() &&
                      d.getDate() === queryDate.getDate();
      } else if (monthParam && yearParam) {
        matchesDate = d.getFullYear().toString() === yearParam &&
                      (d.getMonth() + 1).toString().padStart(2, '0') === monthParam;
      } else if (yearParam) {
        matchesDate = d.getFullYear().toString() === yearParam;
      }
    }

    return matchesSearch && matchesOrder && matchesPayment && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / limit);
  const paginatedOrders = filteredOrders.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">Orders</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage client orders in one place</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2.5 rounded-lg uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)] whitespace-nowrap"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Create Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-[var(--shadow-card)]">
        <div className="relative flex-grow md:max-w-xs">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
          <input 
            type="text"
            placeholder="Search name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors h-[42px]"
          />
        </div>
        <div className="z-20">
          <CustomDatePicker 
            label="From"
            value={startDateParam || ''}
            onChange={handleStartDateChange}
          />
        </div>
        <div className="z-20">
          <CustomDatePicker 
            label="To"
            value={endDateParam || ''}
            onChange={handleEndDateChange}
          />
        </div>
        <div className="w-[220px] z-10">
          <CustomSelect 
              name="filterOrderStatus"
              value={filterOrderStatus} 
              onChange={(e) => setFilterOrderStatus(e.target.value)}
              options={[
                {value: 'All', label: 'All Order Statuses'},
                {value: 'Pending', label: 'Pending'},
                {value: 'Completed', label: 'Completed'}
              ]}
            />
        </div>
        <div className="w-[220px] z-10">
          <CustomSelect 
              name="filterPaymentStatus"
              value={filterPaymentStatus} 
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              options={[
                {value: 'All', label: 'All Payment Statuses'},
                {value: 'Pending', label: 'Pending'},
                {value: 'Completed', label: 'Completed'}
              ]}
            />
        </div>
      </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] w-16">#</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Client Details</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Order Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Delivery Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Order</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Payment</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Total</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-[var(--text-muted)] tracking-widest uppercase">
                    Loading orders...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-[var(--text-muted)]">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => {
                  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                  const due = parseFloat(order.totalAmount) - parseFloat(order.advance);
                  const serialNumber = (page - 1) * limit + index + 1;
                  
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                      onClick={(e) => {
                        if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; 
                        const editBtn = e.currentTarget.querySelector('button[title="View"]') || e.currentTarget.querySelector('button[title="View Details"]') || e.currentTarget.querySelector('button[title="Edit"]') || e.currentTarget.querySelector('button[title="Edit Name"]'); 
                        if(editBtn) editBtn.click();
                      }}
                    >
                      <td className="px-6 py-4 font-medium text-[var(--text-muted)]">
                        {serialNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[var(--text-primary)]">{order.name || order.customer?.name}</div>
                        <div className="text-sm text-[var(--text-secondary)]">{order.customer?.mobile}</div>
                        <div className="text-xs text-luxury-gold mt-1 bg-luxury-gold/10 inline-block px-2 py-0.5 rounded border border-luxury-gold/20 tracking-widest">{items.length} Items</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[var(--text-primary)]">{new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[var(--text-primary)]">{new Date(order.deliverDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium tracking-wider uppercase border ${
                          order.orderStatus === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium tracking-wider uppercase border ${
                          order.paymentStatus === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-[var(--text-primary)] font-medium">₹{parseFloat(order.totalAmount).toFixed(2)}</div>
                        <div className={`text-xs mt-1 ${due <= 0 ? 'text-green-400' : 'text-red-400'}`}>Due: ₹{due.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedOrderForView(order); }}
                            className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                            title="View"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(order); }}
                            className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors p-2 rounded-md border border-luxury-gold/30 bg-luxury-gold/10"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                            className="text-red-400 hover:text-white hover:bg-red-500 transition-colors p-2 rounded-md border border-red-500/30 bg-red-500/10"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[var(--shadow-card)]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <h2 className="text-lg uppercase tracking-widest text-luxury-gold">
                {editingOrder ? 'Edit Order' : 'Create Order'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="orderForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Client & Date Section */}
                <div className="space-y-6 p-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)]/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Customer Name *</label>
                      <input type="text" required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Mobile Number *</label>
                      <input type="text" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} disabled={!!editingOrder} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <CustomDatePicker 
                        label="Order Date *" 
                        value={formData.orderDate} 
                        onChange={(date) => setFormData({...formData, orderDate: date})} 
                      />
                    </div>
                    <div>
                      <CustomDatePicker 
                        label="Delivery Date *" 
                        value={formData.deliverDate} 
                        onChange={(date) => setFormData({...formData, deliverDate: date})} 
                      />
                    </div>
                  </div>
                  
                  {/* Status Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-color)]">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Order Status *</label>
                      <CustomSelect 
                          name="orderStatus"
                          value={formData.orderStatus} 
                          onChange={e => setFormData({...formData, orderStatus: e.target.value})}
                          options={[
                            {value: 'Pending', label: 'Pending'},
                            {value: 'Completed', label: 'Completed'}
                          ]}
                        />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Payment Status *</label>
                      <CustomSelect 
                          name="paymentStatus"
                          value={formData.paymentStatus} 
                          onChange={e => setFormData({...formData, paymentStatus: e.target.value})}
                          options={[
                            {value: 'Pending', label: 'Pending'},
                            {value: 'Completed', label: 'Completed'}
                          ]}
                        />
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-sm uppercase tracking-widest text-luxury-gold">Order Items</h3>
                  </div>
                  
                  {formData.items.map((item, index) => {
                    const filteredCodes = inventory.filter(i => i.category === item.category);
                    return (
                      <div key={index} className="flex flex-wrap md:flex-nowrap gap-4 items-end p-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)]/30">
                        <div className="w-full md:w-1/4">
                          <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Category</label>
                          <CustomSelect 
                              name="category"
                              value={item.category} 
                              onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                              options={[
                                {value: 'Shirt', label: 'Shirt'},
                                {value: 'T-Shirt', label: 'T-Shirt'},
                                {value: 'Pant', label: 'Pant'}
                              ]}
                            />
                        </div>
                        <div className="w-full md:w-1/4">
                          <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Unique Code</label>
                          <CustomSelect 
                              name="uniqueCode"
                              value={item.uniqueCode} 
                              onChange={(e) => handleItemChange(index, 'uniqueCode', e.target.value)}
                              searchable={true}
                              options={[
                                {value: '', label: 'Select Code'},
                                ...filteredCodes.map(code => ({value: code.uniqueCode, label: code.uniqueCode}))
                              ]}
                            />
                        </div>
                        <div className="w-full md:w-1/6">
                          <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Qty</label>
                          <input 
                            type="number" min="1" required
                            value={item.qty} 
                            onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="w-full md:w-1/4">
                          <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Amount (₹)</label>
                          <input 
                            type="number" min="0" step="0.01" required
                            value={item.amount} 
                            onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="w-full md:w-auto flex justify-end">
                          <button 
                            type="button" 
                            onClick={() => removeItemRow(index)}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white p-2.5 rounded transition-colors border border-red-500/30 h-[42px]"
                            title="Remove Item"
                            disabled={formData.items.length === 1}
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  <button 
                    type="button" 
                    onClick={addItemRow}
                    className="w-full border-2 border-dashed border-[var(--border-color)] rounded-xl p-4 text-center text-[var(--text-muted)] hover:border-luxury-gold hover:text-luxury-gold transition-colors flex flex-col items-center gap-2 uppercase tracking-widest text-xs"
                  >
                    <HiOutlinePlus className="w-5 h-5" />
                    Add Another Item
                  </button>
                </div>

                {/* Totals Section */}
                <div className="flex flex-col md:flex-row justify-end gap-6 pt-6 border-t border-[var(--border-color)]">
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl min-w-[200px]">
                    <span className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-1">Total Amount</span>
                    <span className="text-xl font-medium text-luxury-gold">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl min-w-[200px]">
                    <span className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-1">Advance Received</span>
                    <input 
                      type="number" min="0" step="0.01"
                      value={formData.advance} 
                      onChange={(e) => setFormData({...formData, advance: e.target.value})}
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-1 mt-1 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="bg-[var(--bg-card)] border border-red-500/30 p-4 rounded-xl min-w-[200px]">
                    <span className="block text-xs uppercase tracking-widest text-red-400/70 mb-1">Total Due</span>
                    <span className="text-xl font-medium text-red-400">₹{dueAmount.toFixed(2)}</span>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex justify-end">
              <button 
                type="submit" 
                form="orderForm"
                className="bg-luxury-gold text-[var(--bg-primary)] px-8 py-3 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              >
                Save Order
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrderForView && (
        <OrderDetailsModal 
          order={selectedOrderForView} 
          onClose={() => setSelectedOrderForView(null)} 
          onEdit={() => {
            setSelectedOrderForView(null);
            openEditModal(selectedOrderForView);
          }} 
        />
      )}

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, id: null })}
        onConfirm={() => executeDelete(confirmState.id)}
        title="Delete Order"
        message="Are you sure you want to delete this order?"
        confirmText="Delete"
        isDestructive={true}
      />
        </div>
  );
};

export default AdminOrders;

