import { NextFunction, Request, Response, Router } from "express";
import generateRouter from "./generate";
import partnersRoute from "./referals";
import infoRoute from "./info";

const router: Router = Router();

router.use("/generate", generateRouter);

router.use("/info", infoRoute);

router.use("/partners", partnersRoute);

export default router;
