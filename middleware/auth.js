import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};

export const isAdmin = (req, res, next) => {
    console.log(`[AUTH] isAdmin check for user: ${req.user._id}, role: ${req.user.role}`);
    if (req.user.role !== 'admin') return res.status(403).send('Access Denied: Admin Only');
    next();
};

export const isBilling = (req, res, next) => {
    console.log(`[AUTH] isBilling check for user: ${req.user._id}, role: ${req.user.role}`);
    if (req.user.role !== 'billing' && req.user.role !== 'admin') return res.status(403).send('Access Denied: Billing/Admin Only');
    next();
};

export const isTailor = (req, res, next) => {
    if (req.user.role !== 'tailor' && req.user.role !== 'admin') return res.status(403).send('Access Denied: Tailor/Admin Only');
    next();
};
