-- CreateTable
CREATE TABLE "public"."ItemView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemView_userId_itemId_key" ON "public"."ItemView"("userId" ASC, "itemId" ASC);

-- AddForeignKey
ALTER TABLE "public"."ItemView" ADD CONSTRAINT "ItemView_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemView" ADD CONSTRAINT "ItemView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
