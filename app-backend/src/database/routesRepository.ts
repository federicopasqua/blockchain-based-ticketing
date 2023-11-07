import Database from "better-sqlite3";
import { Msp } from "./mspRespository";
import { Location } from "../types";
const db = new Database("database.db");
db.pragma("journal_mode = WAL");

export enum TypeOfTransport {
  TRAIN,
  BOAT,
  PLANE,
  BUS,
}

export class PointOfInterest {
  name: string;
  x: number;
  y: number;
  constructor(name: string, x: number, y: number) {
    this.name = name;
    this.x = x;
    this.y = y;
  }

  getId() {
    return (
      db
        .prepare(
          "SELECT id FROM point_of_interest WHERE name = ? AND x = ? AND y = ?"
        )
        .get(this.name, this.x, this.y) as { id: number }
    ).id;
  }

  save() {
    return db
      .prepare(
        "INSERT OR IGNORE INTO point_of_interest(name, x, y) VALUES(?, ?, ?)"
      )
      .run(this.name, this.x, this.y).lastInsertRowid;
  }
}

export class Routes {
  id: string;
  typeOfTransport: TypeOfTransport;
  price: number;
  from: PointOfInterest;
  to: PointOfInterest;
  departureTime: number;
  eta: number;
  classNumber: number;
  custom: string;
  msp: Msp;
  constructor(
    id: string,
    typeOfTransport: TypeOfTransport,
    price: number,
    from: PointOfInterest,
    to: PointOfInterest,
    departureTime: number,
    eta: number,
    classNumber: number,
    custom: string,
    msp: Msp
  ) {
    this.id = id;
    this.typeOfTransport = typeOfTransport;
    this.price = price;
    this.from = from;
    this.to = to;
    this.departureTime = departureTime;
    this.eta = eta;
    this.classNumber = classNumber;
    this.custom = custom;
    this.msp = msp;
  }

