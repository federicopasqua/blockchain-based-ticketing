import express from "express";
import { vehicleController } from "../controllers/vehiclesController";
import Joi from "joi";
import { validateBody, validateParams } from "../utils/validate";
import { Location } from "../types";

const router = express.Router();

router.post(
  "/",
  validateBody<{ currentPosition: Location; radius: number }>(
    Joi.object({
      currentPosition: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
      }).required(),
      radius: Joi.number().integer().min(1).required(),
    })
  ),
  vehicleController.getVehicles
);

router.get(
  "/owned/:address",
  validateParams<{ address: string }>(
    Joi.object({
      address: Joi.string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .required(),
    })
  ),
  vehicleController.getOwnedVehicle
);

export default router;
