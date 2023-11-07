import { Msp } from "./database/mspRespository";

export type Location = {
  lat: number;
  lng: number;
};

export type Place = {
  referenceId: String;
  description: string;
  mainText: string;
  secondaryText: string;
};

export type PlacesDistance = {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
};

export type Offer = {
  id: number;
  pricePerKm: string;
  pricePerSec: string;
  UnlockPrice: string;
  KmAllowance: number;
  TimeAllowance: number;
  enabled: boolean;
};

export type VehicleWithOffer = {
  id: number;
  position: Location;
  totalKm: number;
  battery: number;
  vehicleAddress: string;
  currentOwner?: string;
  offer?: Offer;
  startKm?: BigInt;
  startTime?: BigInt;
  maxToSpend?: BigInt;
  enabled: boolean;
  msp: Msp;
};
