import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini API successfully initialized.');
  } catch (error) {
    console.error('Failed to initialize Gemini API:', error);
  }
} else {
  console.log('Gemini API key is missing or not configured. AI assistant will run in simulation mode.');
}

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

// AI Assistant Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  // Retrieve current catalog to use as context for Gemini
  const cars = await db.getCars();
  const catalogContext = cars.map(c => 
    `- ${c.brand} ${c.model} (${c.year} г.в.): Цена ${c.price.toLocaleString('ru-RU')} ₽, Пробег ${c.mileage.toLocaleString('ru-RU')} км, Двигатель ${c.engineVolume} (${c.enginePower} л.с.), Топливо: ${c.fuelType}, КПП: ${c.transmission}, Привод: ${c.driveType}, Кузов: ${c.bodyStyle}, Цвет: ${c.color}, Состояние: ${c.condition}. Особенности: ${c.specs.join(', ')}`
  ).join('\n');

  const systemInstruction = `Вы являетесь опытным, приветливым и высококлассным AI-консультантом автосалона "AutoCatalog" (Автокаталог). 
Ваша цель — помочь клиенту выбрать идеальный автомобиль, сравнить интересующие модели, рассчитать кредит или ответить на любые вопросы о машинах из нашего каталога.

Вот наш актуальный каталог автомобилей в наличии на складе автосалона:
${catalogContext}

Правила общения:
1. Отвечайте строго на русском языке, вежливо и профессионально.
2. При рекомендации машин ссылайтесь ТОЛЬКО на автомобили из нашего каталога выше. Если подходящих машин нет, предложите наиболее близкие варианты из нашего каталога и объясните почему.
3. Помогайте пользователю сравнить технические характеристики моделей.
4. Вы можете рассчитать ориентировочный кредит. Например, формула платежа: (Сумма кредита * (Ставка / 12 / 100)) / (1 - (1 + Ставка / 12 / 100)^(-Срок_в_месяцах)). Сумма кредита = Цена машины - Первоначальный взнос.
5. Предлагайте записаться на тест-драйв, если пользователь проявляет интерес к конкретной машине.
6. Отвечайте структурировано, используйте списки и выделение жирным шрифтом для удобства чтения.`;

  if (ai) {
    try {
      // Map frontend messages into Gemini SDK Chat messages format
      // Only send the last user message and the history
      const formattedHistory = messages.slice(0, messages.length - 1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.parts[0].text }]
      }));

      const latestMessage = messages[messages.length - 1].parts[0].text;

      const chat = ai.chats.create({
        model: 'gemini-3.5-flash',
        config: {
          systemInstruction,
        },
        history: formattedHistory
      });

      const response = await chat.sendMessage({ message: latestMessage });
      res.json({ text: response.text });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.status(500).json({ error: 'Произошла ошибка при обращении к AI-консультанту.' });
    }
  } else {
    // Simulated Mode if API Key is not set up
    const latestUserMsg = messages[messages.length - 1].parts[0].text.toLowerCase();
    let reply = `Здравствуйте! К сожалению, AI-ассистент сейчас работает в режиме симуляции (ключ API не настроен). \n\nТем не менее, я вижу, что вы интересуетесь автомобилями. В нашем автосалоне представлен отличный ассортимент премиальных моделей, включая **Mercedes-Benz S-Class**, **BMW M5 Competition**, **Porsche 911** и инновационный электрокар **Tesla Model S Plaid**.\n\nКакую модель вы хотели бы обсудить подробнее? Я могу помочь вам рассчитать кредит или оформить тест-драйв!`;
    
    if (latestUserMsg.includes('бмв') || latestUserMsg.includes('bmw')) {
      reply = `Отличный выбор! Наш **BMW M5 Competition (2023)** — это ураганный седан с двигателем 4.4L V8 на 625 л.с. и полным приводом xDrive. \n\nЦена составляет **14 500 000 ₽**. Пробег всего 12 000 км. Машина оснащена карбон-керамическими тормозами, лазерными фарами и спортивным выхлопом. Желаете рассчитать кредит на эту модель или записаться на тест-драйв?`;
    } else if (latestUserMsg.includes('мерс') || latestUserMsg.includes('mercedes') || latestUserMsg.includes('s-class')) {
      reply = `**Mercedes-Benz S-Class S 500 (2024)** — это эталон представительского класса. Машина абсолютно новая (без пробега), оснащена 3.0-литровым двигателем мощностью 435 л.с., пневмоподвеской AIRMATIC и премиальной акустикой Burmester 3D.\n\nЦена: **18 900 000 ₽**. Идеальный выбор для комфортных поездок. Могу рассчитать ежемесячный платеж по автокредиту для вас!`;
    } else if (latestUserMsg.includes('tesla') || latestUserMsg.includes('тесла')) {
      reply = `**Tesla Model S Plaid (2023)** — электрический монстр мощностью 1020 л.с.! Разгоняется до 100 км/ч за невероятные 2.1 секунды. Машина имеет запас хода около 600 км и оснащена системой полного автопилота FSD.\n\nСтоимость машины: **13 200 000 ₽**. Это будущее автопрома, доступное уже сегодня. Оформим заявку на кредитный расчет?`;
    } else if (latestUserMsg.includes('кредит') || latestUserMsg.includes('расчет') || latestUserMsg.includes('калькулятор')) {
      reply = `Конечно! Наш кредитный калькулятор на сайте позволяет рассчитать платежи под выгодную ставку от 12.5% годовых. \n\nНапример, для **BMW M5** стоимостью **14 500 000 ₽** при первоначальном взносе **30% (4 350 000 ₽)** и сроке на **5 лет (60 месяцев)** ежемесячный платеж составит около **227 000 ₽/мес**. \n\nВы можете перейти во вкладку **«Кредитный калькулятор»**, чтобы подобрать комфортные для вас условия и отправить онлайн-заявку на одобрение!`;
    } else if (latestUserMsg.includes('сравн') || latestUserMsg.includes('лучше')) {
      reply = `Для детального сравнения характеристик рекомендую воспользоваться нашей вкладкой **«Сравнение моделей»**. Вы сможете добавить туда любые автомобили из нашего каталога (например, спортивный **Porsche 911** и мощный седан **BMW M5**) и сравнить их характеристики лицом к лицу:\n\n- Мощность: BMW M5 (625 л.с.) против Porsche 911 (450 л.с.)\n- Тип привода: Полный AWD у BMW против заднего RWD у Porsche\n- Вместительность: Полный 5-местный салон у BMW против классической спортивной компоновки 2+2 у Porsche.`;
    }

    // Delay a bit to simulate network
    await new Promise(resolve => setTimeout(resolve, 600));
    res.json({ text: reply });
  }
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
