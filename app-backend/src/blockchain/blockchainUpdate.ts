import "dotenv/config";
import { Contract, ethers } from "ethers";
import { registerContractAbi, unlockableTransportContractAbi } from "./abi";
import { Msp } from "../database/mspRespository";
import { Vehicles } from "../database/vehicleRepository";
import { runAsTransaction } from "../utils/database";
import { PointOfInterest, Routes } from "../database/routesRepository";
import { TypeOfTransport } from "../database/routesRepository";

export const updateDatabase = async () => {
  const provider = new ethers.JsonRpcProvider(
    process.env.ETHEREUM_PROVIDER_URL
  );

  const registerContract = new Contract(
    process.env.REGISTER_CONTRACT_ADDRESS!,
    registerContractAbi,
    provider
  );

  let allMsp: Msp[] = [];
  try {
    allMsp = await registerContract.getAllMsp();
  } catch (e) {
    console.log(e);
    return;
  }

  for (const msp of allMsp) {
    const isMspKnown = Msp.findMsp(msp.name);
    if (!isMspKnown) {
      new Msp(
        msp.name,
        msp.endpoint,
        msp.unlockableContract,
        msp.ticketContract
      ).save();
      return;
    }
    const unlockableTransportContract = new Contract(
      msp.unlockableContract,
      unlockableTransportContractAbi,
      provider
    );

    const allUnlockables: {
      id: number;
      position: {
        x: BigInt;
        y: BigInt;
      };
      totalKm: number;
      battery: number;
      vehicleAddress: string;
      enabled: boolean;
    }[] = await unlockableTransportContract.getAllVehicles();
    runAsTransaction(async () => {
      Vehicles.deleteByMsp(msp.name);
      for (const unloackable of allUnlockables) {
        let status:
          | {
              currentOwner: string;
              offerId: BigInt;
              startKm: BigInt;
              startTime: BigInt;
              maxToSpend: BigInt;
            }
          | undefined = undefined;
        try {
          status = await unlockableTransportContract.getVehicleStatus(
            unloackable.id
          );
          if (status?.offerId === BigInt(0)) {
            status = undefined;
          }
        } catch (e) {
          //
          console.log(e);
        }
        new Vehicles(
          unloackable.id,
          {
            lat: Number(unloackable.position.x) / 1000000,
            lng: Number(unloackable.position.y) / 1000000,
          },
          unloackable.totalKm,
          unloackable.battery,
          unloackable.vehicleAddress,
          unloackable.enabled,
          msp as Msp,
          status?.currentOwner,
          status?.offerId,
          status?.startKm,
          status?.startTime,
          status?.maxToSpend
        ).save();
      }
    });
    try {
      const endpoint = msp.endpoint;

      const request = await fetch(`${endpoint}/api/routes`);

      if (!request.ok) {
        continue;
      }

      const allRoutes: {
        id: string;
        typeOfTransport: TypeOfTransport;
        price: number;
        from: { name: string; x: number; y: number };
        to: { name: string; x: number; y: number };
        departureTime: number;
        eta: number;
        classNumber: number;
        custom: string;
      }[] = await request.json();
      runAsTransaction(() => {
        Routes.deleteAllByMspName(msp.name);
        for (const route of allRoutes) {
          if (route.departureTime < Date.now() / 1000) {
            continue;
          }
          new Routes(
            route.id,
            route.typeOfTransport,
            route.price,
            new PointOfInterest(route.from.name, route.from.x, route.from.y),
            new PointOfInterest(route.to.name, route.to.x, route.to.y),
            route.departureTime,
            route.eta,
            route.classNumber,
            route.custom,
            msp as Msp
          ).save();
        }
      });
    } catch (e) {
      console.log(e);
      //
    }
  }
};
