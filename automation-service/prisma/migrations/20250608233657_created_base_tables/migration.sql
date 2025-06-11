-- CreateTable
CREATE TABLE "insights" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "insights" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrier_info" (
    "id" TEXT NOT NULL,
    "pickupDateTime" TIMESTAMP(3) NOT NULL,
    "deliveryDateTime" TIMESTAMP(3) NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "carrierPay" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "miles" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "weight" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "commodityCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "insightId" TEXT NOT NULL,

    CONSTRAINT "carrier_info_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "carrier_info" ADD CONSTRAINT "carrier_info_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "insights"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
