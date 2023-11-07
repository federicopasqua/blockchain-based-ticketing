import express from "express";
import "dotenv/config";

import GoogleRoutes from "./routes/googleMapsRoutes";
import VehicleRoutes from "./routes/vehicleRoutes";
import RoutesRoutes from "./routes/routesRoutes";

import { Msp } from "./database/mspRespository";
import { Vehicles } from "./database/vehicleRepository";
import { Routes } from "./database/routesRepository";
import { updateDatabase } from "./blockchain/blockchainUpdate";

//@ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const PORT = 3000;

const app = express();

app.use(express.json());

Msp.setup();
Vehicles.setup();
Routes.setup();

app.use("/api/routes", RoutesRoutes);
app.use("/api/vehicles", VehicleRoutes);
app.use("/api/maps", GoogleRoutes);

setInterval(updateDatabase, 10000);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}/`)
);
