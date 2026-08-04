import dotenv from "dotenv";

dotenv.config();
export const config = {
  databaseUrl: process.env.DATABASE_URL,
  costThreshold: Number(process.env.COST_THRESHOLD || 1000),
  rowsExaminedThreshold: Number(process.env.ROWS_EXAMINED_THRESHOLD ?? 1000),
  rowsReturnedThreshold: Number(process.env.ROWS_RETURNED_THRESHOLD ?? 10),
};
