-- CreateTable
CREATE TABLE "Link" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "shortHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Link_hash_key" ON "Link"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Link_shortHash_key" ON "Link"("shortHash");
