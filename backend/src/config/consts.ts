import 'dotenv/config';

export const appConfig = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  POSTGRES_PORT: process.env.POSTGRES_PORT, 
  LOCALHOST: process.env.LOCALHOST,
  POSTGRES_USERNAME: process.env.POSTGRES_USERNAME, 
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD, 
  POSTGRES_DATABASE: process.env.POSTGRES_DATABASE, 
  DATABASE_URL: process.env.DATABASE_URL,
};