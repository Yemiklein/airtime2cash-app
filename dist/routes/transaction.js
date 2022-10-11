"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = require("../middleware/auth");
const sellAirtime_1 = require("../controller/sellAirtime");
const adminAuth_1 = require("../middleware/adminAuth");
router.post('/sellairtime', auth_1.auth, sellAirtime_1.postSellAirtime);
router.get('/alltransactions', adminAuth_1.adminAuth, sellAirtime_1.allTransactions);
router.get('/pendingTransactions', adminAuth_1.adminAuth, sellAirtime_1.pendingTransactions);
exports.default = router;
//# sourceMappingURL=transaction.js.map