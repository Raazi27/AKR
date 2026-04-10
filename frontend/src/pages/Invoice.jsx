import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiPrinter, FiArrowLeft } from 'react-icons/fi';

const Invoice = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                // If the ID looks like SALXXXX, we might need a search instead of findById
                // But typically we'll use the _id for internal linking.
                const res = await axios.get(`/api/sale-bills/${id}`, { headers });
                setBill(res.data);
            } catch (err) {
                console.error('Error fetching bill:', err);
                setError('Failed to load invoice. It may have been deleted.');
            } finally {
                setLoading(false);
            }
        };
        fetchBill();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="text-red-500 text-5xl mb-4">!</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button onClick={() => window.close()} className="px-6 py-2 bg-slate-800 text-white rounded-xl">Close Window</button>
        </div>
    );

    if (!bill) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0 transition-colors">
            {/* Action Bar (Hidden on Print) */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <button 
                    onClick={() => window.close()} 
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <FiArrowLeft /> Back to Dashboard
                </button>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 hover:bg-emerald-700 transition-all"
                >
                    <FiPrinter /> Print Invoice
                </button>
            </div>

            {/* Invoice Main Container */}
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 print:shadow-none print:border-none print:rounded-none print:p-0 print:dark:bg-white transition-colors">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight print:text-black">AL-KABAH <span className="text-emerald-500 print:text-emerald-600">UNIFORM</span></h1>
                        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium print:text-slate-600">
                            <p>18/A P.J Nehru Road , vaniyambadi</p>
                            <p>Tamil Nadu 635751 | +91 9940923869</p>
                            <p>[tabrezniyazif03@gmail.com]</p>
                        </div>
                    </div>
                </div>

                {/* Invoice Title & Meta */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
                    <div>
                        <h2 className="text-5xl font-light text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em] mb-4 print:text-slate-400">INVOICE</h2>
                        <p className="text-xl font-bold text-slate-800 dark:text-white print:text-black">{bill.billNo}</p>
                    </div>
                    <div className="text-right sm:text-right w-full sm:w-auto">
                        <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${
                            bill.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                            bill.status === 'Partial' ? 'bg-amber-100 text-amber-700' : 
                            'bg-red-100 text-red-700'
                        } print:border print:border-slate-200`}>
                            {bill.status}
                        </span>
                        <p className="text-slate-500 dark:text-slate-400 text-sm print:text-slate-600">Date: {new Date(bill.billDate).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 my-8 print:border-slate-200"></div>

                {/* Bill To */}
                <div className="mb-12">
                    <div className="w-full sm:w-1/2 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 print:bg-white print:border-slate-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">BILL TO</p>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white print:text-black">{bill.customerName}</h3>
                        {bill.customerPhone && <p className="text-slate-500 dark:text-slate-400 mt-1 print:text-slate-600">{bill.customerPhone}</p>}
                    </div>
                </div>

                {/* Table */}
                <div className="mb-12">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-800 dark:border-slate-600 print:border-black">
                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white print:text-black">Description</th>
                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white text-right print:text-black">Price</th>
                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white text-center print:text-black">Qty</th>
                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white text-right print:text-black">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 print:divide-slate-200">
                            {bill.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-6 text-sm font-medium text-slate-800 dark:text-white print:text-black">{item.name}</td>
                                    <td className="py-6 text-sm text-slate-600 dark:text-slate-400 text-right print:text-black">₹{item.unitPrice.toFixed(2)}</td>
                                    <td className="py-6 text-sm text-slate-600 dark:text-slate-400 text-center print:text-black">{item.quantity}</td>
                                    <td className="py-6 text-sm font-bold text-slate-800 dark:text-white text-right print:text-black">₹{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Totals */}
                <div className="flex flex-col items-end gap-3 pt-8 border-t border-slate-100 dark:border-slate-700 print:border-slate-200 print:pt-4">
                    <div className="flex justify-between w-full max-w-[240px] text-sm">
                        <span className="font-black uppercase tracking-widest text-slate-400">SUBTOTAL</span>
                        <span className="font-bold text-slate-800 dark:text-white print:text-black">₹{bill.subtotal.toFixed(2)}</span>
                    </div>
                    {bill.gstAmount > 0 && (
                        <div className="flex justify-between w-full max-w-[240px] text-sm">
                            <span className="font-black uppercase tracking-widest text-slate-400">GST ({bill.gstRate}%)</span>
                            <span className="font-bold text-slate-800 dark:text-white print:text-black">₹{bill.gstAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between w-full max-w-[240px] pt-4 border-t border-slate-100 dark:border-slate-700 print:border-black">
                        <span className="font-black uppercase tracking-widest text-slate-800 dark:text-white print:text-black">TOTAL</span>
                        <span className="text-2xl font-black text-emerald-600 print:text-black">₹{bill.grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Notes */}
                {bill.notes && (
                    <div className="mt-12 p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 print:bg-white print:border-slate-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Notes</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic print:text-slate-600 print:not-italic">{bill.notes}</p>
                    </div>
                )}

                {/* Signature/Stamp Area (Optional) */}
                <div className="mt-20 flex justify-between items-end print:mt-12">
                    <div className="text-center">
                        <div className="w-32 border-b border-slate-200 dark:border-slate-700 print:border-black mb-2"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Signature</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">For Al-Kabah Uniform</p>
                        <div className="h-16"></div>
                        <div className="w-32 border-b border-slate-200 dark:border-slate-700 print:border-black mb-2"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Signatory</p>
                    </div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { margin: 10mm; }
                    body { background: white; }
                    .print-hidden { display: none !important; }
                }
            ` }} />
        </div>
    );
};

export default Invoice;
