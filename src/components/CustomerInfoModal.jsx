import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiPhone, FiMail, FiMapPin, FiHash } from 'react-icons/fi';

const CustomerInfoModal = ({ isOpen, onClose, customer }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
                                    <FiUser size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Customer Details</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 dark:text-slate-500 transition-colors"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {!customer || (!customer.phone && !customer.address) ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <FiUser size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Guest Customer</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">No additional contact information available for this order.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                            <FiUser size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                                            <p className="text-slate-800 dark:text-white font-medium">{customer.name || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                            <FiPhone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                                            <p className="text-slate-800 dark:text-white font-medium">{customer.phone || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                            <FiMail size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                                            <p className="text-slate-800 dark:text-white font-medium">{customer.email || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                                            <FiMapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Shipping Address</p>
                                            <p className="text-slate-800 dark:text-white font-medium leading-relaxed">
                                                {customer.address || 'N/A'}
                                                {customer.pincode && <span className="block mt-1 font-mono text-xs bg-slate-100 dark:bg-slate-700 w-fit px-1.5 rounded">{customer.pincode}</span>}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={onClose}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CustomerInfoModal;
