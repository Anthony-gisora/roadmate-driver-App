import * as SQLite from 'expo-sqlite';

export interface Car {
  id?: number;
  make: string;
  model: string;
  isDefault: boolean;
  plate: string;
  year: number;
  color: string;
}

export interface EmergencyContact {
  id?: number;
  name: string;
  phone: string;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDB() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('OfflineDB.db');
    const db = await dbPromise;
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        isDefault INTEGER DEFAULT 0,
        plate TEXT NOT NULL,
        year INTEGER NOT NULL,
        color TEXT
      );
      CREATE TABLE IF NOT EXISTS emergencyContacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL
      );
    `);
  }
  return dbPromise;
}

export class OfflineDB {
  // ----- Car Methods -----
  async addCar(car: Car): Promise<number> {
    const db = await getDB();
    if (car.isDefault) {
      await db.runAsync(`UPDATE cars SET isDefault = 0 WHERE isDefault = 1`);
    }
    const result = await db.runAsync(
      `INSERT INTO cars (make, model, isDefault, plate, year, color) VALUES (?, ?, ?, ?, ?, ?)`,
      car.make,
      car.model,
      car.isDefault ? 1 : 0,
      car.plate,
      car.year,
      car.color
    );
    return result.lastInsertRowId;
  }

  async getCars(): Promise<Car[]> {
    const db = await getDB();
    const rows = await db.getAllAsync('SELECT * FROM cars');
    return rows.map((row: any) => ({
      ...row,
      isDefault: !!row.isDefault,
    }));
  }

  async updateCar(id: number, updates: Partial<Car>): Promise<number> {
    const db = await getDB();

    if (updates.isDefault) {
      await db.runAsync(`UPDATE cars SET isDefault = 0 WHERE isDefault = 1`);
    }

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.make !== undefined) {
      setClauses.push('make = ?');
      values.push(updates.make);
    }
    if (updates.model !== undefined) {
      setClauses.push('model = ?');
      values.push(updates.model);
    }
    if (updates.isDefault !== undefined) {
      setClauses.push('isDefault = ?');
      values.push(updates.isDefault ? 1 : 0);
    }
    if (updates.plate !== undefined) {
      setClauses.push('plate = ?');
      values.push(updates.plate);
    }
    if (updates.year !== undefined) {
      setClauses.push('year = ?');
      values.push(updates.year);
    }
    if (updates.color !== undefined) {
      setClauses.push('color = ?');
      values.push(updates.color);
    }

    if (setClauses.length === 0) return 0;

    values.push(id);
    const sql = `UPDATE cars SET ${setClauses.join(', ')} WHERE id = ?`;
    const result = await db.runAsync(sql, ...values);
    return result.changes;
  }

  async deleteCar(id: number): Promise<number> {
    const db = await getDB();
    const result = await db.runAsync(
      `DELETE FROM cars WHERE id = ?`,
      id
    );
    return result.changes;
  }

  async getDefaultCar(): Promise<Car | undefined> {
    const db = await getDB();
    const row = await db.getFirstAsync(
      'SELECT * FROM cars WHERE isDefault = 1 LIMIT 1'
    );
    if (row) {
      (row as any).isDefault = !!(row as any).isDefault;
      return row as Car;
    }
    return undefined;
  }

  // ----- Emergency Contact Methods -----
  async addContact(contact: EmergencyContact): Promise<number> {
    const db = await getDB();
    const result = await db.runAsync(
      `INSERT INTO emergencyContacts (name, phone) VALUES (?, ?)`,
      contact.name,
      contact.phone
    );
    return result.lastInsertRowId;
  }

  async getContacts(): Promise<EmergencyContact[]> {
    const db = await getDB();
    const rows = await db.getAllAsync(
      'SELECT * FROM emergencyContacts'
    );
    return rows;
  }

  async updateContact(
    id: number,
    updates: Partial<EmergencyContact>
  ): Promise<number> {
    const db = await getDB();
    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      values.push(updates.name);
    }
    if (updates.phone !== undefined) {
      setClauses.push('phone = ?');
      values.push(updates.phone);
    }
    if (setClauses.length === 0) return 0;

    values.push(id);
    const sql = `UPDATE emergencyContacts SET ${setClauses.join(
      ', '
    )} WHERE id = ?`;
    const result = await db.runAsync(sql, ...values);
    return result.changes;
  }

  async deleteContact(id: number): Promise<number> {
    const db = await getDB();
    const result = await db.runAsync(
      `DELETE FROM emergencyContacts WHERE id = ?`,
      id
    );
    return result.changes;
  }
}

export const offlineDB = new OfflineDB();
