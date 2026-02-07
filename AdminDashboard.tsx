
import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Package, CalendarDays, Settings, Bell, Search, TrendingUp, Users, DollarSign, Plus, Trash2, Edit2, Sparkles, CheckCircle, Loader2, XCircle, Mail, Phone, ChevronDown, Filter, Star, Calendar, Plane, Bus, Ship, Train, Cake } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TravelPackage, Booking, ChartData, Customer } from './types.ts';
import { generatePackageDetails } from './services/geminiService.ts';

interface AdminDashboardProps {
  packages: TravelPackage[];
  setPackages: React.Dispatch<React.SetStateAction<TravelPackage[]>>;
  bookings: Booking[];
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  stats: ChartData[];
  onUpdateStatus: (id: string, status: 'Confirmado' | 'Pendente' | 'Cancelado') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ packages, setPackages, bookings, customers, setCustomers, stats, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'bookings' | 'customers'>('overview');

  const birthdaysToday = useMemo(() => {
    const today = new Date().toISOString().slice(5, 10);
    return customers.filter(c => c.birthDate.slice(5, 10) === today);
  }, [customers]);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <TrendingUp className="text-cyan-500 mr-3" />
          <span className="font-bold text-white">Horizonte Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4 text-sm">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === 'overview' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800'}`}><LayoutDashboard className="mr-3 w-4 h-4" /> Visão Geral</button>
          <button onClick={() => setActiveTab('packages')} className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === 'packages' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800'}`}><Package className="mr-3 w-4 h-4" /> Pacotes</button>
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === 'bookings' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800'}`}><CalendarDays className="mr-3 w-4 h-4" /> Reservas</button>
          <button onClick={() => setActiveTab('customers')} className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === 'customers' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800'}`}><Users className="mr-3 w-4 h-4" /> Clientes</button>
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 capitalize tracking-tight">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="text-slate-400" />
              {birthdaysToday.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-[10px] flex items-center justify-center text-white">{birthdaysToday.length}</span>}
            </div>
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold">AD</div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Clientes Ativos</p>
              <h3 className="text-3xl font-bold">{customers.length}</h3>
            </div>
            <div className="bg-pink-500 p-6 rounded-xl shadow-sm text-white flex justify-between items-center">
              <div>
                <p className="text-xs opacity-80 uppercase font-bold mb-1">Aniversariantes</p>
                <h3 className="text-3xl font-bold">{birthdaysToday.length} Hoje</h3>
              </div>
              <Cake className="w-10 h-10 opacity-40" />
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase">Nome</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase">Contato</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase">Aniversário</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                      {c.name} {c.birthDate.slice(5, 10) === new Date().toISOString().slice(5, 10) && <Cake className="w-4 h-4 text-pink-500" />}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{c.email}</td>
                    <td className="px-6 py-4">{new Date(c.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
