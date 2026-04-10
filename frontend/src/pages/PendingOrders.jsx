import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiFilter, FiUser, FiPackage, FiDollarSign, FiSearch, FiInfo } from 'react-icons/fi';
import SpotlightCard from '../components/react-bits/SpotlightCard';
import BlurText from '../components/react-bits/BlurText';
import TrackingModal from '../components/TrackingModal';
import { useAuth } from '../context/AuthContext';

const PendingOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackingOrder, setTrackingOrder] = useState(null);
    const { user } = useAuth();
    const isCustomer = user?.role === 'customer';

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const fetchAllOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Fetch Pending Sale Bills (Unpaid/Partial for admins, All for customers)
            const statusFilter = isCustomer ? '' : '?status=Unpaid&status=Partial&status=Pending';
            const saleBillsRes = await axios.get(`/api/sale-bills${statusFilter}`, { headers });
            let allOrders = saleBillsRes.data.map(o => ({ 
                ...o, 
                orderType: 'invoice', // Keep internal alias for TrackingModal
                displayId: o.billNo,
                displayDate: o.billDate
            }));

            // If customer, also fetch tailoring orders
            if (isCustomer) {
                const tailoringRes = await axios.get('/api/tailoring', { headers });
                const tailoringOrders = tailoringRes.data.map(o => ({ 
                    ...o, 
                    orderType: 'tailoring', 
                    displayId: o._id.slice(-6).toUpperCase(),
                    displayDate: o.createdAt
                }));
                allOrders = [...allOrders, ...tailoringOrders];
            }

            setOrders(allOrders.sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate)));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/sale-bills/${id}/status`, {
                status: newStatus
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            // Only remove from view if it's no longer "pending"
            const shouldRemove = newStatus === 'Paid' || newStatus === 'Cancelled';

            if (shouldRemove) {
                setOrders(prev => prev.filter(order => order._id !== id));
            } else {
                setOrders(prev => prev.map(order =>
                    order._id === id ? { ...order, status: newStatus } : order
                ));
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="p-6 min-h-screen"
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center mb-10">
                    <BlurText
                        text="Pending Sales & Orders"
                        className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight"
                        delay={50}
                        animateBy="words"
                    />
                    <span className="ml-6 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold uppercase tracking-widest">
                        {orders.length} Active
                    </span>
                </div>

                {orders.length === 0 ? (
                    <SpotlightCard className="text-center py-20 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <div className="w-20 h-20 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center mx-auto mb-6">
                            <FiCheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">All Clear!</h2>
                        <p className="text-slate-500 dark:text-slate-400">No pending sales or orders require your attention.</p>
                    </SpotlightCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map((order) => (
                            <motion.div variants={itemVariants} key={order._id}>
                                <SpotlightCard className="h-full flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl group">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col">
                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-[10px] font-bold w-fit mb-1">
                                                    #{order.displayId}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium tracking-wider">
                                                    {new Date(order.displayDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                order.status === 'Pending' ? 'bg-sky-100 text-sky-600' : 
                                                order.status === 'Partial' ? 'bg-amber-100 text-amber-600' : 
                                                order.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-white group-hover:text-primary-500 transition-colors">
                                                <FiUser className="text-slate-400" />
                                                {order.customerName || 'Customer'}
                                            </h3>
                                            <div className="mt-4 space-y-2">
                                                {order.items?.slice(0, 3).map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                                                        <span>{item.quantity}x {item.name}</span>
                                                        <span>₹{(item.total || item.price * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                {order.items?.length > 3 && (
                                                    <p className="text-[10px] text-primary-500 italic mt-2">+{order.items.length - 3} more items...</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-700 mb-6">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
                                            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">₹{(order.grandTotal || 0).toLocaleString()}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {!isCustomer && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus(order._id, 'Paid')}
                                                        className="flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-xl hover:bg-green-600 transition-colors font-bold text-xs shadow-lg shadow-green-200 dark:shadow-none"
                                                    >
                                                        <FiCheckCircle /> Mark Paid
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(order._id, 'Cancelled')}
                                                        className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-bold text-xs"
                                                    >
                                                        <FiXCircle /> Cancel
                                                    </button>
                                                </>
                                            )}
                                            {isCustomer && (
                                                <button
                                                    onClick={() => setTrackingOrder(order)}
                                                    className="col-span-2 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-all font-bold text-sm shadow-xl shadow-primary-200 dark:shadow-none"
                                                >
                                                    <FiSearch /> Track My Order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            {trackingOrder && (
                <TrackingModal
                    isOpen={!!trackingOrder}
                    onClose={() => setTrackingOrder(null)}
                    order={{
                        ...trackingOrder,
                        invoiceId: trackingOrder.displayId,
                        invoiceDate: trackingOrder.displayDate
                    }}
                    type={trackingOrder.orderType}
                />
            )}
        </motion.div>
    );
};

export default PendingOrders;
