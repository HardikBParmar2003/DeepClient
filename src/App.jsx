import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import LicenseActivationPage from './pages/LicenseActivationPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminExpenses from './pages/admin/AdminExpenses';
import AdminInventory from './pages/admin/AdminInventory';
import AdminGallery from './pages/admin/AdminGallery';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCustomerOrders from './pages/admin/AdminCustomerOrders';
import AdminSellers from './pages/admin/AdminSellers';
import AdminSellerPurchases from './pages/admin/AdminSellerPurchases';
import AdminProfitLoss from './pages/admin/AdminProfitLoss';
import AdminProfile from './pages/admin/AdminProfile';

function App() {
  return (
    <Routes>
      {/* Public Routes with Standard Layout */}
      <Route path="/activate" element={<LicenseActivationPage />} />
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
      <Route path="/product/:id" element={<Layout><ProductDetailPage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
      
      {/* Protected Customer Routes */}
      <Route path="/cart" element={
        <ProtectedRoute>
          <Layout><CartPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      } />

      {/* Admin Routes with Admin Layout */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminDashboard /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/expenses" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminExpenses /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/customers" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout><AdminCustomers /></AdminLayout>
          </ProtectedRoute>
        } />
      <Route path="/admin/customers/:id/orders" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminCustomerOrders /></AdminLayout>
        </ProtectedRoute>
      } />

        <Route path="/admin/orders" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout><AdminOrders /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/gallery" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout><AdminGallery /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/inventory" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminInventory /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/sellers" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminSellers /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/sellers/:id" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminSellerPurchases /></AdminLayout>
        </ProtectedRoute>
      } />
    
      <Route path="/admin/profit-loss" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminProfitLoss /></AdminLayout>
        </ProtectedRoute>
      } />
    
        <Route path="/admin/profile" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout><AdminProfile /></AdminLayout>
          </ProtectedRoute>
        } />
    </Routes>
  );
}

export default App;
