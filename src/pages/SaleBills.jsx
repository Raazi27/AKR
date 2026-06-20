import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiSearch, FiX, FiShoppingCart, FiArrowLeft, FiEye, FiPercent, FiPrinter, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const emptyItem = { productId: '', name: '', quantity: 1, unitPrice: 0 };

const SaleBills = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [viewBill, setViewBill] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const API_BASE = window.location.hostname === 'localhost' ? '' : `http://${window.location.hostname}:5000`;

    // Product search
    const [products, setProducts] = useState([]);
    const [productSearchIdx, setProductSearchIdx] = useState(null);
    const [productQuery, setProductQuery] = useState('');

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [items, setItems] = useState([{ ...emptyItem }]);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [status, setStatus] = useState('Paid');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchBills = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const res = await axios.get(`${API_BASE}/api/sale-bills`, { headers, params });
            setBills(res.data);
        } catch (err) {
            console.error('Error fetching sale bills:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBills(); }, [search, startDate, endDate]);

    // Search products for item selection
    const searchProducts = useCallback(async (q) => {
        if (!q || q.length < 2) { setProducts([]); return; }
        try {
            const res = await axios.get(`${API_BASE}/api/products/search?query=${q}`, { headers });
            setProducts(res.data || []);
        } catch {
            setProducts([]);
        }
    }, [API_BASE, headers]);

    useEffect(() => {
        const timer = setTimeout(() => searchProducts(productQuery), 300);
        return () => clearTimeout(timer);
    }, [productQuery, searchProducts]);

    const addItem = () => setItems([...items, { ...emptyItem }]);
    const removeItem = (idx) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
    };
    const updateItem = (idx, field, value) => {
        setItems(prev => {
            const updated = [...prev];
            updated[idx] = { 
                ...updated[idx], 
                [field]: field === 'name' || field === 'productId' ? value : Number(value) || 0 
            };
            return updated;
        });
    };

    const updateItemMultiple = (idx, updates) => {
        setItems(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...updates };
            return updated;
        });
    };

    const selectProduct = (idx, product) => {
        const updated = [...items];
        updated[idx] = {
            productId: product._id,
            name: `${product.name} - ${product.size}`,
            quantity: 1,
            unitPrice: product.price
        };
        setItems(updated);
        setProductSearchIdx(null);
        setProductQuery('');
        setProducts([]);
    };

    const subtotal = items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0);
    const gstRate = 5;
    const gstAmount = Math.round((subtotal * gstRate / 100) * 100) / 100;
    const grandTotal = Math.round((subtotal + gstAmount) * 100) / 100;

    const resetForm = () => {
        setCustomerName('');
        setCustomerPhone('');
        setItems([{ ...emptyItem }]);
        setPaymentMethod('Cash');
        setStatus('Paid');
        setNotes('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerName.trim()) return alert('Customer name is required');
        if (items.some(i => !i.name.trim())) return alert('All items must have a name');

        setSaving(true);
        try {
            await axios.post(`${API_BASE}/api/sale-bills`, {
                customerName,
                customerPhone,
                items: items.map(i => ({
                    productId: i.productId || undefined,
                    name: i.name,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    total: i.quantity * i.unitPrice
                })),
                paymentMethod,
                status,
                notes
            }, { headers });
            resetForm();
            setShowForm(false);
            fetchBills();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create sale bill');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this sale bill?')) return;
        try {
            await axios.delete(`${API_BASE}/api/sale-bills/${id}`, { headers });
            fetchBills();
        } catch (err) {
            alert('Failed to delete bill');
        }
    };

    const downloadCSV = (bill) => {
        const headers = ['Item Name', 'Quantity', 'Unit Price', 'Total'];
        const rows = bill.items.map(i => [
            i.name,
            i.quantity,
            i.unitPrice,
            i.quantity * i.unitPrice
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + `Bill No,${bill.billNo}\nCustomer,${bill.customerName}\nDate,${new Date(bill.billDate).toLocaleDateString()}\n\n`
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Bill_${bill.billNo}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusColor = (s) => {
        if (s === 'Paid') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
        if (s === 'Pending') return 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400';
        if (s === 'Partial') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/billing')} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <FiArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <FiShoppingCart className="text-emerald-500" /> Sale Bills
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Customer sales with 5% GST</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20"
                >
                    <FiPlus size={16} /> New Sale Bill
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by bill no or customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                </div>
                <div className="flex gap-2">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                </div>
            </div>

            {/* Bills Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300">Bill No</th>
                                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300">Customer</th>
                                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300 hidden sm:table-cell">Payment</th>
                                <th className="text-right p-4 font-semibold text-slate-600 dark:text-slate-300 hidden md:table-cell">Subtotal</th>
                                <th className="text-right p-4 font-semibold text-slate-600 dark:text-slate-300 hidden md:table-cell">GST (5%)</th>
                                <th className="text-right p-4 font-semibold text-slate-600 dark:text-slate-300">Total</th>
                                <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-300 hidden sm:table-cell">Status</th>
                                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300 hidden lg:table-cell">Date</th>
                                <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-12 text-slate-400">Loading...</td></tr>
                            ) : bills.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-12 text-slate-400">No sale bills found</td></tr>
                            ) : bills.map(bill => (
                                <motion.tr
                                    key={bill._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                >
                                    <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{bill.billNo}</td>
                                    <td className="p-4">
                                        <p className="text-slate-800 dark:text-white font-medium">{bill.customerName}</p>
                                        <p className="text-[10px] text-slate-400">{bill.customerPhone || ''}</p>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300 hidden sm:table-cell">{bill.paymentMethod}</td>
                                    <td className="p-4 text-right text-slate-600 dark:text-slate-300 hidden md:table-cell">₹{(bill.subtotal || 0).toLocaleString()}</td>
                                    <td className="p-4 text-right text-slate-600 dark:text-slate-300 hidden md:table-cell">₹{(bill.gstAmount || 0).toLocaleString()}</td>
                                    <td className="p-4 text-right font-bold text-slate-800 dark:text-white">₹{(bill.grandTotal || 0).toLocaleString()}</td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${getStatusColor(bill.status)}`}>{bill.status}</span>
                                    </td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400 hidden lg:table-cell">{new Date(bill.billDate).toLocaleDateString('en-IN')}</td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => setViewBill(bill)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 transition-colors" title="View">
                                                <FiEye size={14} />
                                            </button>
                                            <button 
                                                onClick={() => window.open(`/invoice/${bill._id}`, '_blank')} 
                                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 transition-colors" 
                                                title="Print"
                                            >
                                                <FiPrinter size={14} />
                                            </button>
                                            <button 
                                                onClick={() => downloadCSV(bill)} 
                                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors" 
                                                title="Download CSV"
                                            >
                                                <FiDownload size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(bill._id)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors" title="Delete">
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Sale Bill Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><FiShoppingCart className="text-emerald-500" /> New Sale Bill</h2>
                                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400"><FiX size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
                                {/* Customer Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Customer Name *</label>
                                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter customer name" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Customer Phone</label>
                                        <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone number" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Items</label>
                                        <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors">
                                            <FiPlus size={14} /> Add Item
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {items.map((item, idx) => (
                                            <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search product or type item name..."
                                                        value={item.name}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            updateItemMultiple(idx, { name: val, productId: '' });
                                                            setProductSearchIdx(idx);
                                                            setProductQuery(val);
                                                        }}
                                                        onFocus={() => { setProductSearchIdx(idx); setProductQuery(item.name); }}
                                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                                        required
                                                    />
                                                    {/* Product dropdown */}
                                                    {productSearchIdx === idx && products.length > 0 && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl z-[1000] max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                                                            {products.map(p => (
                                                                <div
                                                                    key={p._id}
                                                                    onClick={() => selectProduct(idx, p)}
                                                                    className="px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer flex justify-between items-center transition-colors group"
                                                                >
                                                                    <div>
                                                                        <p className="text-slate-800 dark:text-white font-semibold text-sm group-hover:text-emerald-600 transition-colors">{p.name}</p>
                                                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Size: {p.size} | Stock: {p.stock}</p>
                                                                    </div>
                                                                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">₹{p.price}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <input type="number" placeholder="Qty" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="w-20 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40" required />
                                                    <input type="number" placeholder="Unit Price" min="0" step="0.01" value={item.unitPrice || ''} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} className="w-28 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40" required />
                                                    <div className="flex-1 text-right text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        ₹{(item.quantity * item.unitPrice).toLocaleString()}
                                                    </div>
                                                    {items.length > 1 && (
                                                        <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment & Status */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Payment Method</label>
                                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                                            <option value="Cash">Cash</option>
                                            <option value="Card">Card</option>
                                            <option value="UPI">UPI</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Status</label>
                                        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                                            <option value="Paid">Paid</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Unpaid">Unpaid</option>
                                            <option value="Partial">Partial</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Notes</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none" />
                                </div>

                                {/* GST Breakdown */}
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                        <span className="font-semibold text-slate-800 dark:text-white">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                            <FiPercent size={12} /> GST (5%)
                                        </span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">+ ₹{gstAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-emerald-200 dark:border-emerald-800 pt-2 flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Grand Total</span>
                                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Create Sale Bill'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Bill Modal */}
            <AnimatePresence>
                {viewBill && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{viewBill.billNo}</h2>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(viewBill.billDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <button onClick={() => setViewBill(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400"><FiX size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Customer</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{viewBill.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Phone</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{viewBill.customerPhone || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Payment</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{viewBill.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Status</p>
                                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${getStatusColor(viewBill.status)}`}>{viewBill.status}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Items</p>
                                    <div className="space-y-2">
                                        {viewBill.items?.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white">{item.name}</p>
                                                    <p className="text-[10px] text-slate-400">{item.quantity} × ₹{item.unitPrice}</p>
                                                </div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">₹{(item.total || item.quantity * item.unitPrice).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {viewBill.notes && (
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Notes</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{viewBill.notes}</p>
                                    </div>
                                )}

                                {/* GST Breakdown */}
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                        <span className="font-semibold text-slate-800 dark:text-white">₹{(viewBill.subtotal || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">GST ({viewBill.gstRate || 5}%)</span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">+ ₹{(viewBill.gstAmount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-emerald-200 dark:border-emerald-800 pt-2 flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Grand Total</span>
                                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{(viewBill.grandTotal || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 grid grid-cols-3 gap-2">
                                <button 
                                    onClick={() => window.open(`/invoice/${viewBill._id}`, '_blank')} 
                                    className="py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center justify-center gap-2"
                                >
                                    <FiPrinter size={16} /> Print
                                </button>
                                <button 
                                    onClick={() => downloadCSV(viewBill)} 
                                    className="py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    <FiDownload size={16} /> CSV
                                </button>
                                <button onClick={() => setViewBill(null)} className="py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700">Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SaleBills;
