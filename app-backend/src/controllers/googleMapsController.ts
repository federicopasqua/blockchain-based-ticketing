import { Request, Response } from "express";
import { Place, Location, PlacesDistance } from "../types";

export class GoogleMapsController {
  static async fetchPlacesFromSearch(
    req: Request<{ input: string }, any, any, Location>,
    res: Response<Place[]>
  ) {
    const { input } = req.params;
    const { lat, lng } = req.query;
    try {
      const result: {
        predictions: {
          description: string;
          reference: string;
          structured_formatting: {
            main_text: string;
            secondary_text: string;
          };
        }[];
      } = await (
        await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&location=${lat},${lng}&radius=50000&key=${process
            .env.GOOGLE_KEY!}`
        )
      ).json();
      const sendBack = result.predictions.map((p) => ({
        referenceId: p.reference,
        description: p.description,
        mainText: p.structured_formatting.main_text,
        secondaryText: p.structured_formatting.secondary_text,
      }));
      return res.status(200).send(sendBack);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }

  static async getCoordinatesFromPlaceId(
    req: Request<{ placeId: String }>,
    res: Response<Location>
  ) {
    const { placeId } = req.params;
    try {
      const result: {
        result: {
          geometry: {
            location: {
              lat: number;
              lng: number;
            };
          };
        };
      } = await (
        await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${process
            .env.GOOGLE_KEY!}`
        )
      ).json();

      return res.status(200).send(result.result.geometry.location);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }

  static async calculateWalkingDistanceBwtweenTwoPoints(
    req: Request<any, { currentLocation: Location; targetLocation: Location }>,
    res: Response<PlacesDistance>
  ) {
    const { currentLocation, targetLocation } = req.body;
    try {
      const result: {
        routes: {
          legs: PlacesDistance[];
        }[];
      } = await (
        await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${
            currentLocation.lat
          },${currentLocation.lng}&destination=${targetLocation.lat},${
            targetLocation.lng
          }&mode=walking&key=${process.env.GOOGLE_KEY!}`
        )
      ).json();

      return res.status(200).send({
        distance: result.routes[0].legs[0].distance,
        duration: result.routes[0].legs[0].duration,
      });
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
}
