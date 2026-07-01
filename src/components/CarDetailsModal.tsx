import React, { useState } from 'react';
import { X, Calendar, Calculator, Check, AlertCircle, Sparkles, Car } from 'lucide-react';
import { Car as CarType, User } from '../types.ts';

interface CarDetailsModalProps {
  car: CarType | null;
  onClose: () => void;
  user: User | null;
  onOpenLoginModal: () => void;
  onGoToCredit: (car: CarType) => void;
  onBookTestDrive: (carId: string, date: string, timeSlot: string) => Promise<boolean>;
}

export default function CarDetailsModal({
  car,
  onClose,
  user,
  onOpenLoginModal,
  onGoToCredit,
  onBookTestDrive
}: CarDetailsModalProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [testDriveDate, setTestDriveDate] = useState('');
  const [testDriveTime, setTestDriveTime] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  if (!car) return null;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenLoginModal();
      return;
    }

    if (!testDriveDate || !testDriveTime) {
      setBookingError('Пожалуйста, выберите дату и время');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');
    try {
      const success = await onBookTestDrive(car.id, testDriveDate, testDriveTime);
      if (success) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingSuccess(false);
          setTestDriveDate('');
          setTestDriveTime('');
        }, 5000);
      } else {
        setBookingError('Ошибка при бронировании тест-драйва. Попробуйте еще раз.');
      }
    } catch (err) {
      setBookingError('Произошла сетевая ошибка.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    '10:00 - 11:00',
    '11:30 - 12:30',
    '13:00 - 14:00',
    '14:30 - 15:30',
    '16:00 - 17:00',
    '17:30 - 18:30'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-slate-900/60 text-white hover:bg-slate-900 p-2 rounded-full backdrop-blur transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Images & Quick Badges */}
        <div className="w-full md:w-1/2 bg-slate-950 flex flex-col justify-between p-4 md:p-6 min-h-[300px] md:min-h-0">
          <div className="flex-1 flex items-center justify-center relative aspect-video md:aspect-auto w-full">
            {!car.images || !car.images[activeImage] || imageErrors[activeImage] ? (
              /* Beautiful luxury custom vector fallback placeholder */
              <div className="w-full h-full min-h-[250px] bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center rounded-xl relative select-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_60%)]" />
                <Car className="h-14 w-14 text-amber-500/80 mb-2 stroke-[1.5] relative z-10" />
                <span className="text-[10px] uppercase tracking-widest font-black text-amber-500/80 relative z-10">{car.brand}</span>
                <span className="text-sm font-semibold text-slate-300 relative z-10 truncate max-w-[90%]">{car.model}</span>
                <span className="text-xs text-slate-500 mt-1 relative z-10">Изображение недоступно</span>
              </div>
            ) : (
              <img
                src={car.images[activeImage]}
                alt={`${car.brand} ${car.model}`}
                referrerPolicy="no-referrer"
                className="max-h-[350px] w-full object-contain rounded-xl"
                onError={() => {
                  setImageErrors(prev => ({ ...prev, [activeImage]: true }));
                }}
              />
            )}
          </div>

          {/* Thumbnail indicators */}
          {car.images.length > 1 && (
            <div className="flex gap-2 justify-center mt-4">
              {car.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-amber-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between max-h-[90vh] md:max-h-none">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">{car.brand}</span>
              <h2 className="heading-display text-2xl md:text-3xl font-bold text-slate-900">{car.model}</h2>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {car.price.toLocaleString('ru-RU')} ₽
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  car.condition === 'New' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {car.condition === 'New' ? 'Новый' : 'С пробегом'}
                </span>
              </div>
            </div>

            {/* Main specs list */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Технические характеристики</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-b border-slate-100 py-3">
                <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                  <span className="text-slate-500">Год выпуска:</span>
                  <span className="font-semibold text-slate-900 font-mono">{car.year}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                  <span className="text-slate-500">Пробег:</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {car.mileage === 0 ? 'Без пробега' : `${car.mileage.toLocaleString('ru-RU')} км`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                  <span className="text-slate-500">Двигатель:</span>
                  <span className="font-semibold text-slate-900 font-mono">{car.engineVolume}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                  <span className="text-slate-500">Мощность:</span>
                  <span className="font-semibold text-slate-900 font-mono">{car.enginePower} л.с.</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Трансмиссия:</span>
                  <span className="font-semibold text-slate-900">
                    {car.transmission === 'Automatic' ? 'Автомат' : car.transmission === 'Manual' ? 'Механика' : 'Робот'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Привод:</span>
                  <span className="font-semibold text-slate-900 font-mono">{car.driveType}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Описание модели</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">{car.description}</p>
            </div>

            {/* Additional Premium Specs */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Комплектация и особенности</h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {car.specs.map((spec, i) => (
                  <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-100">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>{spec}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Booking / Credit Actions Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Action 1: Loan prefill */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
                    <Calculator className="h-4.5 w-4.5 text-amber-500" />
                    Купить в кредит
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed mb-3">Расчитайте индивидуальные параметры автокредита под выгодную процентную ставку.</p>
                </div>
                <button
                  onClick={() => onGoToCredit(car)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Перейти к расчету
                </button>
              </div>

              {/* Action 2: Book test drive */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-emerald-500" />
                  Запись на тест-драйв
                </h4>
                {bookingSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg text-xs flex items-start gap-2 mt-2">
                    <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Успешно забронировано!</p>
                      <p className="text-emerald-700 mt-0.5">Вы записаны. Администратор свяжется с вами для подтверждения.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-2 mt-2">
                    <div>
                      <input
                        type="date"
                        required
                        value={testDriveDate}
                        onChange={e => setTestDriveDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                    <div>
                      <select
                        required
                        value={testDriveTime}
                        onChange={e => setTestDriveTime(e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      >
                        <option value="">Выберите время</option>
                        {timeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>

                    {bookingError && (
                      <p className="text-rose-600 text-[11px] font-semibold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {bookingError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {user ? (isSubmitting ? 'Бронирование...' : 'Записаться онлайн') : 'Войти и записаться'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
