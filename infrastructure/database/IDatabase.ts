export interface IDatabase {
        select<T>(sql: string, params?: any[]): Promise<T[]>;
        
}