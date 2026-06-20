import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiAlertCircle, FiStar, FiMapPin, FiPhone, FiInstagram, FiFacebook, FiTwitter, FiArrowRight, FiSun, FiMoon, FiEye, FiEyeOff } from 'react-icons/fi';
import SpotlightCard from '../components/react-bits/SpotlightCard';
import BlurText from '../components/react-bits/BlurText';
import Marquee from '../components/react-bits/Marquee';
import DotPattern from '../components/react-bits/DotPattern';
import ScrollFloat from '../components/react-bits/ScrollFloat';
import PillNav from '../components/react-bits/PillNav';

const StarRating = ({ rating }) => (
    <div className="flex text-yellow-400 gap-0.5">
        {[...Array(5)].map((_, i) => (
            <FiStar key={i} className={i < rating ? "fill-current" : "text-slate-300 dark:text-slate-600"} />
        ))}
    </div>
);

const ReviewCard = ({ name, role, review, rating }) => (
    <SpotlightCard className="min-w-[300px] md:min-w-[400px] flex flex-col gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20 dark:border-slate-700">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {name[0]}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{role}</p>
                </div>
            </div>
            <StarRating rating={rating} />
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic">"{review}"</p>
    </SpotlightCard>
);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot Password Flow States
    const [view, setView] = useState('login'); // 'login', 'forgot', 'otp', 'reset'
    const [resetEmail, setResetEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const API_BASE = window.location.hostname === 'localhost' ? '' : `http://${window.location.hostname}:5000`;

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(resetEmail)) {
            setError('Please enter a valid email address (e.g. name@domain.com)');
            setLoading(false);
            return;
        }
        try {
            await axios.post(`${API_BASE}/api/auth/forgot-password`, { email: resetEmail });
            setSuccess('OTP sent to your email.');
            setView('otp');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to send OTP';
            if (errorMsg.includes('Error sending email')) {
                setError(`Could not reach ${resetEmail}. Please check if the email address is correct and try again.`);
            } else if (errorMsg.includes('The domain') || errorMsg.includes('cannot receive emails')) {
                setError(errorMsg);
            } else {
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        if (otp.length === 6) {
            setView('reset');
            setSuccess('');
        } else {
            setError('Please enter a valid 6-digit OTP');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post(`${API_BASE}/api/auth/reset-password`, {
                email: resetEmail,
                otp,
                newPassword
            });
            alert('Password reset successful! Please login with your new password.');
            setView('login');
            setEmail(resetEmail);
            setResetEmail('');
            setOtp('');
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const reviews = [
        { name: "Ahmed Khan", role: "School Administrator", review: "The quality of uniforms provided by Al-Kabah is unmatched. Our students look smarter than ever!", rating: 5 },
        { name: "Sarah Jenkins", role: "Parent", review: "Excellent fitting and durable fabric. Survives the rough and tumble of daily school life perfectly.", rating: 5 },
        { name: "Mohammed Ali", role: "Principal", review: "Timely delivery and professional service. Highly recommended for bulk orders.", rating: 4 },
        { name: "Fatima Syed", role: "Fashion Designer", review: "Impressive attention to detail in stitching. Only getting better every year.", rating: 5 },
    ];

    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary-200 selection:text-primary-900 overflow-x-hidden transition-colors duration-300">
            <DotPattern className="opacity-30 fixed inset-0 z-0 pointer-events-none dark:opacity-10" width={32} height={32} />

            {/* Navigation: PillNav */}
            <PillNav
                items={[
                    { label: 'Home', href: '#hero' },
                    { label: 'About', href: '#about' },
                    { label: 'Testimonials', href: '#reviews' },
                    { label: 'Contact', href: '#contact' }
                ]}
                activeHref="#hero"
                theme={theme}
                baseColor={theme === 'dark' ? '#f8fafc' : '#1e293b'}
                pillColor={theme === 'dark' ? '#6366f1' : '#4f46e5'}
                hoveredPillTextColor="#ffffff"
                pillTextColor={theme === 'dark' ? '#f8fafc' : '#1e293b'}
                logo={null}
                className="custom-nav dark:bg-slate-900/70 dark:border-slate-800"
                rightContent={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <FiMoon size={18} /> : <FiSun size={18} />}
                        </button>
                        <Link to="/register" className="px-5 py-2 bg-slate-900 dark:bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-slate-800 dark:hover:bg-primary-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20 md:block hidden">
                            Get Started
                        </Link>
                    </div>
                }
            />

            {/* Hero Section */}
            <section id="hero" className="min-h-screen pt-24 pb-12 px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative">
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-screen" />

                <div className="flex-1 max-w-2xl z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 text-primary-600 dark:text-primary-300 text-sm font-medium"
                    >
                        ✨ Premium Quality Tailoring
                    </motion.div>

                    <div className="mb-6">
                        <ScrollFloat
                            animationDuration={1}
                            ease='back.inOut(2)'
                            scrollStart='center bottom+=50%'
                            scrollEnd='bottom bottom-=40%'
                            stagger={0.03}
                            containerClassName='text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight'
                            textClassName='font-bold text-slate-900 dark:text-white'
                        >
                            Al-Kabah Uniforms
                        </ScrollFloat>

                        <BlurText
                            text="Crafting Excellence in Every Stitch"
                            className="text-2xl lg:text-3xl font-medium text-slate-500 dark:text-slate-400 mt-2 tracking-tight"
                            delay={30}
                            animateBy="words"
                        />
                    </div>

                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-lg">
                        Experience the perfect blend of tradition and modern craftsmanship. We provide top-tier uniform solutions for schools, corporate, and healthcare sectors.
                    </p>

                    <div className="flex gap-4">
                        <button onClick={() => scrollTo('about')} className="px-8 py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all hover:shadow-lg hover:shadow-primary-500/30 flex items-center gap-2 group">
                            Explore More <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={() => scrollTo('reviews')} className="px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                            See Reviews
                        </button>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-md z-10 relative">
                    <SpotlightCard className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/40 dark:border-slate-700 shadow-2xl p-8 overflow-hidden">
                        <AnimatePresence mode="wait">
                            {view === 'login' && (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome Back</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Please sign in to your dashboard</p>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm border border-red-100 dark:border-red-900/30"
                                        >
                                            <FiAlertCircle className="flex-shrink-0" />
                                            {error}
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                                            <div className="relative">
                                                <FiMail className="absolute left-3.5 top-3.5 text-slate-400" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white transition-all outline-none"
                                                    placeholder="name@example.com"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                            <div className="relative">
                                                <FiLock className="absolute left-3.5 top-3.5 text-slate-400" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full pl-10 pr-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white transition-all outline-none"
                                                    placeholder="••••••••"
                                                    required
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

                                        <div className="flex items-center justify-between text-sm">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 bg-slate-50 dark:bg-slate-900" />
                                                <span className="text-slate-500 dark:text-slate-400">Remember me</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => { setView('forgot'); setError(''); setSuccess(''); }}
                                                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Signing In...' : 'Sign In'}
                                        </button>
                                    </form>

                                    <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                        Don't have an account?{' '}
                                        <Link to="/register" className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline">
                                            Create free account
                                        </Link>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'forgot' && (
                                <motion.div
                                    key="forgot"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Forgot Password?</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your email to receive a reset OTP</p>
                                    </div>

                                    {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100">{error}</div>}

                                    <form onSubmit={handleForgotPassword} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold dark:text-slate-300">Email Address</label>
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                                placeholder="name@example.com"
                                                required
                                            />
                                        </div>
                                        <button disabled={loading} className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl">
                                            {loading ? 'Sending...' : 'Send OTP'}
                                        </button>
                                        <button type="button" onClick={() => setView('login')} className="w-full text-slate-500 text-sm hover:underline">Back to Login</button>
                                    </form>
                                </motion.div>
                            )}

                            {view === 'otp' && (
                                <motion.div
                                    key="otp"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Verify OTP</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">OTP sent to {resetEmail}</p>
                                    </div>

                                    {success && <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-lg">{success}</div>}
                                    {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">{error}</div>}

                                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                                        <input
                                            type="text"
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full p-4 text-center text-2xl font-bold tracking-[1em] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                            placeholder="000000"
                                            required
                                        />
                                        <button className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl">Confirm OTP</button>
                                        <div className="flex justify-between items-center text-sm px-2">
                                            <button type="button" onClick={() => setView('forgot')} className="text-slate-500 hover:text-primary-600 hover:underline">Change Email</button>
                                            <button type="button" onClick={() => setView('login')} className="text-slate-500 hover:text-primary-600 hover:underline">Back to Login</button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {view === 'reset' && (
                                <motion.div
                                    key="reset"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">New Password</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Set your new password below</p>
                                    </div>

                                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

                                    <form onSubmit={handleResetPassword} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold dark:text-slate-300">New Password</label>
                                            <div className="relative">
                                                <FiLock className="absolute left-3.5 top-3.5 text-slate-400" />
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full pl-10 pr-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>
                                        </div>
                                        <button disabled={loading} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/30">
                                            {loading ? 'Updating...' : 'Reset Password'}
                                        </button>
                                        <button type="button" onClick={() => setView('otp')} className="w-full text-slate-500 text-sm hover:underline">Back to OTP Verification</button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </SpotlightCard>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 px-6 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-primary-600 dark:text-primary-400 font-bold tracking-wider uppercase text-sm">Why Choose Us</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-2 mb-4">Premium Quality, Delivered.</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">We combine traditional tailoring techniques with modern technology to deliver uniforms that stand the test of time.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Premium Fabrics", desc: "Sourced from the best mills for durability and comfort.", icon: "🧵" },
                            { title: "Expert Tailoring", desc: "Crafted by master tailors with decades of experience.", icon: "✂️" },
                            { title: "Timely Delivery", desc: "We respect your schedule and ensure on-time delivery.", icon: "🚚" }
                        ].map((item, i) => (
                            <SpotlightCard key={i} className="bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 p-8 h-full">
                                <div className="text-4xl mb-6">{item.icon}</div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                            </SpotlightCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section id="reviews" className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors duration-300">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                <div className="text-center mb-16 px-6">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Trusted by Leading Institutions</h2>
                    <p className="text-slate-500 dark:text-slate-400">See what our clients have to say about their experience.</p>
                </div>

                <Marquee duration={40} className="py-8">
                    {reviews.map((review, i) => (
                        <ReviewCard key={i} {...review} />
                    ))}
                </Marquee>
                <Marquee duration={40} reverse className="py-8">
                    {reviews.map((review, i) => (
                        <ReviewCard key={i} {...review} />
                    ))}
                </Marquee>
            </section>

            {/* Contact Footer */}
            <footer id="contact" className="bg-slate-900 dark:bg-black text-slate-300 py-24 px-6 relative overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 z-0 opacity-20">
                    <DotPattern className="fill-white" />
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-500" />
                            <span className="font-bold text-xl text-white tracking-tight">Al-Kabah</span>
                        </div>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            Your trusted partner for high-quality uniforms and professional tailoring services.
                        </p>
                        <div className="flex gap-4">
                            {[FiInstagram, FiFacebook, FiTwitter].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => scrollTo('about')} className="hover:text-primary-400 transition-colors">About Us</button></li>
                            <li><button onClick={() => scrollTo('reviews')} className="hover:text-primary-400 transition-colors">Testimonials</button></li>
                            <li><Link to="/register" className="hover:text-primary-400 transition-colors">Register</Link></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <FiMapPin className="mt-1 text-primary-500" />
                                <span>18/a P.J.Nehru Road, Vaniyambadi,Thirupattur District<br />Tamil Nadu, India 635751</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FiPhone className="text-primary-500" />
                                <span>+91 99409 23869</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FiMail className="text-primary-500" />
                                <span>tabrezniyazif03@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Newsletter</h4>
                        <p className="text-sm text-slate-400 mb-4">Subscribe to get updates on new collections.</p>
                        <form className="flex gap-2">
                            <input type="email" placeholder="Your email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:border-primary-500" />
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700">Go</button>
                        </form>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} Al-Kabah Uniforms. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Login;
