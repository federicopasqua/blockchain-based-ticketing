import { Request, Response } from "express";
import Web3 from "web3";
import "dotenv/config";

import { RoutesRepository } from "../database/routesRepository";

export class SigningController {
  static signRoute(req: Request, res: Response) {
    try {
      const { address, id } = req.params;
      const route = RoutesRepository.findRoute(id);
      if (!route) {
        return res.sendStatus(404);
      }
      const web3 = new Web3();

      if (!web3.utils.isAddress(address)) {
        return res.sendStatus(400);
      }

      const expiration = Math.floor(Date.now() / 1000) + 1000;

      const encoding =
        web3.eth.abi.encodeParameters(
          [
            "uint256",
            "uint256",
            "string",
            "uint256",
            "uint256",
            "string",
            "uint256",
          ],
          [
            route.typeOfTransport,
            route.price,
            route.from.name,
            Math.trunc(route.from.x * 1000000),
            Math.trunc(route.from.y * 1000000),
            route.to.name,
            Math.trunc(route.to.x * 1000000),
          ]
        ) +
        web3.eth.abi
          .encodeParameters(
            [
              "uint256",
              "uint256",
              "uint256",
              "uint8",
              "uint256",
              "address",
              "bytes",
            ],
            [
              Math.trunc(route.to.y * 1000000),
              route.departureTime,
              route.eta,
              route.classNumber,
              expiration,
              address,
              "0x" + route.custom,
            ]
          )
          .slice(2);

      const hashId = web3.utils.soliditySha3(encoding);
      const signature = web3.eth.accounts.sign(
        hashId!,
        process.env.PRIVATE_KEY!
      );

      return res.status(200).send({ expiration, hashId, signature });
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
}
