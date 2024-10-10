"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const txn_1 = __importDefault(require("./txn"));
const addr_1 = __importDefault(require("./addr"));
const referals_1 = __importDefault(require("./referals"));
const router = (0, express_1.Router)();
router.use("/transaction", txn_1.default);
router.use("/address", addr_1.default);
router.use("/partners", referals_1.default);
exports.default = router;
