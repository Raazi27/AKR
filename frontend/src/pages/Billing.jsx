import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiPackage, FiTrendingUp, FiTrendingDown, FiArrowRight, FiDollarSign, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Billing = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalPurchases: 0, totalSales: 0, purchaseCount: 0, saleCount: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const [purchaseRes, saleRes] = await Promise.all([
                    axios.get('/api/purchase-bills', { headers }).catch(() => ({ data: [] })),
                    axios.get('/api/sale-bills', { headers }).catch(() => ({ data: [] }))
                ]);
                const purchases = purchaseRes.data || [];
                const sales = saleRes.data || [];
                setStats({
                    totalPurchases: purchases.reduce((s, b) => s + (b.subtotal || 0), 0),
                    totalSales: sales.reduce((s, b) => s + (b.grandTotal || 0), 0),
                    purchaseCount: purchases.length,
                    saleCount: sales.length
                });
            } catch (err) {
                console.error('Error fetching billing stats:', err);
            }
        };
        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Billing System</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your purchase and sale bills</p>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <FiPackage size={20} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Purchases</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">₹{stats.totalPurchases.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{stats.purchaseCount} bills</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <FiDollarSign size={20} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Sales</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">₹{stats.totalSales.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{stats.saleCount} bills</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                            <FiFileText size={20} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Bills</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.purchaseCount + stats.saleCount}</p>
                    <p className="text-[10px] text-slate-400 mt-1">All records</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(stats.totalSales - stats.totalPurchases) >= 0 ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                            {(stats.totalSales - stats.totalPurchases) >= 0 ? <FiTrendingUp size={20} /> : <FiTrendingDown size={20} />}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Net Profit</p>
                    <p className={`text-2xl font-bold ${(stats.totalSales - stats.totalPurchases) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        ₹{(stats.totalSales - stats.totalPurchases).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Sales - Purchases</p>
                </div>
            </motion.div>

            {/* Main Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Bills Card */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/purchase-bills')}
                    className="cursor-pointer group"
                >
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 shadow-xl shadow-blue-200/40 dark:shadow-blue-900/20 min-h-[260px] flex flex-col justify-between">
                        {/* Abstract shapes */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                            className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                            className="absolute bottom-0 left-0 -ml-12 -mb-12 w-36 h-36 bg-white/10 rounded-full blur-2xl"
                        />

                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FiPackage size={28} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Purchase Bills</h2>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                Record stock purchases from suppliers.<br />Track your inventory costs and supplier details.
                            </p>
                        </div>

                        <div className="relative z-10 flex items-center gap-2 text-white/80 group-hover:text-white transition-colors mt-6">
                            <span className="text-sm font-semibold">Open Purchase Bills</span>
                            <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </div>
                    </div>
                </motion.div>

                {/* Sale Bills Card */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/sale-bills')}
                    className="cursor-pointer group"
                >
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-xl shadow-emerald-200/40 dark:shadow-emerald-900/20 min-h-[260px] flex flex-col justify-between">
                        {/* Abstract shapes */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                            className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                            className="absolute bottom-0 left-0 -ml-12 -mb-12 w-36 h-36 bg-white/10 rounded-full blur-2xl"
                        />

                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FiShoppingCart size={28} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Sale Bills</h2>
                            <p className="text-emerald-100 text-sm leading-relaxed">
                                Record customer sales with 5% GST.<br />Auto-calculate tax and generate sale invoices.
                            </p>
                        </div>

                        <div className="relative z-10 flex items-center gap-2 text-white/80 group-hover:text-white transition-colors mt-6">
                            <span className="text-sm font-semibold">Open Sale Bills</span>
                            <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Billing;
