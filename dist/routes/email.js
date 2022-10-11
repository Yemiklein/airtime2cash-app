"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emailController_1 = require("../controller/emailController");
const router = express_1.default.Router();
// ADD A NEW Trip
router.post('/', emailController_1.sendMail);
exports.default = router;
//# sourceMappingURL=email.js.map