import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiMail, FiSun, FiMoon, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'customer', otp: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const navigate = useNavigate();

    // Theme State
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSendOtp = async () => {
        setError('');
        setSuccess('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            return setError('Please enter a valid email address first');
        }

        const normalizedEmail = formData.email.trim().toLowerCase();
        setSendingOtp(true);
        try {
            await axios.post('/api/auth/register-otp', {
                email: normalizedEmail
            });
            setSuccess('Verification code sent to your email!');
            setIsOtpSent(true);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to send verification code';
            setError(errorMsg);
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) return setError("Passwords don't match");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            return setError('Please enter a valid email address (e.g. name@domain.com)');
        }

        try {
            await axios.post('/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                otp: formData.otp
            });
            setSuccess('Registration Successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || 'Registration failed';
            setError(errorMsg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-4 transition-colors duration-300">
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all shadow-lg"
                aria-label="Toggle Theme"
            >
                {theme === 'dark' ? <FiMoon size={24} /> : <FiSun size={24} />}
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 border border-white/20 dark:border-slate-700"
            >
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">Create Account</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-2">Join Al-Kabah Uniforms Today</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-3 mb-4 rounded text-sm mb-6">
                        {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-3 mb-4 rounded text-sm mb-6">
                        {success}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="name"
                            type="text"
                            placeholder="Full Name"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 dark:text-white placeholder-gray-400"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="relative">
                        <FiMail className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            className="w-full pl-10 pr-24 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 dark:text-white placeholder-gray-400"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isOtpSent}
                        />
                        {!isOtpSent && (
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={sendingOtp}
                                className="absolute right-2 top-2 bottom-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-md transition-colors disabled:bg-gray-400"
                            >
                                {sendingOtp ? 'Sending...' : 'Verify'}
                            </button>
                        )}
                        {isOtpSent && (
                            <button
                                type="button"
                                onClick={() => setIsOtpSent(false)}
                                className="absolute right-2 top-2 bottom-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-md transition-colors"
                            >
                                Change
                            </button>
                        )}
                    </div>

                    {isOtpSent && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-5"
                        >
                            <div className="relative">
                                <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    name="otp"
                                    type="text"
                                    placeholder="6-Digit Verification Code"
                                    maxLength="6"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 dark:text-white placeholder-gray-400"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="relative">
                                <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 dark:text-white placeholder-gray-400"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 dark:text-white placeholder-gray-400"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>

                            <div className="relative">
                                <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                                <select
                                    name="role"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none text-gray-700 dark:text-white"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform"
                                type="submit"
                            >
                                Create Account
                            </motion.button>
                        </motion.div>
                    )}
                </form>

                <div className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 hover:underline transition-colors">
                        Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
