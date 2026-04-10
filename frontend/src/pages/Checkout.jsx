import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

const API_BASE = window.location.hostname === 'localhost' ? '' : `http://${window.location.hostname}:5000`;

const Checkout = () => {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmount = (subtotal * discountPercentage) / 100;
    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * 0.05; // 5% GST
    const total = discountedSubtotal + tax;

    const handleCheckout = async () => {
        if (cart.length === 0) return alert("Cart is empty!");
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            // Safety check for user name
            const userName = user?.name || user?.email || 'Customer';

            const payload = {
                customerName: userName,
                customerPhone: user?.phone || '',
                items: cart.map(item => ({
                    productId: item._id,
                    name: item.name,
                    unitPrice: Number(item.price),
                    quantity: Number(item.quantity),
                    total: Number(item.price) * Number(item.quantity)
                })),
                paymentMethod,
                status: 'Pending'
            };

            console.log('Sending Bill Payload:', payload);

            await axios.post(`${API_BASE}/api/sale-bills`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            clearCart();
            alert('Order Placed Successfully!');
            navigate('/products');
        } catch (err) {
            console.error('Checkout error:', err.response?.data);
            const errorMsg = typeof err.response?.data === 'string' 
                ? err.response.data 
                : err.response?.data?.message || err.message;
            alert('Checkout Failed: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const isCustomer = user?.role === 'customer';

    if (cart.length === 0) {
        return (
            <div className={`p-8 text-center min-h-screen flex flex-col items-center justify-center transition-colors ${isCustomer ? 'bg-[#f5f0eb] dark:bg-[#111827]' : 'bg-slate-50 dark:bg-slate-950'}`}>
                <h2 className={`text-2xl font-black italic uppercase tracking-tighter mb-4 ${isCustomer ? 'text-stone-800 dark:text-teal-300' : 'text-slate-800 dark:text-white'}`}>Your Archive is Empty</h2>
                <button onClick={() => navigate('/products')} className={`font-black uppercase tracking-widest text-xs underline ${isCustomer ? 'text-teal-600 dark:text-teal-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    Return to Collection
                </button>
            </div>
        );
    }

    return (
        <div className={`p-6 min-h-screen transition-colors duration-300 ${isCustomer ? 'bg-[#f5f0eb] dark:bg-[#111827]' : ''}`}>
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/products')} className={`flex items-center mb-10 transition-colors font-black uppercase tracking-widest text-[10px] ${isCustomer ? 'text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                    <FiArrowLeft className="mr-2" /> Resume Curation
                </button>

                <h1 className={`text-4xl font-black italic uppercase tracking-tighter mb-10 ${isCustomer ? 'text-stone-800 dark:text-teal-300' : 'text-slate-800 dark:text-white'}`}>Checkout</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Cart Items */}
                    <div className="md:col-span-2 space-y-6">
                        {cart.map((item) => (
                            <motion.div
                                layout
                                key={item._id}
                                className={`p-6 rounded-[2rem] shadow-xl flex justify-between items-center transition-all duration-500 border group ${isCustomer ? 'bg-white dark:bg-[#1e293b] border-teal-100/40 dark:border-teal-800/20 hover:border-teal-300/50 dark:hover:border-teal-600/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                            >
                                <div className="flex-1">
                                    <h3 className={`font-black italic uppercase tracking-tighter text-xl ${isCustomer ? 'text-stone-800 dark:text-white' : 'text-slate-800 dark:text-white'}`}>{item.name}</h3>
                                    <p className={`font-black uppercase tracking-[0.2em] text-[10px] mt-2 ${isCustomer ? 'text-teal-600 dark:text-teal-500' : 'text-slate-500 dark:text-slate-400'}`}>₹{item.price} • Unit Curation</p>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className={`flex items-center rounded-2xl border ${isCustomer ? 'bg-[#f5f0eb] dark:bg-[#1e293b] border-teal-200/30 dark:border-teal-700/20' : 'border-slate-200 dark:border-slate-600'}`}>
                                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-3 hover:scale-110 transition-transform"><FiMinus size={14} className={isCustomer ? 'text-teal-500' : 'text-slate-600 dark:text-slate-300'} /></button>
                                        <span className={`px-4 font-black ${isCustomer ? 'text-stone-800 dark:text-teal-300' : 'text-slate-800 dark:text-white'}`}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-3 hover:scale-110 transition-transform"><FiPlus size={14} className={isCustomer ? 'text-teal-500' : 'text-slate-600 dark:text-slate-300'} /></button>
                                    </div>
                                    <span className={`font-black text-xl italic tracking-tighter min-w-[100px] text-right ${isCustomer ? 'text-stone-800 dark:text-teal-300' : 'text-slate-800 dark:text-white'}`}>₹{item.price * item.quantity}</span>
                                    <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 p-3 rounded-2xl transition-all hover:scale-110"><FiTrash2 size={20} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className={`p-8 rounded-[2.5rem] shadow-2xl h-fit border transition-all duration-500 ${isCustomer ? 'bg-white dark:bg-[#1e293b] border-teal-100/40 dark:border-teal-800/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                        <h2 className={`text-2xl font-black italic uppercase tracking-tighter mb-8 pb-4 border-b ${isCustomer ? 'text-stone-800 dark:text-teal-300 border-teal-100/40 dark:border-teal-800/20' : 'text-slate-800 dark:text-white border-slate-100 dark:border-slate-700'}`}>Summary</h2>

                        <div className={`space-y-4 mb-8 font-black uppercase tracking-widest text-[10px] ${isCustomer ? 'text-stone-500 dark:text-stone-400' : 'text-slate-600 dark:text-slate-300'}`}>
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className={isCustomer ? 'text-stone-700 dark:text-teal-300' : ''}>₹{subtotal.toFixed(2)}</span>
                            </div>

                            {(!isCustomer && (user?.role === 'admin' || user?.role === 'billing')) && (
                                <div className="flex justify-between items-center py-2">
                                    <span>Discount (%)</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={discountPercentage}
                                        onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                                        className="w-16 p-2 border border-slate-200 dark:border-slate-600 rounded-xl text-right bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                                    />
                                </div>
                            )}

                            {discountPercentage > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-emerald-500">
                                    <span>Loyalty Discount</span>
                                    <span>-₹{discountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span>Vat (5%)</span>
                                <span className={isCustomer ? 'text-stone-700 dark:text-teal-300' : ''}>₹{tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className={`block text-[10px] font-black uppercase tracking-tighter mb-3 ${isCustomer ? 'text-teal-600 dark:text-teal-500' : 'text-slate-700 dark:text-slate-300'}`}>Settlement</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className={`w-full p-4 rounded-xl outline-none font-bold text-sm appearance-none border ${isCustomer ? 'bg-[#f5f0eb] dark:bg-[#1e293b] border-teal-200/30 dark:border-teal-700/20 text-stone-800 dark:text-teal-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white'}`}
                            >
                                <option value="Cash">Cash / COD</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Card</option>
                            </select>
                        </div>

                        <div className={`border-t pt-6 mb-8 ${isCustomer ? 'border-teal-200/30 dark:border-teal-800/20' : 'border-slate-200 dark:border-slate-700'}`}>
                            <div className="flex justify-between items-end">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isCustomer ? 'text-teal-600 dark:text-teal-500' : 'text-slate-500'}`}>Grand Total</span>
                                <span className={`text-4xl font-black italic tracking-tighter ${isCustomer ? 'text-stone-800 dark:text-teal-300' : 'text-slate-800 dark:text-white'}`}>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-2xl transition-all border ${isCustomer ? 'bg-teal-500 dark:bg-teal-600 text-white border-teal-400/30 hover:scale-[1.02] shadow-teal-400/25' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'}`}
                        >
                            {loading ? 'Confirming...' : 'Authorize Transaction'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
