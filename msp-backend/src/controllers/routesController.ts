import { Request, Response } from "express";

import { RoutesRepository } from "../database/routesRepository";

export class RoutesController {
  static getRoutes(req: Request, res: Response) {
    try {
      const routes = RoutesRepository.findAll();
      return res.status(200).send(routes);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
}
