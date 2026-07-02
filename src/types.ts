export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number; // in Rubles (₽)
  mileage: number; // in km
  engineVolume: string; // e.g. "2.0L" or "Electric"
  enginePower: number; // hp
  fuelType: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Automatic' | 'Manual' | 'Robotic';
  driveType: 'FWD' | 'RWD' | 'AWD';
  bodyStyle: 'Sedan' | 'SUV' | 'Coupe' | 'Hatchback' | 'Wagon';
  color: string;
  condition: 'New' | 'Used';
  description: string;
  images: string[];
  specs: string[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  carId: string;
  carBrand: string;
  carModel: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  createdAt: string;
}

export interface LoanRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  carId: string;
  carBrand: string;
  carModel: string;
  carPrice: number;
  downPayment: number;
  loanTerm: number; // in months
  interestRate: number; // e.g. 14.5
  monthlyPayment: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface Favorite {
  userId: string;
  carId: string;
}
