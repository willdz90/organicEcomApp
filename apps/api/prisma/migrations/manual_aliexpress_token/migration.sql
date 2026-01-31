-- CreateTable
CREATE TABLE "AliexpressToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AliexpressToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AliexpressToken_userId_key" ON "AliexpressToken"("userId");

-- CreateIndex
CREATE INDEX "AliexpressToken_userId_idx" ON "AliexpressToken"("userId");

-- CreateIndex
CREATE INDEX "AliexpressToken_expiresAt_idx" ON "AliexpressToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "AliexpressToken" ADD CONSTRAINT "AliexpressToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
