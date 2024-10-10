import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router: Router = Router();

const HashRegex = /^0x[a-fA-F0-9]{64}$/;

router.post("/", async function (req: Request, res: Response) {
  const { userId, id } = req.body;
  if (!userId || !id) {
    return res.status(400).json({ error: "Not enough params to get info" });
  }

  try {
    const addrLink = await prisma.addrLink.findFirst({
      where: { shortHash: id },
    });

    const txnLink = await prisma.txLink.findFirst({
      where: { shortHash: id },
    });

    if (!addrLink && !txnLink) {
      return res.status(400).json({ error: "No link found" });
    }

    if (addrLink) {
      const existingReferral = await prisma.referralAddrCounter.findFirst({
        where: {
          linkId: addrLink.id,
          chainId: addrLink.chainId,
          referralId: userId,
        },
      });

      if (!existingReferral) {
        await prisma.referralAddrCounter.create({
          data: {
            linkId: addrLink.id,
            chainId: addrLink.chainId,
            referralId: userId,
          },
        });
      }

      res.status(200).json(addrLink);
    } else if (txnLink) {
      const existingReferral = await prisma.referralTxCounter.findFirst({
        where: {
          linkId: txnLink.id,
          chainId: txnLink.chainId,
          referralId: userId,
        },
      });

      if (!existingReferral) {
        await prisma.referralTxCounter.create({
          data: {
            linkId: txnLink.id,
            chainId: txnLink.chainId,
            referralId: userId,
          },
        });
      }

      res.status(200).json(txnLink);
    } else {
      res.status(404).json({ error: "Link not found" });
    }
  } catch (error) {
    console.error("Error retrieving link:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/info", async function (req: Request, res: Response) {
  const { id } = req.params;

  try {
    const link = await prisma.addrLink.findUnique({
      where: { id: id },
    });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }
    const linkToService = `https://eth.blockscout.com/api/v2/addresses/${link.hash}/tokenstype=ERC-20`;
    const responseFromService = await fetch(linkToService, { method: "POST" });

    res.json(responseFromService);
  } catch (error) {
    console.error("Error retrieving link:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/saveId", async function (req: Request, res: Response) {
  const { id } = req.body;

  if (!id) {
    return res.status(404).json({ error: "No id provided for request" });
  }

  try {
    const userId = await prisma.userIds.findFirst({
      where: { telegramUserId: id },
    });

    if (userId) {
      return res.status(404).json({ error: "userId already exists" });
    } else {
      const userId = await prisma.userIds.create({
        data: {
          telegramUserId: id,
        },
      });

      res.status(200).json(userId);
    }
  } catch (error) {
    console.error("Error retrieving link:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getId", async function (req: Request, res: Response) {
  try {
    const userIds = await prisma.userIds.findMany({});
    res.status(200).json(userIds);
  } catch (error) {
    console.error("Error retrieving link:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
