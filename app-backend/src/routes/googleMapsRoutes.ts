import express from "express";
import { GoogleMapsController } from "../controllers/googleMapsController";
import Joi from "joi";
import { validateBody, validateParams, validateQuery } from "../utils/validate";

const router = express.Router();

router.get(
  "/places/search/:input",
  validateParams(
    Joi.object({
      input: Joi.string().min(2).required(),
    })
  ),
  validateQuery(
    Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    })
  ),
  GoogleMapsController.fetchPlacesFromSearch
);

router.get(
  "/places/coord/:placeId",
  validateParams(
    Joi.object({
      placeId: Joi.string().required(),
    })
  ),
  GoogleMapsController.getCoordinatesFromPlaceId
);

router.post(
  "/places/distance",
  validateBody<{}>(
    Joi.object({
      currentLocation: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
      }).required(),
      targetLocation: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
      }).required(),
    })
  ),
  GoogleMapsController.calculateWalkingDistanceBwtweenTwoPoints
);

export default router;
