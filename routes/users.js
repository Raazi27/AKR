import express from 'express';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update User (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate) return res.status(404).json({ message: 'User not found' });

        const { name, email, role, password } = req.body;

        // Fetch requester to check if they are Super Admin
        const requester = await User.findById(req.user._id);
        const SUPER_ADMIN = process.env.ADMIN_EMAIL || 'farmanraazi2006@gmail.com';

        // Update fields
        if (name) userToUpdate.name = name;
        if (email) userToUpdate.email = email;
        if (password) userToUpdate.password = password; // SChema pre-save will hash

        // Role update check
        if (role && role !== userToUpdate.role) {
            if (requester.email !== SUPER_ADMIN) {
                return res.status(403).json({ message: 'Only Main Admin can allot roles.' });
            }
            userToUpdate.role = role;
        }

        await userToUpdate.save();

        // Return updated user without password
        const updatedUser = await User.findById(userToUpdate._id).select('-password');
        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete User (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const SUPER_ADMIN = process.env.ADMIN_EMAIL || 'farmanraazi2006@gmail.com';
        if (user.email === SUPER_ADMIN) {
            return res.status(403).json({ message: 'Cannot delete Super Admin' });
        }

        await User.findByIdAndDelete(req.params.id);

        // If user was a customer, delete their customer profile too
        if (user.role === 'customer') {
            await Customer.findOneAndDelete({ userId: req.params.id });
        }

        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
