const Router = require("express").Router();
const {
    createOrder,
    verifySignature
} = require("../controllers/payementController");

Router.post('/', createOrder);
Router.post('/callback',verifySignature);

module.exports = Router;