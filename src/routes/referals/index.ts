import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router: Router = Router();

// GET ALL REFERRALS
router.get("/", async (req: Request, res: Response) => {
  const { start, end } = req.query;
  if (!start || !end) {
    res.status(400).json({ error: "No time period provided" });
  }
  try {
    const txPartners = await prisma.txLink.findMany({
      where: {
        createdAt: {
          gte: new Date(start as string),
          lte: new Date(end as string),
        },
      },
    });

    const addrPartners = await prisma.addrLink.findMany({
      where: {
        createdAt: {
          gte: new Date(start as string),
          lte: new Date(end as string),
        },
      },
    });

    const allPartners = [
      ...new Set([...txPartners, ...addrPartners].map((p) => p.userTgId)),
    ];

    res.json(allPartners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET ALL THE INFORMATION ABOUT REFERRALS THAT WERE PROVIDED
// BY PARTICULAR PERSON
router.get("/:partner_id/referrals", async (req: Request, res: Response) => {
  const { partner_id } = req.params;
  const { start, end } = req.query;

  if (!partner_id || !start || !end) {
    res.status(400).json({ error: "No time period provided" });
  }

  try {
    const txLinks = await prisma.txLink.findMany({
      where: {
        userTgId: partner_id,
      },
    });

    const addrLinks = await prisma.addrLink.findMany({
      where: {
        userTgId: partner_id,
      },
    });

    const txLinkIds = txLinks.map((link) => link.id);
    const addrLinkIds = addrLinks.map((link) => link.id);

    const txReferrals = await prisma.referralTxCounter.findMany({
      where: {
        linkId: {
          in: txLinkIds,
        },
        createdAt: {
          gte: new Date(start as string),
          lte: new Date(end as string),
        },
      },
      select: {
        referralId: true,
      },
    });

    const addrReferrals = await prisma.referralAddrCounter.findMany({
      where: {
        linkId: {
          in: addrLinkIds,
        },
        createdAt: {
          gte: new Date(start as string),
          lte: new Date(end as string),
        },
      },
      select: {
        referralId: true,
      },
    });
    const allReferralIds = [
      ...txReferrals.map((ref) => ref.referralId),
      ...addrReferrals.map((ref) => ref.referralId),
    ];

    const uniqueReferralIds = Array.from(new Set(allReferralIds));

    res.json(uniqueReferralIds);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET COUNT OF REFERRALS PROVIDED BY PARTICULAR PERSON
router.get(
  "/:partner_id/referrals/count",
  async (req: Request, res: Response) => {
    const { partner_id } = req.params;
    const { start, end } = req.query;

    try {
      const txReferralCount = await prisma.referralTxCounter.count({
        where: {
          referralId: partner_id,
        },
      });

      const addrReferralCount = await prisma.referralAddrCounter.count({
        where: {
          referralId: partner_id,
        },
      });

      const totalReferralCount = txReferralCount + addrReferralCount;

      res.json({ count: totalReferralCount });
    } catch (error) {
      console.error("Error fetching referral count:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// GET TOP 3 REFERRALS
router.get("/top-referrals", async (req: Request, res: Response) => {
  try {
    const txTopReferrals = await prisma.referralTxCounter.groupBy({
      by: ["referralId"],
      _count: {
        referralId: true,
      },
      orderBy: {
        _count: {
          referralId: "desc",
        },
      },
    });

    const addrTopReferrals = await prisma.referralAddrCounter.groupBy({
      by: ["referralId"],
      _count: {
        referralId: true,
      },
      orderBy: {
        _count: {
          referralId: "desc",
        },
      },
    });

    const referralMap: { [key: string]: number } = {};

    txTopReferrals.forEach((referral) => {
      referralMap[referral.referralId] =
        (referralMap[referral.referralId] || 0) + referral._count.referralId;
    });

    addrTopReferrals.forEach((referral) => {
      referralMap[referral.referralId] =
        (referralMap[referral.referralId] || 0) + referral._count.referralId;
    });

    const sortedReferrals = Object.entries(referralMap)
      .map(([referralId, count]) => ({ referralId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    res.json(sortedReferrals);
  } catch (error) {
    console.error("Error fetching top referrals:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
