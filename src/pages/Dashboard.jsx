import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiShoppingBag, FiScissors, FiDollarSign, FiBarChart2, FiSearch, FiX, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SpotlightCard from '../components/react-bits/SpotlightCard';
import BlurText from '../components/react-bits/BlurText';
import axios from 'axios';
import TrackingModal from '../components/TrackingModal';
import CustomerDashboard from './CustomerDashboard';

const DashboardCard = ({ title, value, icon, color, trend, children }) => (
    <SpotlightCard className="h-full p-0 flex flex-col relative overflow-hidden group bg-white dark:bg-slate-800 border-white/20 dark:border-slate-700">
        <div className="relative p-6 h-full flex flex-col justify-between z-10">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-50 dark:bg-${color}-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 z-0`}></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
                        {icon}
                    </div>
                    {trend && (
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center">
                            +{trend}%
                        </span>
                    )}
                </div>

                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</h3>
                </div>
                {children}
            </div>
        </div>
    </SpotlightCard>
);

const RecentItemsModal = ({ isOpen, onClose, items, onFeedback }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
                >
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Purchased Items</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400"><FiX size={24} /></button>
                    </div>
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 gap-4">
                            {items && items.length > 0 ? items.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 flex flex-col gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                            <FiShoppingBag size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold text-slate-700 dark:text-slate-200 block">{item.name}</span>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Order #{item.orderId} • {new Date(item.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {item.status}
                                        </div>
                                    </div>
                                    {item.status === 'Delivered' && !item.feedback && (
                                        <button
                                            onClick={() => onFeedback(item)}
                                            className="w-full py-2.5 bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-900 text-primary-600 dark:text-primary-400 rounded-xl font-bold text-xs hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FiBarChart2 size={14} /> Feedback / Complain
                                        </button>
                                    )}
                                    {item.feedback && (
                                        <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                                            <FiBarChart2 size={12} /> Feedback Provided
                                        </div>
                                    )}
                                </motion.div>
                            )) : (
                                <p className="text-center text-slate-400 py-4">No recently purchased items found.</p>
                            )}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                        <button onClick={onClose} className="w-full py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-700 shadow-sm">Close</button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'customer') {
        return <CustomerDashboard />;
    }

    const isAdmin = user?.role === 'admin';
    const isCustomer = user?.role === 'customer';
    const navigate = useNavigate();
    const API_BASE = window.location.hostname === 'localhost' ? '' : `http://${window.location.hostname}:5000`;

    const [stats, setStats] = useState({
        sales: 0,
        customers: 0,
        orders: 0,
        products: 0,
        totalPurchaseCount: 0,
        productFrequency: [],
        recentActivity: [],
        upcomingDeliveries: [],
        recentItems: [],
        upcomingProducts: []
    });
    const [trackingOrder, setTrackingOrder] = useState(null);
    const [isRecentItemsModalOpen, setIsRecentItemsModalOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE}/api/stats/dashboard`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setStats(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            }
        };
        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-4">
                <div>
                    <BlurText
                        text={isCustomer ? 'My Dashboard' : 'Dashboard Overview'}
                        className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2"
                        delay={50}
                        animateBy="words"
                    />
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">Here is what's happening with your business today.</p>
                </div>

                {!isCustomer && (
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button className="flex-1 sm:flex-none bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Last 30 Days</button>
                        <button className="flex-1 sm:flex-none bg-primary-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-primary-200 dark:shadow-primary-900/20 text-sm font-medium hover:bg-primary-700 hover:scale-105 transition-all">Download Report</button>
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {!isCustomer ? (
                    <>
                        <motion.div variants={itemVariants}><DashboardCard title="Total Sales" value={`₹${(stats.sales || 0).toLocaleString()}`} icon={<FiDollarSign size={24} />} color="emerald" /></motion.div>
                        <motion.div variants={itemVariants}><DashboardCard title="Total Purchases" value={`₹${(stats.purchases || 0).toLocaleString()}`} icon={<FiShoppingBag size={24} />} color="rose" /></motion.div>
                        <motion.div variants={itemVariants}><DashboardCard title="Net Profit" value={`₹${(stats.profit || 0).toLocaleString()}`} icon={<FiBarChart2 size={24} />} color="blue" /></motion.div>
                        <motion.div variants={itemVariants}><DashboardCard title="Pending Sales" value={stats.orders} icon={<FiDollarSign size={24} />} color="amber" /></motion.div>
                    </>
                ) : (
                    <>
                        <motion.div variants={itemVariants}><DashboardCard title="Total Spent" value={`₹${(stats.sales || 0).toLocaleString()}`} icon={<FiDollarSign size={24} />} color="emerald" /></motion.div>
                        <motion.div variants={itemVariants}><DashboardCard title="Total Purchases" value={stats.totalPurchaseCount || 0} icon={<FiShoppingBag size={24} />} color="blue" /></motion.div>
                        <motion.div variants={itemVariants}>
                            <DashboardCard title="My Active Orders" value={stats.orders} icon={<FiScissors size={24} />} color="amber">
                                <button
                                    onClick={() => setIsRecentItemsModalOpen(true)}
                                    className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                                >
                                    <FiShoppingBag size={14} /> Recent Purchased Items
                                </button>
                            </DashboardCard>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <SpotlightCard className="h-full p-4 bg-white dark:bg-slate-800 border-white/20 dark:border-slate-700">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Top Purchases</h4>
                                <div className="space-y-2">
                                    {stats.productFrequency?.slice(0, 2).map((p, i) => (
                                        <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate mr-2">{p.name}</span>
                                            <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] px-1.5 py-0.5 rounded-md">x{p.count}</span>
                                        </div>
                                    ))}
                                    {(!stats.productFrequency || stats.productFrequency.length === 0) && (
                                        <p className="text-[10px] text-slate-400 text-center py-2">No items purchased yet</p>
                                    )}
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    </>
                )}
            </div>

            {/* Charts Section Placeholder */}
            {!isCustomer && (
                <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <SpotlightCard className="col-span-2 min-h-[400px] bg-white dark:bg-slate-800 border-white/20 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Analytics</h3>
                            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300">
                                <FiBarChart2 />
                            </div>
                        </div>
                        <div className="h-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 group">
                            <motion.p
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-slate-400 dark:text-slate-500 font-medium group-hover:text-primary-500 transition-colors"
                            >
                                Chart Integration Coming Soon
                            </motion.p>
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className="bg-white dark:bg-slate-800 border-white/20 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent Activity</h3>
                        <div className="space-y-6">
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((activity, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 + 0.5 }}
                                        className="flex items-start"
                                    >
                                        <div className="w-2 h-2 mt-2 rounded-full bg-primary-500 shrink-0 mr-3 animate-pulse"></div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{activity.message}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(activity.time).toLocaleString()}</p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm">No recent activity</p>
                            )}
                        </div>
                    </SpotlightCard>
                </motion.div>
            )}

            {/* Upcoming Deliveries Section */}
            {(isAdmin || isCustomer) && (
                <motion.div variants={itemVariants} className="mt-8">
                    <SpotlightCard className="bg-white dark:bg-slate-800 border-white/20 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Upcoming Results & Deliveries</h3>
                            <div className="flex gap-2">
                                {!isCustomer && (
                                    <button
                                        onClick={() => navigate('/products')}
                                        className="flex items-center gap-2 text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-all shadow-md shadow-amber-200 dark:shadow-none"
                                    >
                                        <FiPlus size={14} /> Add Upcoming
                                    </button>
                                )}
                                {isCustomer && (
                                    <button
                                        onClick={() => setIsRecentItemsModalOpen(true)}
                                        className="flex items-center gap-2 text-xs font-bold bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-all border border-primary-100 dark:border-primary-800"
                                    >
                                        <FiShoppingBag size={14} /> Recent Purchased Items
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                ...stats.upcomingDeliveries.map(d => ({ ...d, type: 'delivery' })),
                                ...stats.upcomingProducts.map(p => ({ ...p, type: 'product' }))
                            ].sort((a, b) => new Date(a.deliveryDate || a.releaseDate) - new Date(b.deliveryDate || b.releaseDate)).map((item, i) => (
                                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                                            {item.type === 'delivery' ? (item.customerId?.name || 'Customer') : item.name}
                                        </p>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${item.type === 'delivery' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'}`}>
                                            {item.type === 'delivery' ? item.status : 'Upcoming Product'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <FiScissors size={14} className={item.type === 'delivery' ? 'text-amber-500' : 'text-primary-500'} />
                                        {item.type === 'delivery' ? (
                                            <>Delivery Due: <span className="text-slate-800 dark:text-slate-200">{new Date(item.deliveryDate).toLocaleDateString()}</span></>
                                        ) : (
                                            <>Release: <span className="text-slate-800 dark:text-slate-200">{new Date(item.releaseDate).toLocaleDateString()}</span></>
                                        )}
                                    </div>
                                    {item.type === 'product' && (
                                        <div className="mt-2 text-[10px] text-slate-400">
                                            {item.school} • {item.category}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {stats.upcomingDeliveries.length === 0 && stats.upcomingProducts.length === 0 && (
                                <div className="col-span-full py-10 text-center text-slate-400 italic text-sm">
                                    No upcoming deliveries or products found
                                </div>
                            )}
                        </div>
                    </SpotlightCard>
                </motion.div>
            )}

            {
                isCustomer && (
                    <motion.div variants={itemVariants} className="mt-8 bg-gradient-to-br from-indigo-500 to-purple-600 p-10 rounded-3xl shadow-xl text-center text-white relative overflow-hidden group">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                        />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <motion.h3
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-bold mb-4"
                            >
                                Welcome to Al-Kabah Uniforms!
                            </motion.h3>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-indigo-100 mb-8 text-lg"
                            >
                                Track your orders, view our latest collection, and update your profile all in one place.
                            </motion.p>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex justify-center gap-4"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/products')}
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg"
                                >
                                    Browse Collections
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                )
            }
            <TrackingModal
                isOpen={!!trackingOrder}
                onClose={() => setTrackingOrder(null)}
                order={trackingOrder}
                type={trackingOrder?.orderType}
            />
            <RecentItemsModal
                isOpen={isRecentItemsModalOpen}
                onClose={() => setIsRecentItemsModalOpen(false)}
                items={stats.recentItems}
                onFeedback={(item) => {
                    setIsRecentItemsModalOpen(false);
                    setTrackingOrder({
                        _id: item.mongoId,
                        invoiceId: item.orderId,
                        status: item.status,
                        feedback: item.feedback,
                        items: [{ name: item.name, quantity: 1, price: 0 }], // Placeholder for modal
                        orderType: 'invoice'
                    });
                }}
            />
        </motion.div >
    );
};

export default Dashboard;
