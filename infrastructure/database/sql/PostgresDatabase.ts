import { Pool } from "pg";
import { IDatabase } from "../IDatabase";
import process from "process";

export class PostgresDatabase implements IDatabase {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process?.env.DATABASE_URL,
    });
  }

  async query<T>(sql: string, params?: any[]): Promise<T> {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }
}