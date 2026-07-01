import React from 'react';
import { Car, User, Shield, LogOut, ListCollapse, Calculator, Heart, Landmark } from 'lucide-react';
import { User as UserType } from '../types.ts';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  favoritesCount: number;
  compareCount: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  onOpenLoginModal,
  favoritesCount,
  compareCount
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setActiveTab('catalog')}
          >
            <div className="bg-amber-500 text-slate-950 p-2 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 stroke-[2.5]" />
            </div>
            <span className="heading-display text-xl font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              AutoSelect
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex space-x-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'catalog'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Car className="h-4 w-4" />
              <span>Каталог</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'compare'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ListCollapse className="h-4 w-4" />
              <span>Сравнение</span>
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 animate-pulse">
                  {compareCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('credit')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'credit'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>Автокредит</span>
            </button>

            {user && (
              <button
                onClick={() => setActiveTab('garage')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'garage'
                    ? 'bg-slate-800 text-amber-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Heart className="h-4 w-4 text-rose-400 fill-current" />
                <span>Мой Гараж</span>
              </button>
            )}

            {user && user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Админ-панель</span>
              </button>
            )}
          </div>

          {/* User Auth controls */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden lg:block text-right">
                  <div className="text-sm font-semibold text-slate-100">{user.name}</div>
                  <div className="text-xs text-slate-400 flex items-center justify-end space-x-1">
                    {user.role === 'admin' ? (
                      <span className="flex items-center text-amber-400 text-[10px] bg-amber-950 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                        Админ
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider font-semibold">Клиент</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                  title="Выйти из аккаунта"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-sm transition-all duration-200 font-semibold"
              >
                Войти в кабинет
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Links */}
      <div className="md:hidden flex overflow-x-auto py-2 px-4 space-x-2 border-t border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'catalog' ? 'bg-slate-800 text-amber-400' : 'text-slate-300'
          }`}
        >
          <Car className="h-3.5 w-3.5" />
          <span>Каталог</span>
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors relative ${
            activeTab === 'compare' ? 'bg-slate-800 text-amber-400' : 'text-slate-300'
          }`}
        >
          <ListCollapse className="h-3.5 w-3.5" />
          <span>Сравнение ({compareCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('credit')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'credit' ? 'bg-slate-800 text-amber-400' : 'text-slate-300'
          }`}
        >
          <Calculator className="h-3.5 w-3.5" />
          <span>Автокредит</span>
        </button>

        {user && (
          <button
            onClick={() => setActiveTab('garage')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'garage' ? 'bg-slate-800 text-amber-400' : 'text-slate-300'
            }`}
          >
            <Heart className="h-3.5 w-3.5 text-rose-400 fill-current" />
            <span>Мой Гараж</span>
          </button>
        )}

        {user && user.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'admin' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Админ</span>
          </button>
        )}
      </div>
    </nav>
  );
}
