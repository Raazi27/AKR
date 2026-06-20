import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave, FiCamera, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import SpotlightCard from '../components/react-bits/SpotlightCard';
import BlurText from '../components/react-bits/BlurText';

const Profile = () => {
    const { logout, updateUser, user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        pincode: '',
        password: '',
        confirmPassword: '',
        profilePicture: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;

            if (data) {
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    // Prefer direct fields (User model), fallback to customerDetails (Legacy/Customer model)
                    phone: data.phone || data.customerDetails?.phone || '',
                    address: data.address || data.customerDetails?.address || '',
                    pincode: data.pincode || data.customerDetails?.pincode || '',
                    password: '',
                    confirmPassword: '',
                    profilePicture: data.profilePicture || ''
                });
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching profile:", err);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const getProfileImageUrl = () => {
        if (preview) return preview;
        if (profile.profilePicture && typeof profile.profilePicture === 'string') {
            const cleanPath = profile.profilePicture.replace(/\\/g, '/');
            return `/${cleanPath}`;
        }
        return null; // Should trigger fallback
    };

    const imageUrl = getProfileImageUrl();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setSaving(true);

        if (profile.password && profile.password !== profile.confirmPassword) {
            setError("Passwords don't match");
            setSaving(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('email', profile.email);
            formData.append('phone', profile.phone);
            formData.append('address', profile.address);
            formData.append('pincode', profile.pincode);
            if (profile.password) formData.append('password', profile.password);
            if (file) formData.append('profilePicture', file);

            const res = await axios.put('/api/auth/profile', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage('Profile updated successfully!');

            // Update global auth context so sidebar/header update instantly
            if (res.data.user) {
                updateUser(res.data.user);
            }

            setProfile(prev => ({
                ...prev,
                password: '',
                confirmPassword: '',
                profilePicture: res.data.user?.profilePicture || prev.profilePicture
            }));
            setFile(null); // Clear selected file
            setPreview(null); // Clear preview

            // Optional: If you want to update the global auth context with new name/pic immediately
            // You might need to reload or expose a setUser method from AuthContext
            // window.location.reload(); // Simple brute force update for sidebar
        } catch (err) {
            setError(err.response?.data || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto p-6 transition-colors duration-300"
        >
            <motion.div variants={itemVariants} className="mb-10">
                <BlurText
                    text="Account Settings"
                    className={`text-3xl font-extrabold tracking-tight ${!isAdmin ? 'text-stone-800 dark:text-teal-300 font-black italic uppercase' : 'text-slate-800 dark:text-white'}`}
                    delay={50}
                    animateBy="words"
                />
                {!isAdmin && <p className="text-teal-700 dark:text-teal-500/70 text-[10px] font-black tracking-[0.3em] uppercase mt-2">Private Client Profile</p>}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Card */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-1"
                >
                    <SpotlightCard className={`p-0 flex flex-col items-center text-center relative overflow-hidden rounded-[2.5rem] h-full shadow-2xl transition-all duration-500 border ${!isAdmin ? 'bg-white dark:bg-[#1e293b] border-teal-100/40 dark:border-teal-800/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                        <div className="w-full relative p-10 flex flex-col items-center z-10">
                            <div className={`absolute top-0 left-0 w-full h-32 z-0 ${!isAdmin ? 'bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600' : 'bg-gradient-to-r from-primary-500 to-indigo-600'}`}></div>

                            <div className="relative z-10 -mt-2 mb-6 group cursor-pointer">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className={`w-40 h-40 rounded-3xl overflow-hidden border-4 shadow-2xl relative ${!isAdmin ? 'border-white dark:border-teal-700/50 bg-teal-50 dark:bg-[#1e293b]' : 'border-white dark:border-slate-800 bg-white dark:bg-slate-700'}`}
                                >
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-500">
                                            <FiUser size={48} />
                                        </div>
                                    )}
                                </motion.div>
                                <label className={`absolute bottom-2 right-2 p-3 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-110 border ${!isAdmin ? 'bg-teal-500 text-white border-teal-400/30' : 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 border-slate-100 dark:border-slate-600'}`}>
                                    <FiCamera size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>

                            <h2 className={`text-2xl font-black italic uppercase tracking-tighter ${!isAdmin ? 'text-stone-800 dark:text-teal-300' : 'text-slate-800 dark:text-white'} mt-4`}>{profile.name}</h2>
                            <p className={`${!isAdmin ? 'text-teal-700 dark:text-teal-500/50 text-[10px] font-black tracking-widest uppercase mb-6' : 'text-slate-500 dark:text-slate-400 text-sm mb-6'}`}>{profile.email}</p>

                            <div className={`w-full border-t pt-8 mt-4 flex flex-col gap-4 ${!isAdmin ? 'border-teal-100/40 dark:border-teal-800/20' : 'border-slate-100 dark:border-slate-700'}`}>
                                <div className="flex items-center text-sm font-black uppercase tracking-widest text-stone-600 dark:text-stone-400 text-left w-full pl-6">
                                    <FiPhone className={`mr-4 min-w-[18px] ${!isAdmin ? 'text-teal-500' : 'text-primary-500'}`} />
                                    <span className="truncate">{profile.phone || 'No phone added'}</span>
                                </div>
                                <div className="flex items-center text-sm font-black uppercase tracking-widest text-stone-600 dark:text-stone-400 text-left w-full pl-6">
                                    <FiMapPin className={`mr-4 min-w-[18px] ${!isAdmin ? 'text-teal-500' : 'text-primary-500'}`} />
                                    <span className="line-clamp-2 text-left">{profile.address ? `${profile.address}${profile.pincode ? `, ${profile.pincode}` : ''}` : 'No address added'}</span>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                </motion.div>

                {/* Edit Form */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-1 lg:col-span-2"
                >
                    <SpotlightCard className={`p-10 rounded-[2.5rem] shadow-2xl transition-all duration-500 border ${!isAdmin ? 'bg-white dark:bg-[#1e293b] border-teal-100/40 dark:border-teal-800/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                        <div className={`flex items-center justify-between mb-10 pb-6 border-b ${!isAdmin ? 'border-teal-100/40 dark:border-teal-800/20' : 'border-slate-100 dark:border-slate-700'}`}>
                            <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${!isAdmin ? 'text-stone-800 dark:text-teal-300' : 'text-slate-800 dark:text-white'}`}>Curation Details</h3>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${!isAdmin ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-200/40 dark:border-teal-700/30' : 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-100 dark:border-primary-800'}`}>Personal Archive</span>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 p-4 rounded-xl mb-6 flex items-center border border-emerald-100 dark:border-emerald-800"
                            >
                                <FiSave className="mr-2" /> {message}
                            </motion.div>
                        )}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6 border border-red-100 dark:border-red-800"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <motion.div variants={itemVariants} className="space-y-3">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ${!isAdmin ? 'text-teal-700 dark:text-teal-500/60' : 'text-slate-700 dark:text-slate-300'}`}>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleChange}
                                        className={`w-full p-4 rounded-2xl border outline-none transition-all font-bold ${!isAdmin ? 'bg-[#f5f0eb] dark:bg-[#1e293b] border-teal-200/30 dark:border-teal-700/20 focus:border-teal-500 text-stone-800 dark:text-teal-300' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white'}`}
                                        required
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                        required
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        placeholder="+91..."
                                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={profile.pincode}
                                        onChange={handleChange}
                                        placeholder="110001"
                                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-3 md:col-span-2">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ${!isAdmin ? 'text-teal-700 dark:text-teal-500/60' : 'text-slate-700 dark:text-slate-300'}`}>Address</label>
                                    <textarea
                                        name="address"
                                        value={profile.address}
                                        onChange={handleChange}
                                        placeholder="Street, City, State..."
                                        rows="3"
                                        className={`w-full p-4 rounded-2xl border outline-none transition-all font-bold resize-none ${!isAdmin ? 'bg-[#f5f0eb] dark:bg-[#1e293b] border-teal-200/30 dark:border-teal-700/20 focus:border-teal-500 text-stone-800 dark:text-teal-300' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white'}`}
                                    />
                                </motion.div>
                            </motion.div>

                            <div className={`border-t pt-10 mt-6 ${!isAdmin ? 'border-teal-100/40 dark:border-teal-800/20' : 'border-slate-100 dark:border-slate-700'}`}>
                                <h3 className={`text-xl font-black italic uppercase tracking-tighter mb-8 ${!isAdmin ? 'text-stone-800 dark:text-teal-300' : 'text-slate-800 dark:text-white'}`}>Security Vault</h3>
                                <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <motion.div variants={itemVariants} className="space-y-3">
                                        <label className={`text-[10px] font-black uppercase tracking-widest ${!isAdmin ? 'text-teal-700 dark:text-teal-500/60' : 'text-slate-700 dark:text-slate-300'}`}>New Password</label>
                                        <div className="relative">
                                            <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 ${!isAdmin ? 'text-teal-500/50' : 'text-slate-400'}`} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={profile.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className={`w-full pl-12 pr-12 p-4 rounded-2xl border outline-none transition-all font-bold ${!isAdmin ? 'bg-[#f5f0eb] dark:bg-[#1e293b] border-teal-200/30 dark:border-teal-700/20 focus:border-teal-500 text-stone-800 dark:text-teal-300' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                                        <div className="relative">
                                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={profile.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full pl-10 pr-10 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>

                            <motion.div variants={itemVariants} className="flex justify-end pt-10">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`px-10 py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50 disabled:shadow-none border ${!isAdmin ? 'bg-teal-500 dark:bg-teal-600 text-white border-teal-400/30 hover:scale-105 shadow-teal-400/25' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200 dark:shadow-primary-900'}`}
                                >
                                    {saving ? (
                                        <>
                                            <div className={`w-5 h-5 border-2 rounded-full animate-spin ${!isAdmin ? 'border-white/30 border-t-white' : 'border-white/30 border-t-white'}`}></div>
                                            Archiving...
                                        </>
                                    ) : (
                                        <><FiSave size={20} /> Update Profile</>
                                    )}
                                </button>
                            </motion.div>
                        </form>
                    </SpotlightCard>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Profile;
