import { DataSource } from "typeorm";
import { appConfig } from "./consts";
import { join } from "path";

export const AppDataSource = new DataSource({
  type: "postgres", 
  host: appConfig.LOCALHOST,
  port: Number(appConfig.POSTGRES_PORT), 
  username: appConfig.POSTGRES_USERNAME, 
  password: appConfig.POSTGRES_PASSWORD, 
  database: appConfig.POSTGRES_DATABASE, 
entities: [
    join(__dirname, '../models/*{.ts,.js}'),
  ],
    subscribers: [],
  migrations: [],
  logging: true,
  synchronize: true,
});
