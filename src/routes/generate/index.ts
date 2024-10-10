import { NextFunction, Request, Response, Router } from "express";
import { extractBeforeDash, generateShortHash } from "../../helpers";
import { PrismaClient } from "@prisma/client";
import base64url from "base64url";

const prisma = new PrismaClient();
const router: Router = Router();
const AddressRegex = /^0x[a-fA-F0-9]{40}$/;
const HashRegex = /^0x[a-fA-F0-9]{64}$/;

router.post("/", async function (req: Request, res: Response) {
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
  if (!AddressRegex.test(hash) && !HashRegex.test(hash)) {
    return res
      .status(400)
      .json({ error: `Value is not a valid address or txn: ${hash}` });
  }

  try {
    if (AddressRegex.test(hash)) {
      const createUniqueId = (data: any): string => {
        const rawString = `${data.hash}::${data.chainId}::${data.userTgId}::${data.timestamp}`;
        return base64url.encode(rawString);
      };

      const existingLink = await prisma.addrLink.findFirst({
        where: { hash },
      });

      if (existingLink) {
        const idForLink = extractBeforeDash(existingLink.id);
        return res.status(200).json({
          id: `${idForLink}`,
        });
      }

      const newLink = await prisma.addrLink.create({
        data: {
          hash,
          chainId,
          userTgId: userId,
        },
      });
      const idForLink = extractBeforeDash(newLink.id);

      const updatedLink = await prisma.addrLink.update({
        where: {
          id: newLink.id,
        },
        data: {
          shortHash: idForLink,
        },
      });
      res.status(200).json({
        id: `${idForLink}`,
      });
    } else {
      const existingLink = await prisma.txLink.findFirst({
        where: { hash },
      });

      if (existingLink) {
        const idForLink = extractBeforeDash(existingLink.id);
        return res.json({
          id: `${idForLink}`,
        });
      }

      const newLink = await prisma.txLink.create({
        data: {
          hash,
          chainId,
          userTgId: userId,
        },
      });
      const linkForResponse = extractBeforeDash(newLink.id);
      const updatedLink = await prisma.txLink.update({
        where: {
          id: newLink.id,
        },
        data: {
          shortHash: linkForResponse,
        },
      });
      res.status(200).json({
        id: `${linkForResponse}`,
      });
    }
  } catch (error) {
    console.error("Error generating link:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
