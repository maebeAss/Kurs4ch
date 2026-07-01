import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Info, Heart, ListPlus, ListMinus, Car } from 'lucide-react';
import { type Car as CarType } from '../types.ts';

interface CarCatalogProps {
  cars: CarType[];
  onSelectCar: (car: CarType) => void;
  favorites: string[];
  onToggleFavorite: (carId: string) => void;
  compareList: string[];
  onToggleCompare: (carId: string) => void;
  onOpenLoginModal: () => void;
  userLoggedIn: boolean;
}

export default function CarCatalog({
  cars,
  onSelectCar,
  favorites,
  onToggleFavorite,
  compareList,
  onToggleCompare,
  onOpenLoginModal,
  userLoggedIn
}: CarCatalogProps) {
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedBodyStyle, setSelectedBodyStyle] = useState('All');
  const [condition, setCondition] = useState<'All' | 'New' | 'Used'>('All');
  const [maxPrice, setMaxPrice] = useState<number>(22000000);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [minPower, setMinPower] = useState<number>(100);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc'>('year_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Extract unique options for filters
  const brands = useMemo(() => {
    return ['All', ...Array.from(new Set(cars.map(c => c.brand)))];
  }, [cars]);

  const bodyStyles = useMemo(() => {
    return ['All', ...Array.from(new Set(cars.map(c => c.bodyStyle)))];
  }, [cars]);

  const handleFuelToggle = (fuel: string) => {
    setSelectedFuelTypes(prev =>
      prev.includes(fuel) ? prev.filter(f => f !== fuel) : [...prev, fuel]
    );
  };

  const handleTransmissionToggle = (trans: string) => {
    setSelectedTransmissions(prev =>
      prev.includes(trans) ? prev.filter(t => t !== trans) : [...prev, trans]
    );
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedBrand('All');
    setSelectedBodyStyle('All');
    setCondition('All');
    setMaxPrice(22000000);
    setMinPrice(0);
    setMinPower(100);
    setSelectedFuelTypes([]);
    setSelectedTransmissions([]);
    setSortBy('year_desc');
  };

  // Filter & Sort Logic
  const filteredCars = useMemo(() => {
    let result = [...cars];

    // Search query (Brand, Model, description, etc.)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        c =>
          c.brand.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    // Brand
    if (selectedBrand !== 'All') {
      result = result.filter(c => c.brand === selectedBrand);
    }

    // Body Style
    if (selectedBodyStyle !== 'All') {
      result = result.filter(c => c.bodyStyle === selectedBodyStyle);
    }

    // Condition
    if (condition !== 'All') {
      result = result.filter(c => c.condition === condition);
    }

    // Price range
    result = result.filter(c => c.price >= minPrice && c.price <= maxPrice);

    // Horsepower
    result = result.filter(c => c.enginePower >= minPower);

    // Fuel Type
    if (selectedFuelTypes.length > 0) {
      result = result.filter(c => selectedFuelTypes.includes(c.fuelType));
    }

    // Transmission
    if (selectedTransmissions.length > 0) {
      result = result.filter(c => selectedTransmissions.includes(c.transmission));
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'year_desc':
          return b.year - a.year;
        case 'mileage_asc':
          return a.mileage - b.mileage;
        default:
          return 0;
      }
    });

    return result;
  }, [
    cars,
    search,
    selectedBrand,
    selectedBodyStyle,
    condition,
    minPrice,
    maxPrice,
    minPower,
    selectedFuelTypes,
    selectedTransmissions,
    sortBy
  ]);

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск марки, модели..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all w-full md:w-auto ${
              showFilters
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Фильтры</span>
            {(selectedBrand !== 'All' ||
              selectedBodyStyle !== 'All' ||
              condition !== 'All' ||
              minPrice > 0 ||
              maxPrice < 22000000 ||
              minPower > 100 ||
              selectedFuelTypes.length > 0 ||
              selectedTransmissions.length > 0) && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <div className="relative w-full md:w-56">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-700 cursor-pointer font-semibold"
            >
              <option value="year_desc">Сначала свежие</option>
              <option value="price_asc">От дешевых к дорогим</option>
              <option value="price_desc">От дорогих к дешевым</option>
              <option value="mileage_asc">Минимальный пробег</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {/* Brand & Body style */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Марка</label>
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand === 'All' ? 'Все марки' : brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Тип кузова</label>
              <select
                value={selectedBodyStyle}
                onChange={e => setSelectedBodyStyle(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                {bodyStyles.map(style => (
                  <option key={style} value={style}>
                    {style === 'All' ? 'Все кузова' : style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition & Power */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Состояние</label>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                {(['All', 'New', 'Used'] as const).map(cond => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setCondition(cond)}
                    className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                      condition === cond
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cond === 'All' ? 'Все' : cond === 'New' ? 'Новые' : 'Б/У'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Мощность: от {minPower} л.с.
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={minPower}
                onChange={e => setMinPower(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-mono mt-1">
                <span>100 л.с.</span>
                <span>1000 л.с.</span>
              </div>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Диапазон цены
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold">Мин, ₽</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={e => setMinPrice(Number(e.target.value))}
                    className="w-full p-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold">Макс, ₽</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full p-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="22000000"
                step="500000"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-mono">
                <span>0 ₽</span>
                <span>22 млн ₽</span>
              </div>
            </div>
          </div>

          {/* Transmission & Fuel Types */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Коробка передач</label>
              <div className="space-y-1.5">
                {['Automatic', 'Manual', 'Robotic'].map(trans => (
                  <label key={trans} className="flex items-center space-x-2 text-xs text-slate-600 font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedTransmissions.includes(trans)}
                      onChange={() => handleTransmissionToggle(trans)}
                      className="rounded text-amber-500 focus:ring-amber-500/30 border-slate-300 h-3.5 w-3.5"
                    />
                    <span>{trans === 'Automatic' ? 'Автомат' : trans === 'Manual' ? 'Механика' : 'Робот'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Топливо</label>
              <div className="space-y-1.5">
                {['Gasoline', 'Diesel', 'Electric', 'Hybrid'].map(fuel => (
                  <label key={fuel} className="flex items-center space-x-2 text-xs text-slate-600 font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedFuelTypes.includes(fuel)}
                      onChange={() => handleFuelToggle(fuel)}
                      className="rounded text-amber-500 focus:ring-amber-500/30 border-slate-300 h-3.5 w-3.5"
                    />
                    <span>{fuel === 'Gasoline' ? 'Бензин' : fuel === 'Diesel' ? 'Дизель' : fuel === 'Electric' ? 'Электро' : 'Гибрид'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Clear button */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-xs text-rose-500 font-bold hover:text-rose-600 underline"
            >
              Сбросить все фильтры
            </button>
          </div>
        </div>
      )}

      {/* Car Grid */}
      {filteredCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map(car => {
            const isFav = favorites.includes(car.id);
            const inCompare = compareList.includes(car.id);

            return (
              <div
                key={car.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-all duration-300 flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative aspect-video overflow-hidden bg-slate-100 flex items-center justify-center">
                  {!car.images || !car.images[0] || imageErrors[car.id] ? (
                    /* Beautiful luxury custom vector fallback placeholder */
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center p-4 text-center relative select-none">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_60%)]" />
                      <Car className="h-10 w-10 text-amber-500/80 mb-1.5 stroke-[1.5] relative z-10" />
                      <span className="text-[9px] uppercase tracking-widest font-black text-amber-500/80 relative z-10">{car.brand}</span>
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
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm text-white ${
                      car.condition === 'New' ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      {car.condition === 'New' ? 'Новый' : 'С пробегом'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white font-mono uppercase tracking-widest shadow-sm">
                      {car.year} г.
                    </span>
                  </div>

                  {/* Top-right Actions */}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (userLoggedIn) {
                          onToggleFavorite(car.id);
                        } else {
                          onOpenLoginModal();
                        }
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
                        isFav 
                          ? 'bg-rose-500 text-white shadow-md' 
                          : 'bg-white/85 text-slate-700 hover:bg-white hover:text-rose-500 shadow-sm'
                      }`}
                      title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
                    >
                      <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompare(car.id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
                        inCompare 
                          ? 'bg-amber-500 text-slate-950 shadow-md' 
                          : 'bg-white/85 text-slate-700 hover:bg-white hover:text-amber-500 shadow-sm'
                      }`}
                      title={inCompare ? 'Убрать из сравнения' : 'Добавить в сравнение'}
                    >
                      {inCompare ? <ListMinus className="h-4.5 w-4.5" /> : <ListPlus className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-3 min-w-0">
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{car.brand}</span>
                        <h3 className="heading-display text-slate-800 font-bold text-base block truncate" title={car.model}>{car.model}</h3>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Стоимость</span>
                        <span className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                          {car.price.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </div>

                    {/* Specs Pills */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="text-[10px] sm:text-[11px] bg-slate-50 border border-slate-100 p-2 rounded-lg text-slate-600 font-semibold font-mono truncate" title={`${car.transmission === 'Automatic' ? 'АКПП' : car.transmission === 'Manual' ? 'МКПП' : 'Робот'} • ${car.driveType}`}>
                        🚗 {car.transmission === 'Automatic' ? 'АКПП' : car.transmission === 'Manual' ? 'МКПП' : 'Робот'} • {car.driveType}
                      </div>
                      <div className="text-[10px] sm:text-[11px] bg-slate-50 border border-slate-100 p-2 rounded-lg text-slate-600 font-semibold font-mono truncate" title={`${car.engineVolume !== 'Electric' ? car.engineVolume : 'Электро'} • ${car.enginePower} л.с.`}>
                        ⚡ {car.engineVolume !== 'Electric' ? car.engineVolume : 'Электро'} • {car.enginePower} л.с.
                      </div>
                      <div className="text-[10px] sm:text-[11px] bg-slate-50 border border-slate-100 p-2 rounded-lg text-slate-600 font-semibold font-mono col-span-2 truncate" title={`${car.mileage === 0 ? 'Без пробега' : `${car.mileage.toLocaleString('ru-RU')} км`} • ${car.fuelType === 'Gasoline' ? 'Бензин' : car.fuelType === 'Diesel' ? 'Дизель' : car.fuelType === 'Electric' ? 'Электричество' : 'Гибрид'}`}>
                        ⏱️ {car.mileage === 0 ? 'Без пробега' : `${car.mileage.toLocaleString('ru-RU')} км`} • {car.fuelType === 'Gasoline' ? 'Бензин' : car.fuelType === 'Diesel' ? 'Дизель' : car.fuelType === 'Electric' ? 'Электро' : 'Гибрид'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectCar(car)}
                      className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
                    >
                      <Info className="h-4.5 w-4.5" />
                      <span>Подробнее</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 max-w-md mx-auto shadow-sm">
          <div className="bg-slate-50 text-slate-400 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">Ничего не найдено</h3>
          <p className="text-slate-500 text-sm mb-4 leading-relaxed">Мы не нашли автомобилей, соответствующих вашим критериям фильтрации.</p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-sm transition-all"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}
