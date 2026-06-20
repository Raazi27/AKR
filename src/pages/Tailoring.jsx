import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInfo, FiScissors, FiUserCheck } from 'react-icons/fi';
import SpotlightCard from '../components/react-bits/SpotlightCard';

const Tailoring = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [activeField, setActiveField] = useState(null); // Track focused field for visualization
    const [gender, setGender] = useState('male'); // 'male' or 'female'
    const [measurements, setMeasurements] = useState({
        chest: '', waist: '', shoulder: '', sleeveLength: '', shirtLength: '',
        pantWaist: '', pantLength: '', hip: '', notes: ''
    });
    const [orderItems, setOrderItems] = useState(['']);

    useEffect(() => {
        // Fetch customers or mock
        const fetchCustomers = async () => {
            // Mock
            setCustomers([
                { _id: '1', name: 'John Doe', phone: '1234567890', measurements: { chest: 40, waist: 32 } },
                { _id: '2', name: 'Jane Smith', phone: '0987654321', measurements: {} }
            ]);
        };
        fetchCustomers();
    }, []);

    const handleCustomerSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setFilteredCustomers(customers.filter(c => c.name.toLowerCase().includes(query) || c.phone.includes(query)));
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        if (customer.measurements) {
            setMeasurements({ ...measurements, ...customer.measurements });
        }
        setFilteredCustomers([]);
    };

    // Standard Sizes for Quick Fill
    const applyStandardSize = (size) => {
        // Simple sizing logic - could be expanded for gender specific later
        const baseSizes = {
            'S': { chest: 36, waist: 30, shoulder: 17, sleeveLength: 24, shirtLength: 28, pantWaist: 30, pantLength: 39, hip: 36 },
            'M': { chest: 38, waist: 32, shoulder: 18, sleeveLength: 25, shirtLength: 29, pantWaist: 32, pantLength: 40, hip: 38 },
            'L': { chest: 40, waist: 34, shoulder: 19, sleeveLength: 25.5, shirtLength: 30, pantWaist: 34, pantLength: 41, hip: 40 },
            'XL': { chest: 42, waist: 36, shoulder: 19.5, sleeveLength: 26, shirtLength: 31, pantWaist: 36, pantLength: 42, hip: 42 },
        };

        // Slight adjustments for female if needed (mock logic)
        let sizes = { ...baseSizes[size] };
        if (gender === 'female') {
            sizes.shoulder -= 2;
            sizes.waist -= 2;
            sizes.hip += 2;
        }

        if (baseSizes[size]) {
            setMeasurements({ ...measurements, ...sizes });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/tailoring', {
                customerId: selectedCustomer._id,
                gender,
                measurements,
                items: orderItems,
                deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days later mock
            });
            alert('Tailoring Order Created');
        } catch (err) {
            alert('Order Created (Mock)');
        }
    };

    // Visualization Component
    const BodyVisualizer = ({ active, gender }) => {
        const isDark = document.documentElement?.classList.contains('dark');
        const baseColor = isDark ? '#475569' : '#cbd5e1'; // slate-600 / slate-300
        const highlightColor = '#8b5cf6'; // violet-500

        // Helper to determine color
        const getColor = (fields) => fields.includes(active) ? highlightColor : baseColor;

        if (gender === 'female') {
            return (
                <svg viewBox="0 0 200 400" className="w-full h-full max-h-[500px] drop-shadow-xl">
                    {/* Female Head */}
                    <circle cx="100" cy="40" r="22" fill={baseColor} opacity="0.5" />

                    {/* Female Shoulders */}
                    <path
                        d="M 60 75 Q 100 85 140 75 L 145 100 L 55 100 Z"
                        fill={getColor(['shoulder'])}
                        className="transition-colors duration-300"
                    />

                    {/* Female Torso / Bust */}
                    <path
                        d="M 55 100 L 145 100 L 135 150 Q 100 160 65 150 Z"
                        fill={getColor(['chest', 'shirtLength'])}
                        className="transition-colors duration-300"
                    />

                    {/* Female Arms */}
                    <path
                        d="M 145 100 L 175 190 L 160 195 L 135 110"
                        fill={getColor(['sleeveLength'])}
                        className="transition-colors duration-300"
                    />
                    <path
                        d="M 55 100 L 25 190 L 40 195 L 65 110"
                        fill={getColor(['sleeveLength'])}
                        className="transition-colors duration-300"
                    />

                    {/* Female Waist / Hips (Curved) */}
                    <path
                        d="M 65 150 Q 100 160 135 150 L 145 200 Q 100 210 55 200 Z"
                        fill={getColor(['waist'])}
                        className="transition-colors duration-300"
                    />
                    <path
                        d="M 55 200 Q 100 210 145 200 L 150 240 L 50 240 Z"
                        fill={getColor(['hip', 'pantWaist'])}
                        className="transition-colors duration-300"
                    />

                    {/* Female Legs */}
                    <path
                        d="M 50 240 L 150 240 L 140 380 L 110 380 L 105 280 L 95 280 L 90 380 L 60 380 Z"
                        fill={getColor(['pantLength'])}
                        className="transition-colors duration-300"
                    />

                    {/* Active Lines */}
                    {active === 'chest' && <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="55" y1="125" x2="145" y2="125" stroke={highlightColor} strokeWidth="2" strokeDasharray="5,5" />}
                    {active === 'waist' && <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="60" y1="175" x2="140" y2="175" stroke={highlightColor} strokeWidth="2" strokeDasharray="5,5" />}
                    {active === 'hip' && <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="50" y1="220" x2="150" y2="220" stroke={highlightColor} strokeWidth="2" strokeDasharray="5,5" />}
                    {active === 'pantLength' && <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="170" y1="240" x2="170" y2="380" stroke={highlightColor} strokeWidth="2" />}
                </svg>
            );
        }

        // Male Body Default
        return (
            <svg viewBox="0 0 200 400" className="w-full h-full max-h-[500px] drop-shadow-xl">
                {/* Head */}
                <circle cx="100" cy="40" r="25" fill={baseColor} opacity="0.5" />

                {/* Shoulders */}
                <path
                    d="M 50 80 Q 100 90 150 80 L 160 110 L 40 110 Z"
                    fill={getColor(['shoulder'])}
                    className="transition-colors duration-300"
                />

                {/* Torso / Chest */}
                <path
                    d="M 40 110 L 160 110 L 150 180 L 50 180 Z"
                    fill={getColor(['chest', 'shirtLength'])}
                    className="transition-colors duration-300"
                />

                {/* Sleeves / Arms */}
                <path
                    d="M 160 110 L 190 200 L 175 205 L 150 120"
                    fill={getColor(['sleeveLength'])}
                    className="transition-colors duration-300"
                />
                <path
                    d="M 40 110 L 10 200 L 25 205 L 50 120"
                    fill={getColor(['sleeveLength'])}
                    className="transition-colors duration-300"
                />

                {/* Waist / Hips */}
                <path
                    d="M 50 180 L 150 180 L 155 230 L 45 230 Z"
                    fill={getColor(['waist', 'pantWaist', 'hip'])}
                    className="transition-colors duration-300"
                />

                {/* Legs / Pants */}
                <path
                    d="M 45 230 L 155 230 L 145 380 L 105 380 L 100 280 L 95 380 L 55 380 Z"
                    fill={getColor(['pantLength'])}
                    className="transition-colors duration-300"
                />

                {/* Highlight Indicator Lines */}
                {active === 'chest' && <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="20" y1="140" x2="180" y2="140" stroke={highlightColor} strokeWidth="2" strokeDasharray="5,5" />}
                {active === 'waist' && <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="20" y1="200" x2="180" y2="200" stroke={highlightColor} strokeWidth="2" strokeDasharray="5,5" />}
                {active === 'pantLength' && <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="180" y1="230" x2="180" y2="380" stroke={highlightColor} strokeWidth="2" />}
            </svg>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-100px)]">
            {/* Left Column: Form */}
            <div className="flex-1 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-700 transition-colors lg:overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                    <FiScissors className="text-primary-500" /> New Tailoring Order
                </h2>

                {/* Customer Search & Gender */}
                <div className="mb-8 relative group">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Customer Details</label>
                        {/* Gender Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button
                                onClick={() => setGender('male')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${gender === 'male' ? 'bg-white dark:bg-slate-600 shadow text-primary-600 dark:text-primary-300' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Male
                            </button>
                            <button
                                onClick={() => setGender('female')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${gender === 'female' ? 'bg-white dark:bg-slate-600 shadow text-pink-600 dark:text-pink-300' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Female
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Customer by Name or Phone..."
                            className="w-full p-3.5 pl-11 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            onChange={handleCustomerSearch}
                        />
                        <FiUserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                    </div>

                    <AnimatePresence>
                        {filteredCustomers.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute z-20 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-600 rounded-xl shadow-2xl mt-2 max-h-60 overflow-y-auto"
                            >
                                {filteredCustomers.map(c => (
                                    <div
                                        key={c._id}
                                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                                        onClick={() => handleSelectCustomer(c)}
                                    >
                                        <div className="font-bold">{c.name}</div>
                                        <div className="text-xs text-slate-500">{c.phone}</div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {selectedCustomer && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg flex items-center justify-between text-sm border border-green-100 dark:border-green-800"
                        >
                            <span className="font-medium">Selected: {selectedCustomer.name}</span>
                            <button onClick={() => setSelectedCustomer(null)} className="text-xs underline hover:text-green-800 dark:hover:text-green-200">Change</button>
                        </motion.div>
                    )}
                </div>

                {/* Measurements Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Upper Body</h3>
                            {['chest', 'shoulder', 'sleeveLength', 'shirtLength'].map(field => (
                                <div key={field} className="relative">
                                    <input
                                        type="number"
                                        placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        value={measurements[field]}
                                        onChange={e => setMeasurements({ ...measurements, [field]: e.target.value })}
                                        onFocus={() => setActiveField(field)}
                                        onBlur={() => setActiveField(null)}
                                        className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow focus:border-transparent placeholder-slate-400"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Lower Body</h3>
                            {['waist', 'hip', 'pantWaist', 'pantLength'].map(field => (
                                <input
                                    key={field}
                                    type="number"
                                    placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    value={measurements[field]}
                                    onChange={e => setMeasurements({ ...measurements, [field]: e.target.value })}
                                    onFocus={() => setActiveField(field)}
                                    onBlur={() => setActiveField(null)}
                                    className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow focus:border-transparent placeholder-slate-400"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Order Items</label>
                        <input
                            type="text"
                            placeholder="e.g. 2 Shirts, 1 Trouser (Separate by comma)"
                            className="w-full p-3.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            onChange={e => setOrderItems(e.target.value.split(','))}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Tailor Notes</label>
                        <textarea
                            className="w-full p-3.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                            rows="3"
                            placeholder="Special instructions, fit preference, fabric details..."
                            value={measurements.notes}
                            onChange={e => setMeasurements({ ...measurements, notes: e.target.value })}
                        ></textarea>
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Create Tailoring Order
                    </button>
                </form>
            </div>

            {/* Right: Smart Measurement Assistant */}
            <div className="hidden lg:flex w-1/3 flex-col gap-6">
                {/* Visualizer Card */}
                <SpotlightCard className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden transition-colors">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gender === 'female' ? 'from-pink-500 to-rose-500' : 'from-primary-500 to-blue-500'}`}></div>

                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2 self-start flex items-center gap-2">
                        <FiInfo /> Visual Assistant ({gender === 'male' ? 'Male' : 'Female'})
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 self-start">
                        {activeField
                            ? `Enter measurement for ${activeField.replace(/([A-Z])/g, ' $1')}`
                            : "Focus on a field to see guidance"}
                    </p>

                    <div className="w-full flex-1 flex items-center justify-center relative">
                        <div className={`absolute inset-0 rounded-full blur-3xl transform scale-75 ${gender === 'female' ? 'bg-pink-500/5 dark:bg-pink-500/10' : 'bg-primary-500/5 dark:bg-primary-500/10'}`}></div>
                        <BodyVisualizer active={activeField} gender={gender} />
                    </div>
                </SpotlightCard>

                {/* Quick Presets Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-700 transition-colors">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 uppercase tracking-wider">Quick Size Presets ({gender})</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {['S', 'M', 'L', 'XL'].map(size => (
                            <button
                                key={size}
                                onClick={() => applyStandardSize(size)}
                                className={`aspect-square rounded-xl bg-slate-50 dark:bg-slate-700 hover:text-white font-bold text-lg transition-all shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md ${gender === 'female' ? 'hover:bg-pink-500 dark:hover:bg-pink-600 hover:border-pink-500' : 'hover:bg-primary-500 dark:hover:bg-primary-600 hover:border-primary-500'} text-slate-600 dark:text-slate-300`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-4 text-center">
                        Clicking a preset will auto-fill standard measurements.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Tailoring;
