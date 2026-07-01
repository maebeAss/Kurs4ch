import React, { useState, useEffect, useMemo } from 'react';
import { Landmark, ArrowRight, Check, AlertCircle, Sparkles, ReceiptText } from 'lucide-react';
import { Car, User } from '../types.ts';

interface CreditCalculatorProps {
  cars: Car[];
  selectedCar: Car | null;
  onCarSelect: (car: Car | null) => void;
  user: User | null;
  onOpenLoginModal: () => void;
  onSubmitLoanRequest: (reqData: {
    carId: string;
    downPayment: number;
    loanTerm: number;
    interestRate: number;
    monthlyPayment: number;
  }) => Promise<boolean>;
}

export default function CreditCalculator({
  cars,
  selectedCar,
  onCarSelect,
  user,
  onOpenLoginModal,
  onSubmitLoanRequest
}: CreditCalculatorProps) {
  // Input states
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 20%
  const [loanTerm, setLoanTerm] = useState<number>(60); // 5 years (60 months)
  const [interestRate, setInterestRate] = useState<number>(14.5); // 14.5% interest in RF

  // Application form states
  const [income, setIncome] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle selected car changes
  const handleCarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const carId = e.target.value;
    if (carId) {
      const car = cars.find(c => c.id === carId) || null;
      onCarSelect(car);
    } else {
      onCarSelect(null);
    }
  };

  const carPrice = selectedCar ? selectedCar.price : 5000000; // default for simulation if no car selected
  const downPaymentAmount = useMemo(() => {
    return Math.round((carPrice * downPaymentPercent) / 100);
  }, [carPrice, downPaymentPercent]);

  const loanAmount = useMemo(() => {
    return carPrice - downPaymentAmount;
  }, [carPrice, downPaymentAmount]);

  // Annuity formula calculation
  const monthlyPayment = useMemo(() => {
    if (loanAmount <= 0) return 0;
    const monthlyRate = interestRate / 12 / 100;
    if (monthlyRate === 0) return Math.round(loanAmount / loanTerm);
    const payment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm));
    return Math.round(payment);
  }, [loanAmount, interestRate, loanTerm]);

  const totalPayment = monthlyPayment * loanTerm;
  const totalInterest = totalPayment - loanAmount;

  // Generate Amortization Schedule (first 12 months, or summary)
  const schedule = useMemo(() => {
    if (loanAmount <= 0 || monthlyPayment <= 0) return [];
    let balance = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const result = [];

    for (let month = 1; month <= loanTerm; month++) {
      const interestPart = Math.round(balance * monthlyRate);
      const principalPart = Math.round(monthlyPayment - interestPart);
      balance = Math.max(0, balance - principalPart);

      result.push({
        month,
        payment: monthlyPayment,
        interest: interestPart,
        principal: principalPart,
        remaining: balance
      });
    }
    return result;
  }, [loanAmount, interestRate, loanTerm, monthlyPayment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar) {
      setSubmitError('Пожалуйста, выберите автомобиль в калькуляторе');
      return;
    }

    if (!user) {
      onOpenLoginModal();
      return;
    }

    if (!phone) {
      setSubmitError('Укажите контактный номер телефона');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const success = await onSubmitLoanRequest({
        carId: selectedCar.id,
        downPayment: downPaymentAmount,
        loanTerm,
        interestRate,
        monthlyPayment
      });

      if (success) {
        setSubmitSuccess(true);
        setPhone('');
        setIncome('');
        setTimeout(() => setSubmitSuccess(false), 8000);
      } else {
        setSubmitError('Не удалось отправить заявку. Попробуйте еще раз.');
      }
    } catch (err) {
      setSubmitError('Произошла ошибка при отправке заявки.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="heading-display text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Landmark className="h-6 w-6 text-amber-500" />
          Автокредит и Расчет рассрочки
        </h2>
        <p className="text-slate-500 text-sm mt-1 leading-relaxed">
          Интерактивный калькулятор для расчета ежемесячных платежей, переплаты и формирования графика погашения.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Calculator Controls & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Controls Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-3">Параметры кредита</h3>

            {/* Car selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Выберите автомобиль</label>
              <select
                value={selectedCar?.id || ''}
                onChange={handleCarChange}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white font-semibold text-slate-700 cursor-pointer"
              >
                <option value="">Выберите модель из наличия...</option>
                {cars.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.brand} {car.model} — {car.price.toLocaleString('ru-RU')} ₽ ({car.condition === 'New' ? 'Новый' : 'Б/У'})
                  </option>
                ))}
              </select>
            </div>

            {selectedCar ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-10 rounded overflow-hidden border border-slate-200 shrink-0">
                    <img src={selectedCar.images[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{selectedCar.brand} {selectedCar.model}</h4>
                    <span className="text-xs text-slate-500 font-mono">Базовая цена: {selectedCar.price.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Размер кредита</span>
                  <span className="font-bold font-mono text-base text-slate-900">{loanAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-slate-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <p className="leading-relaxed">
                  Автомобиль не выбран. По умолчанию расчет производится для абстрактной стоимости в <strong>5 000 000 ₽</strong>. Рекомендуем выбрать машину из списка выше для получения точных условий.
                </p>
              </div>
            )}

            {/* Sliders */}
            <div className="space-y-5">
              {/* Down Payment */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span>Первоначальный взнос</span>
                  <span className="font-mono text-amber-600 font-bold">{downPaymentPercent}% ({downPaymentAmount.toLocaleString('ru-RU')} ₽)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={downPaymentPercent}
                  onChange={e => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                  <span>0% (Без взноса)</span>
                  <span>50%</span>
                  <span>90%</span>
                </div>
              </div>

              {/* Loan Term */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span>Срок кредитования</span>
                  <span className="font-mono text-amber-600 font-bold">{loanTerm} месяцев ({Math.round(loanTerm / 12)} л.)</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="84"
                  step="12"
                  value={loanTerm}
                  onChange={e => setLoanTerm(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                  <span>12 мес (1 год)</span>
                  <span>48 мес (4 года)</span>
                  <span>84 мес (7 лет)</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span>Процентная ставка</span>
                  <span className="font-mono text-amber-600 font-bold">{interestRate}% годовых</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="0.5"
                  value={interestRate}
                  onChange={e => setInterestRate(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                  <span>5% (Минимум)</span>
                  <span>15%</span>
                  <span>25% (Максимум)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amortization Schedule (Table layout) */}
          {schedule.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider text-xs">
                  <ReceiptText className="h-4 w-4 text-slate-500" />
                  График погашения (Первые 12 месяцев)
                </h4>
                <span className="text-slate-400 font-mono text-[10px] font-semibold uppercase">Аннуитетный платеж</span>
              </div>
              <div className="overflow-x-auto max-h-[350px] scrollbar-thin">
                <table className="w-full text-xs text-left text-slate-600 border-collapse">
                  <thead className="bg-slate-100/60 sticky top-0 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3 text-center">Месяц</th>
                      <th className="p-3 text-right">Платеж, ₽</th>
                      <th className="p-3 text-right">Основной долг, ₽</th>
                      <th className="p-3 text-right">Проценты, ₽</th>
                      <th className="p-3 text-right">Остаток долга, ₽</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.slice(0, 12).map(row => (
                      <tr key={row.month} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 text-center font-bold font-mono text-slate-800 bg-slate-50/30">{row.month}</td>
                        <td className="p-3 text-right font-semibold font-mono text-slate-900">{row.payment.toLocaleString('ru-RU')}</td>
                        <td className="p-3 text-right font-mono text-slate-600">{row.principal.toLocaleString('ru-RU')}</td>
                        <td className="p-3 text-right font-mono text-amber-600">{row.interest.toLocaleString('ru-RU')}</td>
                        <td className="p-3 text-right font-mono text-slate-500">{row.remaining.toLocaleString('ru-RU')}</td>
                      </tr>
                    ))}
                    {schedule.length > 12 && (
                      <tr className="bg-slate-50/30">
                        <td colSpan={5} className="p-3 text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          ... Ещё {schedule.length - 12} месяцев платежей по графику ...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Summary & Loan Submission */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 space-y-6 relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <h3 className="font-bold text-amber-400 text-base flex items-center gap-1.5 border-b border-slate-800 pb-3 uppercase tracking-wider text-xs">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Расчет платежей
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Ежемесячный платеж</span>
                <span className="text-3xl font-black font-mono text-white leading-tight">
                  {monthlyPayment.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Размер кредита</span>
                  <span className="font-bold font-mono text-slate-200">{loanAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Взнос клиента</span>
                  <span className="font-bold font-mono text-slate-200">{downPaymentAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Переплата</span>
                  <span className="font-bold font-mono text-amber-400">{totalInterest.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Всего выплат</span>
                  <span className="font-bold font-mono text-slate-200">{totalPayment.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Form Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4 border-b border-slate-100 pb-3 uppercase tracking-wider text-xs">
              Онлайн одобрение кредита
            </h3>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-start gap-2.5">
                <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Заявка отправлена!</p>
                  <p className="text-emerald-700 mt-1 leading-relaxed">
                    Ваш кредитный запрос успешно зарегистрирован в базе данных автосалона со статусом <strong>«В обработке»</strong>. Администраторы рассмотрят его в ближайшее время. Статус можно отслеживать в разделе <strong>«Мой Гараж»</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    ФИО заемщика
                  </label>
                  <input
                    type="text"
                    required
                    value={user ? user.name : ''}
                    disabled={!!user}
                    placeholder="Иванов Иван Иванович"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50/50 text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Телефон для связи
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Ежемесячный доход (₽)
                  </label>
                  <input
                    type="number"
                    required
                    value={income}
                    onChange={e => setIncome(e.target.value)}
                    placeholder="90000"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-800 font-mono"
                  />
                </div>

                {submitError && (
                  <p className="text-rose-600 text-xs font-semibold flex items-center gap-1 bg-rose-50 p-2 rounded border border-rose-100">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <span>{user ? (isSubmitting ? 'Отправка...' : 'Отправить онлайн-заявку') : 'Войти и отправить заявку'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
