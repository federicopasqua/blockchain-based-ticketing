import Database from "better-sqlite3";
const db = new Database("database.db");
db.pragma("journal_mode = WAL");

export class Msp {
  name: string;
  endpoint: string;
  unlockableContract: string;
  ticketContract: string;
  constructor(
    name: string,
    endpoint: string,
    unlockableContract: string,
    ticketContract: string
  ) {
    this.name = name;
    this.endpoint = endpoint;
    this.unlockableContract = unlockableContract;
    this.ticketContract = ticketContract;
  }

  static setup(DEBUG = false) {
    db.prepare(
      `CREATE TABLE IF NOT EXISTS "msp" (
                "name"	TEXT NOT NULL,
                "endpoint"	TEXT NOT NULL,
                "unlockable_contract"	TEXT NOT NULL,
                "ticket_contract" INTEGER NOT NULL,
                PRIMARY KEY("name")
            )`
    ).run();

    if (!DEBUG) return;

    const mspInsert = db.prepare(
      "INSERT OR IGNORE INTO msp(name, endpoint, unlockable_contract, ticket_contract) VALUES (?, ?, ?, ?)"
    );
    const defaultMsp = [
      ["Trenitalia", "", "", ""],
      ["Italo", "", "", ""],
      ["Ita", "", "", ""],
      ["GTT", "", "", ""],
      ["Bike Rent", "", "", ""],
    ];

    for (const msp of defaultMsp) {
      mspInsert.run(msp[0], msp[1], msp[2], msp[3]);
    }
  }

  static findMsp(name: string) {
    const msp: any = db.prepare(`SELECT * FROM msp WHERE name = ?`).get(name);
    if (!msp) {
      return undefined;
    }
    return new this(
      msp.name,
      msp.endpoint,
      msp.unlockable_contract,
      msp.ticket_contract
    );
  }

  static findAll() {
    const msps: any = db.prepare(`SELECT * FROM msp`).all();
    const routes = [];
    for (const msp of msps as any[]) {
      routes.push(
        new this(
          msp.name,
          msp.endpoint,
          msp.unlockable_contract,
          msp.ticket_contract
        )
      );
    }
    return routes;
  }

  save() {
    db.prepare(
      "INSERT INTO msp (name, endpoint, unlockable_contract, ticket_contract) VALUES (?,?,?,?)"
    ).run(
      this.name,
      this.endpoint,
      this.unlockableContract,
      this.ticketContract
    );
  }
}
