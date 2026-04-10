import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiTag, FiX, FiShoppingCart } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import SpotlightCard from '../components/react-bits/SpotlightCard';
import BlurText from '../components/react-bits/BlurText';

const Products = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin' || user?.role === 'staff';

    const [products, setProducts] = useState([]);
    const [query, setQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const API_BASE = window.location.hostname === 'localhost' ? '' : `http://${window.location.hostname}:5000`;
    const [formData, setFormData] = useState({
        name: '',
        school: '',
        category: 'Uniform',
        subCategory: '',
        size: 'M',
        price: '',
        stock: '',
        lowStockAlert: 10,
        isUpcoming: false,
        releaseDate: ''
    });

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/api/products` + (query ? `/search?query=${query}` : ''), {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setProducts(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [query]);

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (selectedFile) data.append('image', selectedFile);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editingId) {
                const res = await axios.put(`${API_BASE}/api/products/${editingId}`, data, config);
                setProducts(products.map(p => p._id === editingId ? res.data : p));
                alert('Product Updated Successfully!');
            } else {
                const res = await axios.post(`${API_BASE}/api/products`, data, config);
                setProducts([res.data, ...products]);
                alert('Product Added Successfully!');
            }
            closeModal();
        } catch (err) {
            alert('Failed to save product: ' + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This action cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(products.filter(p => p._id !== id));
        } catch (err) {
            alert("Error deleting product");
        }
    };

    const openEditModal = (product) => {
        setFormData({
            name: product.name,
            school: product.school || '',
            category: product.category,
            subCategory: product.subCategory || '',
            size: product.size,
            price: product.price,
            stock: product.stock,
            lowStockAlert: product.lowStockAlert || 10,
            isUpcoming: product.isUpcoming || false,
            releaseDate: product.releaseDate ? new Date(product.releaseDate).toISOString().split('T')[0] : ''
        });
        setEditingId(product._id);
        setPreviewUrl(product.image ? `${API_BASE}${product.image}` : null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setSelectedFile(null);
        if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setFormData({ name: '', school: '', category: 'Uniform', subCategory: '', size: 'M', price: '', stock: '', lowStockAlert: 10, isUpcoming: false, releaseDate: '' });
    };

    return (
        <div className={`p-6 min-h-screen relative transition-colors duration-300 ${!isAdmin ? 'bg-[#f5f0eb] dark:bg-[#111827]' : 'bg-slate-50 dark:bg-slate-950'}`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <div>
                    <BlurText
                        text="Product Catalog"
                        className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${!isAdmin ? 'text-stone-800 dark:text-teal-300' : 'text-slate-800 dark:text-white'}`}
                        delay={50}
                        animateBy="words"
                    />
                    <p className={`${!isAdmin ? 'text-teal-700 dark:text-teal-500/70 font-bold uppercase text-[10px] tracking-widest mt-2' : 'text-slate-500 dark:text-slate-400 mt-1 text-sm'}`}>
                        {!isAdmin ? 'Exclusively curated for Al-Kabah Private Clients' : 'Inventory Management & Product Catalog'}
                    </p>
                </div>

                {isAdmin && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ name: '', school: '', category: 'Uniform', subCategory: '', size: 'M', price: '', stock: '', lowStockAlert: 10, isUpcoming: false, releaseDate: '' });
                                setPreviewUrl(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-emerald-700 font-bold transition-all"
                        >
                            <FiPlus className="mr-2 text-xl" /> Add New Product
                        </button>
                    </div>
                )}
            </div>

            <SpotlightCard className={`p-5 mb-10 flex items-center shadow-xl ${!isAdmin ? 'bg-white dark:bg-[#1e293b]' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                <FiSearch className={`${!isAdmin ? 'text-teal-500' : 'text-slate-400'} mr-4 text-xl`} />
                <input
                    type="text"
                    placeholder="Search by Name, Category or Barcode..."
                    className={`w-full outline-none bg-transparent placeholder-stone-400/50 ${!isAdmin ? 'text-stone-800 dark:text-teal-300' : 'text-slate-700 dark:text-slate-200'}`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </SpotlightCard>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${!isAdmin ? 'border-teal-500' : 'border-emerald-500'}`}></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <SpotlightCard key={product._id} className={`h-full flex flex-col justify-between overflow-hidden border shadow-xl ${!isAdmin ? 'bg-white dark:bg-[#1e293b] border-teal-100 rounded-[2rem]' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                            <div className="p-6">
                                <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-black mb-4 relative">
                                    {product.image ? (
                                        <img src={`${API_BASE}${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300"><FiTag size={40} /></div>
                                    )}

                                    {/* Floating Purchase Logo (Cart Icon) */}
                                    {!isAdmin && (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(product);
                                            }}
                                            className="absolute top-3 right-3 p-3 bg-emerald-500/80 backdrop-blur-md text-white rounded-full shadow-lg border border-white/20 hover:bg-emerald-600 transition-colors z-10 group"
                                            title="Add to Cart"
                                        >
                                            <FiShoppingCart className="text-lg group-hover:rotate-12 transition-transform" />
                                        </motion.button>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white uppercase truncate">{product.name}</h3>
                                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1 font-bold"><FiTag /> {product.size}</span>
                                    <span className={`font-bold ${product.stock < (product.lowStockAlert || 10) ? 'text-red-500' : 'text-emerald-500'}`}>{product.stock} Units</span>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">List Price</p>
                                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 italic">₹{product.price}</p>
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(product)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg"><FiEdit size={18} /></button>
                                            <button onClick={() => handleDelete(product._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg"><FiTrash2 size={18} /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
            )}

            {/* Product Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 my-8"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        {editingId ? <FiEdit className="text-blue-500" /> : <FiPlus className="text-emerald-500" />}
                                        {editingId ? 'Edit Product' : 'Add New Product'}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure product details and inventory</p>
                                </div>
                                <button onClick={closeModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors"><FiX size={20} /></button>
                            </div>

                            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Product Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                            placeholder="e.g. 7th Std Uniform"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">School (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.school}
                                            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                            placeholder="e.g. KV School"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                        >
                                            <option value="Uniform">Uniform</option>
                                            <option value="Fabric">Fabric</option>
                                            <option value="Accessories">Accessories</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Size</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.size}
                                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                            placeholder="e.g. 32, M, L"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white font-bold"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Stock</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                            placeholder="Available units"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Low Stock Alert</label>
                                        <input
                                            type="number"
                                            value={formData.lowStockAlert}
                                            onChange={(e) => setFormData({ ...formData, lowStockAlert: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Product Image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                                            {previewUrl ? (
                                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <FiTag className="text-slate-300" size={24} />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setSelectedFile(file);
                                                    setPreviewUrl(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
                                    >
                                        {editingId ? 'Update Product' : 'Create Product'}
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

export default Products;
