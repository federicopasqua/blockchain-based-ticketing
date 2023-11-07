import { Request, Response } from "express";

import { Routes } from "../database/routesRepository";
import { Msp } from "../database/mspRespository";

export class RoutesController {
  static getRoutesByDepartureAndArrival(
    req: Request<
      any,
      { departure: Location; arrival: Location; departureTime: number }
    >,
    res: Response<Routes[]>
  ) {
    try {
      const { departure, arrival, departureTime } = req.body;
      const routes = Routes.findAllByDepartureAndArrival(
        departure,
        arrival,
        departureTime
      );
      return res.status(200).send(routes);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }

  static async signRoute(
    req: Request<{
      address: string;
      msp: string;
      id: number;
    }>,
    res: Response
  ) {
    try {
      const { address, msp, id } = req.params;
      const databaseMsp = Msp.findMsp(msp);
      if (!databaseMsp) {
        return res.sendStatus(404);
      }
      const request = await fetch(
        `${databaseMsp.endpoint}/api/sign/${address}/${id}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!request.ok) {
        return res.sendStatus(request.status);
      }
      return res.status(200).send(await request.json());
    } catch {
      return res.sendStatus(500);
    }
  }
}
