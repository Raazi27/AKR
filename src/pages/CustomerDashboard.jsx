import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiClock, FiUser, FiArrowRight, FiPackage, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SpotlightCard from '../components/react-bits/SpotlightCard';
import BlurText from '../components/react-bits/BlurText';
import axios from 'axios';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const API_BASE = window.location.hostname === 'localhost' ? '' : `http://${window.location.hostname}:5000`;

    const [stats, setStats] = useState({
        orders: 0,
        totalPurchaseCount: 0,
        recentItems: [],
        upcomingDeliveries: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE}/api/stats/dashboard`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setStats(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error('Error fetching customer stats:', err);
            }
        };
        fetchStats();
    }, []);

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

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
        >
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="relative group">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-black text-xs uppercase tracking-[0.3em] mb-4"
                    >
                        <FiActivity size={16} /> Welcome to the Atelier
                    </motion.div>
                    <BlurText
                        text={`Hello, ${user?.name?.split(' ')[0] || 'valued customer'}!`}
                        className="text-5xl md:text-6xl font-black text-stone-800 dark:text-white tracking-tighter"
                        delay={50}
                        animateBy="words"
                    />
                    <p className="text-stone-500 dark:text-stone-400 mt-6 text-xl max-w-xl font-medium italic tracking-wide">
                        The art of tailoring, redefined for your exclusive comfort.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-teal-500 dark:bg-teal-600 text-white px-10 py-5 rounded-2xl font-black shadow-2xl shadow-teal-400/25 hover:scale-105 transition-all flex items-center gap-3 uppercase tracking-widest text-xs border border-teal-400/30"
                    >
                        New Collection <FiArrowRight />
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <SpotlightCard className="bg-white dark:bg-[#1e293b] border-teal-200/30 dark:border-teal-700/20 shadow-xl p-10 flex items-center gap-8 group">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200/40 dark:border-teal-700/30 group-hover:bg-teal-500 group-hover:text-white transition-all duration-500">
                        <FiPackage size={40} />
                    </div>
                    <div>
                        <p className="text-stone-500 dark:text-stone-400 font-black text-[10px] uppercase tracking-[0.2em]">In Progress</p>
                        <h3 className="text-4xl font-black text-stone-800 dark:text-white leading-none mt-2">{stats.orders}</h3>
                    </div>
                </SpotlightCard>

                <SpotlightCard className="bg-white dark:bg-[#1e293b] border-teal-200/30 dark:border-teal-700/20 shadow-xl p-10 flex items-center gap-8 group">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-700/30 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                        <FiCheckCircle size={40} />
                    </div>
                    <div>
                        <p className="text-stone-500 dark:text-stone-400 font-black text-[10px] uppercase tracking-[0.2em]">Delivered</p>
                        <h3 className="text-4xl font-black text-stone-800 dark:text-white leading-none mt-2">{stats.totalPurchaseCount}</h3>
                    </div>
                </SpotlightCard>

                <SpotlightCard className="bg-white dark:bg-[#1e293b] border-teal-200/30 dark:border-teal-700/20 shadow-xl p-10 flex items-center gap-8 cursor-pointer group" onClick={() => navigate('/profile')}>
                    <div className="w-20 h-20 rounded-[2.5rem] bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400 border border-rose-200/40 dark:border-rose-700/30 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                        <FiUser size={40} />
                    </div>
                    <div>
                        <p className="text-stone-500 dark:text-stone-400 font-black text-[10px] uppercase tracking-[0.2em]">Concierge</p>
                        <h3 className="text-xl font-black text-stone-800 dark:text-white mt-2 uppercase tracking-tighter">My Profile</h3>
                    </div>
                </SpotlightCard>
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Recent Purchases */}
                <motion.div variants={itemVariants} className="space-y-8">
                    <div className="flex items-center justify-between border-b border-teal-200/30 dark:border-teal-700/20 pb-4">
                        <h2 className="text-2xl font-black text-stone-800 dark:text-teal-300 uppercase tracking-widest flex items-center gap-4">
                            <div className="w-1.5 h-8 bg-teal-500 rounded-full"></div> Purchases
                        </h2>
                        <button className="text-teal-600 dark:text-teal-400 font-black text-xs uppercase tracking-widest hover:underline" onClick={() => navigate('/pending-orders')}>View Archive</button>
                    </div>
                    <div className="space-y-6">
                        {stats.recentItems && stats.recentItems.length > 0 ? (
                            stats.recentItems.slice(0, 4).map((item, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 rounded-[2rem] bg-white dark:bg-[#1e293b] border border-teal-100/50 dark:border-teal-800/20 hover:border-teal-300/50 dark:hover:border-teal-600/30 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/5 rounded-bl-full translate-x-16 -translate-y-16 group-hover:translate-x-12 transition-transform"></div>
                                    <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm relative z-10">
                                        <FiShoppingBag size={24} />
                                    </div>
                                    <div className="flex-1 relative z-10">
                                        <p className="font-black text-stone-800 dark:text-white uppercase tracking-tighter text-lg">{item.name}</p>
                                        <p className="text-[10px] text-stone-500 dark:text-stone-400 font-black uppercase tracking-widest mt-1">Order #{item.orderId} • {new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] relative z-10 shadow-lg ${item.status === 'Delivered' ? 'bg-emerald-500 text-white' : 'bg-teal-500 text-white'}`}>
                                        {item.status}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-white dark:bg-[#1e293b] rounded-[2rem] border border-dashed border-teal-200/40 dark:border-teal-700/20">
                                <p className="text-stone-400 dark:text-stone-500 font-black uppercase tracking-widest text-xs">No entries in your ledger.</p>
                                <button className="mt-6 text-teal-600 dark:text-teal-400 font-black text-[10px] underline uppercase tracking-[0.2em]" onClick={() => navigate('/products')}>Open Collection</button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Upcoming Deliveries */}
                <motion.div variants={itemVariants} className="space-y-8">
                    <div className="flex items-center justify-between border-b border-teal-200/30 dark:border-teal-700/20 pb-4">
                        <h2 className="text-2xl font-black text-stone-800 dark:text-teal-300 uppercase tracking-widest flex items-center gap-4">
                            <div className="w-1.5 h-8 bg-rose-400 rounded-full"></div> Timeline
                        </h2>
                    </div>
                    <div className="space-y-6">
                        {stats.upcomingDeliveries && stats.upcomingDeliveries.length > 0 ? (
                            stats.upcomingDeliveries.map((delivery, i) => (
                                <div key={i} className="relative p-8 rounded-[2rem] bg-white dark:bg-[#1e293b] border border-teal-200/30 dark:border-teal-700/20 flex items-center gap-8 overflow-hidden group shadow-xl">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/5 rounded-bl-full translate-x-24 -translate-y-24"></div>
                                    <div className="w-20 h-20 rounded-3xl bg-teal-500 text-white flex items-center justify-center shadow-xl relative z-10">
                                        <FiClock size={36} />
                                    </div>
                                    <div className="relative z-10 flex-1">
                                        <p className="font-black text-teal-600 dark:text-teal-400 text-xl tracking-tighter uppercase">Delivery Expected</p>
                                        <p className="text-xs text-stone-500 dark:text-stone-400 font-black uppercase tracking-widest mt-2">{new Date(delivery.deliveryDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <p className="text-[10px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-[0.3em] mb-3">{delivery.status}</p>
                                        <button className="px-5 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-300/30 dark:border-teal-700/30 rounded-xl text-[10px] font-black hover:bg-teal-500 hover:text-white transition-all uppercase tracking-widest">Track</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-white dark:bg-[#1e293b] rounded-[2rem] border border-dashed border-teal-200/40 dark:border-teal-700/20">
                                <p className="text-stone-400 dark:text-stone-500 font-black uppercase tracking-widest text-xs">The loom is currently resting.</p>
                                <p className="text-stone-400/60 text-[10px] mt-2 font-bold italic uppercase">We will notify you of your next curation.</p>
                            </div>
                        )}

                        {/* Promotion Card */}
                        <div className="mt-8 p-10 rounded-[3rem] bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 text-white relative overflow-hidden group shadow-2xl">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-[80px]"
                            />
                            <div className="relative z-10">
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Curated Arrivals</span>
                                <h4 className="font-black text-3xl mb-4 tracking-tighter uppercase leading-none">Spring 2026 Collection</h4>
                                <p className="text-white/80 text-sm mb-8 font-medium leading-relaxed max-w-xs uppercase tracking-tight">Discover the finest silks and bespoke linens handpicked for your wardrobe.</p>
                                <button onClick={() => navigate('/products')} className="bg-white text-teal-600 px-10 py-4 rounded-2xl font-black text-xs hover:scale-105 transition-all flex items-center gap-3 uppercase tracking-widest border border-white/20">
                                    Explore Now <FiArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default CustomerDashboard;
