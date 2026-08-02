import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config/env.js";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
