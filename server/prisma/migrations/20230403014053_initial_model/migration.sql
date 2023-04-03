CREATE EXTENSION citext;

-- CreateTable
CREATE TABLE "GodToken" (
    "token" VARCHAR(512) NOT NULL,
    "friend_id" INTEGER,
    "signed" BOOLEAN NOT NULL DEFAULT false,
    "expiration" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Friend" (
    "id" SERIAL NOT NULL,
    "name" CITEXT NOT NULL,
    "public_key" TEXT NOT NULL,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timer" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Timer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimerRefreshes" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "refreshed_by_id" INTEGER NOT NULL,
    "timer_id" INTEGER NOT NULL,

    CONSTRAINT "TimerRefreshes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FriendToTimer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GodToken_token_key" ON "GodToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_name_key" ON "Friend"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Timer_name_key" ON "Timer"("name");

-- CreateIndex
CREATE INDEX "TimerRefreshes_end_idx" ON "TimerRefreshes"("end");

-- CreateIndex
CREATE UNIQUE INDEX "_FriendToTimer_AB_unique" ON "_FriendToTimer"("A", "B");

-- CreateIndex
CREATE INDEX "_FriendToTimer_B_index" ON "_FriendToTimer"("B");

-- AddForeignKey
ALTER TABLE "GodToken" ADD CONSTRAINT "GodToken_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "Friend"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimerRefreshes" ADD CONSTRAINT "TimerRefreshes_refreshed_by_id_fkey" FOREIGN KEY ("refreshed_by_id") REFERENCES "Friend"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimerRefreshes" ADD CONSTRAINT "TimerRefreshes_timer_id_fkey" FOREIGN KEY ("timer_id") REFERENCES "Timer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FriendToTimer" ADD CONSTRAINT "_FriendToTimer_A_fkey" FOREIGN KEY ("A") REFERENCES "Friend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FriendToTimer" ADD CONSTRAINT "_FriendToTimer_B_fkey" FOREIGN KEY ("B") REFERENCES "Timer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
