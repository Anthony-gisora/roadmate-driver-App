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