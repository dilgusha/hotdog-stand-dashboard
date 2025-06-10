import { DataSource } from "typeorm";
import { appConfig } from "./consts";

export const AppDataSource = new DataSource({
  type: "postgres", 
  host: appConfig.LOCALHOST,
  port: Number(appConfig.POSTGRES_PORT), 
  username: appConfig.POSTGRES_USERNAME, 
  password: appConfig.POSTGRES_PASSWORD, 
  database: appConfig.POSTGRES_DATABASE, 
  entities: ["src/models/**/*.ts"], 
  subscribers: [],
  migrations: [],
  logging: false,
  synchronize: true,
});
