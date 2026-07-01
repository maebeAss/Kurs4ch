import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { Car, User, Booking, LoanRequest, Favorite } from '../types.js';

dotenv.config();

const { Pool } = pg;
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

export interface IDatabase {
  getCars(): Promise<Car[]>;
  getCarById(id: string): Promise<Car | undefined>;
  addCar(car: Omit<Car, 'id' | 'createdAt'>): Promise<Car>;
  updateCar(id: string, updatedCar: Partial<Car>): Promise<Car | undefined>;
  deleteCar(id: string): Promise<boolean>;
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  getBookings(): Promise<Booking[]>;
  getBookingsByUserId(userId: string): Promise<Booking[]>;
  addBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking>;
  updateBookingStatus(id: string, status: Booking['status']): Promise<Booking | undefined>;
  getLoanRequests(): Promise<LoanRequest[]>;
  getLoanRequestsByUserId(userId: string): Promise<LoanRequest[]>;
  addLoanRequest(req: Omit<LoanRequest, 'id' | 'createdAt' | 'status'>): Promise<LoanRequest>;
  updateLoanRequestStatus(id: string, status: LoanRequest['status']): Promise<LoanRequest | undefined>;
  getFavoritesByUserId(userId: string): Promise<string[]>;
  toggleFavorite(userId: string, carId: string): Promise<boolean>;
}

export class LocalDb implements IDatabase {
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
  async getCars(): Promise<Car[]> {
    this.load();
    return this.data.cars;
  }

  async getCarById(id: string): Promise<Car | undefined> {
    this.load();
    return this.data.cars.find(c => c.id === id);
  }

