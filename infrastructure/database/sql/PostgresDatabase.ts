import { Pool } from "pg";
import { IDatabase } from "../IDatabase";
import process from "process";

export class PostgresDatabase implements IDatabase {
  private pool: Pool;
  databasename: string = "vogit_db";

  constructor() {
    this.pool = new Pool({
      connectionString: process?.env.DATABASE_URL,
    });
  }

  async select<T>(sql: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(`SELECT ${sql}`, params);
    return result.rows as T[];
  }
  async insert(table: string, sql: string, params?: any[]): Promise<void> {
    await this.pool.query(`INSERT INTO ${table} ${sql}`, params);
  }
  async createTableIfNotExists(tableName: string, columns: string): Promise<void> {
    const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
    await this.pool.query(query);
  }
}
