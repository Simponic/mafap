/*
  Warnings:

  - You are about to drop the `_FriendToTimer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `created_by_id` to the `Timer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_FriendToTimer" DROP CONSTRAINT "_FriendToTimer_A_fkey";

-- DropForeignKey
ALTER TABLE "_FriendToTimer" DROP CONSTRAINT "_FriendToTimer_B_fkey";

-- AlterTable
ALTER TABLE "Timer" ADD COLUMN     "created_by_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_FriendToTimer";

-- CreateTable
CREATE TABLE "_referenced_friend_fk" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_referenced_friend_fk_AB_unique" ON "_referenced_friend_fk"("A", "B");

-- CreateIndex
CREATE INDEX "_referenced_friend_fk_B_index" ON "_referenced_friend_fk"("B");

-- AddForeignKey
ALTER TABLE "Timer" ADD CONSTRAINT "Timer_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "Friend"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_referenced_friend_fk" ADD CONSTRAINT "_referenced_friend_fk_A_fkey" FOREIGN KEY ("A") REFERENCES "Friend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_referenced_friend_fk" ADD CONSTRAINT "_referenced_friend_fk_B_fkey" FOREIGN KEY ("B") REFERENCES "Timer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
