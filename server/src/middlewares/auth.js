import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_typeracer_jwt_key_2026_!@#$');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
}

export function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_typeracer_jwt_key_2026_!@#$');
            req.user = decoded;
        } catch (err) {
            // Ignore invalid token in optional auth
        }
    }
    next();
}
