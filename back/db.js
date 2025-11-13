import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const connectionUri =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  null;

const baseOptions = {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "production" ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const sequelize = connectionUri
  ? new Sequelize(connectionUri, {
      ...baseOptions,
      dialectOptions: {
        ssl:
          process.env.DB_SSL === "false"
            ? false
            : {
                require: true,
                rejectUnauthorized: false,
              },
      },
    })
  : new Sequelize(
      process.env.DB_NAME || "expertos",
      process.env.DB_USER || "postgres",
      process.env.DB_PASSWORD || "password",
      {
        ...baseOptions,
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
      }
    );

export default sequelize;
