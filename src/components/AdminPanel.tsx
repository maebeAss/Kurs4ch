import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Calendar, Landmark, Check, X, ShieldAlert, ListFilter } from 'lucide-react';
import { Car, Booking, LoanRequest } from '../types.ts';

interface AdminPanelProps {
  cars: Car[];
  bookings: Booking[];
  loans: LoanRequest[];
  onAddCar: (car: Omit<Car, 'id' | 'createdAt'>) => Promise<boolean>;
  onUpdateCar: (id: string, car: Partial<Car>) => Promise<boolean>;
  onDeleteCar: (id: string) => Promise<boolean>;
  onUpdateBookingStatus: (id: string, status: Booking['status']) => Promise<boolean>;
  onUpdateLoanStatus: (id: string, status: LoanRequest['status']) => Promise<boolean>;
}

export default function AdminPanel({
  cars,
  bookings,
  loans,
  onAddCar,
  onUpdateCar,
  onDeleteCar,
  onUpdateBookingStatus,
  onUpdateLoanStatus
}: AdminPanelProps) {
  // Admin tabs
  const [adminTab, setAdminTab] = useState<'catalog' | 'bookings' | 'loans'>('catalog');

  // Form toggles
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);

  // Form fields
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [price, setPrice] = useState<number>(3000000);
  const [mileage, setMileage] = useState<number>(0);
  const [engineVolume, setEngineVolume] = useState('2.0L');
  const [enginePower, setEnginePower] = useState<number>(150);
  const [fuelType, setFuelType] = useState<Car['fuelType']>('Gasoline');
  const [transmission, setTransmission] = useState<Car['transmission']>('Automatic');
  const [driveType, setDriveType] = useState<Car['driveType']>('FWD');
  const [bodyStyle, setBodyStyle] = useState<Car['bodyStyle']>('Sedan');
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState<Car['condition']>('New');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [specsInput, setSpecsInput] = useState('');

  // Form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const carData = {
      brand,
      model,
      year: Number(year),
      price: Number(price),
      mileage: Number(mileage),
      engineVolume,
      enginePower: Number(enginePower),
      fuelType,
      transmission,
      driveType,
      bodyStyle,
      color,
      condition,
      description,
      images: [imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'],
      specs: specsInput.split(',').map(s => s.trim()).filter(Boolean)
    };

    if (editingCarId) {
      const success = await onUpdateCar(editingCarId, carData);
      if (success) {
        setEditingCarId(null);
        resetForm();
      }
    } else {
      const success = await onAddCar(carData);
      if (success) {
        setShowAddForm(false);
        resetForm();
      }
    }
  };

  const handleEditClick = (car: Car) => {
    setEditingCarId(car.id);
    setBrand(car.brand);
    setModel(car.model);
    setYear(car.year);
    setPrice(car.price);
    setMileage(car.mileage);
    setEngineVolume(car.engineVolume);
    setEnginePower(car.enginePower);
    setFuelType(car.fuelType);
    setTransmission(car.transmission);
    setDriveType(car.driveType);
    setBodyStyle(car.bodyStyle);
    setColor(car.color);
    setCondition(car.condition);
    setDescription(car.description);
    setImageUrl(car.images[0]);
    setSpecsInput(car.specs.join(', '));
    setShowAddForm(true); // Re-use add form structure
  };

  const resetForm = () => {
    setBrand('');
    setModel('');
    setYear(2024);
    setPrice(3000000);
    setMileage(0);
    setEngineVolume('2.0L');
    setEnginePower(150);
    setFuelType('Gasoline');
    setTransmission('Automatic');
    setDriveType('FWD');
    setBodyStyle('Sedan');
    setColor('');
    setCondition('New');
    setDescription('');
    setImageUrl('');
    setSpecsInput('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-500" />
            Административная панель
          </h2>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            Система управления товарными позициями (каталогом), подтверждением тест-драйвов и рассмотрением кредитов.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setAdminTab('catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminTab === 'catalog' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Управление автопарком
          </button>
          <button
            onClick={() => setAdminTab('bookings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminTab === 'bookings' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Тест-драйвы ({bookings.length})
          </button>
          <button
            onClick={() => setAdminTab('loans')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminTab === 'loans' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Заявки на Кредит ({loans.length})
          </button>
        </div>
      </div>

      {/* Main Admin Section */}
      {adminTab === 'catalog' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
            <h3 className="font-bold text-slate-800 text-base">Список автомобилей в наличии ({cars.length})</h3>
            <button
              onClick={() => {
                if (showAddForm) {
                  setEditingCarId(null);
                  resetForm();
                }
                setShowAddForm(!showAddForm);
              }}
              className="inline-flex items-center space-x-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddForm ? 'Скрыть форму' : 'Добавить машину'}</span>
            </button>
          </div>

          {/* Form Overlay/Display */}
          {showAddForm && (
            <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
              <h4 className="font-bold text-slate-800 text-base col-span-1 md:col-span-3 border-b pb-2">
                {editingCarId ? 'Редактировать параметры автомобиля' : 'Внести новый автомобиль в базу данных'}
              </h4>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Марка</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="BMW, Mercedes-Benz, Audi..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Модель</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="S 500, M5 Competition..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Год выпуска</label>
                <input
                  type="number"
                  required
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Цена (₽)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Пробег (км)</label>
                <input
                  type="number"
                  required
                  value={mileage}
                  onChange={e => setMileage(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Состояние</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 bg-white"
                >
                  <option value="New">Новый</option>
                  <option value="Used">С пробегом (Б/У)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Тип кузова</label>
                <select
                  value={bodyStyle}
                  onChange={e => setBodyStyle(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 bg-white"
                >
                  <option value="Sedan">Седан</option>
                  <option value="SUV">Внедорожник/SUV</option>
                  <option value="Coupe">Купе</option>
                  <option value="Hatchback">Хэтчбек</option>
                  <option value="Wagon">Универсал</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Двигатель (напр. 3.0L / Electric)</label>
                <input
                  type="text"
                  required
                  value={engineVolume}
                  onChange={e => setEngineVolume(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Мощность (л.с.)</label>
                <input
                  type="number"
                  required
                  value={enginePower}
                  onChange={e => setEnginePower(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Топливо</label>
                <select
                  value={fuelType}
                  onChange={e => setFuelType(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 bg-white"
                >
                  <option value="Gasoline">Бензин</option>
                  <option value="Diesel">Дизель</option>
                  <option value="Electric">Электро</option>
                  <option value="Hybrid">Гибрид</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Коробка передач</label>
                <select
                  value={transmission}
                  onChange={e => setTransmission(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 bg-white"
                >
                  <option value="Automatic">Автомат</option>
                  <option value="Manual">Механика</option>
                  <option value="Robotic">Робот</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Привод</label>
                <select
                  value={driveType}
                  onChange={e => setDriveType(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 bg-white"
                >
                  <option value="FWD">Передний (FWD)</option>
                  <option value="RWD">Задний (RWD)</option>
                  <option value="AWD">Полный (AWD)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Цвет кузова</label>
                <input
                  type="text"
                  required
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  placeholder="Магический Синий Metallic..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ссылка на фото (Unsplash URL)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Фишки комплектации (через запятую)</label>
                <input
                  type="text"
                  value={specsInput}
                  onChange={e => setSpecsInput(e.target.value)}
                  placeholder="Камера 360, Панорама, Кожа..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="col-span-1 md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Описание автомобиля</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Введите развернутое описание автомобиля..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="col-span-1 md:col-span-3 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCarId(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  {editingCarId ? 'Обновить данные' : 'Сохранить запись'}
                </button>
              </div>
            </form>
          )}

          {/* Cars List Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600 border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Модель</th>
                    <th className="p-4 text-right">Цена</th>
                    <th className="p-4">Состояние</th>
                    <th className="p-4">Двигатель</th>
                    <th className="p-4">Кузов</th>
                    <th className="p-4 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map(car => (
                    <tr key={car.id} className="border-b border-slate-100 hover:bg-slate-50/30">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img src={car.images[0]} alt="" referrerPolicy="no-referrer" className="w-12 h-8 object-cover rounded" />
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">{car.brand}</span>
                            <span className="font-bold text-slate-800">{car.model}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold font-mono text-slate-900">{car.price.toLocaleString('ru-RU')} ₽</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          car.condition === 'New' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {car.condition === 'New' ? 'Новый' : `Б/У • ${car.mileage.toLocaleString('ru-RU')} км`}
                        </span>
                      </td>
                      <td className="p-4 font-semibold font-mono text-slate-600">{car.engineVolume} ({car.enginePower} л.с.) • {car.transmission === 'Automatic' ? 'АКПП' : 'МКПП'}</td>
                      <td className="p-4 font-semibold text-slate-700">{car.bodyStyle}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleEditClick(car)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                            title="Редактировать"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Удалить ${car.brand} ${car.model} из базы автосалона?`)) {
                                onDeleteCar(car.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Входящие бронирования тест-драйвов ({bookings.length})
            </h3>
          </div>
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Клиент</th>
                    <th className="p-4">Автомобиль</th>
                    <th className="p-4">Дата и Слот</th>
                    <th className="p-4">Статус</th>
                    <th className="p-4 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(book => (
                    <tr key={book.id} className="border-b border-slate-100 hover:bg-slate-50/30">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{book.userName}</div>
                        <span className="text-[10px] text-slate-400 font-mono block">{book.userEmail}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700">{book.carBrand} {book.carModel}</div>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-600">
                        {book.date} • {book.timeSlot}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          book.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          book.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          book.status === 'Completed' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                          'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                        }`}>
                          {book.status === 'Confirmed' ? 'Подтвержден' :
                           book.status === 'Cancelled' ? 'Отменен' :
                           book.status === 'Completed' ? 'Проведен' : 'Ожидание'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-1.5">
                          {book.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => onUpdateBookingStatus(book.id, 'Confirmed')}
                                className="p-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded font-bold"
                                title="Подтвердить"
                              >
                                <Check className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => onUpdateBookingStatus(book.id, 'Cancelled')}
                                className="p-1 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded font-bold"
                                title="Отменить"
                              >
                                <X className="h-4.5 w-4.5" />
                              </button>
                            </>
                          )}
                          {book.status === 'Confirmed' && (
                            <button
                              onClick={() => onUpdateBookingStatus(book.id, 'Completed')}
                              className="px-2 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded font-bold text-[10px] tracking-wide"
                            >
                              Отметить как проведенный
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400">Нет входящих бронирований.</div>
          )}
        </div>
      )}

      {adminTab === 'loans' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
              <Landmark className="h-5 w-5 text-amber-500" />
              Кредитные заявки на одобрение ({loans.length})
            </h3>
          </div>
          {loans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Клиент</th>
                    <th className="p-4">Автомобиль</th>
                    <th className="p-4 text-right">Расчет кредита</th>
                    <th className="p-4">Статус</th>
                    <th className="p-4 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map(loan => (
                    <tr key={loan.id} className="border-b border-slate-100 hover:bg-slate-50/30">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{loan.userName}</div>
                        <span className="text-[10px] text-slate-400 font-mono block">{loan.userEmail}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700">{loan.carBrand} {loan.carModel}</div>
                        <span className="text-[10px] text-slate-400 font-mono block">Цена: {loan.carPrice.toLocaleString('ru-RU')} ₽</span>
                      </td>
                      <td className="p-4 text-right space-y-0.5">
                        <div className="font-bold font-mono text-slate-800">{(loan.carPrice - loan.downPayment).toLocaleString('ru-RU')} ₽</div>
                        <div className="text-[10px] text-slate-400 font-mono">{loan.loanTerm} мес. @ {loan.interestRate}% ставка</div>
                        <div className="text-[10px] font-bold text-indigo-600 font-mono">{loan.monthlyPayment.toLocaleString('ru-RU')} ₽/мес.</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          loan.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                        }`}>
                          {loan.status === 'Approved' ? 'Одобрен' :
                           loan.status === 'Rejected' ? 'Отклонен' : 'Ожидание'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-1.5">
                          {loan.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => onUpdateLoanStatus(loan.id, 'Approved')}
                                className="p-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded font-bold"
                                title="Одобрить"
                              >
                                <Check className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => onUpdateLoanStatus(loan.id, 'Rejected')}
                                className="p-1 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded font-bold"
                                title="Отклонить"
                              >
                                <X className="h-4.5 w-4.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400">Нет кредитных заявок для рассмотрения.</div>
          )}
        </div>
      )}
    </div>
  );
}
