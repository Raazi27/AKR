import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { FiDownload, FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';
import SpotlightCard from '../components/react-bits/SpotlightCard';
import BlurText from '../components/react-bits/BlurText';
import axios from 'axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

const Reports = () => {
    const [isDark, setIsDark] = useState(false);
    const [reportData, setReportData] = useState({
        revenueAnalytics: { labels: [], data: [] },
        categoryData: { labels: [], data: [] },
        recentTransactions: []
    });
    const [loading, setLoading] = useState(true);
    const [exportDate, setExportDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/stats/reports');
            setReportData(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching report data:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to reset all reports? This will delete all purchase bills, sale bills and orders permanently.')) {
            try {
                await axios.delete('/api/stats/reset');
                alert('Reports data has been reset.');
                fetchReportData();
            } catch (err) {
                console.error('Error resetting reports:', err);
                alert('Failed to reset reports.');
            }
        }
    };

    const handleExport = async () => {
        try {
            const res = await axios.get(`/api/stats/export?month=${exportDate.month}&year=${exportDate.year}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `SalesReport_${exportDate.year}_${exportDate.month}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error exporting report:', err);
            alert('Failed to export report.');
        }
    };

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Common Chart Options for Dark/Light Mode
    const getChartOptions = (title) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: isDark ? '#e2e8f0' : '#475569',
                    font: { family: "'Inter', sans-serif" }
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#f8fafc' : '#1e293b',
                bodyColor: isDark ? '#cbd5e1' : '#475569',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 10,
                displayColors: true,
                usePointStyle: true,
            }
        },
        scales: {
            y: {
                ticks: { color: isDark ? '#94a3b8' : '#64748b' },
                grid: { color: isDark ? '#334155' : '#f1f5f9' },
                border: { display: false }
            },
            x: {
                ticks: { color: isDark ? '#94a3b8' : '#64748b' },
                grid: { display: false },
                border: { display: false }
            }
        }
    });

    const salesData = {
        labels: reportData.revenueAnalytics.labels,
        datasets: [
            {
                label: 'Revenue (₹)',
                data: reportData.revenueAnalytics.data,
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(79, 70, 229, 0.8)',
                borderRadius: 4,
                hoverBackgroundColor: isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(67, 56, 202, 1)',
            },
        ],
    };

    const categoryData = {
        labels: reportData.categoryData.labels,
        datasets: [
            {
                label: 'Orders',
                data: reportData.categoryData.data,
                backgroundColor: [
                    'rgba(244, 63, 94, 0.8)',   // Rose
                    'rgba(59, 130, 246, 0.8)',  // Blue
                    'rgba(16, 185, 129, 0.8)',  // Emerald
                    'rgba(245, 158, 11, 0.8)',  // Amber
                ],
                borderColor: isDark ? '#1e293b' : '#ffffff',
                borderWidth: 2,
            },
        ],
    };

    const kpiStats = [
        { label: 'Total Sales Revenue', value: `₹${reportData.revenueAnalytics.data.reduce((a, b) => a + b, 0).toLocaleString()}`, change: 'Real-time', icon: FiDollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
        { label: 'Total Sale Bills', value: reportData.recentTransactions.length, change: 'Lifetime', icon: FiShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
        { label: 'Avg Basket Value', value: reportData.recentTransactions.length ? `₹${(reportData.revenueAnalytics.data.reduce((a, b) => a + b, 0) / reportData.recentTransactions.length).toFixed(0)}` : '₹0', change: 'Avg', icon: FiTrendingUp, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20' },
        { label: 'Tailoring Items', value: reportData.categoryData.labels.length, change: 'Count', icon: FiUsers, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
    ];

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-6 transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <BlurText
                    text="Business Intelligence"
                    className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight"
                    delay={50}
                    animateBy="words"
                />
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                        <select
                            value={exportDate.month}
                            onChange={(e) => setExportDate({ ...exportDate, month: e.target.value })}
                            className="bg-transparent text-slate-700 dark:text-slate-200 text-sm outline-none px-2 py-1"
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'short' })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={exportDate.year}
                            onChange={(e) => setExportDate({ ...exportDate, year: e.target.value })}
                            className="bg-transparent text-slate-700 dark:text-slate-200 text-sm outline-none px-2 py-1"
                        >
                            {[2024, 2025, 2026].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-3 py-1 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition"
                        >
                            <FiDownload /> Export
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpiStats.map((stat, index) => (
                    <SpotlightCard key={index} className="bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    </SpotlightCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Monthly Sales Revenue</h3>
                    <div className="h-[300px]">
                        <Bar key={`bar-${isDark}`} options={getChartOptions('Revenue')} data={salesData} />
                    </div>
                </div>

                {/* Category Chart */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Tailoring Orders</h3>
                    <div className="h-[300px] flex items-center justify-center">
                        <Pie key={`pie-${isDark}`} options={{
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: { color: isDark ? '#cbd5e1' : '#475569', padding: 20 }
                                }
                            }
                        }} data={categoryData} />
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Recent Sales</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                                <th className="p-4 pl-6">Bill No</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Grand Total</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {reportData.recentTransactions.length > 0 ? (
                                reportData.recentTransactions.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 pl-6 font-bold text-slate-700 dark:text-slate-200">#{bill.billNo}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">
                                                    {bill.customerName ? bill.customerName[0] : 'G'}
                                                </div>
                                                <span className="font-medium">{bill.customerName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-500 dark:text-slate-500 text-sm font-medium">{new Date(bill.billDate).toLocaleDateString()}</td>
                                        <td className="p-4 text-right font-bold text-slate-800 dark:text-white">₹{bill.grandTotal.toLocaleString()}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                bill.status === 'Paid'
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : bill.status === 'Partial' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400 font-medium italic">No sales transactions available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
