const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({ path: "D:/GitHub/TeachHubl/.env" });
const authSessionModel = require("../models/authSessionModel");

const auth_secret = process.env.AUTH_SECRET;

async function auth(req, res, next) {

    if (req.originalUrl == '/payment/callback') {
        return next();
    }

    if (!req.headers.authorization) {
        return res.status(401).json({ Error: "User not found...signup required" });
    }

    const auth_token = req.headers.authorization.split(' ')[1];

    const decoded = await new Promise((resolve, reject) => {
        jwt.verify(auth_token, auth_secret, (err, decoded) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            else resolve(decoded);
        });
    });

    const { sessionId } = decoded;
    const session = await authSessionModel.findOne({ sessionId });

    if (!session) {
        return res.status(403).json({ Error: "Session expired...signin required" });
    }
    next();
}

module.exports = auth;