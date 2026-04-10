import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Dynamic imports for pages
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Customers = lazy(() => import('./pages/Customers'))
const Products = lazy(() => import('./pages/Products'))
const Billing = lazy(() => import('./pages/Billing'))
const PurchaseBills = lazy(() => import('./pages/PurchaseBills'))
const SaleBills = lazy(() => import('./pages/SaleBills'))
const Tailoring = lazy(() => import('./pages/Tailoring'))
const Reports = lazy(() => import('./pages/Reports'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const PendingOrders = lazy(() => import('./pages/PendingOrders'))
const Profile = lazy(() => import('./pages/Profile'))
const Invoice = lazy(() => import('./pages/Invoice'))
const Checkout = lazy(() => import('./pages/Checkout'))

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'

// Loading component defined outside of main.jsx or as a separate file is better for Vite
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <SpeedInsights />
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <Layout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<Dashboard />} />
                                <Route path="customers" element={<Customers />} />
                                <Route path="products" element={<Products />} />
                                <Route path="billing" element={<Billing />} />
                                <Route path="purchase-bills" element={<PurchaseBills />} />
                                <Route path="sale-bills" element={<SaleBills />} />
                                <Route path="tailoring" element={<Tailoring />} />
                                <Route path="reports" element={<Reports />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="pending-orders" element={<PendingOrders />} />
                                <Route path="profile" element={<Profile />} />
                                <Route path="checkout" element={<Checkout />} />
                            </Route>
                            <Route path="/invoice/:id" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
                        </Routes>
                    </Suspense>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
