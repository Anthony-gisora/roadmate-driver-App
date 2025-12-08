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

const db = SQLite.openDatabase('OfflineDB.db');

export class OfflineDB {
  constructor() {
    this.init();
  }

  private init() {
    // Create tables if they don't exist
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cars (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          make TEXT NOT NULL,
          model TEXT NOT NULL,
          isDefault INTEGER DEFAULT 0,
          plate TEXT NOT NULL,
          year INTEGER NOT NULL,
          color TEXT
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS emergencyContacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL
        );`
      );
    });
  }

  // ----- Car Methods -----
  addCar(car: Car): Promise<number> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        const setDefault = car.isDefault ? 1 : 0;

        // If new car is default, unset previous default
        if (setDefault) {
          tx.executeSql(
            `UPDATE cars SET isDefault = 0 WHERE isDefault = 1;`
          );
        }

        tx.executeSql(
          `INSERT INTO cars (make, model, isDefault, plate, year, color) VALUES (?, ?, ?, ?, ?, ?)`,
          [car.make, car.model, setDefault, car.plate, car.year, car.color],
          (_, result) => resolve(result.insertId),
          (_, error) => {
            console.error('Error adding car:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  getCars(): Promise<Car[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM cars`,
          [],
          (_, { rows }) => {
            // Convert isDefault from 0/1 to boolean
            const cars: Car[] = rows._array.map(row => ({
              ...row,
              isDefault: !!row.isDefault,
            }));
            resolve(cars);
          },
          (_, error) => {
            console.error('Error fetching cars:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  updateCar(id: number, updates: Partial<Car>): Promise<number> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // If setting new default, unset previous default
        if (updates.isDefault) {
          tx.executeSql(
            `UPDATE cars SET isDefault = 0 WHERE isDefault = 1;`
          );
        }

        const fields: string[] = [];
        const values: any[] = [];
        if (updates.make !== undefined) { fields.push('make = ?'); values.push(updates.make); }
        if (updates.model !== undefined) { fields.push('model = ?'); values.push(updates.model); }
        if (updates.isDefault !== undefined) { fields.push('isDefault = ?'); values.push(updates.isDefault ? 1 : 0); }
        if (updates.plate !== undefined) { fields.push('plate = ?'); values.push(updates.plate); }
        if (updates.year !== undefined) { fields.push('year = ?'); values.push(updates.year); }
        if (updates.color !== undefined) { fields.push('color = ?'); values.push(updates.color); }

        const sql = `UPDATE cars SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);

        tx.executeSql(
          sql,
          values,
          (_, result) => resolve(result.rowsAffected),
          (_, error) => {
            console.error('Error updating car:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  deleteCar(id: number): Promise<number> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM cars WHERE id = ?`,
          [id],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => {
            console.error('Error deleting car:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  getDefaultCar(): Promise<Car | undefined> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM cars WHERE isDefault = 1 LIMIT 1`,
          [],
          (_, { rows }) => {
            const car = rows._array[0];
            if (car) car.isDefault = !!car.isDefault;
            resolve(car);
          },
          (_, error) => {
            console.error('Error fetching default car:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // ----- Emergency Contact Methods -----
  addContact(contact: EmergencyContact): Promise<number> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO emergencyContacts (name, phone) VALUES (?, ?)`,
          [contact.name, contact.phone],
          (_, result) => resolve(result.insertId),
          (_, error) => {
            console.error('Error adding contact:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  getContacts(): Promise<EmergencyContact[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM emergencyContacts`,
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => {
            console.error('Error fetching contacts:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  updateContact(id: number, updates: Partial<EmergencyContact>): Promise<number> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        const fields: string[] = [];
        const values: any[] = [];
        if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
        if (updates.phone !== undefined) { fields.push('phone = ?'); values.push(updates.phone); }
        values.push(id);

        const sql = `UPDATE emergencyContacts SET ${fields.join(', ')} WHERE id = ?`;
        tx.executeSql(
          sql,
          values,
          (_, result) => resolve(result.rowsAffected),
          (_, error) => {
            console.error('Error updating contact:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  deleteContact(id: number): Promise<number> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM emergencyContacts WHERE id = ?`,
          [id],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => {
            console.error('Error deleting contact:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
}

export const offlineDB = new OfflineDB();
