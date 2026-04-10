import express from 'express';
import SaleBill from '../models/SaleBill.js';
import PurchaseBill from '../models/PurchaseBill.js';
import TailoringOrder from '../models/TailoringOrder.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get Dashboard Stats
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const isCustomer = req.user.role === 'customer';

        let stats = {
            sales: 0,
            purchases: 0,
            profit: 0,
            customers: 0,
            orders: 0,
            products: 0,
            recentActivity: [],
            upcomingDeliveries: [],
            recentItems: [],
            upcomingProducts: [],
            totalPurchaseCount: 0,
            productFrequency: []
        };

        if (isCustomer) {
            // Find customer record
            const customer = await Customer.findOne({ userId: req.user._id });
            if (customer) {
                // Total Spent (Sales to this customer)
                const saleBills = await SaleBill.find({ 
                    $or: [
                        { customerPhone: customer.phone },
                        { customerName: customer.name }
                    ]
                });
                stats.sales = saleBills.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
                stats.totalPurchaseCount = saleBills.length;

                const frequencies = {};
                saleBills.forEach(bill => {
                    bill.items.forEach(item => {
                        frequencies[item.name] = (frequencies[item.name] || 0) + item.quantity;
                    });
                });

                stats.productFrequency = Object.entries(frequencies)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                // Recent Unique Items for Feedback
                const recentItems = [];
                const seenItems = new Set();

                const recentBillsWithItems = await SaleBill.find({
                    $or: [
                        { customerPhone: customer.phone },
                        { customerName: customer.name }
                    ]
                }).sort({ billDate: -1 }).limit(20);

                recentBillsWithItems.forEach(bill => {
                    bill.items.forEach(item => {
                        if (!seenItems.has(item.name)) {
                            recentItems.push({
                                name: item.name,
                                orderId: bill.billNo,
                                mongoId: bill._id,
                                status: bill.status,
                                date: bill.billDate
                            });
                            seenItems.add(item.name);
                        }
                    });
                });
                stats.recentItems = recentItems.slice(0, 10);

                // My Active Orders (SaleBills Unpaid/Partial + Recent Paid + Tailoring)
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const pendingSales = await SaleBill.countDocuments({ 
                    $and: [
                        { $or: [{ customerPhone: customer.phone }, { customerName: customer.name }] },
                        { $or: [
                            { status: { $in: ['Unpaid', 'Partial'] } },
                            { status: 'Paid', billDate: { $gte: sevenDaysAgo } }
                        ]}
                    ]
                });
                const pendingTailoring = await TailoringOrder.countDocuments({ customerId: customer._id, status: { $ne: 'Delivered' } });
                stats.orders = pendingSales + pendingTailoring;

                // Recent Activity
                const recentSales = await SaleBill.find({ 
                    $or: [{ customerPhone: customer.phone }, { customerName: customer.name }] 
                }).sort({ billDate: -1 }).limit(3);

                const recentTailoring = await TailoringOrder.find({ customerId: customer._id })
                    .sort({ createdAt: -1 }).limit(3);

                stats.recentActivity = [
                    ...recentSales.map(s => ({ message: `Sale Bill #${s.billNo} Status: ${s.status}`, time: s.billDate })),
                    ...recentTailoring.map(o => ({ message: `Tailoring Order Status: ${o.status}`, time: o.createdAt }))
                ].sort((a, b) => b.time - a.time).slice(0, 5);

                // Upcoming Deliveries
                stats.upcomingDeliveries = await TailoringOrder.find({
                    customerId: customer._id,
                    status: { $ne: 'Delivered' },
                    deliveryDate: { $gte: new Date() }
                }).sort({ deliveryDate: 1 }).limit(3);

                stats.upcomingProducts = await Product.find({ isUpcoming: true }).sort({ releaseDate: 1 }).limit(5);
            }
        } else {
            // Admin/Staff Stats
            const saleBills = await SaleBill.find({});
            const purchaseBills = await PurchaseBill.find({});

            const totalSales = saleBills.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
            const totalPurchases = purchaseBills.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);

            stats.sales = totalSales;
            stats.purchases = totalPurchases;
            stats.profit = totalSales - totalPurchases;
            stats.customers = await Customer.countDocuments();
            stats.orders = await SaleBill.countDocuments({ status: { $in: ['Unpaid', 'Partial'] } });
            stats.products = await Product.countDocuments();

            // Recent Activity
            const recentSales = await SaleBill.find({}).sort({ billDate: -1 }).limit(3);
            const recentPurchases = await PurchaseBill.find({}).sort({ billDate: -1 }).limit(3);
            const recentOrders = await TailoringOrder.find({}).sort({ createdAt: -1 }).limit(3).populate('customerId');

            stats.recentActivity = [
                ...recentSales.map(s => ({ message: `New Sale #${s.billNo} for ${s.customerName}`, time: s.billDate })),
                ...recentPurchases.map(p => ({ message: `New Purchase #${p.billNo} from ${p.supplierName}`, time: p.billDate })),
                ...recentOrders.map(o => ({ message: `New Tailoring Order for ${o.customerId?.name || 'Customer'}`, time: o.createdAt }))
            ].sort((a, b) => b.time - a.time).slice(0, 5);

            stats.upcomingDeliveries = await TailoringOrder.find({
                status: { $ne: 'Delivered' },
                deliveryDate: { $gte: new Date() }
            }).sort({ deliveryDate: 1 }).limit(5).populate('customerId');

            stats.upcomingProducts = await Product.find({ isUpcoming: true }).sort({ releaseDate: 1 }).limit(10);
        }

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Get Reports Data
router.get('/reports', verifyToken, isAdmin, async (req, res) => {
    try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();

        const saleBills = await SaleBill.find({
            billDate: { $gte: new Date(new Date().getFullYear(), 0, 1) }
        });

        const monthlyRevenue = Array(12).fill(0);
        saleBills.forEach(bill => {
            const m = new Date(bill.billDate).getMonth();
            monthlyRevenue[m] += (bill.grandTotal || 0);
        });

        const labels = [];
        const data = [];
        for (let i = 5; i >= 0; i--) {
            const m = (currentMonth - i + 12) % 12;
            labels.push(months[m]);
            data.push(monthlyRevenue[m]);
        }

        // Sales by Category (Aggregating from Tailoring for consistency or SaleBill items)
        const allTailoring = await TailoringOrder.find({});
        const categories = {};
        allTailoring.forEach(o => {
            o.items.forEach(item => {
                categories[item] = (categories[item] || 0) + 1;
            });
        });

        // Recent Transactions (Sale Bills)
        const recentTransactions = await SaleBill.find({})
            .sort({ billDate: -1 })
            .limit(10);

        res.json({
            revenueAnalytics: { labels, data },
            categoryData: { labels: Object.keys(categories), data: Object.values(categories) },
            recentTransactions
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Reset All Reports Data
router.delete('/reset', verifyToken, isAdmin, async (req, res) => {
    try {
        await SaleBill.deleteMany({});
        await PurchaseBill.deleteMany({});
        await TailoringOrder.deleteMany({});
        res.json({ message: 'All reports data has been reset successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Export Monthly Reports (CSV)
router.get('/export', verifyToken, isAdmin, async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).send('Month and year are required.');

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const bills = await SaleBill.find({
            billDate: { $gte: startDate, $lte: endDate }
        });

        const header = ['Bill No', 'Date', 'Customer', 'Items', 'Subtotal', 'GST', 'Grand Total', 'Payment', 'Status'];
        const csvRows = [header.join(',')];

        bills.forEach(b => {
            const items = b.items.map(i => `${i.name}(${i.quantity})`).join('; ');
            const row = [
                b.billNo,
                new Date(b.billDate).toLocaleDateString(),
                b.customerName,
                `"${items}"`,
                b.subtotal,
                b.gstAmount,
                b.grandTotal,
                b.paymentMethod,
                b.status
            ];
            csvRows.push(row.join(','));
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=SalesReport_${year}_${month}.csv`);
        res.status(200).send(csvRows.join('\n'));
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

export default router;
