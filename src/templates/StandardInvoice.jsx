import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

import api from '../services/api';

const StandardInvoice = React.forwardRef(({ order }, ref) => {
  const { user } = useContext(AuthContext) || {};
  
  if (!order) return null;

  // Business details
  const shopName = user?.shopName || 'Shop Name';
  const shopAddress = user?.shopAddress || 'Shop Address';
  const shopMobile = user?.shopMobile || '';
  const getBaseUrl = () => api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5000';

  // Order items grouping
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
  
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = { category, qty: 0, amount: 0 };
    }
    acc[category].qty += (parseInt(item.qty) || 0);
    acc[category].amount += (parseFloat(item.amount) || 0);
    return acc;
  }, {});

  const groupedArray = Object.values(groupedItems);

  // Totals
  const totalAmount = parseFloat(order.totalAmount) || 0;
  const advanceAmount = parseFloat(order.advance) || 0;
  const dueAmount = Math.max(0, totalAmount - advanceAmount);

  // Dates
  const dateStr = new Date(order.created_at || order.orderDate || new Date()).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div ref={ref} className="w-[800px] bg-white p-8 font-sans text-[13px] text-black">
      <div className="border border-black flex flex-col">
        
        {/* Top Header Row */}
        <div className="border-b border-black p-1 text-center font-bold text-sm tracking-wide">
          INVOICE
        </div>
        
        {/* Company Details */}
        <div className="flex border-b border-black min-h-[100px]">
          <div className="w-36 border-r border-black p-1 flex items-center justify-center">
            {user?.shopLogo ? (
              <img src={`${getBaseUrl()}${user.shopLogo}`} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                Add Logo
              </div>
            )}
          </div>
          <div className="flex-1 text-center p-2 flex flex-col justify-center">
            <h1 className="text-xl font-bold uppercase">{shopName}</h1>
            <p className="whitespace-pre-wrap">{shopAddress}</p>
            {shopMobile && <p>Mobile: {shopMobile}</p>}
          </div>
        </div>
        
        {/* Invoice & Billing Grid (2 columns) */}
        <div className="flex border-b border-black">
          {/* Left: Invoice & Billing */}
          <div className="w-1/2 border-r border-black p-2 space-y-1">
            <div className="flex">
              <span className="w-32 font-semibold">Invoice Date</span>
              <span>: {dateStr}</span>
            </div>
            <div className="border-t border-gray-300 my-1"></div>
            <h3 className="font-bold border-b border-gray-300 inline-block mb-1">Billing Details</h3>
            <div className="flex">
              <span className="w-32 font-semibold">Name</span>
              <span>: {order.name || order.customer?.name || 'Customer'}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold">Mobile</span>
              <span>: {order.mobile || order.customer?.mobile || 'N/A'}</span>
            </div>
          </div>
          
          {/* Right: Order Status Details */}
          <div className="w-1/2 p-2 space-y-1">
            <h3 className="font-bold border-b border-gray-300 inline-block mb-1">Order Details</h3>
            <div className="flex">
              <span className="w-32 font-semibold">Order Status</span>
              <span>: {order.orderStatus || 'Completed'}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold">Delivery Date</span>
              <span>: {order.deliverDate ? new Date(order.deliverDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
            </div>
          </div>
        </div>
        
        {/* Table Header */}
        <div className="flex border-b border-black font-bold text-center bg-gray-50">
          <div className="w-12 border-r border-black p-1">Sr.</div>
          <div className="flex-1 border-r border-black p-1 text-left pl-2">Item Description</div>
          <div className="w-24 border-r border-black p-1">Qty</div>
          <div className="w-32 p-1 text-right pr-2">Amount (₹)</div>
        </div>
        
        {/* Table Body (min-height to force the grid look like the image) */}
        <div className="flex min-h-[300px]">
          {/* Sr No Column */}
          <div className="w-12 border-r border-black p-1 text-center flex flex-col gap-1">
            {groupedArray.map((_, i) => <span key={i}>{i + 1}</span>)}
          </div>
          {/* Description Column */}
          <div className="flex-1 border-r border-black p-1 pl-2 text-left flex flex-col gap-1">
            {groupedArray.map((item, i) => <span key={i}>{item.category}</span>)}
          </div>
          {/* Qty Column */}
          <div className="w-24 border-r border-black p-1 text-center flex flex-col gap-1">
            {groupedArray.map((item, i) => <span key={i}>{item.qty}</span>)}
          </div>
          {/* Amount Column */}
          <div className="w-32 p-1 text-right pr-2 flex flex-col gap-1">
            {groupedArray.map((item, i) => <span key={i}>{item.amount.toFixed(2)}</span>)}
          </div>
        </div>
        
        {/* Totals Rows */}
        <div className="border-t border-black flex">
          <div className="flex-1 border-r border-black p-1 font-bold text-right pr-4">Total Amount</div>
          <div className="w-32 p-1 text-right pr-2 font-bold">{totalAmount.toFixed(2)}</div>
        </div>
        {advanceAmount > 0 && (
          <div className="border-t border-black flex">
            <div className="flex-1 border-r border-black p-1 font-bold text-right pr-4">Advance Paid</div>
            <div className="w-32 p-1 text-right pr-2 font-bold">- {advanceAmount.toFixed(2)}</div>
          </div>
        )}
        <div className="border-t border-black flex bg-gray-50">
          <div className="flex-1 border-r border-black p-1 font-bold text-right pr-4">Balance Due</div>
          <div className="w-32 p-1 text-right pr-2 font-bold">{dueAmount.toFixed(2)}</div>
        </div>
        
        {/* Footer sections */}
        <div className="border-t border-black flex h-32">
          <div className="w-1/2 border-r border-black p-3 text-xs">
            <h4 className="font-bold mb-1">Terms and Conditions</h4>
            <p className="mb-1">E & O.E</p>
            <p>1. Goods once sold will not be taken back.</p>
            <p>2. Subject to local jurisdiction only.</p>
          </div>
          <div className="w-1/2 p-3 flex flex-col justify-between items-end">
             <div className="text-right text-sm pt-2">For <span className="font-bold">{shopName}</span></div>
             <div className="text-right text-xs font-semibold pb-2">Authorized Signatory</div>
          </div>
        </div>
        
      </div>
    </div>
  );
});

export default StandardInvoice;
