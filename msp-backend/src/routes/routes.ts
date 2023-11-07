import express from "express";
import { RoutesController } from "../controllers/routesController";

const router = express.Router();

router.get("/", RoutesController.getRoutes);

export default router;
