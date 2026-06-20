import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiClock, FiPackage, FiTruck, FiAlertCircle, FiStar } from 'react-icons/fi';
import { useState } from 'react';
import axios from 'axios';

const FeedbackForm = ({ orderId, onFeedbackSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return alert('Please select a rating');
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/invoices/${orderId}/feedback`, { rating, feedback }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Thank you for your feedback!');
            onFeedbackSubmitted();
        } catch (err) {
            console.error(err);
            alert('Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-center font-bold text-slate-800 dark:text-white">How was your order?</h3>
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                    >
                        <FiStar fill={rating >= star ? 'currentColor' : 'none'} />
                    </button>
                ))}
            </div>
            <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience (optional)..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                rows="3"
            />
            <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all ${loading ? 'bg-slate-400' : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30'}`}
            >
                {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
        </div>
    );
};

const TrackingModal = ({ isOpen, onClose, order, type }) => {
    if (!isOpen || !order) return null;

    const invoiceSteps = [
        { status: 'Pending', label: 'Order Placed', icon: <FiClock /> },
        { status: 'Paid', label: 'Payment Confirmed', icon: <FiCheck /> },
        { status: 'Delivered', label: 'the product have been deliverd successfully', icon: <FiPackage /> }
    ];

    const tailoringSteps = [
        { status: 'Pending', label: 'Order Placed', icon: <FiClock /> },
        { status: 'In Progress', label: 'Under Tailoring', icon: <FiClock /> },
        { status: 'Ready', label: 'Ready for Pickup', icon: <FiCheck /> },
        { status: 'Delivered', label: 'the product have been deliverd successfully', icon: <FiPackage /> }
    ];

    const steps = type === 'tailoring' ? tailoringSteps : invoiceSteps;

    // Find index of current status
    const currentStatusIndex = steps.findIndex(s => s.status === order.status);
    const isCancelled = order.status === 'Cancelled';

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
                >
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Track Your Order</h2>
                            <p className="text-sm text-slate-500 font-mono mt-1">Order #{order.invoiceId || order._id.slice(-6).toUpperCase()}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 dark:text-slate-500 transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="p-8">
                        {isCancelled ? (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiAlertCircle size={40} className="text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Order Cancelled</h3>
                                <p className="text-slate-500 dark:text-slate-400">the order have been canceled due to some techinal issues</p>
                            </div>
                        ) : (
                            <div className="space-y-8 relative">
                                {/* Connector Line */}
                                <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-700 z-0"></div>

                                {steps.map((step, index) => {
                                    const isCompleted = index < currentStatusIndex || order.status === step.status;
                                    const isActive = order.status === step.status;

                                    return (
                                        <div key={index} className="flex items-start gap-6 relative z-10">
                                            <div className={`
                                                w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                                                ${isCompleted
                                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}
                                                ${isActive ? 'ring-4 ring-primary-500/20 scale-110' : ''}
                                            `}>
                                                {isCompleted ? <FiCheck size={24} /> : step.icon}
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <h4 className={`font-bold transition-colors ${isCompleted ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                                                    {step.label}
                                                </h4>
                                                <p className="text-sm text-slate-400 dark:text-slate-500">
                                                    {isActive ? 'Current Status' : (isCompleted ? 'Completed' : 'Pending')}
                                                </p>
                                            </div>
                                            {isActive && (
                                                <div className="ml-auto">
                                                    <span className="flex h-3 w-3 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                        {order.status === 'Delivered' && !order.feedback ? (
                            <FeedbackForm orderId={order._id} onFeedbackSubmitted={onClose} />
                        ) : (
                            <button
                                onClick={onClose}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TrackingModal;
