const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '');

		if (!token) {
			return res.status(401).json({ error: 'No token, authorization denied' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
		req.userId = decoded.userId;
		req.userRole = decoded.role;
		next();
	} catch (err) {
		res.status(401).json({ error: 'Token is not valid' });
	}
};

const adminOnly = (req, res, next) => {
	if (req.userRole !== 'admin') {
		return res.status(403).json({ error: 'Admin access required' });
	}
	next();
};

module.exports = { auth, adminOnly };
