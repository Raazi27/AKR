import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch, FiPrinter, FiEdit, FiUser, FiPhone, FiMail, FiMapPin, FiX } from 'react-icons/fi';
import SpotlightCard from '../components/react-bits/SpotlightCard';
import BlurText from '../components/react-bits/BlurText';
import { useAuth } from '../context/AuthContext';

const Customers = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [customers, setCustomers] = useState([]);
    const [query, setQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });

    useEffect(() => {
        fetchCustomers();
    }, [query]);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('/api/customers' + (query ? `/search?query=${query}` : ''));
            setCustomers(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch customers", err);
            setLoading(false);
        }
    };

    const handleSaveCustomer = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const res = await axios.put(`/api/customers/${editingId}`, formData);
                setCustomers(customers.map(c => c._id === editingId ? res.data : c));
                alert('Customer Updated Successfully!');
            } else {
                const res = await axios.post('/api/customers', formData);
                setCustomers([res.data, ...customers]);
                alert('Customer Added Successfully!');
            }
            closeModal();
        } catch (err) {
            alert('Error saving customer: ' + (err.response?.data || err.message));
        }
    };

    const openEditModal = (customer) => {
        setFormData({
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address
        });
        setEditingId(customer._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: '', phone: '', email: '', address: '' });
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen relative transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <BlurText
                        text="Customer Management"
                        className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight"
                        delay={50}
                        animateBy="words"
                    />
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage client profiles and measurements</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', phone: '', email: '', address: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    <FiPlus className="mr-2 text-xl" /> Add New Customer
                </motion.button>
            </div>

            <SpotlightCard className="p-4 mb-8 flex items-center bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700">
                <FiSearch className="text-slate-400 mr-3 text-xl" />
                <input
                    type="text"
                    placeholder="Search by Name, Phone, or ID..."
                    className="w-full outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 bg-transparent"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </SpotlightCard>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {customers.map((customer) => (
                            <motion.div key={customer._id} variants={item} layout>
                                <SpotlightCard className="h-full flex flex-col justify-between p-0 overflow-hidden bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 transition-colors">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/30 dark:to-indigo-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-lg">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{customer.name}</h3>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">ID: {customer.customerId}</p>
                                                </div>
                                            </div>
                                            {/* Barcode Mockup */}
                                            <div className="h-8 w-24 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-400 tracking-widest font-mono">
                                                BARCODE
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-4">
                                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                <FiPhone className="text-slate-400" />
                                                <span>{customer.phone}</span>
                                            </div>
                                            {customer.email && (
                                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                    <FiMail className="text-slate-400" />
                                                    <span className="truncate">{customer.email}</span>
                                                </div>
                                            )}
                                            {customer.address && (
                                                <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                    <FiMapPin className="text-slate-400 mt-1 flex-shrink-0" />
                                                    <span className="line-clamp-2">{customer.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700 p-4 flex justify-end gap-2">
                                        {isAdmin && (
                                            <button
                                                onClick={() => openEditModal(customer)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                            >
                                                <FiEdit /> Edit
                                            </button>
                                        )}
                                        <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                                            <FiPrinter /> Print Card
                                        </button>
                                    </div>
                                </SpotlightCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative z-10 border dark:border-slate-700"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
                                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><FiX size={24} /></button>
                            </div>

                            <form onSubmit={handleSaveCustomer} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-800 dark:text-white"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="+91 98765 43210"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-800 dark:text-white"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Email (Optional)</label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-800 dark:text-white"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Address</label>
                                    <textarea
                                        placeholder="123 Street Name, City"
                                        rows="3"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none text-slate-800 dark:text-white"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-5 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 dark:shadow-primary-900/20 transition-all"
                                    >
                                        {editingId ? 'Update Customer' : 'Save Customer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Customers;
