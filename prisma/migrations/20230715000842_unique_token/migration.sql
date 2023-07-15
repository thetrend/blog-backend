/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `ResetTokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ResetTokens_token_key` ON `ResetTokens`(`token`);
