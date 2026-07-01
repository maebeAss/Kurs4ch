/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.tsx';
import CarCatalog from './components/CarCatalog.tsx';
import CarDetailsModal from './components/CarDetailsModal.tsx';
import CarComparison from './components/CarComparison.tsx';
import CreditCalculator from './components/CreditCalculator.tsx';
import MyGarage from './components/MyGarage.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { Car, User, Booking, LoanRequest, ChatMessage } from './types.ts';
import { Shield, Sparkles, X, Mail, UserIcon, Info, HelpCircle } from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('catalog');

  // App core state
  const [cars, setCars] = useState<Car[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loans, setLoans] = useState<LoanRequest[]>([]);

  // Selected sub-states
  const [selectedCarForDetails, setSelectedCarForDetails] = useState<Car | null>(null);
  const [selectedCarForCredit, setSelectedCarForCredit] = useState<Car | null>(null);

  // Auth modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  // Fetch all cars on mount
  useEffect(() => {
    fetchCars();
    // Attempt to load token from localStorage
    const savedUserId = localStorage.getItem('auto_token');
    if (savedUserId) {
      fetchCurrentUser(savedUserId);
    }
  }, []);

  // Fetch bookings, loans and favorites when user logs in
  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setFavorites([]);
      setBookings([]);
      setLoans([]);
      if (activeTab === 'garage' || activeTab === 'admin') {
        setActiveTab('catalog');
      }
    }
  }, [user]);

  const fetchCars = async () => {
    try {
      const res = await fetch('/api/cars');
      if (res.ok) {
        const data = await res.json();
        setCars(data);
      }
    } catch (e) {
      console.error('Failed to fetch cars', e);
    }
  };

  const fetchCurrentUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${userId}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('auto_token');
      }
    } catch (e) {
      console.error('Failed to fetch user', e);
    }
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem('auto_token');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      // Fetch Favorites
      const favRes = await fetch('/api/favorites', { headers });
      if (favRes.ok) {
        const favData = await favRes.json();
        setFavorites(favData);
      }

      // Fetch Bookings
      const bookRes = await fetch('/api/bookings', { headers });
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setBookings(bookData);
      }

      // Fetch Loan Requests
      const loanRes = await fetch('/api/loans', { headers });
      if (loanRes.ok) {
        const loanData = await loanRes.json();
        setLoans(loanData);
      }
    } catch (e) {
      console.error('Failed to fetch user data', e);
    }
  };

  // Auth operations
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!loginEmail) {
      setAuthError('Email обязателен к заполнению');
      return;
    }

    try {
      if (isRegistering) {
        if (!loginName) {
          setAuthError('Имя обязательно для регистрации');
          return;
        }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail, name: loginName })
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          localStorage.setItem('auto_token', data.user.id);
          setIsLoginModalOpen(false);
          resetAuthForm();
        } else {
          setAuthError(data.error || 'Ошибка при регистрации');
        }
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail })
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          localStorage.setItem('auto_token', data.user.id);
          setIsLoginModalOpen(false);
          resetAuthForm();
        } else {
          setAuthError(data.error || 'Ошибка при авторизации');
        }
      }
    } catch (err) {
      setAuthError('Ошибка подключения к серверу');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auto_token');
    setUser(null);
  };

  const resetAuthForm = () => {
    setLoginEmail('');
    setLoginName('');
    setIsRegistering(false);
    setAuthError('');
  };

  // Toggle favorite car
  const handleToggleFavorite = async (carId: string) => {
    const token = localStorage.getItem('auto_token');
    if (!token) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ carId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isFavorited) {
          setFavorites(prev => [...prev, carId]);
        } else {
          setFavorites(prev => prev.filter(id => id !== carId));
        }
      }
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  };

  // Toggle car comparison
  const handleToggleCompare = (carId: string) => {
    setCompareList(prev => {
      if (prev.includes(carId)) {
        return prev.filter(id => id !== carId);
      } else {
        if (prev.length >= 3) {
          alert('Вы можете сравнивать одновременно не более 3 автомобилей.');
          return prev;
        }
        return [...prev, carId];
      }
    });
  };

  const handleRemoveFromCompare = (carId: string) => {
    setCompareList(prev => prev.filter(id => id !== carId));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  // Pre-fill credit calc from catalog card
  const handleGoToCredit = (car: Car) => {
    setSelectedCarForCredit(car);
    setActiveTab('credit');
    setSelectedCarForDetails(null); // close details modal if open
  };

  // Online Book Test drive
  const handleBookTestDrive = async (carId: string, date: string, timeSlot: string): Promise<boolean> => {
    const token = localStorage.getItem('auto_token');
    if (!token) return false;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ carId, date, timeSlot })
      });
      if (res.ok) {
        fetchUserData(); // Refresh bookings list
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error booking test drive', e);
      return false;
    }
  };

  // Submit credit application
  const handleSubmitLoanRequest = async (loanData: {
    carId: string;
    downPayment: number;
    loanTerm: number;
    interestRate: number;
    monthlyPayment: number;
  }): Promise<boolean> => {
    const token = localStorage.getItem('auto_token');
    if (!token) return false;

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(loanData)
      });
      if (res.ok) {
        fetchUserData(); // Refresh loans list
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error submitting loan request', e);
      return false;
    }
  };

  // AI chat send
  const handleSendAIChat = async (chatMessages: ChatMessage[]): Promise<string> => {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages })
      });
      if (res.ok) {
        const data = await res.json();
        return data.text;
      }
      throw new Error('Chat API Error');
    } catch (e) {
      console.error('Chat error', e);
      return 'Извините, произошла техническая ошибка при ответе. Пожалуйста, попробуйте еще раз.';
    }
  };

  // Admin Catalog Methods
  const handleAddCarAdmin = async (newCarData: Omit<Car, 'id' | 'createdAt'>): Promise<boolean> => {
    const token = localStorage.getItem('auto_token');
    if (!token) return false;

    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCarData)
      });
      if (res.ok) {
        fetchCars(); // reload list
        return true;
      }
      return false;
    } catch (e) {
      console.error('Admin Add Car error', e);
      return false;
    }
  };

  const handleUpdateCarAdmin = async (id: string, updatedCarData: Partial<Car>): Promise<boolean> => {
    const token = localStorage.getItem('auto_token');
    if (!token) return false;

    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedCarData)
      });
      if (res.ok) {
        fetchCars(); // reload list
        return true;
      }
      return false;
    } catch (e) {
      console.error('Admin Update Car error', e);
      return false;
    }
  };

  const handleDeleteCarAdmin = async (id: string): Promise<boolean> => {
    const token = localStorage.getItem('auto_token');
    if (!token) return false;

    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchCars(); // reload list
        return true;
      }
      return false;
    } catch (e) {
      console.error('Admin Delete Car error', e);
      return false;
    }
  };

  // Admin Bookings & Loans methods
  const handleUpdateBookingStatusAdmin = async (id: string, status: Booking['status']): Promise<boolean> => {
    const token = localStorage.getItem('auto_token');
    if (!token) return false;

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchUserData(); // refresh list
        return true;
      }
      return false;
    } catch (e) {
      console.error('Admin Update Booking error', e);
      return false;
    }
  };

  const handleUpdateLoanStatusAdmin = async (id: string, status: LoanRequest['status']): Promise<boolean> => {
    const token = localStorage.getItem('auto_token');
    if (!token) return false;

    try {
      const res = await fetch(`/api/loans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchUserData(); // refresh list
        return true;
      }
      return false;
    } catch (e) {
      console.error('Admin Update Loan error', e);
      return false;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Navbar Component */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        favoritesCount={favorites.length}
        compareCount={compareList.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'catalog' && (
          <CarCatalog
            cars={cars}
            onSelectCar={setSelectedCarForDetails}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            userLoggedIn={!!user}
          />
        )}

        {activeTab === 'compare' && (
          <CarComparison
            cars={cars}
            compareList={compareList}
            onRemoveFromCompare={handleRemoveFromCompare}
            onClearCompare={handleClearCompare}
            onSelectCar={setSelectedCarForDetails}
            onGoToCredit={handleGoToCredit}
          />
        )}

        {activeTab === 'credit' && (
          <CreditCalculator
            cars={cars}
            selectedCar={selectedCarForCredit}
            onCarSelect={setSelectedCarForCredit}
            user={user}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onSubmitLoanRequest={handleSubmitLoanRequest}
          />
        )}

        {activeTab === 'garage' && user && (
          <MyGarage
            user={user}
            cars={cars}
            favorites={favorites}
            bookings={bookings}
            loans={loans}
            onToggleFavorite={handleToggleFavorite}
            onSelectCar={setSelectedCarForDetails}
            onGoToCredit={handleGoToCredit}
          />
        )}

        {activeTab === 'admin' && user && user.role === 'admin' && (
          <AdminPanel
            cars={cars}
            bookings={bookings}
            loans={loans}
            onAddCar={handleAddCarAdmin}
            onUpdateCar={handleUpdateCarAdmin}
            onDeleteCar={handleDeleteCarAdmin}
            onUpdateBookingStatus={handleUpdateBookingStatusAdmin}
            onUpdateLoanStatus={handleUpdateLoanStatusAdmin}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="heading-display font-black text-sm uppercase text-slate-100 tracking-wider">
              AutoSelect
            </span>
            <span className="text-slate-600 text-sm">|</span>
            <p className="text-xs text-slate-500 font-medium">Курсовой проект: Разработка портала автосалона</p>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            © 2026 AutoSelect. Все права защищены. Разработано для демонстрации.
          </p>
        </div>
      </footer>

      {/* Car Details Modal overlay */}
      {selectedCarForDetails && (
        <CarDetailsModal
          car={selectedCarForDetails}
          onClose={() => setSelectedCarForDetails(null)}
          user={user}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onGoToCredit={handleGoToCredit}
          onBookTestDrive={handleBookTestDrive}
        />
      )}

      {/* Auth Modal overlay */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative p-6 md:p-8 animate-fade-in space-y-6">
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                resetAuthForm();
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="bg-amber-100 text-amber-600 p-3.5 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto shadow-sm">
                <UserIcon className="h-6 w-6 stroke-[2.5]" />
              </div>
              <h3 className="heading-display text-xl font-bold text-slate-900">
                {isRegistering ? 'Регистрация аккаунта' : 'Личный кабинет'}
              </h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed px-4">
                {isRegistering 
                  ? 'Зарегистрируйтесь для ведения избранного списка и отправки онлайн-заявок'
                  : 'Войдите, чтобы записываться на тест-драйвы и рассчитывать автокредиты'}
              </p>
            </div>

            {/* Hint Box for Teachers */}
            <div className="bg-amber-50 border border-amber-200 text-slate-700 p-3.5 rounded-xl text-xs space-y-1.5 leading-relaxed">
              <h4 className="font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                <Shield className="h-4 w-4" />
                Инструкция для тестирования:
              </h4>
              <p className="text-[11px] font-semibold text-slate-600">
                • Введите <strong className="text-slate-900 font-mono bg-amber-100 px-1 rounded">admin@auto.ru</strong> для входа с правами <strong>Администратора</strong> (авто-регистрация). Это разблокирует вкладку управления автосалоном!<br />
                • Введите любой другой email для входа как обычный Клиент. Пароль не требуется для быстрой проверки.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
              {isRegistering && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Ваше имя
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={loginName}
                      onChange={e => setLoginName(e.target.value)}
                      placeholder="Иван Иванов"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-800 font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Электронная почта
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="email@example.ru"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-800 font-mono font-semibold"
                  />
                </div>
              </div>

              {authError && (
                <p className="text-rose-600 text-xs font-semibold bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer"
              >
                {isRegistering ? 'Зарегистрироваться' : 'Продолжить'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setAuthError('');
                }}
                className="text-xs text-amber-600 font-bold hover:text-amber-700 hover:underline"
              >
                {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться за 5 секунд'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
