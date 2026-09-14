import { verifyToken } from '../utils/auth.js';
export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
};
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.role || !roles.includes(req.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};
