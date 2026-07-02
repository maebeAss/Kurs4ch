import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Authentication middleware to extract user from Authorization header
const getUserId = (req: express.Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

// API ROUTES

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Simple demo logic: Find user, if not found, create one!
  // This makes testing extremely simple for the user and their teacher.
  let user = await db.getUserByEmail(email);
  if (!user) {
    // If it is admin@auto.ru, create with admin role
    const isAdmin = email.toLowerCase() === 'admin@auto.ru';
    user = await db.addUser({
      email: email.toLowerCase(),
      name: isAdmin ? 'Администратор Салона' : email.split('@')[0],
      role: isAdmin ? 'admin' : 'user'
    });
  }
  res.json({ user });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, name, role } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and Name are required' });
  }

  const existing = await db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
  }

  const user = await db.addUser({
    email: email.toLowerCase(),
    name,
    role: role || 'user'
  });
  res.json({ user });
});

app.get('/api/auth/me', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = await db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

// Cars endpoints
app.get('/api/cars', async (req, res) => {
  const cars = await db.getCars();
  res.json(cars);
});

app.get('/api/cars/:id', async (req, res) => {
  const car = await db.getCarById(req.params.id);
  if (!car) {
    return res.status(404).json({ error: 'Car not found' });
  }
  res.json(car);
});

app.post('/api/cars', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await db.getUserById(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can add cars' });
  }

  try {
    const newCar = await db.addCar(req.body);
    res.status(201).json(newCar);
  } catch (e) {
    res.status(400).json({ error: 'Invalid car data' });
  }
});

app.put('/api/cars/:id', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await db.getUserById(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can modify cars' });
  }

  const updated = await db.updateCar(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Car not found' });
  }
  res.json(updated);
});

app.delete('/api/cars/:id', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await db.getUserById(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete cars' });
  }

  const success = await db.deleteCar(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Car not found' });
  }
  res.json({ success: true });
});

// Bookings endpoints
app.get('/api/bookings', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.role === 'admin') {
    res.json(await db.getBookings());
  } else {
    res.json(await db.getBookingsByUserId(userId));
  }
});

app.post('/api/bookings', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { carId, date, timeSlot } = req.body;
  if (!carId || !date || !timeSlot) {
    return res.status(400).json({ error: 'Missing booking details' });
  }

  const car = await db.getCarById(carId);
  if (!car) return res.status(404).json({ error: 'Car not found' });

  const booking = await db.addBooking({
    userId,
    userName: user.name,
    userEmail: user.email,
    carId,
    carBrand: car.brand,
    carModel: car.model,
    date,
    timeSlot
  });

  res.status(201).json(booking);
});

app.put('/api/bookings/:id', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await db.getUserById(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can update bookings' });
  }

  const { status } = req.body;
  const updated = await db.updateBookingStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json(updated);
});

// Loan Requests endpoints
app.get('/api/loans', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.role === 'admin') {
    res.json(await db.getLoanRequests());
  } else {
    res.json(await db.getLoanRequestsByUserId(userId));
  }
});

app.post('/api/loans', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { carId, downPayment, loanTerm, interestRate, monthlyPayment } = req.body;
  if (!carId || downPayment === undefined || !loanTerm || !interestRate || !monthlyPayment) {
    return res.status(400).json({ error: 'Missing loan calculation details' });
  }

  const car = await db.getCarById(carId);
  if (!car) return res.status(404).json({ error: 'Car not found' });

  const loan = await db.addLoanRequest({
    userId,
    userName: user.name,
    userEmail: user.email,
    carId,
    carBrand: car.brand,
    carModel: car.model,
    carPrice: car.price,
    downPayment,
    loanTerm,
    interestRate,
    monthlyPayment
  });

  res.status(201).json(loan);
});

app.put('/api/loans/:id', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await db.getUserById(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can update loan requests' });
  }

  const { status } = req.body;
  const updated = await db.updateLoanRequestStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Loan request not found' });
  }
  res.json(updated);
});

// Favorites endpoints
app.get('/api/favorites', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  res.json(await db.getFavoritesByUserId(userId));
});

app.post('/api/favorites', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { carId } = req.body;
  if (!carId) return res.status(400).json({ error: 'Car ID required' });

  const isFavorited = await db.toggleFavorite(userId, carId);
  res.json({ isFavorited });
});




// Vite middleware / Static asset serving
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();
