"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// GET ALL REFERRALS
router.get("/", async (req, res) => {
    const { start, end } = req.query;
    try {
        const partners = await prisma.referralCounter.findMany({
            where: {
                createdAt: {
                    gte: new Date(start),
                    lte: new Date(end),
                },
            },
            select: {
                referralId: true,
            },
            distinct: ["referralId"],
        });
        res.json(partners);
    }
    catch (error) {
        console.error("Error fetching partners:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// GET ALL THE INFORMATION ABOUT REFERRALS THAT WERE PROVIDED
// BY PARTICULAR PERSON
router.get("/:partner_id/referrals", async (req, res) => {
    const { partner_id } = req.params;
    const { start, end } = req.query;
    try {
        const referrals = await prisma.referralCounter.findMany({
            where: {
                referralId: partner_id,
                createdAt: {
                    gte: new Date(start),
                    lte: new Date(end),
                },
            },
        });
        res.json(referrals);
    }
    catch (error) {
        console.error("Error fetching referrals:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/:partner_id/referrals/count", async (req, res) => {
    const { partner_id } = req.params;
    const { start, end } = req.query;
    try {
        const referralCount = await prisma.referralCounter.count({
            where: {
                referralId: partner_id,
                createdAt: {
                    gte: new Date(start),
                    lte: new Date(end),
                },
            },
        });
        res.json({ count: referralCount });
    }
    catch (error) {
        console.error("Error fetching referral count:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/top-referrals", async (req, res) => {
    try {
        const topReferrals = await prisma.referralCounter.groupBy({
            by: ["referralId"],
            _count: {
                referralId: true,
            },
            orderBy: {
                _count: {
                    referralId: "desc",
                },
            },
            take: 3,
        });
        res.json(topReferrals.map((referral) => ({
            referralId: referral.referralId,
            count: referral._count.referralId,
        })));
    }
    catch (error) {
        console.error("Error fetching top referrals:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.default = router;
