import Dexie from 'dexie';

// Define your database schema types
interface Car {
    id?: number;
    make: string,
    model: string;
    isDefault: boolean;
    plate: string;
    year: number;
    color: string
}

interface EmergencyContact {
    id?: number;
    name: string;
    phone: string;
}

export class OfflineDB extends Dexie {
    cars: Dexie.Table<Car, number>;
    emergencyContacts: Dexie.Table<EmergencyContact, number>;

    constructor() {
        super('OfflineDB');

        // Define database schema
        this.version(1).stores({
            cars: '++id, make, model, isDefault, plate, year, color',
            emergencyContacts: '++id, name, phone'
        });

        this.cars = this.table('cars');
        this.emergencyContacts = this.table('emergencyContacts');
    }

    // ----- Car Methods -----
    async addCar(car: Car) {
        // If car is default, unset previous default
        if (car.isDefault) {
            await this.cars.where('isDefault').equals(1).modify({ isDefault: false });
        }
        return this.cars.add(car);
    }

    async getCars(): Promise<Car[]> {
        return this.cars.toArray();
    }

    async updateCar(id: number, updates: Partial<Car>) {
        // If setting a new default car
        if (updates.isDefault) {
            await this.cars.where('isDefault').equals(1).modify({ isDefault: false });
        }
        return this.cars.update(id, updates);
    }

    async deleteCar(id: number) {
        return this.cars.delete(id);
    }

    async getDefaultCar(): Promise<Car | undefined> {
        return this.cars.where('isDefault').equals(1).first();
    }

    // ----- Emergency Contact Methods -----
    async addContact(contact: EmergencyContact) {
        return this.emergencyContacts.add(contact);
    }

    async getContacts(): Promise<EmergencyContact[]> {
        return this.emergencyContacts.toArray();
    }

    async updateContact(id: number, updates: Partial<EmergencyContact>) {
        return this.emergencyContacts.update(id, updates);
    }

    async deleteContact(id: number) {
        return this.emergencyContacts.delete(id);
    }
}

export const db = new OfflineDB();