import express, { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import apiRoutes from "./src/routes";
import { swaggerDocs, swaggerUi } from "./swagger";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${3001}/api-docs`);
});
