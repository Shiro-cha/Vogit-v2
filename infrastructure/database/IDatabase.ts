export interface IDatabase {
        select<T>(sql: string, params?: any[]): Promise<T[]>;
        insert(table: string, sql: string, params?: any[]): Promise<void>;
        createTableIfNotExists(tableName: string, columns: string): Promise<void>;

}