import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiSearch, FiX, FiPackage, FiArrowLeft, FiCalendar, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const emptyItem = { name: '', quantity: 1, unitPrice: 0, useMeters: false, meters: 0, ratePerMeter: 0 };

const PurchaseBills = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [viewBill, setViewBill] = useState(null);

    // Form state
    const [supplierName, setSupplierName] = useState('');
    const [supplierPhone, setSupplierPhone] = useState('');
    const [items, setItems] = useState([{ ...emptyItem }]);
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
            const res = await axios.get('/api/purchase-bills', { headers, params });
            setBills(res.data);
        } catch (err) {
            console.error('Error fetching purchase bills:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBills(); }, [search, startDate, endDate]);

    const addItem = () => setItems([...items, { ...emptyItem }]);
    const removeItem = (idx) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
    };
    const updateItem = (idx, field, value) => {
        setItems(prev => {
            const updated = [...prev];
            let val = value;
            if (field !== 'name' && field !== 'useMeters') val = Number(value) || 0;
            updated[idx] = { ...updated[idx], [field]: val };
            return updated;
        });
    };

    const subtotal = items.reduce((s, item) => {
        const itemTotal = item.useMeters 
            ? (item.meters * item.ratePerMeter) 
            : (item.quantity * item.unitPrice);
        return s + itemTotal;
    }, 0);

    const resetForm = () => {
        setSupplierName('');
        setSupplierPhone('');
        setItems([{ ...emptyItem }]);
        setNotes('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!supplierName.trim()) return alert('Supplier name is required');
        if (items.some(i => !i.name.trim())) return alert('All items must have a name');

        setSaving(true);
        try {
            await axios.post('/api/purchase-bills', {
                supplierName,
                supplierPhone,
                items: items.map(i => {
                    const total = i.useMeters ? (i.meters * i.ratePerMeter) : (i.quantity * i.unitPrice);
                    return {
                        name: i.name,
                        quantity: i.useMeters ? null : i.quantity,
                        unitPrice: i.useMeters ? null : i.unitPrice,
                        useMeters: i.useMeters,
                        meters: i.useMeters ? i.meters : null,
                        ratePerMeter: i.useMeters ? i.ratePerMeter : null,
                        total
                    };
                }),
                subtotal,
                notes
            }, { headers });
            resetForm();
            setShowForm(false);
            fetchBills();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create bill');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this purchase bill?')) return;
        try {
            await axios.delete(`/api/purchase-bills/${id}`, { headers });
            fetchBills();
        } catch (err) {
            alert('Failed to delete bill');
        }
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
                            <FiPackage className="text-blue-500" /> Purchase Bills
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Record purchases from suppliers</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
                >
                    <FiPlus size={16} /> New Purchase Bill
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by bill no or supplier..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                </div>
                <div className="flex gap-2">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                </div>
            </div>

            {/* Bills Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300">Bill No</th>
                                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300">GRN No</th>
                                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300">Supplier</th>
                                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300 hidden sm:table-cell">Phone</th>
                                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300">Items</th>
                                <th className="text-right p-4 font-semibold text-slate-600 dark:text-slate-300">Total</th>
                                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300 hidden md:table-cell">Date</th>
                                <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td></tr>
                            ) : bills.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No purchase bills found</td></tr>
                            ) : bills.map(bill => (
                                <motion.tr
                                    key={bill._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                >
                                    <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{bill.billNo}</td>
                                    <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{bill.grnNo || '-'}</td>
                                    <td className="p-4 text-slate-800 dark:text-white font-medium">{bill.supplierName}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{bill.supplierPhone || '-'}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">{bill.items?.length || 0}</td>
                                    <td className="p-4 text-right font-bold text-slate-800 dark:text-white">₹{(bill.subtotal || 0).toLocaleString()}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">{new Date(bill.billDate).toLocaleDateString('en-IN')}</td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => setViewBill(bill)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors" title="View">
                                                <FiEye size={14} />
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

            {/* Create Bill Modal */}
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
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><FiPackage className="text-blue-500" /> New Purchase Bill</h2>
                                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400"><FiX size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Supplier Name *</label>
                                        <input type="text" value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="Enter supplier name" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Supplier Phone</label>
                                        <input type="text" value={supplierPhone} onChange={e => setSupplierPhone(e.target.value)} placeholder="Phone number" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Items</label>
                                        <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                                            <FiPlus size={14} /> Add Item
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {items.map((item, idx) => (
                                            <div key={idx} className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <div className="flex gap-2 items-center">
                                                    <input type="text" placeholder="Item name" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} className="flex-1 min-w-0 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" required />
                                                    <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                                                        <button type="button" onClick={() => updateItem(idx, 'useMeters', false)} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${!item.useMeters ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>QTY</button>
                                                        <button type="button" onClick={() => updateItem(idx, 'useMeters', true)} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${item.useMeters ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>MTR</button>
                                                    </div>
                                                    {items.length > 1 && (
                                                        <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    {!item.useMeters ? (
                                                        <>
                                                            <input type="number" placeholder="Qty" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="w-1/2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" required />
                                                            <input type="number" placeholder="Price" min="0" step="0.01" value={item.unitPrice || ''} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} className="w-1/2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" required />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <input type="number" placeholder="Meters" min="0" step="0.01" value={item.meters || ''} onChange={e => updateItem(idx, 'meters', e.target.value)} className="w-1/2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" required />
                                                            <input type="number" placeholder="Rate/Mtr" min="0" step="0.01" value={item.ratePerMeter || ''} onChange={e => updateItem(idx, 'ratePerMeter', e.target.value)} className="w-1/2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" required />
                                                        </>
                                                    )}
                                                    <div className="w-32 px-3 py-2 text-right text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        ₹{ (item.useMeters ? (item.meters * item.ratePerMeter) : (item.quantity * item.unitPrice)).toLocaleString() }
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Notes</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" />
                                </div>

                                {/* Total */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/40">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Subtotal</span>
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Create Purchase Bill'}
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
                                    <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">{viewBill.grnNo}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{new Date(viewBill.billDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <button onClick={() => setViewBill(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400"><FiX size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Supplier</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{viewBill.supplierName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Phone</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{viewBill.supplierPhone || '-'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Items</p>
                                    <div className="space-y-2">
                                        {viewBill.items?.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white">{item.name}</p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {item.useMeters 
                                                            ? `${item.meters} meters × ₹${item.ratePerMeter}/mtr`
                                                            : `${item.quantity} × ₹${item.unitPrice}`
                                                        }
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">₹{(item.total || 0).toLocaleString()}</p>
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

                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/40">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total</span>
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{(viewBill.subtotal || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <button onClick={() => setViewBill(null)} className="w-full py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700">Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PurchaseBills;
