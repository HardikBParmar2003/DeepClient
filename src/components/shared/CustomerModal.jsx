import React, { useState, useEffect } from 'react';
import { HiX, HiOutlinePhone, HiOutlineUser, HiPencil } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CustomerModal = ({ isOpen, onClose, customer, onUpdate, initialEditMode = false }) => {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [formData, setFormData] = useState({
    name: '',
    mobile: ''
  });

  useEffect(() => {
    if (isOpen && customer) {
      setFormData({
        name: customer.name || '',
        mobile: customer.mobile || ''
      });
      setIsEditing(initialEditMode);
    }
  }, [isOpen, customer, initialEditMode]);

  if (!isOpen || !customer) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/users/${customer.id}`, formData);
      if (data.success) {
        toast.success('Customer updated successfully');
        setIsEditing(false);
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update customer');
    }
  };

  const userInitial = customer.name ? customer.name.charAt(0).toUpperCase() : 'C';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="customer-modal-container relative w-full max-w-md glassmorphism rounded-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient accent */}
          <div className="relative h-28 bg-gradient-to-br from-luxury-gold/30 via-luxury-gold/10 to-transparent overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.2),transparent_70%)]" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-full hover:bg-[var(--bg-card-hover)] cursor-pointer"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>

          {/* Avatar - overlapping header */}
          <div className="flex justify-center -mt-12">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-luxury-gold to-luxury-gold-dark flex items-center justify-center text-3xl font-semibold text-black shadow-[0_0_30px_rgba(212,175,55,0.3)] border-4 border-[var(--bg-primary)] ring-2 ring-luxury-gold/20">
                {userInitial}
              </div>
            </div>
          </div>

          {/* User Name & Role */}
          <div className="text-center mt-3 mb-1 px-6">
            <h2 className="text-xl font-medium text-[var(--text-primary)] tracking-wide">{customer.name}</h2>
            <span className="inline-block mt-1 text-[10px] uppercase tracking-[0.2em] text-luxury-gold bg-luxury-gold/10 px-3 py-1 rounded-full border border-luxury-gold/20">
              {customer.cust_type || 'Customer'}
            </span>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 pt-4">
            {!isEditing ? (
              /* View Mode */
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                  <div className="w-9 h-9 rounded-lg bg-luxury-gold/10 flex items-center justify-center flex-shrink-0">
                    <HiOutlineUser className="h-4 w-4 text-luxury-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Full Name</p>
                    <p className="text-sm text-[var(--text-primary)] truncate">{customer.name}</p>
                  </div>
                </div>

                

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                  <div className="w-9 h-9 rounded-lg bg-luxury-gold/10 flex items-center justify-center flex-shrink-0">
                    <HiOutlinePhone className="h-4 w-4 text-luxury-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Mobile</p>
                    <p className="text-sm text-[var(--text-primary)] truncate">{customer.mobile || 'Not set'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-3 py-3 text-sm font-medium uppercase tracking-widest text-black bg-luxury-gold hover:bg-luxury-gold-dark transition-all duration-300 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] cursor-pointer"
                >
                  Edit Customer
                </button>
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="appearance-none block w-full px-4 py-2.5 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-gold text-sm"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Mobile Number</label>
                  <input
                    name="mobile"
                    type="text"
                    required
                    className="appearance-none block w-full px-4 py-2.5 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-gold text-sm"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 text-sm font-medium uppercase tracking-widest text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors duration-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-sm font-medium uppercase tracking-widest text-black bg-luxury-gold hover:bg-luxury-gold-dark transition-all duration-300 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .customer-modal-container {
          animation: customerModalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes customerModalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default CustomerModal;
