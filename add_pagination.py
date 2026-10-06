import os

filepath = r"D:\deep clothes\client\src\pages\admin\AdminProfitLoss.jsx"

content = r'''import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineCurrencyRupee, HiOutlineCalendar, HiX } from 'react-icons/hi';
import CustomDatePicker from '../../components/shared/CustomDatePicker';
import CustomPagination from '../../components/shared/CustomPagination';

const AdminProfitLoss = () => {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [selectedCode, setSelectedCode] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  const filteredOrders = orders.filter(order => {
    if (!startDate && !endDate) return true;
    const oDate = new Date(order.orderDate);
    oDate.setHours(0, 0, 0, 0);
    
    let isValid = true;
    if (startDate) {
      const sDate = new Date(startDate);
      sDate.setHours(0, 0, 0, 0);
      if (oDate < sDate) isValid = false;
    }
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      if (oDate > eDate) isValid = false;
    }
    return isValid;
  });

  const invMap = {};
  inventory.forEach(inv => {
    invMap[inv.uniqueCode?.toUpperCase()] = parseFloat(inv.price) || 0;
  });

  let totalRevenue = 0;
  let totalCost = 0;
  
  const categoryMetrics = {
    'Shirt': { qty: 0, revenue: 0, cost: 0 },
    'T-Shirt': { qty: 0, revenue: 0, cost: 0 },
    'Pant': { qty: 0, revenue: 0, cost: 0 }
  };

  const itemMetrics = {};

  filteredOrders.forEach(order => {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    
    items.forEach(item => {
      const uCode = item.uniqueCode?.toUpperCase() || 'UNKNOWN';
      const cat = item.category || 'Other';
      const qty = parseFloat(item.qty) || 0;
      const revenue = parseFloat(item.amount) || 0;
      
      const unitCost = invMap[uCode] || 0;
      const totalItemCost = unitCost * qty;

      totalRevenue += revenue;
      totalCost += totalItemCost;

      if (!categoryMetrics[cat]) {
        categoryMetrics[cat] = { qty: 0, revenue: 0, cost: 0 };
      }
      categoryMetrics[cat].qty += qty;
      categoryMetrics[cat].revenue += revenue;
      categoryMetrics[cat].cost += totalItemCost;

      if (!itemMetrics[uCode]) {
        itemMetrics[uCode] = { category: cat, qty: 0, revenue: 0, cost: 0, unitCost };
      }
      itemMetrics[uCode].qty += qty;
      itemMetrics[uCode].revenue += revenue;
      itemMetrics[uCode].cost += totalItemCost;
    });
  });

  const totalProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  const itemsArray = Object.entries(itemMetrics);
  const totalPages = Math.ceil(itemsArray.length / limit);
  const paginatedItems = itemsArray.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">Profit & Loss</h1>
          <p className="text-[var(--text-secondary)] mt-1">Analyze your sales performance and margins</p>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl shadow-[var(--shadow-card)] flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-luxury-gold">
          <HiOutlineCalendar className="w-5 h-5" />
          <span className="text-sm uppercase tracking-widest font-medium">Filter By Order Date:</span>
        </div>
        <div className="w-full md:w-48">
          <CustomDatePicker 
            label="Start Date"
            value={startDate}
            onChange={(date) => setStartDate(date)}
          />
        </div>
        <div className="text-[var(--text-muted)]">to</div>
        <div className="w-full md:w-48">
          <CustomDatePicker 
            label="End Date"
            value={endDate}
            onChange={(date) => setEndDate(date)}
          />
        </div>
        <button 
          onClick={() => { setStartDate(''); setEndDate(''); }}
          className="text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-luxury-gold transition-colors ml-auto"
        >
          Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-[var(--shadow-card)] relative overflow-hidden group hover:border-luxury-gold/50 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-1">Total Revenue</p>
              <h3 className="text-3xl font-light text-[var(--text-primary)]">{"\u20B9"}{totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <HiOutlineCurrencyRupee className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-[var(--shadow-card)] relative overflow-hidden group hover:border-luxury-gold/50 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-1">Total Cost</p>
              <h3 className="text-3xl font-light text-[var(--text-primary)]">{"\u20B9"}{totalCost.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <HiOutlineChartBar className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className={'bg-[var(--bg-card)] border ' + (totalProfit >= 0 ? 'border-green-500/30' : 'border-red-500/30') + ' p-6 rounded-2xl shadow-[var(--shadow-card)] relative overflow-hidden group hover:border-luxury-gold/50 transition-colors'}>
          <div className={'absolute -right-6 -top-6 w-24 h-24 ' + (totalProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10') + ' rounded-full blur-2xl transition-colors'}></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-1">Net Profit / Loss</p>
              <h3 className={'text-3xl font-light ' + (totalProfit >= 0 ? 'text-green-600' : 'text-red-600')}>
                {"\u20B9"}{Math.abs(totalProfit).toFixed(2)}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-2">Margin: {marginPercent}%</p>
            </div>
            <div className={'w-12 h-12 rounded-xl flex items-center justify-center border ' + (totalProfit >= 0 ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-red-500/10 border-red-500/20 text-red-600')}>
              {totalProfit >= 0 ? <HiOutlineTrendingUp className="w-6 h-6" /> : <HiOutlineTrendingDown className="w-6 h-6" />}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium tracking-widest uppercase text-luxury-gold mb-4 border-b border-[var(--border-color)] pb-2">Category Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(categoryMetrics).map(([cat, data]) => {
            const catProfit = data.revenue - data.cost;
            const catMargin = data.revenue > 0 ? ((catProfit / data.revenue) * 100).toFixed(1) : 0;
            return (
              <div key={cat} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 hover:border-luxury-gold/50 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-luxury-gold/10 border border-luxury-gold/30 rounded-md text-xs font-medium tracking-wider uppercase text-luxury-gold">{cat}</span>
                  <span className="text-xs text-[var(--text-secondary)]">Sold: {data.qty}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Revenue:</span>
                    <span className="text-[var(--text-primary)]">{"\u20B9"}{data.revenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Cost:</span>
                    <span className="text-[var(--text-primary)]">{"\u20B9"}{data.cost.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-[var(--border-color)] flex justify-between font-medium">
                    <span className="text-[var(--text-primary)]">Profit:</span>
                    <span className={catProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {"\u20B9"}{Math.abs(catProfit).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)] mt-8">
        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)]">Item-wise Profit & Loss</h2>
          <span className="text-xs text-[var(--text-muted)]">Click on a row to view orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">#</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">Code</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">Category</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] text-right">Qty Sold</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] text-right">Unit Cost</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] text-right">Total Cost</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] text-right">Revenue</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] text-right">Profit / Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-[var(--text-muted)] tracking-widest uppercase">
                    Loading data...
                  </td>
                </tr>
              ) : itemsArray.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-[var(--text-muted)]">
                    No sales data found for the selected period.
                  </td>
                </tr>
              ) : (
                paginatedItems.map(([code, data], index) => {
                  const profit = data.revenue - data.cost;
                  const serialNumber = (page - 1) * limit + index + 1;
                  return (
                    <tr key={code} onClick={() => setSelectedCode(code)} className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer">
                      <td className="px-6 py-4 font-medium text-[var(--text-muted)]">{serialNumber}</td>
                      <td className="px-6 py-4 font-mono text-[var(--text-primary)]">{code}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-luxury-gold/10 border border-luxury-gold/30 rounded-md text-[10px] font-medium tracking-wider uppercase text-luxury-gold">
                          {data.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-[var(--text-primary)]">{data.qty}</td>
                      <td className="px-6 py-4 text-right text-[var(--text-secondary)]">{"\u20B9"}{data.unitCost.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-[var(--text-secondary)]">{"\u20B9"}{data.cost.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-[var(--text-primary)]">{"\u20B9"}{data.revenue.toFixed(2)}</td>
                      <td className={'px-6 py-4 text-right font-medium ' + (profit >= 0 ? 'text-green-600' : 'text-red-600')}>
                        {"\u20B9"}{Math.abs(profit).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {itemsArray.length > 0 && (
          <CustomPagination 
            page={page} 
            totalPages={totalPages} 
            setPage={setPage} 
            limit={limit} 
            setLimit={setLimit} 
          />
        )}
      </div>
      
      {selectedCode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[var(--shadow-card)]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <h2 className="text-lg uppercase tracking-widest text-luxury-gold">
                Sales History: {selectedCode}
              </h2>
              <button onClick={() => setSelectedCode(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <HiX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                        <th className="px-4 py-3 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">Order Date</th>
                        <th className="px-4 py-3 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">Customer</th>
                        <th className="px-4 py-3 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] text-right">Qty Sold</th>
                        <th className="px-4 py-3 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                        {filteredOrders.filter(order => {
                            const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                            return items.some(i => (i.uniqueCode || '').toUpperCase() === selectedCode);
                        }).length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-[var(--text-muted)] tracking-widest uppercase text-xs">
                                    No orders found for this code.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => {
                                const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                                const matchingItem = items.find(i => (i.uniqueCode || '').toUpperCase() === selectedCode);
                                if (!matchingItem) return null;
                                return (
                                    <tr key={order.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                                        <td className="px-4 py-3 text-[var(--text-secondary)]">{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{order.name || order.customer?.name || 'Walk-in'}</td>
                                        <td className="px-4 py-3 text-right text-[var(--text-primary)]">{matchingItem.qty}</td>
                                        <td className="px-4 py-3 text-right text-green-600">{"\u20B9"}{parseFloat(matchingItem.amount || 0).toFixed(2)}</td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AdminProfitLoss;
'''

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AdminProfitLoss.jsx with pagination and serial number")
