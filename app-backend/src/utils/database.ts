import Database from "better-sqlite3";
const db = new Database("database.db");

export function runAsTransaction(operation: () => void) {
  db.prepare("BEGIN").run();
  try {
    operation();
    db.prepare("COMMIT").run();
  } finally {
    if (db.inTransaction) {
      console.log("ROLLBACKING TRANSACTIONS");
      db.prepare("ROLLBACK").run();
    }
  }
}
