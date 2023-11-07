import Database from "better-sqlite3";
const db = new Database("routes.db");
db.pragma("journal_mode = WAL");

enum TypeOfTransport {
  TRAIN,
  BOAT,
  PLANE,
  BUS,
}

class PointOfInterest {
  name: string;
  x: number;
  y: number;
  constructor(name: string, x: number, y: number) {
    this.name = name;
    this.x = x;
    this.y = y;
  }
}

export class RoutesRepository {
  id: string;
  typeOfTransport: TypeOfTransport;
  price: number;
  from: PointOfInterest;
  to: PointOfInterest;
  departureTime: number;
  eta: number;
  classNumber: number;
  custom: string;
  constructor(
    id: string,
    typeOfTransport: TypeOfTransport,
    price: number,
    from: PointOfInterest,
    to: PointOfInterest,
    departureTime: number,
    eta: number,
    classNumber: number,
    custom: string
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
  }

  static setup(DEBUG = true) {
    db.prepare(
      `CREATE TABLE IF NOT EXISTS "routes" (
                "id"	INTEGER NOT NULL UNIQUE,
                "typeOfTransport"	TEXT NOT NULL,
                "price"	TEXT NOT NULL,
                "from_point" INTEGER NOT NULL,
                "to_point" INTEGER NOT NULL,
                "departureTime" NUMBER NOT NULL,
                "eta" NUMBER NOT NULL,
                "classNumber" NUMBER NOT NULL,
                "custom" TEXT,
                PRIMARY KEY("id"),
                FOREIGN KEY("to_point") REFERENCES "point_of_interest"("id"),
                FOREIGN KEY("from_point") REFERENCES "point_of_interest"("id")
            )`
    ).run();
    db.prepare(
      `CREATE TABLE IF NOT EXISTS "point_of_interest" (
                "id"	INTEGER,
                "name"	TEXT NOT NULL,
                "x" NUMBER NOT NULL,
                "y" NUMBER NOT NULL,
                PRIMARY KEY("id")
            )`
    ).run();

    // Run the following code only if you want to setup the database for test. NOT production code.
    if (!DEBUG) return;

    const routesInsert = db.prepare(
      "INSERT OR IGNORE INTO routes(id, typeOfTransport, price, from_point, to_point, departureTime, eta, classNumber, custom) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)"
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
      [0, "TRAIN", "100000000000000000", 0, 2, 1703502000, 1703505600, 1, ""],
      [1, "TRAIN", "100000000000000000", 0, 2, 1703505600, 1703509200, 1, ""],
      [2, "TRAIN", "100000000000000000", 0, 2, 1703509200, 1703512800, 1, ""],
      [3, "TRAIN", "100000000000000000", 0, 2, 1703512800, 1703516400, 1, ""],
      [4, "TRAIN", "100000000000000000", 0, 2, 1703516400, 1703520000, 1, ""],
      [5, "BUS", "200000000000000000", 1, 4, 1703502000, 1703505600, 1, ""],
      [6, "BUS", "300000000000000000", 1, 4, 1703505600, 1703509200, 1, ""],
      [7, "BUS", "400000000000000000", 1, 4, 1703509200, 1703512800, 1, ""],
      [8, "BUS", "500000000000000000", 1, 4, 1703512800, 1703516400, 1, ""],
      [9, "BUS", "1000000000000000000", 1, 4, 1703516400, 1703520000, 1, ""],
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
        route[8]
      );
    }
  }

  static findRoute(id: string) {
    const rawRoute: any = db
      .prepare(
        `SELECT 
                    r.id AS id,
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
                    t.y AS ty
                FROM routes as r
                INNER JOIN point_of_interest AS f ON f.id = r.from_point
                INNER JOIN point_of_interest AS t ON t.id = r.to_point
                WHERE r.id = ?`
      )
      .get(id);
    if (!rawRoute) {
      return undefined;
    }
    return new this(
      rawRoute.id,
      TypeOfTransport[rawRoute.typeOfTransport as keyof typeof TypeOfTransport],
      rawRoute.price,
      new PointOfInterest(rawRoute.fname, rawRoute.fx, rawRoute.fy),
      new PointOfInterest(rawRoute.tname, rawRoute.tx, rawRoute.ty),
      rawRoute.departureTime,
      rawRoute.eta,
      rawRoute.classNumber,
      rawRoute.custom
    );
  }

  static findAll() {
    const rawRoutes = db
      .prepare(
        `SELECT
                    r.id AS id,
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
                    t.y AS ty
                FROM routes as r
                INNER JOIN point_of_interest AS f ON f.id = r.from_point
                INNER JOIN point_of_interest AS t ON t.id = r.to_point`
      )
      .all();

    const routes = [];
    for (const route of rawRoutes as any[]) {
      routes.push(
        new this(
          route.id,
          TypeOfTransport[
            route.typeOfTransport as keyof typeof TypeOfTransport
          ],
          route.price,
          new PointOfInterest(route.fname, route.fx, route.fy),
          new PointOfInterest(route.tname, route.tx, route.ty),
          route.departureTime,
          route.eta,
          route.classNumber,
          route.custom
        )
      );
    }
    return routes;
  }

  static findAllByDepartureAndArrival(departure: string, arrival: string) {
    const rawRoutes = db
      .prepare(
        `SELECT
                    r.id AS id,
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
                    t.y AS ty
                FROM routes as r
                INNER JOIN point_of_interest AS f ON f.id = r.from_point
                INNER JOIN point_of_interest AS t ON t.id = r.to_point
                WHERE fname LIKE ? AND tname LIKE ?`
      )
      .all(departure, arrival);

    const routes = [];
    for (const route of rawRoutes as any[]) {
      routes.push(
        new this(
          route.id,
          TypeOfTransport[
            route.typeOfTransport as keyof typeof TypeOfTransport
          ],
          route.price,
          new PointOfInterest(route.fname, route.fx, route.fy),
          new PointOfInterest(route.tname, route.tx, route.ty),
          route.departureTime,
          route.eta,
          route.classNumber,
          route.custom
        )
      );
    }
    return routes;
  }
}
