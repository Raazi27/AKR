import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiShield, FiUser, FiEdit, FiX, FiCheck, FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import SpotlightCard from '../components/react-bits/SpotlightCard';
import BlurText from '../components/react-bits/BlurText';

const AdminUsers = () => {
    const { user: currentUser } = useAuth(); // Rename to avoid confusion
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const SUPER_ADMIN_EMAIL = 'farmanraazi2006@gmail.com';
    const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData };
            if (!payload.password) delete payload.password; // Don't send empty password

            if (editingId) {
                const res = await axios.put(`/api/users/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(users.map(u => u._id === editingId ? { ...u, ...res.data.user } : u)); // Backend returns { message, user }
                alert('User Updated Successfully!');
            }
            closeModal();
        } catch (err) {
            alert('Failed to update user: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(users.filter(u => u._id !== id));
            } catch (err) {
                alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const openEditModal = (user) => {
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '' // Don't fill password
        });
        setEditingId(user._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: '', email: '', role: '', password: '' });
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-7xl mx-auto transition-colors duration-300"
        >
            <div className="flex justify-between items-center mb-8">
                <BlurText
                    text="User Management"
                    className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight"
                    delay={50}
                    animateBy="words"
                />
                <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-xl font-bold text-sm shadow-sm border border-primary-200 dark:border-primary-800">
                    {users.length} Total Users
                </div>
            </div>

            <SpotlightCard className="p-0 overflow-hidden bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-lg dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider font-semibold">
                                <th className="p-5">Name</th>
                                <th className="p-5">Email</th>
                                <th className="p-5">Role</th>
                                <th className="p-5">Joined At</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group">
                                    <td className="p-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-primary-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-slate-800 dark:text-white">{user.name}</span>
                                    </td>
                                    <td className="p-5 text-slate-600 dark:text-slate-300">{user.email}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm
                                            ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                                user.role === 'tailor' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                                    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-5 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-5 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2.5 rounded-xl transition-all hover:shadow-md"
                                            title="Edit User"
                                        >
                                            <FiEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (user.email === SUPER_ADMIN_EMAIL) {
                                                    alert("Cannot delete the Super Admin.");
                                                    return;
                                                }
                                                handleDelete(user._id);
                                            }}
                                            className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-2.5 rounded-xl transition-all hover:shadow-md"
                                            title="Delete User"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && (
                    <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">No users found.</div>
                )}
            </SpotlightCard>

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
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Edit User Details</h3>
                                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><FiX size={24} /></button>
                            </div>

                            <form onSubmit={handleSaveUser} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-800 dark:text-white"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Email</label>
                                    <input
                                        type="email"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-800 dark:text-white"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                {isSuperAdmin ? (
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Role (Super Admin Only)</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-800 dark:text-white"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="billing">Billing Staff</option>
                                            <option value="tailor">Tailor</option>
                                            <option value="customer">Customer</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl text-orange-700 dark:text-orange-300 text-sm">
                                        <p>You cannot change user roles. Only the Main Admin can allot roles.</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">New Password (Optional)</label>
                                    <div className="relative">
                                        <FiLock className="absolute left-3.5 top-3.5 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full pl-10 pr-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-800 dark:text-white"
                                            placeholder="Leave blank to keep current"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
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
                                        className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 dark:shadow-none transition-all"
                                    >
                                        Update User
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminUsers;
