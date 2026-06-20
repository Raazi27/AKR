import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiShoppingBag, FiClock, FiUser, FiLogOut, FiSun, FiMoon, FiMenu, FiX, FiShoppingCart } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import DotPattern from './react-bits/DotPattern';

const CustomerLayout = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const links = [
        { name: 'Home', icon: <FiHome />, path: '/' },
        { name: 'Products', icon: <FiShoppingBag />, path: '/products' },
        { name: 'My Orders', icon: <FiClock />, path: '/pending-orders' },
        { name: 'Profile', icon: <FiUser />, path: '/profile' },
    ];

    return (
        <div className="min-h-screen bg-[#f5f0eb] dark:bg-[#111827] font-sans transition-colors duration-300">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <DotPattern className="opacity-30 dark:opacity-10" width={20} height={20} cx={1} cy={1} cr={1} />
                <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-400/10 dark:bg-teal-700/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
                />
                <motion.div
                    animate={{ scale: [1.1, 1, 1.1], rotate: [0, -60, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-300/10 dark:bg-rose-800/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
                />
            </div>

            {/* Navigation Bar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-4 ${scrolled ? 'bg-white/90 dark:bg-[#1a2332]/90 backdrop-blur-xl shadow-lg border-b border-teal-200/40 dark:border-teal-700/20 py-3' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 via-teal-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg shadow-teal-400/30 ring-1 ring-white/20">
                            <span className="text-white font-black text-xl uppercase italic drop-shadow-md">K</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-stone-800 dark:text-teal-300 font-extrabold text-lg leading-tight tracking-tighter uppercase">Al-Kabah</h1>
                            <p className="text-teal-700 dark:text-teal-500/70 text-[10px] font-black tracking-[0.2em] uppercase">Private Client</p>
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1 bg-white/60 dark:bg-white/5 p-1 rounded-2xl border border-teal-300/20 dark:border-teal-700/20 backdrop-blur-md">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link key={link.name} to={link.path}>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-6 py-2 rounded-xl text-sm font-black transition-all duration-500 flex items-center gap-2 tracking-wide uppercase ${isActive
                                            ? 'bg-teal-500 text-white shadow-lg shadow-teal-400/25'
                                            : 'text-stone-600 dark:text-teal-400/60 hover:text-teal-700 dark:hover:text-teal-300'
                                            }`}
                                    >
                                        <span className={isActive ? 'text-white' : 'text-teal-500 dark:text-teal-500/60'}>{link.icon}</span>
                                        {link.name}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-white dark:bg-[#1a2332] text-teal-600 dark:text-teal-400 border border-teal-300/30 dark:border-teal-700/30 hover:border-teal-500 shadow-sm transition-all"
                        >
                            {theme === 'dark' ? <FiMoon size={20} /> : <FiSun size={20} />}
                        </button>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="p-2.5 rounded-xl bg-white dark:bg-[#1a2332] text-teal-600 dark:text-teal-400 border border-teal-300/30 dark:border-teal-700/30 hover:border-teal-500 shadow-sm transition-all relative"
                        >
                            <FiShoppingCart size={20} />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#1a2332] animate-bounce">
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        <div className="h-8 w-[1px] bg-teal-300/30 mx-1 hidden sm:block"></div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3">
                            <Link to="/profile" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 via-teal-500 to-cyan-600 p-[2px] shadow-xl group-hover:scale-110 transition-all duration-500">
                                    <div className="w-full h-full rounded-[10px] bg-stone-100 dark:bg-[#1a2332] p-0.5 overflow-hidden">
                                        {user?.profilePicture ? (
                                            <img
                                                src={`/${user.profilePicture.replace(/\\/g, '/')}`}
                                                alt="User"
                                                className="w-full h-full object-cover rounded-[8px]"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/40 rounded-[8px]">
                                                {user?.name?.[0] || 'U'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-xs font-black text-stone-800 dark:text-teal-300 leading-none uppercase tracking-wider">{user?.name || 'Client'}</p>
                                    <p className="text-[10px] font-bold text-teal-700 dark:text-teal-500 uppercase mt-1 tracking-widest">Member</p>
                                </div>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-rose-500 dark:bg-rose-600 text-white rounded-xl hover:bg-rose-600 dark:hover:bg-rose-500 transition-all duration-300 text-[10px] font-black uppercase tracking-widest border border-rose-400/30"
                            >
                                <FiLogOut />
                                <span className="hidden lg:inline">Sign Out</span>
                            </button>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2.5 rounded-xl bg-teal-500 text-white shadow-xl shadow-teal-500/30"
                        >
                            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden mt-4 overflow-hidden"
                        >
                            <div className="bg-white/95 dark:bg-[#1a2332]/95 backdrop-blur-2xl rounded-3xl border border-teal-200/30 dark:border-teal-700/20 shadow-2xl p-4 space-y-2">
                                {links.map((link) => {
                                    const isActive = location.pathname === link.path;
                                    return (
                                        <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)}>
                                            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${isActive ? 'bg-teal-500 text-white' : 'text-stone-600 dark:text-teal-400/70 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'}`}>
                                                {link.icon}
                                                {link.name}
                                            </div>
                                        </Link>
                                    );
                                })}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-rose-300/20 dark:border-rose-700/20 uppercase tracking-widest mt-4"
                                >
                                    <FiLogOut />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Main Content Area */}
            <main className="relative z-10 pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Outlet context={{ theme }} />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-16 px-6 border-t border-teal-200/30 dark:border-teal-800/20 bg-white/50 dark:bg-[#1a2332]/60 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div>
                        <h2 className="text-xl font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.3em]">Al-Kabah</h2>
                        <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 font-bold tracking-wider italic">Excellence in every stitch since 2014.</p>
                    </div>
                    <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-500">
                        <Link to="/" className="hover:text-teal-400 transition-colors">Concierge</Link>
                        <Link to="/" className="hover:text-teal-400 transition-colors">Privacy</Link>
                        <Link to="/" className="hover:text-teal-400 transition-colors">Institutional</Link>
                    </div>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest">© 2014 Al-Kabah Uniforms. Defined by Craftsmanship.</p>
                </div>
            </footer>
        </div>
    );
};

export default CustomerLayout;
