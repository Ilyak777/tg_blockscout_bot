import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Referral API",
      version: "1.0.0",
      description:
        "API documentation for generating links and managing referrals",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/./*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerDocs, swaggerUi };
