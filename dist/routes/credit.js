"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const adminAuth_1 = require("../middleware/adminAuth");
const credit_1 = require("../controller/credit");
router.post('/credit', adminAuth_1.adminAuth, credit_1.credit);
exports.default = router;
//# sourceMappingURL=credit.js.map