  async addCar(car: Omit<Car, 'id' | 'createdAt'>): Promise<Car> {
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

  async updateCar(id: string, updatedCar: Partial<Car>): Promise<Car | undefined> {
    this.load();
    const index = this.data.cars.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    this.data.cars[index] = {
      ...this.data.cars[index],
      ...updatedCar,
      id
    };
    this.save();
    return this.data.cars[index];
  }

  async deleteCar(id: string): Promise<boolean> {
    this.load();
    const initialLen = this.data.cars.length;
    this.data.cars = this.data.cars.filter(c => c.id !== id);
    if (this.data.cars.length === initialLen) return false;
    this.data.favorites = this.data.favorites.filter(f => f.carId !== id);
    this.save();
    return true;
  }

  // Users CRUD
  async getUsers(): Promise<User[]> {
    this.load();
    return this.data.users;
  }

  async getUserById(id: string): Promise<User | undefined> {
    this.load();
    return this.data.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    this.load();
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
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
  async getBookings(): Promise<Booking[]> {
    this.load();
    return this.data.bookings;
  }

  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    this.load();
    return this.data.bookings.filter(b => b.userId === userId);
  }

  async addBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> {
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

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking | undefined> {
    this.load();
    const booking = this.data.bookings.find(b => b.id === id);
    if (!booking) return undefined;
    booking.status = status;
    this.save();
    return booking;
  }

  // Loan Requests
  async getLoanRequests(): Promise<LoanRequest[]> {
    this.load();
    return this.data.loanRequests;
  }

  async getLoanRequestsByUserId(userId: string): Promise<LoanRequest[]> {
    this.load();
    return this.data.loanRequests.filter(l => l.userId === userId);
  }

  async addLoanRequest(req: Omit<LoanRequest, 'id' | 'createdAt' | 'status'>): Promise<LoanRequest> {
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

  async updateLoanRequestStatus(id: string, status: LoanRequest['status']): Promise<LoanRequest | undefined> {
    this.load();
    const request = this.data.loanRequests.find(l => l.id === id);
    if (!request) return undefined;
    request.status = status;
    this.save();
    return request;
  }

  // Favorites
  async getFavoritesByUserId(userId: string): Promise<string[]> {
    this.load();
    return this.data.favorites.filter(f => f.userId === userId).map(f => f.carId);
  }

  async toggleFavorite(userId: string, carId: string): Promise<boolean> {
    this.load();
    const index = this.data.favorites.findIndex(f => f.userId === userId && f.carId === carId);
    if (index === -1) {
      this.data.favorites.push({ userId, carId });
      this.save();
      return true;
    } else {
      this.data.favorites.splice(index, 1);
      this.save();
      return false;
    }
  }
}

export class PgDb implements IDatabase {
  private pool: pg.Pool;
  private initialized = false;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  }

  async init() {
    if (this.initialized) return;
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          email VARCHAR(150) UNIQUE NOT NULL,
          name VARCHAR(150) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          created_at VARCHAR(100) NOT NULL
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS cars (
          id VARCHAR(100) PRIMARY KEY,
          brand VARCHAR(100) NOT NULL,
          model VARCHAR(100) NOT NULL,
          year INT NOT NULL,
          price BIGINT NOT NULL,
          mileage INT NOT NULL,
          engine_volume VARCHAR(100) NOT NULL,
          engine_power INT NOT NULL,
          fuel_type VARCHAR(100) NOT NULL,
          transmission VARCHAR(100) NOT NULL,
          drive_type VARCHAR(100) NOT NULL,
          body_style VARCHAR(100) NOT NULL,
          color VARCHAR(100) NOT NULL,
          condition VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          images TEXT NOT NULL,
          specs TEXT NOT NULL,
          created_at VARCHAR(100) NOT NULL
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          user_name VARCHAR(150) NOT NULL,
          user_email VARCHAR(150) NOT NULL,
          car_id VARCHAR(100) NOT NULL,
          car_brand VARCHAR(100) NOT NULL,
          car_model VARCHAR(100) NOT NULL,
          date VARCHAR(100) NOT NULL,
          time_slot VARCHAR(100) NOT NULL,
          status VARCHAR(100) NOT NULL DEFAULT 'Pending',
          created_at VARCHAR(100) NOT NULL
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS loan_requests (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          user_name VARCHAR(150) NOT NULL,
          user_email VARCHAR(150) NOT NULL,
          car_id VARCHAR(100) NOT NULL,
          car_brand VARCHAR(100) NOT NULL,
          car_model VARCHAR(100) NOT NULL,
          car_price BIGINT NOT NULL,
          down_payment BIGINT NOT NULL,
          loan_term INT NOT NULL,
          interest_rate NUMERIC NOT NULL,
          monthly_payment BIGINT NOT NULL,
          status VARCHAR(100) NOT NULL DEFAULT 'Pending',
          created_at VARCHAR(100) NOT NULL
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS favorites (
          user_id VARCHAR(100) NOT NULL,
          car_id VARCHAR(100) NOT NULL,
          PRIMARY KEY (user_id, car_id)
        )
      `);

      // Seed users
      const usersCheck = await this.pool.query('SELECT COUNT(*) FROM users');
      if (parseInt(usersCheck.rows[0].count, 10) === 0) {
        console.log('Seeding initial users into PostgreSQL...');
        for (const u of initialUsers) {
          await this.pool.query(
            'INSERT INTO users (id, email, name, role, created_at) VALUES ($1, $2, $3, $4, $5)',
            [u.id, u.email, u.name, u.role, u.createdAt]
          );
        }
      }

      // Seed cars
      const carsCheck = await this.pool.query('SELECT COUNT(*) FROM cars');
      if (parseInt(carsCheck.rows[0].count, 10) === 0) {
        console.log('Seeding initial cars into PostgreSQL...');
        for (const c of initialCars) {
          await this.pool.query(
            `INSERT INTO cars (id, brand, model, year, price, mileage, engine_volume, engine_power, fuel_type, transmission, drive_type, body_style, color, condition, description, images, specs, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
            [
              c.id, c.brand, c.model, c.year, c.price, c.mileage, 
              c.engineVolume, c.enginePower, c.fuelType, c.transmission, 
              c.driveType, c.bodyStyle, c.color, c.condition, c.description, 
              JSON.stringify(c.images), JSON.stringify(c.specs), c.createdAt
            ]
          );
        }
      }

      this.initialized = true;
      console.log('PostgreSQL Database successfully initialized and seeded.');
    } catch (err) {
      console.error('Failed to initialize PostgreSQL tables:', err);
    }
  }

  async getCars(): Promise<Car[]> {
    await this.init();
    const res = await this.pool.query('SELECT * FROM cars ORDER BY created_at DESC');
    return res.rows.map(row => ({
      id: row.id,
      brand: row.brand,
      model: row.model,
      year: row.year,
      price: Number(row.price),
      mileage: row.mileage,
      engineVolume: row.engine_volume,
      enginePower: row.engine_power,
      fuelType: row.fuel_type,
      transmission: row.transmission,
      driveType: row.drive_type,
      bodyStyle: row.body_style,
      color: row.color,
      condition: row.condition,
      description: row.description,
      images: JSON.parse(row.images),
      specs: JSON.parse(row.specs),
      createdAt: row.created_at
    }));
  }

  async getCarById(id: string): Promise<Car | undefined> {
    await this.init();
    const res = await this.pool.query('SELECT * FROM cars WHERE id = $1', [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      brand: row.brand,
      model: row.model,
      year: row.year,
      price: Number(row.price),
      mileage: row.mileage,
      engineVolume: row.engine_volume,
      enginePower: row.engine_power,
      fuelType: row.fuel_type,
      transmission: row.transmission,
      driveType: row.drive_type,
      bodyStyle: row.body_style,
      color: row.color,
      condition: row.condition,
      description: row.description,
      images: JSON.parse(row.images),
      specs: JSON.parse(row.specs),
      createdAt: row.created_at
    };
  }

  async addCar(car: Omit<Car, 'id' | 'createdAt'>): Promise<Car> {
    await this.init();
    const id = `car-${Date.now()}`;
    const createdAt = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO cars (id, brand, model, year, price, mileage, engine_volume, engine_power, fuel_type, transmission, drive_type, body_style, color, condition, description, images, specs, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        id, car.brand, car.model, car.year, car.price, car.mileage,
        car.engineVolume, car.enginePower, car.fuelType, car.transmission,
        car.driveType, car.bodyStyle, car.color, car.condition, car.description,
        JSON.stringify(car.images), JSON.stringify(car.specs), createdAt
      ]
    );
    return { ...car, id, createdAt };
  }

  async updateCar(id: string, updatedCar: Partial<Car>): Promise<Car | undefined> {
    await this.init();
    const current = await this.getCarById(id);
    if (!current) return undefined;

    const merged = { ...current, ...updatedCar };
    await this.pool.query(
      `UPDATE cars SET brand=$1, model=$2, year=$3, price=$4, mileage=$5, engine_volume=$6, engine_power=$7, fuel_type=$8, transmission=$9, drive_type=$10, body_style=$11, color=$12, condition=$13, description=$14, images=$15, specs=$16 WHERE id=$17`,
      [
        merged.brand, merged.model, merged.year, merged.price, merged.mileage,
        merged.engineVolume, merged.enginePower, merged.fuelType, merged.transmission,
        merged.driveType, merged.bodyStyle, merged.color, merged.condition, merged.description,
        JSON.stringify(merged.images), JSON.stringify(merged.specs), id
      ]
    );
    return merged;
  }

  async deleteCar(id: string): Promise<boolean> {
    await this.init();
    const res = await this.pool.query('DELETE FROM cars WHERE id = $1', [id]);
    await this.pool.query('DELETE FROM favorites WHERE car_id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async getUsers(): Promise<User[]> {
    await this.init();
    const res = await this.pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return res.rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as 'user' | 'admin',
      createdAt: row.created_at
    }));
  }

  async getUserById(id: string): Promise<User | undefined> {
    await this.init();
    const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as 'user' | 'admin',
      createdAt: row.created_at
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.init();
    const res = await this.pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as 'user' | 'admin',
      createdAt: row.created_at
    };
  }

  async addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await this.init();
    const id = `user-${Date.now()}`;
    const createdAt = new Date().toISOString();
    await this.pool.query(
      'INSERT INTO users (id, email, name, role, created_at) VALUES ($1, $2, $3, $4, $5)',
      [id, user.email, user.name, user.role, createdAt]
    );
    return { ...user, id, createdAt };
  }

  async getBookings(): Promise<Booking[]> {
    await this.init();
    const res = await this.pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    return res.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      carId: row.car_id,
      carBrand: row.car_brand,
      carModel: row.car_model,
      date: row.date,
      timeSlot: row.time_slot,
      status: row.status as Booking['status'],
      createdAt: row.created_at
    }));
  }

  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    await this.init();
    const res = await this.pool.query('SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      carId: row.car_id,
      carBrand: row.car_brand,
      carModel: row.car_model,
      date: row.date,
      timeSlot: row.time_slot,
      status: row.status as Booking['status'],
      createdAt: row.created_at
    }));
  }

  async addBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> {
    await this.init();
    const id = `booking-${Date.now()}`;
    const status = 'Pending';
    const createdAt = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO bookings (id, user_id, user_name, user_email, car_id, car_brand, car_model, date, time_slot, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id, booking.userId, booking.userName, booking.userEmail, booking.carId,
        booking.carBrand, booking.carModel, booking.date, booking.timeSlot, status, createdAt
      ]
    );
    return { ...booking, id, status, createdAt };
  }

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking | undefined> {
    await this.init();
    const res = await this.pool.query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      carId: row.car_id,
      carBrand: row.car_brand,
      carModel: row.car_model,
      date: row.date,
      timeSlot: row.time_slot,
      status: row.status as Booking['status'],
      createdAt: row.created_at
    };
  }

  async getLoanRequests(): Promise<LoanRequest[]> {
    await this.init();
    const res = await this.pool.query('SELECT * FROM loan_requests ORDER BY created_at DESC');
    return res.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      carId: row.car_id,
      carBrand: row.car_brand,
      carModel: row.car_model,
      carPrice: Number(row.car_price),
      downPayment: Number(row.down_payment),
      loanTerm: row.loan_term,
      interestRate: Number(row.interest_rate),
      monthlyPayment: Number(row.monthly_payment),
      status: row.status as LoanRequest['status'],
      createdAt: row.created_at
    }));
  }

  async getLoanRequestsByUserId(userId: string): Promise<LoanRequest[]> {
    await this.init();
    const res = await this.pool.query('SELECT * FROM loan_requests WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      carId: row.car_id,
      carBrand: row.car_brand,
      carModel: row.car_model,
      carPrice: Number(row.car_price),
      downPayment: Number(row.down_payment),
      loanTerm: row.loan_term,
      interestRate: Number(row.interest_rate),
      monthlyPayment: Number(row.monthly_payment),
      status: row.status as LoanRequest['status'],
      createdAt: row.created_at
    }));
  }

  async addLoanRequest(req: Omit<LoanRequest, 'id' | 'createdAt' | 'status'>): Promise<LoanRequest> {
    await this.init();
    const id = `loan-${Date.now()}`;
    const status = 'Pending';
    const createdAt = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO loan_requests (id, user_id, user_name, user_email, car_id, car_brand, car_model, car_price, down_payment, loan_term, interest_rate, monthly_payment, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id, req.userId, req.userName, req.userEmail, req.carId, req.carBrand, req.carModel,
        req.carPrice, req.downPayment, req.loanTerm, req.interestRate, req.monthlyPayment, status, createdAt
      ]
    );
    return { ...req, id, status, createdAt };
  }

  async updateLoanRequestStatus(id: string, status: LoanRequest['status']): Promise<LoanRequest | undefined> {
    await this.init();
    const res = await this.pool.query('UPDATE loan_requests SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      carId: row.car_id,
      carBrand: row.car_brand,
      carModel: row.car_model,
      carPrice: Number(row.car_price),
      downPayment: Number(row.down_payment),
      loanTerm: row.loan_term,
      interestRate: Number(row.interest_rate),
      monthlyPayment: Number(row.monthly_payment),
      status: row.status as LoanRequest['status'],
      createdAt: row.created_at
    };
  }

  async getFavoritesByUserId(userId: string): Promise<string[]> {
    await this.init();
    const res = await this.pool.query('SELECT car_id FROM favorites WHERE user_id = $1', [userId]);
    return res.rows.map(row => row.car_id);
  }

  async toggleFavorite(userId: string, carId: string): Promise<boolean> {
    await this.init();
    const check = await this.pool.query('SELECT 1 FROM favorites WHERE user_id = $1 AND car_id = $2', [userId, carId]);
    if (check.rows.length === 0) {
      await this.pool.query('INSERT INTO favorites (user_id, car_id) VALUES ($1, $2)', [userId, carId]);
      return true;
    } else {
      await this.pool.query('DELETE FROM favorites WHERE user_id = $1 AND car_id = $2', [userId, carId]);
      return false;
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;
export const db: IDatabase = databaseUrl ? new PgDb(databaseUrl) : new LocalDb();
