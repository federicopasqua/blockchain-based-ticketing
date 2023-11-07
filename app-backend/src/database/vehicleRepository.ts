import Database from "better-sqlite3";
import { Msp } from "./mspRespository";
import { Location } from "../types";
const db = new Database("database.db");
db.pragma("journal_mode = WAL");

export class Vehicles {
  id: number;
  position: Location;
  totalKm: number;
  battery: number;
  vehicleAddress: string;
  currentOwner?: string;
  offerId?: BigInt;
  startKm?: BigInt;
  startTime?: BigInt;
  maxToSpend?: BigInt;
  enabled: boolean;
  msp: Msp;
  constructor(
    id: number,
    position: Location,
    totalKm: number,
    battery: number,
    vehicleAddress: string,
    enabled: number | boolean,
    msp: Msp,
    currentOwner?: string,
    offerId?: BigInt,
    startKm?: BigInt,
    startTime?: BigInt,
    maxToSpend?: BigInt
  ) {
    this.id = id;
    this.position = position;
    this.totalKm = totalKm;
    this.battery = battery;
    this.vehicleAddress = vehicleAddress;
    this.currentOwner = currentOwner;
    this.offerId = offerId;
    this.startKm = startKm;
    this.startTime = startTime;
    this.maxToSpend = maxToSpend;
    this.msp = msp;
    // Double equality is needed here
    this.enabled = true == enabled;
  }

