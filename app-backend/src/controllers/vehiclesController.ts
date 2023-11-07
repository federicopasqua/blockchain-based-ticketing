import { Request, Response } from "express";

import { Vehicles } from "../database/vehicleRepository";
import { Contract, ethers } from "ethers";
import { unlockableTransportContractAbi } from "../blockchain/abi";
import { VehicleWithOffer, Location, Offer } from "../types";

const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_PROVIDER_URL);

export class vehicleController {
  static getVehicles(
    req: Request<any, { currentPosition: Location; radius: number }>,
    res: Response<Vehicles[]>
  ) {
    try {
      const { currentPosition, radius } = req.body;
      const vehicles = Vehicles.findByRadius(currentPosition, radius);
      return res.status(200).send(vehicles);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }

  static async getOwnedVehicle(
    req: Request<{ address: string }>,
    res: Response<VehicleWithOffer>
  ) {
    try {
      const { address } = req.params;
      const vehicle = Vehicles.findByOwner(address);
      if (!vehicle) {
        return res.sendStatus(404);
      }
      const unlockableTransportContract = new Contract(
        vehicle.msp.unlockableContract,
        unlockableTransportContractAbi,
        provider
      );
      const offer: Offer = await unlockableTransportContract.getOffer(
        vehicle.offerId
      );
      return res.status(200).send({ ...vehicle, offer });
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
}
