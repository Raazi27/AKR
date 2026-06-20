import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiShoppingBag, FiScissors, FiDollarSign, FiBarChart2, FiMenu, FiX, FiLogOut, FiSettings, FiClock, FiSun, FiMoon, FiPackage, FiShoppingCart } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import DotPattern from './react-bits/DotPattern';
import CustomerLayout from './CustomerLayout';

const Layout = () => {
    const { user, logout } = useAuth();

    if (user?.role === 'customer') {
        return <CustomerLayout />;
    }

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [sidebarOpen, setSidebarOpen] = useState(windowWidth >= 1024);
    const navigate = useNavigate();
    const location = useLocation();

    // Handle initial state and resize
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            if (width >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        // Set initial state correctly
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar on mobile when location changes
    useEffect(() => {
        if (windowWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [location.pathname, windowWidth]);

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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const links = [
        { name: 'Dashboard', icon: <FiHome />, path: '/' },
        { name: 'Start New Order', icon: <FiScissors />, path: '/tailoring', role: ['admin', 'staff'] },
        { name: 'Active Orders', icon: <FiClock />, path: '/pending-orders' },
        { name: 'Products', icon: <FiShoppingBag />, path: '/products' },
        { name: 'Customers', icon: <FiUsers />, path: '/customers', role: ['admin'] },
        { name: 'Billing', icon: <FiDollarSign />, path: '/billing', role: ['admin', 'staff'] },
        { name: 'Purchase Bills', icon: <FiPackage />, path: '/purchase-bills', role: ['admin', 'staff'] },
        { name: 'Sale Bills', icon: <FiShoppingCart />, path: '/sale-bills', role: ['admin', 'staff'] },
        { name: 'Reports', icon: <FiBarChart2 />, path: '/reports', role: ['admin'] },
        { name: 'Admin Users', icon: <FiSettings />, path: '/users', role: ['admin'] },
    ];

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden relative font-sans transition-colors duration-300">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <DotPattern className="opacity-40 dark:opacity-10" width={20} height={20} cx={1} cy={1} cr={1} />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary-200/30 dark:bg-primary-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -90, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary-200/30 dark:bg-secondary-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
                />
            </div>

            {/* Mobile Header Toggle */}
            <div className="lg:hidden absolute top-4 left-4 z-50">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-600 dark:text-slate-300">
                    <FiMenu size={24} />
                </button>
            </div>

            {/* Sidebar */}
            <AnimatePresence>
                {(sidebarOpen || windowWidth >= 1024) && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className={`fixed lg:relative z-40 h-full w-[280px] p-4 ${windowWidth < 1024 ? 'shadow-2xl' : ''}`}
                    >
                        <div className="h-full w-full bg-[#1e1b4b]/95 backdrop-blur-xl border border-white/5 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] flex flex-col p-6 overflow-hidden relative">
                            {/* Abstract Shapes */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-secondary-500/20 rounded-full blur-2xl"></div>

                            <div className="relative z-10 flex items-center gap-3 mb-10">
                                <Link to="/" className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                                        <span className="text-white font-bold text-xl">A</span>
                                    </div>
                                    <div>
                                        <h1 className="text-white font-bold text-lg leading-tight">Al-Kabah</h1>
                                        <p className="text-slate-400 text-xs font-medium">Uniforms & Tailoring</p>
                                    </div>
                                </Link>
                                {windowWidth < 1024 && (
                                    <button onClick={() => setSidebarOpen(false)} className="ml-auto text-slate-400 hover:text-white p-2">
                                        <FiX size={20} />
                                    </button>
                                )}
                            </div>

                            <nav className="relative z-10 flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                                {links.filter(link => !link.role || (user && link.role.includes(user.role))).map((link) => {
                                    const isActive = location.pathname === link.path;
                                    return (
                                        <Link key={link.name} to={link.path}>
                                            <motion.div
                                                whileHover={{ x: 5 }}
                                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                                                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-900/20'
                                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'} transition-colors`}>
                                                    {link.icon}
                                                </span>
                                                <span className="font-medium text-sm">{link.name}</span>
                                                {isActive && (
                                                    <motion.div layoutId="activePill" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                                                )}
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="relative z-10 mt-auto pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between px-4 mb-4">
                                    {/* User Info with Link to Profile */}
                                    <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity" title="View Profile">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-[#1e1b4b] overflow-hidden">
                                            {user?.profilePicture ? (
                                                <img
                                                    src={`/${user.profilePicture.replace(/\\/g, '/')}`}
                                                    alt="User"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                user?.name?.[0] || 'U'
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-white text-sm font-medium truncate max-w-[80px]">{user?.name || 'User'}</p>
                                            <p className="text-slate-500 text-xs truncate capitalize">{user?.role || 'Guest'}</p>
                                        </div>
                                    </Link>

                                    {/* Theme Toggle in Sidebar */}
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                        aria-label="Toggle Theme"
                                    >
                                        {theme === 'dark' ? <FiMoon size={18} /> : <FiSun size={18} />}
                                    </button>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-semibold group border border-red-500/20 hover:border-red-500"
                                >
                                    <FiLogOut className="group-hover:-translate-x-1 transition-transform" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 p-4 lg:p-8 custom-scrollbar scroll-smooth">
                <Header user={user} theme={theme} toggleTheme={toggleTheme} logout={handleLogout} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <div className="max-w-7xl mx-auto h-[calc(100%-80px)]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full"
                        >
                            <Outlet context={{ theme }} /> {/* Pass theme context to children if needed */}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

// Simple Header component just for mobile/desktop toggle
const Header = ({ user, logout, toggleSidebar, theme, toggleTheme }) => {
    return (
        <header className="lg:hidden flex justify-between items-center px-4 py-4 mb-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700 shadow-sm sticky top-0 z-30 transition-colors duration-300">
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">Al-Kabah</h1>
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                    {theme === 'dark' ? <FiMoon size={18} /> : <FiSun size={18} />}
                </button>
                <Link to="/profile">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs overflow-hidden border border-primary-200 dark:border-primary-800">
                        {user?.profilePicture ? (
                            <img
                                src={`/${user.profilePicture.replace(/\\/g, '/')}`}
                                alt="User"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user?.name?.[0] || 'U'
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default Layout;
