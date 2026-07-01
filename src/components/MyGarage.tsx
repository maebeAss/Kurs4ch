import React, { useState } from 'react';
import { Heart, Calendar, Landmark, User, ShieldAlert, FileText, CheckCircle2, Clock, XCircle, Car } from 'lucide-react';
import { Car as CarType, Booking, LoanRequest, User as UserType } from '../types.ts';

interface MyGarageProps {
  user: UserType | null;
  cars: CarType[];
  favorites: string[];
  bookings: Booking[];
  loans: LoanRequest[];
  onToggleFavorite: (carId: string) => void;
  onSelectCar: (car: CarType) => void;
  onGoToCredit: (car: CarType) => void;
}

export default function MyGarage({
  user,
  cars,
  favorites,
  bookings,
  loans,
  onToggleFavorite,
  onSelectCar,
  onGoToCredit
}: MyGarageProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const favoriteCars = cars.filter(c => favorites.includes(c.id));

  // Status helper rendering badges
  const renderBookingStatus = (status: Booking['status']) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Подтвержден
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
            <XCircle className="h-3.5 w-3.5" />
            Отменен
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
            Проведен
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            Ожидает подтверждения
          </span>
        );
    }
  };

  const renderLoanStatus = (status: LoanRequest['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Одобрен
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
            <XCircle className="h-3.5 w-3.5" />
            Отклонен
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            На рассмотрении
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* User Dashboard Welcome card */}
      {user && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-slate-100 text-slate-800 rounded-2xl border border-slate-200">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h2 className="heading-display text-xl md:text-2xl font-bold text-slate-900">Добро пожаловать, {user.name}!</h2>
              <p className="text-slate-500 text-sm mt-0.5 font-semibold">Ваш личный кабинет клиента AutoSelect ({user.email})</p>
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Избранное</span>
              <span className="text-xl font-bold font-mono text-slate-800">{favoriteCars.length}</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Тест-драйвы</span>
              <span className="text-xl font-bold font-mono text-slate-800">{bookings.length}</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Кредиты</span>
              <span className="text-xl font-bold font-mono text-slate-800">{loans.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Favorites + Statuses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Favorite Cars */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="heading-display text-lg font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Heart className="h-5 w-5 text-rose-500 fill-current" />
            Избранные автомобили
          </h3>

          {favoriteCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteCars.map(car => (
                <div
                  key={car.id}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-200"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100 flex items-center justify-center">
                    {!car.images || !car.images[0] || imageErrors[car.id] ? (
                      /* Beautiful luxury custom vector fallback placeholder */
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center p-3 text-center relative select-none">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_60%)]" />
                        <Car className="h-8 w-8 text-amber-500/80 mb-1 stroke-[1.5] relative z-10" />
                        <span className="text-[8px] uppercase tracking-widest font-black text-amber-500/80 relative z-10">{car.brand}</span>
                        <span className="text-xs font-semibold text-slate-300 relative z-10 truncate max-w-[90%]">{car.model}</span>
                      </div>
                    ) : (
                      <img
                        src={car.images[0]}
                        alt={`${car.brand} ${car.model}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => {
                          setImageErrors(prev => ({ ...prev, [car.id]: true }));
                        }}
                      />
                    )}
                    <button
                      onClick={() => onToggleFavorite(car.id)}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-rose-500 text-white rounded-full shadow-md transition-transform active:scale-95 z-20"
                      title="Убрать"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{car.brand}</span>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{car.model} ({car.year} г.)</h4>
                      <span className="font-bold text-slate-900 font-mono text-sm block mt-1">
                        {car.price.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectCar(car)}
                        className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] rounded-lg cursor-pointer transition-colors"
                      >
                        Детали
                      </button>
                      <button
                        onClick={() => onGoToCredit(car)}
                        className="w-full py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[11px] rounded-lg cursor-pointer transition-colors"
                      >
                        В кредит
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center shadow-sm">
              <Heart className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-xs">У вас пока нет сохраненных моделей.</p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Bookings & Credit Requests Statuses */}
        <div className="space-y-6">
          {/* Active Bookings section */}
          <div className="space-y-3">
            <h3 className="heading-display text-base font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Записи на тест-драйв
            </h3>

            {bookings.length > 0 ? (
              <div className="space-y-2.5">
                {bookings.map(book => (
                  <div key={book.id} className="bg-white p-3.5 border border-slate-100 rounded-xl shadow-sm space-y-2 animate-fade-in">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs leading-snug">{book.carBrand} {book.carModel}</h4>
                        <span className="text-[10px] font-semibold text-slate-400 font-mono">Дата: {book.date} • {book.timeSlot}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-50 flex justify-end">
                      {renderBookingStatus(book.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 border border-slate-100 text-center shadow-sm text-xs text-slate-400">
                Заявок на тест-драйв не обнаружено.
              </div>
            )}
          </div>

          {/* Credit requests section */}
          <div className="space-y-3">
            <h3 className="heading-display text-base font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Landmark className="h-5 w-5 text-amber-500" />
              Запросы одобрения кредитов
            </h3>

            {loans.length > 0 ? (
              <div className="space-y-2.5">
                {loans.map(loan => (
                  <div key={loan.id} className="bg-white p-3.5 border border-slate-100 rounded-xl shadow-sm space-y-2.5 animate-fade-in">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs leading-snug">{loan.carBrand} {loan.carModel}</h4>
                        <div className="space-y-0.5 mt-1">
                          <span className="text-[10px] text-slate-400 font-mono block">Кредит: {(loan.carPrice - loan.downPayment).toLocaleString('ru-RU')} ₽ ({loan.loanTerm} мес. @ {loan.interestRate}%)</span>
                          <span className="text-[10px] text-slate-400 font-mono block">Платеж: <strong className="text-slate-800">{loan.monthlyPayment.toLocaleString('ru-RU')} ₽/мес</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-50 flex justify-end">
                      {renderLoanStatus(loan.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 border border-slate-100 text-center shadow-sm text-xs text-slate-400">
                Запросов кредитования не найдено.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
