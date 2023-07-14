/*
  Warnings:

  - Made the column `title` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Post` MODIFY `title` VARCHAR(255) NOT NULL DEFAULT 'untitled';
