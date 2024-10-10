"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const helpers_1 = require("../../helpers");
const client_1 = require("@prisma/client");
const base64url_1 = __importDefault(require("base64url"));
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const AddressRegex = /^0x[a-fA-F0-9]{40}$/;
router.post("/generate", async function (req, res) {
    const { hash, userId, chainId } = req.body;
    if (!hash) {
        return res
            .status(400)
            .json({ error: "Not enough params to generate link" });
    }
    if (typeof hash !== "string") {
        return res.status(400).json({ error: `Value is not a string: ${hash}` });
    }
    if (!hash.trim().length) {
        return res
            .status(400)
            .json({ error: `Value cannot be an empty string: ${hash}` });
    }
    if (!AddressRegex.test(hash)) {
        return res
            .status(400)
            .json({ error: `Value is not a valid address: ${hash}` });
    }
    try {
        const createUniqueId = (data) => {
            const rawString = `${data.hash}::${data.chainId}::${data.userTgId}::${data.timestamp}`;
            return base64url_1.default.encode(rawString);
        };
        const shortHash = (0, helpers_1.generateShortHash)(hash);
        const existingLink = await prisma.addrLink.findFirst({
            where: { hash },
        });
        if (existingLink) {
            const idForLink = (0, helpers_1.extractBeforeDash)(existingLink.id);
            return res.status(200).json({
                link: `https://t.me/blockscout_test_bot/bs_test_app?startapp=${idForLink}`,
            });
        }
        const newLink = await prisma.addrLink.create({
            data: {
                hash,
                chainId,
                userTgId: userId,
            },
        });
        const idForLink = (0, helpers_1.extractBeforeDash)(newLink.id);
        res.status(200).json({
            link: `https://t.me/blockscout_test_bot/bs_test_app?startapp=${idForLink}`,
        });
    }
    catch (error) {
        console.error("Error generating link:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/:shortHash", async function (req, res) {
    const { shortHash } = req.params;
    const { userId } = req.body;
    if (!userId || !shortHash) {
        return res.status(400).json({ error: "Not enough params to get info" });
    }
    try {
        const link = await prisma.addrLink.findUnique({
            where: { id: shortHash },
        });
        if (!link) {
            return res.status(404).json({ error: "Link not found" });
        }
        const saveReferral = await prisma.referralCounter.create({
            data: {
                linkType: "ADDR_LINK",
                linkId: link.id,
                chainId: link.chainId,
                referralId: userId,
            },
        });
        res.status(200).json(link);
    }
    catch (error) {
        console.error("Error retrieving link:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/info", async function (req, res) {
    const { shortHash } = req.params;
    try {
        const link = await prisma.addrLink.findUnique({
            where: { id: shortHash },
        });
        if (!link) {
            return res.status(404).json({ error: "Link not found" });
        }
        const linkToService = `https://eth.blockscout.com/api/v2/addresses/${link.hash}/tokenstype=ERC-20`;
        const responseFromService = await fetch(linkToService, { method: "POST" });
        res.json(responseFromService);
    }
    catch (error) {
        console.error("Error retrieving link:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.default = router;
