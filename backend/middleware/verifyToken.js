const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
	try {
		const token = req.cookies.token;
		if (!token) {
			return res.status(401).json({ success: false, message: "Unauthorized - No token" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.userId;
		next();
	} catch (error) {
		res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
	}
};

module.exports = { verifyToken };