  static setup(DEBUG = false) {
    db.prepare(
      `CREATE TABLE IF NOT EXISTS "routes" (
                "id" INTEGER NOT NULL,
                "route_id"	INTEGER NOT NULL,
                "typeOfTransport"	TEXT NOT NULL,
                "price"	TEXT NOT NULL,
                "from_point" INTEGER NOT NULL,
                "to_point" INTEGER NOT NULL,
                "departureTime" NUMBER NOT NULL,
                "eta" NUMBER NOT NULL,
                "classNumber" NUMBER NOT NULL,
                "custom" TEXT,
                "msp" TEXT NOT NULL,
                PRIMARY KEY("id"),
                UNIQUE("route_id", "msp")
                FOREIGN KEY("to_point") REFERENCES "point_of_interest"("id"),
                FOREIGN KEY("from_point") REFERENCES "point_of_interest"("id")
                FOREIGN KEY("msp") REFERENCES "msp"("name")
            )`
    ).run();
    db.prepare(
      `CREATE TABLE IF NOT EXISTS "point_of_interest" (
                "id"	INTEGER,
                "name"	TEXT NOT NULL UNIQUE,
                "x" NUMBER NOT NULL,
                "y" NUMBER NOT NULL,
                PRIMARY KEY("id")
                UNIQUE("name", "x", "y")
            )`
    ).run();
    if (!DEBUG) return;

    const routesInsert = db.prepare(
      "INSERT OR IGNORE INTO routes(route_id, typeOfTransport, price, from_point, to_point, departureTime, eta, classNumber, custom, msp) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const poiInsert = db.prepare(
      "INSERT OR IGNORE INTO point_of_interest(id, name, x, y) VALUES(?, ?, ?, ?)"
    );
    const defaultPoi = [
      [0, "Torino Porta Nuova", 45.06252503747235, 7.678657189208664],
      [1, "Torino Porta Susa", 45.071823841677755, 7.665394642013816],
      [2, "Milano Centrale", 45.48882171189028, 9.2052076107038],
      [3, "Milano Porta Garibaldi", 45.485107098684374, 9.187154995554817],
      [4, "Torino Airport", 45.19716815595198, 7.648020571287013],
      [5, "Milan Malpensa Airport", 45.63449784851509, 8.72596340386153],
      [6, "Linate Airport", 45.453465713817884, 9.276264748367234],
      [7, "Bergamo Train Station", 45.69047036067589, 9.675116996937676],
      [8, "Milan Bergamo Airport", 45.67080152073263, 9.70724167633958],
      [9, "Brescia Train Station", 45.532660334070556, 10.212921774066558],
      [10, "Verona Porta Nuova", 45.43116863832541, 10.982861924866658],
      [11, "Venezia Santa Lucia", 45.44127289284531, 12.321054338133045],
      [12, "Venice Marco Polo Airport", 45.507007550707904, 12.347597902314032],
      [13, "Padova Train Station", 45.418320122373586, 11.880985510555659],
      [14, "Bologna Centrale", 44.507561734727034, 11.343012071637382],
      [
        15,
        "Bologna Guglielmo Marconi Airport",
        44.53469744366263,
        11.28778420548929,
      ],
      [16, "Ancona Train Station", 43.608407708663606, 13.497566339821327],
      [
        17,
        "Aéroport de Paris-Charles de Gaulle",
        49.00796520567168,
        2.5508466075749086,
      ],
      [18, "Heathrow Airport", 51.46817179857003, -0.45500807425327006],
      [
        19,
        "Josep Tarradellas Barcelona-El Prat Airport",
        41.30248613304319,
        2.078018658159708,
      ],
      [
        20,
        "Leonardo da Vinci–Fiumicino Airport",
        41.806288836447855,
        12.2556046344081,
      ],
    ];

    const defaultRoutes = [
      [
        0,
        "TRAIN",
        "100000000000000000",
        0,
        2,
        1703502000,
        1703505600,
        1,
        "",
        "Trenitalia",
      ],
      [
        1,
        "TRAIN",
        "100000000000000000",
        0,
        2,
        1703505600,
        1703509200,
        1,
        "",
        "Trenitalia",
      ],
      [
        2,
        "TRAIN",
        "100000000000000000",
        0,
        2,
        1703509200,
        1703512800,
        1,
        "",
        "Trenitalia",
      ],
      [
        3,
        "TRAIN",
        "100000000000000000",
        0,
        2,
        1703512800,
        1703516400,
        1,
        "",
        "Italo",
      ],
      [
        4,
        "TRAIN",
        "100000000000000000",
        0,
        2,
        1703516400,
        1703520000,
        1,
        "",
        "Trenitalia",
      ],
      [
        5,
        "BUS",
        "200000000000000000",
        1,
        4,
        1703502000,
        1703505600,
        1,
        "",
        "GTT",
      ],
      [
        6,
        "BUS",
        "300000000000000000",
        1,
        4,
        1703505600,
        1703509200,
        1,
        "",
        "GTT",
      ],
      [
        7,
        "BUS",
        "400000000000000000",
        1,
        4,
        1703509200,
        1703512800,
        1,
        "",
        "GTT",
      ],
      [
        8,
        "BUS",
        "500000000000000000",
        1,
        4,
        1703512800,
        1703516400,
        1,
        "",
        "GTT",
      ],
      [
        9,
        "BUS",
        "1000000000000000000",
        1,
        4,
        1703516400,
        1703520000,
        1,
        "",
        "GTT",
      ],
    ];

    for (const poi of defaultPoi) {
      poiInsert.run(poi[0], poi[1], poi[2], poi[3]);
    }

    for (const route of defaultRoutes) {
      routesInsert.run(
        route[0],
        route[1],
        route[2],
        route[3],
        route[4],
        route[5],
        route[6],
        route[7],
        route[8],
        route[9]
      );
    }
  }

  static findRoute(id: string) {
    const rawRoute: any = db
      .prepare(
        `SELECT 
                    r.route_id AS id,
                    typeOfTransport,
                    price,
                    departureTime,
                    eta,
                    classNumber,
                    custom,
                    f.name AS fname,
                    f.x AS fx,
                    f.y AS fy,
                    t.name AS tname,
                    t.x AS tx,
                    t.y AS ty,
                    m.name as mspName,
                    m.endpoint as mspEndpoint,
                    m.unlockable_contract as mspUnloackableContract,
                    m.ticket_contract as mspTicketContract
                FROM routes as r
                INNER JOIN point_of_interest AS f ON f.id = r.from_point
                INNER JOIN point_of_interest AS t ON t.id = r.to_point
                INNER JOIN msp AS m ON m.name = r.msp
                WHERE r.route_id = ?`
      )
      .get(id);
    if (!rawRoute) {
      return undefined;
    }
    return new this(
      rawRoute.id,
      rawRoute.typeOfTransport,
      rawRoute.price,
      new PointOfInterest(rawRoute.fname, rawRoute.fx, rawRoute.fy),
      new PointOfInterest(rawRoute.tname, rawRoute.tx, rawRoute.ty),
      rawRoute.departureTime,
      rawRoute.eta,
      rawRoute.classNumber,
      rawRoute.custom,
      new Msp(
        rawRoute.mspName,
        rawRoute.mspEndpoint,
        rawRoute.mspUnloackableContract,
        rawRoute.mspTicketContract
      )
    );
  }

