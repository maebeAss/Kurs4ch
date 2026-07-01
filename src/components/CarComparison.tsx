import React, { useState } from 'react';
import { X, Scale, Calculator, ArrowRight, AlertCircle, Trash2, Car } from 'lucide-react';
import { Car as CarType } from '../types.ts';

interface CarComparisonProps {
  cars: CarType[];
  compareList: string[];
  onRemoveFromCompare: (carId: string) => void;
  onClearCompare: () => void;
  onSelectCar: (car: CarType) => void;
  onGoToCredit: (car: CarType) => void;
}

export default function CarComparison({
  cars,
  compareList,
  onRemoveFromCompare,
  onClearCompare,
  onSelectCar,
  onGoToCredit
}: CarComparisonProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  // Filter the full car list to only the compared ones
  const comparedCars = cars.filter(c => compareList.includes(c.id));

  // Determine superior specs acrosscompared cars
  // E.g. Lowest Price, Highest Power, Lowest Mileage, Newest Year
  const analysis = React.useMemo(() => {
    if (comparedCars.length < 2) return null;

    let minPriceId = '';
    let maxPowerId = '';
    let minMileageId = '';
    let maxYearId = '';

    let minPrice = Infinity;
    let maxPower = -1;
    let minMileage = Infinity;
    let maxYear = -1;

    comparedCars.forEach(car => {
      if (car.price < minPrice) {
        minPrice = car.price;
        minPriceId = car.id;
      }
      if (car.enginePower > maxPower) {
        maxPower = car.enginePower;
        maxPowerId = car.id;
      }
      if (car.mileage < minMileage) {
        minMileage = car.mileage;
        minMileageId = car.id;
      }
      if (car.year > maxYear) {
        maxYear = car.year;
        maxYearId = car.id;
      }
    });

    return { minPriceId, maxPowerId, minMileageId, maxYearId };
  }, [comparedCars]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="heading-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="h-6 w-6 text-amber-500" />
            Сравнение моделей
          </h2>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            Сравните технические параметры, стоимость и комплектацию автомобилей бок о бок для взвешенного выбора.
          </p>
        </div>
        {comparedCars.length > 0 && (
          <button
            onClick={onClearCompare}
            className="inline-flex items-center space-x-1.5 px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-bold transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            <span>Очистить сравнение</span>
          </button>
        )}
      </div>

      {comparedCars.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 max-w-lg mx-auto shadow-sm">
          <div className="bg-slate-50 text-slate-400 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Scale className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">Список сравнения пуст</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Перейдите в наш каталог автомобилей и нажмите на кнопку сравнения (весы в верхнем углу карточки), чтобы добавить модели в этот список.
          </p>
        </div>
      ) : comparedCars.length === 1 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 max-w-lg mx-auto shadow-sm">
          <div className="bg-amber-50 text-amber-600 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">Добавьте еще одну модель</h3>
          <p className="text-slate-500 text-sm mb-4 leading-relaxed">
            Для полноценного сравнения необходимо добавить как минимум 2 автомобиля. Сейчас добавлен только: 
            <strong className="text-slate-700 block mt-1">{comparedCars[0].brand} {comparedCars[0].model}</strong>
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="p-4 text-left font-bold text-slate-400 text-xs uppercase tracking-widest w-1/4">Характеристика</th>
                {comparedCars.map(car => (
                  <th key={car.id} className="p-4 w-1/4 align-top relative">
                    <button
                      onClick={() => onRemoveFromCompare(car.id)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                      title="Убрать"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="aspect-video w-full rounded-xl overflow-hidden mb-3 border border-slate-200 flex items-center justify-center bg-slate-100">
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
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImageErrors(prev => ({ ...prev, [car.id]: true }));
                          }}
                        />
                      )}
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{car.brand}</span>
                      <span className="font-bold text-slate-800 text-base block heading-display leading-tight">{car.model}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-600">Стоимость</td>
                {comparedCars.map(car => {
                  const isBest = analysis && analysis.minPriceId === car.id;
                  return (
                    <td key={car.id} className="p-4">
                      <span className={`font-mono font-bold text-base ${isBest ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {car.price.toLocaleString('ru-RU')} ₽
                      </span>
                      {isBest && (
                        <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">⭐ Выгодная цена</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Year row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-600">Год выпуска</td>
                {comparedCars.map(car => {
                  const isBest = analysis && analysis.maxYearId === car.id;
                  return (
                    <td key={car.id} className="p-4 font-mono font-semibold text-slate-800">
                      {car.year} г.
                      {isBest && (
                        <span className="block text-[10px] text-amber-600 font-bold mt-0.5">✨ Самый свежий</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Mileage row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-600">Пробег</td>
                {comparedCars.map(car => {
                  const isBest = analysis && analysis.minMileageId === car.id;
                  return (
                    <td key={car.id} className="p-4 font-mono text-slate-800 font-semibold">
                      {car.mileage === 0 ? 'Без пробега' : `${car.mileage.toLocaleString('ru-RU')} км`}
                      {isBest && car.mileage > 0 && (
                        <span className="block text-[10px] text-indigo-600 font-bold mt-0.5">⏱️ Меньше износ</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Engine row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-600">Объем / Тип двигателя</td>
                {comparedCars.map(car => (
                  <td key={car.id} className="p-4 text-slate-800 font-semibold font-mono">
                    {car.engineVolume !== 'Electric' ? car.engineVolume : 'Электрический'}
                  </td>
                ))}
              </tr>

              {/* Horsepower row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-600">Мощность</td>
                {comparedCars.map(car => {
                  const isBest = analysis && analysis.maxPowerId === car.id;
                  return (
                    <td key={car.id} className="p-4">
                      <span className={`font-mono font-bold ${isBest ? 'text-indigo-600' : 'text-slate-800'}`}>
                        {car.enginePower} л.с.
                      </span>
                      {isBest && (
                        <span className="block text-[10px] text-indigo-600 font-bold mt-0.5">🔥 Максимальная мощь</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Fuel Type row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-600">Тип топлива</td>
                {comparedCars.map(car => (
                  <td key={car.id} className="p-4 text-slate-800 font-semibold">
                    {car.fuelType === 'Gasoline' ? 'Бензин' : car.fuelType === 'Diesel' ? 'Дизель' : car.fuelType === 'Electric' ? 'Электричество' : 'Гибрид'}
                  </td>
                ))}
              </tr>

              {/* Transmission row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-600">Трансмиссия</td>
                {comparedCars.map(car => (
                  <td key={car.id} className="p-4 text-slate-800 font-semibold">
                    {car.transmission === 'Automatic' ? 'Автомат' : car.transmission === 'Manual' ? 'Механика' : 'Роботизированная'}
                  </td>
                ))}
              </tr>

              {/* Drive type row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-600">Тип привода</td>
                {comparedCars.map(car => (
                  <td key={car.id} className="p-4 text-slate-800 font-mono font-bold">
                    {car.driveType === 'FWD' ? 'Передний (FWD)' : car.driveType === 'RWD' ? 'Задний (RWD)' : 'Полный (AWD)'}
                  </td>
                ))}
              </tr>

              {/* Body style row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-600">Кузов</td>
                {comparedCars.map(car => (
                  <td key={car.id} className="p-4 text-slate-800 font-semibold">
                    {car.bodyStyle === 'Sedan' ? 'Седан' : car.bodyStyle === 'SUV' ? 'Внедорожник/SUV' : car.bodyStyle === 'Coupe' ? 'Купе' : car.bodyStyle === 'Hatchback' ? 'Хэтчбек' : 'Универсал'}
                  </td>
                ))}
              </tr>

              {/* Color row */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-600">Цвет</td>
                {comparedCars.map(car => (
                  <td key={car.id} className="p-4 text-slate-700 text-sm">
                    {car.color}
                  </td>
                ))}
              </tr>

              {/* Actions row */}
              <tr className="hover:bg-slate-50/50 bg-slate-50/30">
                <td className="p-4"></td>
                {comparedCars.map(car => (
                  <td key={car.id} className="p-4 space-y-2">
                    <button
                      onClick={() => onSelectCar(car)}
                      className="w-full inline-flex items-center justify-center space-x-1 px-3 py-2 border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Подробнее</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onGoToCredit(car)}
                      className="w-full inline-flex items-center justify-center space-x-1 px-3 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Calculator className="h-3.5 w-3.5" />
                      <span>Рассчитать кредит</span>
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
