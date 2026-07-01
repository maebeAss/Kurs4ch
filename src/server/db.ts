import fs from 'fs';
import path from 'path';
import { Car, User, Booking, LoanRequest, Favorite } from '../types.js';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface Schema {
  cars: Car[];
  users: User[];
  bookings: Booking[];
  loanRequests: LoanRequest[];
  favorites: Favorite[];
}

const initialCars: Car[] = [
  {
    id: 'car-1',
    brand: 'Mercedes-Benz',
    model: 'S-Class S 500',
    year: 2024,
    price: 18900000,
    mileage: 0,
    engineVolume: '3.0L',
    enginePower: 435,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    driveType: 'AWD',
    bodyStyle: 'Sedan',
    color: 'Obsidian Black Metallic',
    condition: 'New',
    description: 'Абсолютный лидер представительского класса. Сочетание непревзойденного комфорта, передовых технологий мультимедиа MBUX и максимальной безопасности на дороге.',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'
    ],
    specs: [
      'Пневмоподвеска AIRMATIC',
      'Панорамная крыша',
      'Акустическая система Burmester 3D',
      'Вентиляция и массаж всех сидений',
      'Адаптивный круиз-контроль DISTRONIC',
      'Камеры 360 градусов'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'car-2',
    brand: 'BMW',
    model: 'M5 Competition',
    year: 2023,
    price: 14500000,
    mileage: 12000,
    engineVolume: '4.4L',
    enginePower: 625,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    driveType: 'AWD',
    bodyStyle: 'Sedan',
    color: 'Marina Bay Blue',
    condition: 'Used',
    description: 'Экстремальный седан со спортивным характером. Динамика суперкара в сочетании с практичностью премиального седана бизнес-класса.',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&q=80&w=800'
    ],
    specs: [
      'Карбон-керамические тормоза M',
      'Спортивная выхлопная система M',
      'Проекционный дисплей',
      'Лазерные фары BMW Laserlight',
      'Кожаный салон Merino',
      'Дифференциал M Active'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'car-3',
    brand: 'Porsche',
    model: '911 Carrera S',
    year: 2024,
    price: 21000000,
    mileage: 0,
    engineVolume: '3.0L',
    enginePower: 450,
    fuelType: 'Gasoline',
    transmission: 'Robotic',
    driveType: 'RWD',
    bodyStyle: 'Coupe',
    color: 'Guards Red',
    condition: 'New',
    description: 'Икона спортивного автомобилестроения. Идеальная управляемость, легендарный оппозитный двигатель с двойным турбонаддувом и непревзойденный стиль.',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800'
    ],
    specs: [
      'Трансмиссия PDK 8-ступенчатая',
      'Спортивный пакет Sport Chrono',
      'Адаптивная подвеска PASM',
      'Акустика BOSE Surround Sound',
      'Спортивные сиденья с регулировкой в 18 направлениях',
      'Подруливающая задняя ось'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'car-4',
    brand: 'Audi',
    model: 'Q7 V6 TDI',
    year: 2022,
    price: 9800000,
    mileage: 48000,
    engineVolume: '3.0L',
    enginePower: 249,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    driveType: 'AWD',
    bodyStyle: 'SUV',
    color: 'Daytona Grey Pearl',
    condition: 'Used',
    description: 'Премиальный семейный кроссовер с непревзойденным постоянным полным приводом quattro. Комфорт, вместительность и экономичный мощный дизельный двигатель V6.',
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800'
    ],
    specs: [
      'Постоянный полный привод Quattro',
      'Адаптивная пневмоподвеска',
      'Матричные фары HD Matrix LED',
      '7-местный салон',
      'Виртуальная приборная панель Audi Virtual Cockpit',
      'Доводчики дверей'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'car-5',
    brand: 'Tesla',
    model: 'Model S Plaid',
    year: 2023,
    price: 13200000,
    mileage: 5000,
    engineVolume: 'Electric',
    enginePower: 1020,
    fuelType: 'Electric',
    transmission: 'Automatic',
    driveType: 'AWD',
    bodyStyle: 'Sedan',
    color: 'Pearl White Multi-Coat',
    condition: 'Used',
    description: 'Один из самых быстрых серийных автомобилей в мире. Три электромотора выдают сумасшедшие 1020 л.с., разгоняя машину до сотни за невероятные 2.1 секунды.',
    images: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800'
    ],
    specs: [
      'Разгон 0-100 км/ч за 2.1 с',
      'Запас хода до 600 км',
      'Штурвал вместо рулевого колеса Yoke',
      'Система автопилотирования Full Self-Driving',
      'Игровая станция с производительностью PS5',
      'Премиум аудиосистема с 22 динамиками'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'car-6',
    brand: 'Toyota',
    model: 'Camry XV70 Gr-Sport',
    year: 2022,
    price: 4300000,
    mileage: 35000,
    engineVolume: '2.5L',
    enginePower: 200,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    driveType: 'FWD',
    bodyStyle: 'Sedan',
    color: 'Two-Tone Red/Black',
    condition: 'Used',
    description: 'Настоящая легенда надежности в ярком спортивном исполнении GR Sport. Экономичный и динамичный атмосферный двигатель, легендарная подвеска и высокая ликвидность.',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&q=80&w=800'
    ],
    specs: [
      'Спортивный обвес GR Sport',
      'Кожаный салон со красной прострочкой',
      'Зимний пакет (обогрев руля, лобового стекла, всех сидений)',
      'Акустика JBL с сабвуфером',
      'Комплекс систем безопасности Toyota Safety Sense',
      'Беспроводная зарядка для смартфона'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'car-7',
    brand: 'Hyundai',
    model: 'Tucson Lifestyle',
    year: 2024,
    price: 3950000,
    mileage: 0,
    engineVolume: '2.0L',
    enginePower: 150,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    driveType: 'AWD',
    bodyStyle: 'SUV',
    color: 'Shimmering Silver',
    condition: 'New',
    description: 'Современный городской кроссовер с футуристичным дизайном и просторным салоном. Прекрасный выбор для семьи: экономичный, высокий и безопасный.',
    images: [
      'https://images.unsplash.com/photo-1627454820516-dc767bcb4d3e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'
    ],
    specs: [
      'Светодиодная оптика со встроенными ходовыми огнями',
      'Цифровая панель приборов 10.25 дюймов',
      'Мультимедиа 10.25 дюймов с Apple CarPlay и Android Auto',
      'Двухзонный климат-контроль',
      'Камера заднего вида и парктроники по кругу',
      'Бесключевой доступ и запуск с кнопки'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'car-8',
    brand: 'Porsche',
    model: 'Taycan 4S',
    year: 2023,
    price: 15800000,
    mileage: 8000,
    engineVolume: 'Electric',
    enginePower: 571,
    fuelType: 'Electric',
    transmission: 'Automatic',
    driveType: 'AWD',
    bodyStyle: 'Sedan',
    color: 'Frozen Blue Metallic',
    condition: 'Used',
    description: 'Электрокар, сохранивший гены истинного спортивного Porsche. Феноменальное ускорение, моментальный отклик и неповторимая динамика в тишине.',
    images: [
      'https://images.unsplash.com/photo-1611245701175-372de200622e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'
    ],
    specs: [
      'Батарея Performance Plus (до 460 км хода)',
      'Спортивная пневмоподвеска PASM',
      'Панорамный стеклянный верх',
      'Дисплей для переднего пассажира',
      'Адаптивный спойлер',
      'Быстрая зарядка 800В (до 80% за 22 минуты)'
    ],
    createdAt: new Date().toISOString()
  }
];

const initialUsers: User[] = [
  {
    id: 'user-admin',
    email: 'admin@auto.ru',
    name: 'Администратор Салона',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-test',
    email: 'test@auto.ru',
    name: 'Иван Иванов',
    role: 'user',
    createdAt: new Date().toISOString()
  }
];

export class LocalDb {
  private data: Schema;

  constructor() {
    this.data = {
      cars: [],
      users: [],
      bookings: [],
      loanRequests: [],
      favorites: []
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure lists exist
        this.data.cars = this.data.cars || [];
        this.data.users = this.data.users || [];
        this.data.bookings = this.data.bookings || [];
        this.data.loanRequests = this.data.loanRequests || [];
        this.data.favorites = this.data.favorites || [];
      } else {
        this.data = {
          cars: initialCars,
          users: initialUsers,
          bookings: [],
          loanRequests: [],
          favorites: []
        };
        this.save();
      }
    } catch (e) {
      console.error('Failed to load database, resetting to initial state', e);
      this.data = {
        cars: initialCars,
        users: initialUsers,
        bookings: [],
        loanRequests: [],
        favorites: []
      };
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  // Cars CRUD
  getCars(): Car[] {
    this.load();
    return this.data.cars;
  }

  getCarById(id: string): Car | undefined {
    this.load();
    return this.data.cars.find(c => c.id === id);
  }

  addCar(car: Omit<Car, 'id' | 'createdAt'>): Car {
    this.load();
    const newCar: Car = {
      ...car,
      id: `car-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.cars.push(newCar);
    this.save();
    return newCar;
  }

  updateCar(id: string, updatedCar: Partial<Car>): Car | undefined {
    this.load();
    const index = this.data.cars.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    this.data.cars[index] = {
      ...this.data.cars[index],
      ...updatedCar,
      id // prevent id changing
    };
    this.save();
    return this.data.cars[index];
  }

  deleteCar(id: string): boolean {
    this.load();
    const initialLen = this.data.cars.length;
    this.data.cars = this.data.cars.filter(c => c.id !== id);
    if (this.data.cars.length === initialLen) return false;
    // clean up favorites and bookings/loan requests related to this car
    this.data.favorites = this.data.favorites.filter(f => f.carId !== id);
    this.save();
    return true;
  }

  // Users CRUD
  getUsers(): User[] {
    this.load();
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    this.load();
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    this.load();
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    this.load();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // Bookings
  getBookings(): Booking[] {
    this.load();
    return this.data.bookings;
  }

  getBookingsByUserId(userId: string): Booking[] {
    this.load();
    return this.data.bookings.filter(b => b.userId === userId);
  }

  addBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking {
    this.load();
    const newBooking: Booking = {
      ...booking,
      id: `booking-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    this.data.bookings.push(newBooking);
    this.save();
    return newBooking;
  }

  updateBookingStatus(id: string, status: Booking['status']): Booking | undefined {
    this.load();
    const booking = this.data.bookings.find(b => b.id === id);
    if (!booking) return undefined;
    booking.status = status;
    this.save();
    return booking;
  }

  // Loan Requests
  getLoanRequests(): LoanRequest[] {
    this.load();
    return this.data.loanRequests;
  }

  getLoanRequestsByUserId(userId: string): LoanRequest[] {
    this.load();
    return this.data.loanRequests.filter(l => l.userId === userId);
  }

  addLoanRequest(req: Omit<LoanRequest, 'id' | 'createdAt' | 'status'>): LoanRequest {
    this.load();
    const newReq: LoanRequest = {
      ...req,
      id: `loan-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    this.data.loanRequests.push(newReq);
    this.save();
    return newReq;
  }

  updateLoanRequestStatus(id: string, status: LoanRequest['status']): LoanRequest | undefined {
    this.load();
    const request = this.data.loanRequests.find(l => l.id === id);
    if (!request) return undefined;
    request.status = status;
    this.save();
    return request;
  }

  // Favorites
  getFavoritesByUserId(userId: string): string[] {
    this.load();
    return this.data.favorites.filter(f => f.userId === userId).map(f => f.carId);
  }

  toggleFavorite(userId: string, carId: string): boolean {
    this.load();
    const index = this.data.favorites.findIndex(f => f.userId === userId && f.carId === carId);
    if (index === -1) {
      this.data.favorites.push({ userId, carId });
      this.save();
      return true; // Added
    } else {
      this.data.favorites.splice(index, 1);
      this.save();
      return false; // Removed
    }
  }
}

export const db = new LocalDb();