  static findAll() {
    const rawRoutes = db
      .prepare(
        `SELECT
                    r.route_id AS id,
                    typeOfTransport,
                    price,
                    departureTime,
                    eta,
                    classNumber,
                    custom,
                    f.name AS fname,
                    f.x AS fx,
                    f.y AS fy,
                    t.name AS tname,
                    t.x AS tx,
                    t.y AS ty,
                    m.name as mspName,
                    m.endpoint as mspEndpoint,
                    m.unlockable_contract as mspUnloackableContract,
                    m.ticket_contract as mspTicketContract
                FROM routes as r
                INNER JOIN point_of_interest AS f ON f.id = r.from_point
                INNER JOIN point_of_interest AS t ON t.id = r.to_point
                INNER JOIN msp AS m ON m.name = r.msp`
      )
      .all();

    const routes = [];
    for (const route of rawRoutes as any[]) {
      routes.push(
        new this(
          route.id,
          route.typeOfTransport,
          route.price,
          new PointOfInterest(route.fname, route.fx, route.fy),
          new PointOfInterest(route.tname, route.tx, route.ty),
          route.departureTime,
          route.eta,
          route.classNumber,
          route.custom,
          new Msp(
            route.mspName,
            route.mspEndpoint,
            route.mspUnloackableContract,
            route.mspTicketContract
          )
        )
      );
    }
    return routes;
  }

  static findAllByDepartureAndArrival(
    departure: Location,
    arrival: Location,
    departureTime: number
  ) {
    const rawRoutes = db
      .prepare(
        `SELECT
                    r.route_id AS id,
                    typeOfTransport,
                    price,
                    departureTime,
                    eta,
                    classNumber,
                    custom,
                    f.name AS fname,
                    f.x AS fx,
                    f.y AS fy,
                    t.name AS tname,
                    t.x AS tx,
                    t.y AS ty,
                    m.name as mspName,
                    m.endpoint as mspEndpoint,
                    m.unlockable_contract as mspUnloackableContract,
                    m.ticket_contract as mspTicketContract
                FROM routes as r
                INNER JOIN point_of_interest AS f ON f.id = r.from_point
                INNER JOIN point_of_interest AS t ON t.id = r.to_point
                INNER JOIN msp AS m ON m.name = r.msp
                WHERE (
                  acos(sin(fx * 0.0175) * sin(? * 0.0175) 
                       + cos(fx * 0.0175) * cos(? * 0.0175) *    
                         cos((? * 0.0175) - (fy * 0.0175))
                      ) * 6371 <= 1
              ) AND
                (
                  acos(sin(tx* 0.0175) * sin(? * 0.0175) 
                       + cos(tx* 0.0175) * cos(? * 0.0175) *    
                         cos((? * 0.0175) - (ty * 0.0175))
                      ) * 6371 <= 1
              ) AND
                departureTime > ?
                ORDER BY departureTime ASC LIMIT 100`
      )
      .all(
        departure.lat,
        departure.lat,
        departure.lng,
        arrival.lat,
        arrival.lat,
        arrival.lng,
        departureTime
      );

    const routes = [];
    for (const route of rawRoutes as any[]) {
      routes.push(
        new this(
          route.id,
          route.typeOfTransport,
          route.price,
          new PointOfInterest(route.fname, route.fx, route.fy),
          new PointOfInterest(route.tname, route.tx, route.ty),
          route.departureTime,
          route.eta,
          route.classNumber,
          route.custom,
          new Msp(
            route.mspName,
            route.mspEndpoint,
            route.mspUnloackableContract,
            route.mspTicketContract
          )
        )
      );
    }
    return routes;
  }

  static deleteAllByMspName(mspName: string) {
    db.prepare(
      `DELETE
                FROM routes
                WHERE msp = ?`
    ).run(mspName);
  }

  save() {
    this.from.save();
    this.to.save();
    db.prepare(
      "INSERT INTO routes(route_id, typeOfTransport, price, from_point, to_point, departureTime, eta, classNumber, custom, msp) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      this.id,
      TypeOfTransport[this.typeOfTransport],
      this.price,
      this.from.getId(),
      this.to.getId(),
      this.departureTime,
      this.eta,
      this.classNumber,
      this.custom,
      this.msp.name
    );
  }
}
