const jwt = require("jsonwebtoken");
require("dotenv").config();
const { userModel } = require("../features/model/user.model");

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ ok: false, msg: "Please login first" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ ok: false, msg: "User not found" });
        }

        // Single session check: Is this token the most recent one?
        if (user.activeToken && user.activeToken !== token) {
            return res.status(401).json({
                ok: false,
                msg: "A newer session has started elsewhere. Please login again.",
                code: "SESSION_INVALIDATED"
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ ok: false, msg: "Session expired, please login again" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ ok: false, msg: "Access denied. Admin only." });
    }
};

module.exports = { authenticate, isAdmin };
