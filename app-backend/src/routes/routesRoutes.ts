import express from "express";
import { RoutesController } from "../controllers/routesController";
import Joi from "joi";
import { validateBody, validateParams } from "../utils/validate";
import { Location } from "../types";

const router = express.Router();

router.post(
  "/",
  validateBody<{
    departure: Location;
    arrival: Location;
    departureTime: number;
  }>(
    Joi.object({
      departure: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
      }).required(),
      arrival: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
      }).required(),
      departureTime: Joi.number().integer().min(1).required(),
    })
  ),
  RoutesController.getRoutesByDepartureAndArrival
);

router.get(
  "/:address/:msp/:id",
  validateParams<{
    address: string;
    msp: string;
    id: number;
  }>(
    Joi.object({
      address: Joi.string().min(1).required(),
      msp: Joi.string().min(1).required(),
      id: Joi.number().integer().required(),
    })
  ),
  RoutesController.signRoute
);

export default router;
