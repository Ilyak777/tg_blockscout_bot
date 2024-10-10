"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const helpers_1 = require("../../helpers");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const HashRegex = /^0x[a-fA-F0-9]{64}$/;
router.post("/generate", async function (req, res) {
    const { hash, userId, chainId } = req.body;
    if (!hash || !userId || !chainId) {
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
    if (!HashRegex.test(hash)) {
        return res
            .status(400)
            .json({ error: `Value is not a valid address: ${hash}` });
    }
    try {
        const shortHash = (0, helpers_1.generateShortHash)(hash);
        const existingLink = await prisma.txLink.findFirst({
            where: { hash },
        });
        if (existingLink) {
            const idForLink = (0, helpers_1.extractBeforeDash)(existingLink.id);
            return res.json({
                link: `https://t.me/blockscout_test_bot/bs_test_app?startapp=${idForLink}`,
            });
        }
        const newLink = await prisma.txLink.create({
            data: {
                hash,
                chainId,
                userTgId: userId,
            },
        });
        const linkForResponse = (0, helpers_1.extractBeforeDash)(newLink.id);
        res.status(200).json({
            link: `https://t.me/blockscout_test_bot/bs_test_app?startapp=${newLink.id}`,
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
        const link = await prisma.txLink.findUnique({
            where: { id: shortHash },
        });
        if (!link) {
            return res.status(404).json({ error: "Link not found" });
        }
        const saveReferral = await prisma.referralCounter.create({
            data: {
                linkType: "TX_LINK",
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
exports.default = router;