  static setup(DEBUG = false) {
    db.prepare(
      `CREATE TABLE IF NOT EXISTS "vehicle" (
                "id" INTEGER NOT NULL,
                "vehicle_id"	INTEGER NOT NULL,
                "latitude"	REAL NOT NULL,
                "longitude"	REAL NOT NULL,
                "totalKm" INTEGER NOT NULL,
                "battery" INTEGER NOT NULL,
                "vehicleAddress" TEXT NOT NULL,
                "currentOwner" TEXT,
                "offerId" INTEGER,
                "startKm" INTEGER,
                "startTime" INTEGER,
                "maxToSpend" INTEGER,
                "enabled" INTEGER,
                "msp" TEXT NOT NULL,
                PRIMARY KEY("id"),
                UNIQUE("vehicle_id", "msp")
                FOREIGN KEY("msp") REFERENCES "msp"("name")
            )`
    ).run();

    if (!DEBUG) {
      return;
    }

    const defaultVehicles: [
      number,
      Location,
      number,
      number,
      string,
      string
    ][] = [
      [
        1,
        { lat: 45.06350463, lng: 7.67891931 },
        234,
        100,
        "0x055244AD6C4B48EC811B19C32A11B30A298947D5",
        "Bike Rent",
      ],
      [
        2,
        { lat: 45.06300781, lng: 7.66360248 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        3,
        { lat: 45.07056227, lng: 7.66494555 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        4,
        { lat: 45.06528164, lng: 7.68228381 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        5,
        { lat: 45.06930763, lng: 7.67655068 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        6,
        { lat: 45.07097656, lng: 7.67208339 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        7,
        { lat: 45.07338167, lng: 7.67914906 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        8,
        { lat: 45.06109324, lng: 7.6707144 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        9,
        { lat: 45.06646306, lng: 7.67889224 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        10,
        { lat: 45.06744792, lng: 7.66248602 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        11,
        { lat: 45.06894068, lng: 7.67053235 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        12,
        { lat: 45.0649333, lng: 7.66676118 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        13,
        { lat: 45.05972124, lng: 7.67329278 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        14,
        { lat: 45.06537102, lng: 7.66574312 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        15,
        { lat: 45.06553126, lng: 7.66709126 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        16,
        { lat: 45.06748662, lng: 7.66784068 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        17,
        { lat: 45.07384066, lng: 7.66493782 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        18,
        { lat: 45.06128911, lng: 7.66751361 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        19,
        { lat: 45.07304604, lng: 7.67528972 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        20,
        { lat: 45.062145, lng: 7.66605718 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        21,
        { lat: 45.06794479, lng: 7.67259198 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        22,
        { lat: 45.06330273, lng: 7.68312381 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        23,
        { lat: 45.06165092, lng: 7.67813848 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        24,
        { lat: 45.0650631, lng: 7.67993722 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        25,
        { lat: 45.05951102, lng: 7.67162255 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        26,
        { lat: 45.0744997, lng: 7.67816805 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        27,
        { lat: 45.07038185, lng: 7.67537543 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        28,
        { lat: 45.06547526, lng: 7.68420166 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        29,
        { lat: 45.06041037, lng: 7.6723605 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        30,
        { lat: 45.07258587, lng: 7.67795983 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        31,
        { lat: 45.06356131, lng: 7.68118559 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        32,
        { lat: 45.0685877, lng: 7.66260353 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        33,
        { lat: 45.07508677, lng: 7.67581884 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        34,
        { lat: 45.06507721, lng: 7.68496345 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        35,
        { lat: 45.06020578, lng: 7.67450011 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        36,
        { lat: 45.06933477, lng: 7.68152582 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        37,
        { lat: 45.07130595, lng: 7.6725743 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        38,
        { lat: 45.06473084, lng: 7.66334057 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        39,
        { lat: 45.06843596, lng: 7.6829341 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        40,
        { lat: 45.06988631, lng: 7.66735036 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        41,
        { lat: 45.07103191, lng: 7.68192921 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        42,
        { lat: 45.06023456, lng: 7.66739283 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        43,
        { lat: 45.07315007, lng: 7.67597858 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        44,
        { lat: 45.0644407, lng: 7.67130452 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        45,
        { lat: 45.06390861, lng: 7.6681144 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        46,
        { lat: 45.06059716, lng: 7.67564509 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        47,
        { lat: 45.06127098, lng: 7.66974561 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        48,
        { lat: 45.06500358, lng: 7.67906885 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        49,
        { lat: 45.07162513, lng: 7.6809564 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
      [
        50,
        { lat: 45.06998078, lng: 7.68475221 },
        234,
        100,
        "0x110Ae8774b4859147F621260bf26BF7754348cf4",
        "Bike Rent",
      ],
    ];

    for (const vehicle of defaultVehicles) {
      new this(
        vehicle[0],
        vehicle[1],
        vehicle[2],
        vehicle[3],
        vehicle[4],
        true,
        Msp.findMsp(vehicle[5])!
      ).save();
    }
  }

  static findByRadius(location: Location, radius: number) {
    const rawVehicles = db
      .prepare(
        `SELECT v.*,
                m.name as mspName,
                m.endpoint as mspEndpoint,
                m.unlockable_contract as mspUnloackableContract,
                m.ticket_contract as mspTicketContract
                FROM vehicle as v
                INNER JOIN msp AS m ON m.name = v.msp
                WHERE (
                  acos(sin(v.latitude * 0.0175) * sin(? * 0.0175) 
                       + cos(v.latitude * 0.0175) * cos(? * 0.0175) *    
                         cos((? * 0.0175) - (v.longitude * 0.0175))
                      ) * 6371 <= ?
              )`
      )
      .all(location.lat, location.lat, location.lng, radius);

    const vehicles = [];
    for (const vehicle of rawVehicles as any[]) {
      vehicles.push(
        new this(
          vehicle.vehicle_id,
          {
            lat: vehicle.latitude,
            lng: vehicle.longitude,
          },
          vehicle.totalKm,
          vehicle.battery,
          vehicle.vehicleAddress,
          +vehicle.enabled,
          new Msp(
            vehicle.mspName,
            vehicle.mspEndpoint,
            vehicle.mspUnloackableContract,
            vehicle.mspTicketContract
          ),
          vehicle.currentOwner,
          vehicle.offerId,
          vehicle.startKm,
          vehicle.startTime,
          vehicle.maxToSpend
        )
      );
    }
    return vehicles;
  }

  static findByOwner(address: string): Vehicles | undefined {
    const rawVehicle: any = db
      .prepare(
        `SELECT v.*,
                m.name as mspName,
                m.endpoint as mspEndpoint,
                m.unlockable_contract as mspUnloackableContract,
                m.ticket_contract as mspTicketContract
                FROM vehicle as v
                INNER JOIN msp AS m ON m.name = v.msp
                WHERE v.currentOwner = ?`
      )
      .get(address);
    if (!rawVehicle) {
      return undefined;
    }

    return new this(
      rawVehicle.vehicle_id,
      {
        lat: rawVehicle.latitude,
        lng: rawVehicle.longitude,
      },
      rawVehicle.totalKm,
      rawVehicle.battery,
      rawVehicle.vehicleAddress,
      +rawVehicle.enabled,
      new Msp(
        rawVehicle.mspName,
        rawVehicle.mspEndpoint,
        rawVehicle.mspUnloackableContract,
        rawVehicle.mspTicketContract
      ),
      rawVehicle.currentOwner,
      rawVehicle.offerId,
      rawVehicle.startKm,
      rawVehicle.startTime,
      rawVehicle.maxToSpend
    );
  }

  static existsByIdAndMsp(id: number, mspName: string) {
    const count = db
      .prepare(
        `SELECT COUNT(*) as count
                FROM vehicle
                WHERE msp = ? AND vehicle_id = ?`
      )
      .get(mspName, id) as { count: number };

    return count.count > 0;
  }

  static deleteByMsp(mspName: string) {
    db.prepare(
      `DELETE
                FROM vehicle
                WHERE msp = ?`
    ).run(mspName);
  }

  save() {
    if (Vehicles.existsByIdAndMsp(this.id, this.msp.name)) {
      db.prepare(
        "UPDATE vehicle SET latitude = ?, longitude = ?, totalKm = ?, battery = ?, enabled = ?, currentOwner = ?, offerId = ?, startKm = ?, startTime = ?, maxToSpend = ? WHERE vehicle_id = ? AND msp = ?"
      ).run(
        this.position.lat,
        this.position.lng,
        this.totalKm,
        this.battery,
        +this.enabled,
        this.currentOwner,
        this.offerId,
        this.startKm,
        this.startTime,
        this.maxToSpend,
        this.id,
        this.msp.name
      );
      return;
    }
    db.prepare(
      "INSERT INTO vehicle(vehicle_id, latitude, longitude, totalKm, battery, vehicleAddress, enabled, msp, currentOwner, offerId, startKm, startTime, maxToSpend) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      this.id,
      this.position.lat,
      this.position.lng,
      this.totalKm,
      this.battery,
      this.vehicleAddress,
      +this.enabled,
      this.msp.name,
      this.currentOwner,
      this.offerId,
      this.startKm,
      this.startTime,
      this.maxToSpend
    );
  }
}
