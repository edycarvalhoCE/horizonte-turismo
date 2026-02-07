
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Package, CalendarDays, Settings, Bell, Search, 
  TrendingUp, Users, DollarSign, Plus, Trash2, Edit2, Sparkles, CheckCircle, Loader2, XCircle, Mail, Phone, ChevronDown, Filter, Star, Calendar,
  Plane, Bus, Ship, Train, CheckSquare, Square, MinusCircle, PlusCircle, Cake, Info, ArrowRight, User
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TravelPackage, Booking, ChartData, Customer } from './types';
import { generatePackageDetails } from './services/geminiService';

interface AdminDashboardProps {
  packages: TravelPackage[];
  setPackages: React.Dispatch<React.SetStateAction<TravelPackage[]>>;
  bookings: Booking[];
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  stats: ChartData[];
  onUpdateStatus: (id: string, status: 'Confirmado' | 'Pendente' | 'Cancelado') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  packages, setPackages, bookings, customers, setCustomers, stats, onUpdateStatus 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'bookings' | 'customers'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewPackageId, setViewPackageId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Aniversários hoje
  const birthdaysToday = useMemo(() => {
    const today = new Date().toISOString().slice(5, 10); // MM-DD
    return customers.filter(c => c.birthDate.slice(5, 10) === today);
  }, [customers]);

  // Aniversários do mês
  const birthdaysThisMonth = useMemo(() => {
    const month = new Date().toISOString().slice(5, 7); // MM
    return customers.filter(c => c.birthDate.slice(5, 7) === month);
  }, [customers]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerHistory = bookings.filter(b => b.email === selectedCustomer?.email);

  // --- Funções de Gestão de Pacotes --- (Mantidas as existentes por brevidade, focando na nova feature)
  const [newPackage, setNewPackage] = useState<Partial<TravelPackage>>({ title: '', price: 0 });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    if (!newPackage.location || !newPackage.duration || !newPackage.price) {
      alert("Preencha Destino, Duração e Preço.");
      return;
    }
    setIsGenerating(true);
    try {
      const data = await generatePackageDetails(newPackage.location, newPackage.duration, newPackage.price.toString());
      setNewPackage(prev => ({ ...prev, description: `${data.description}\n\nItinerário:\n${data.itinerary}` }));
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <TrendingUp className="text-cyan-500 w-6 h-6 mr-3" />
          <span className="font-bold text-white text-lg tracking-wide">Horizonte <span className="text-xs font-normal text-slate-400">Admin</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Visão Geral
          </button>
          <button onClick={() => setActiveTab('packages')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'packages' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800'}`}>
            <Package className="w-5 h-5 mr-3" /> Pacotes
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'bookings' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800'}`}>
            <CalendarDays className="w-5 h-5 mr-3" /> Reservas
          </button>
          <button onClick={() => setActiveTab('customers')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'customers' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800'}`}>
            <Users className="w-5 h-5 mr-3" /> Clientes
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'overview' ? 'Painel de Controle' : 
               activeTab === 'packages' ? 'Gerenciar Pacotes' : 
               activeTab === 'customers' ? 'Base de Clientes' : 'Reservas'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group">
              <Bell className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
              {birthdaysToday.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-white text-[10px] flex items-center justify-center text-white font-bold animate-pulse">
                  {birthdaysToday.length}
                </span>
              )}
              {/* Dropdown de Notificação Rápida */}
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 hidden group-hover:block p-4 z-50">
                <h4 className="font-bold text-xs text-slate-400 uppercase mb-3">Notificações</h4>
                {birthdaysToday.length > 0 ? (
                  birthdaysToday.map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-2 bg-pink-50 rounded-lg mb-2">
                      <Cake className="w-4 h-4 text-pink-500" />
                      <span className="text-sm font-medium text-pink-700">{c.name} faz anos hoje!</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Sem notificações recentes.</p>
                )}
              </div>
            </div>
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold border border-cyan-200">AD</div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                   <p className="text-sm text-slate-500 font-medium">Receita Mensal</p>
                   <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">R$ 145.200</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                   <p className="text-sm text-slate-500 font-medium">Clientes Totais</p>
                   <Users className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{customers.length}</h3>
              </div>
              {/* Card de Aniversários */}
              <div className="bg-gradient-to-br from-pink-500 to-rose-400 p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center justify-between mb-4">
                   <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Festa do Mês</p>
                   <Cake className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold">{birthdaysThisMonth.length} Aniversariantes</h3>
                <p className="text-xs mt-2 opacity-90">{birthdaysToday.length} celebram hoje! 🎉</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h3 className="text-lg font-bold mb-6 text-slate-800">Desempenho</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#0891b2" fill="#0891b220" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               {/* Lista Rápida de Aniversariantes */}
               <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Aniversariantes Próximos</h3>
                  <div className="space-y-3">
                    {birthdaysThisMonth.slice(0, 4).map(c => (
                      <div key={c.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${c.birthDate.slice(5, 10) === new Date().toISOString().slice(5, 10) ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-500'}`}>
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{c.name}</p>
                            <p className="text-xs text-slate-500">Data: {new Date(c.birthDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                          </div>
                        </div>
                        <button onClick={() => { setActiveTab('customers'); setSelectedCustomerId(c.id); }} className="text-cyan-600 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-bold">
                           Ver Perfil <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar clientes por nome ou e-mail..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800">Exportar Base</button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase">Viajante</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase">Contato</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase">Aniversário</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase">Cliente Desde</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((c) => {
                    const isBdayToday = c.birthDate.slice(5, 10) === new Date().toISOString().slice(5, 10);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">{c.name.charAt(0)}</div>
                            <span className="font-medium text-slate-700">{c.name}</span>
                            {isBdayToday && <Cake className="w-4 h-4 text-pink-500" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-500 space-y-1">
                            <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</div>
                            <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-sm ${isBdayToday ? 'font-bold text-pink-600' : 'text-slate-600'}`}>
                             {new Date(c.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(c.joinedAt).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => setSelectedCustomerId(c.id)}
                            className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-cyan-100 transition-colors"
                          >
                            Ver Histórico
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Mantidas Abas de Pacotes e Reservas --- */}
        {activeTab === 'packages' && (
           <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold">Lista de Pacotes</h3>
                <button onClick={() => setShowAddModal(true)} className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Novo Pacote</button>
              </div>
              {/* Conteúdo resumido para brevidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map(p => (
                  <div key={p.id} className="p-4 border border-slate-100 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={p.image} className="w-12 h-12 object-cover rounded-lg" />
                      <div>
                        <p className="font-bold text-sm">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Edit2 className="w-4 h-4" /></button>
                       <button className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}

        {activeTab === 'bookings' && (
           <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                   <tr>
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Reserva</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Cliente</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Valor</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {bookings.map(b => (
                     <tr key={b.id}>
                        <td className="px-6 py-4 text-sm font-medium">{b.packageName}</td>
                        <td className="px-6 py-4 text-sm">{b.customerName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${b.status === 'Confirmado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-slate-700">R$ {b.amount.toLocaleString('pt-BR')}</td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </div>
        )}
      </main>

      {/* Modal Histórico do Cliente */}
      {selectedCustomerId && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedCustomer.name}</h2>
                    <p className="text-sm text-slate-500">Membro desde {new Date(selectedCustomer.joinedAt).toLocaleDateString('pt-BR')}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedCustomerId(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                 <XCircle className="w-8 h-8 text-slate-400" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <p className="text-xs font-bold text-slate-400 uppercase">Total de Viagens</p>
                   <p className="text-2xl font-bold text-slate-800">{customerHistory.length}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <p className="text-xs font-bold text-slate-400 uppercase">Investimento Total</p>
                   <p className="text-2xl font-bold text-cyan-600">R$ {customerHistory.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <p className="text-xs font-bold text-slate-400 uppercase">Próximo Aniversário</p>
                   <div className="flex items-center gap-2 text-rose-500">
                      <Cake className="w-5 h-5" />
                      <p className="text-lg font-bold">{new Date(selectedCustomer.birthDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                   </div>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-cyan-600" /> Histórico de Viagens
              </h3>
              
              {customerHistory.length > 0 ? (
                <div className="space-y-4">
                   {customerHistory.map(b => (
                     <div key={b.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                           <div className={`p-3 rounded-lg ${b.status === 'Confirmado' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                             {b.status === 'Confirmado' ? <CheckCircle className="w-6 h-6" /> : <Loader2 className="w-6 h-6" />}
                           </div>
                           <div>
                              <p className="font-bold text-slate-800">{b.packageName}</p>
                              <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                 <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Partida: {b.date}</span>
                                 <span className="flex items-center gap-1"><User className="w-3 h-3" /> {b.travelers} viajante(s)</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-slate-900">R$ {b.amount.toLocaleString('pt-BR')}</p>
                           <p className={`text-[10px] font-bold uppercase mt-1 ${b.status === 'Confirmado' ? 'text-green-500' : 'text-yellow-500'}`}>{b.status}</p>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                   <Info className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                   <p className="text-slate-500 italic">Nenhum histórico de viagens encontrado para este cliente.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Package (Simplificado) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Novo Pacote</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Destino" className="w-full p-2 border border-slate-200 rounded-lg outline-none" value={newPackage.location} onChange={e => setNewPackage({...newPackage, location: e.target.value})} />
              <input type="text" placeholder="Duração (ex: 5 dias)" className="w-full p-2 border border-slate-200 rounded-lg outline-none" value={newPackage.duration} onChange={e => setNewPackage({...newPackage, duration: e.target.value})} />
              <input type="number" placeholder="Preço" className="w-full p-2 border border-slate-200 rounded-lg outline-none" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: Number(e.target.value)})} />
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <button onClick={handleGenerateDescription} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 text-purple-700 font-bold text-sm">
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Gerar Descrição com IA
                </button>
                {newPackage.description && <p className="text-xs text-slate-600 mt-2 line-clamp-3">{newPackage.description}</p>}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-500">Cancelar</button>
                <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-bold">Criar Pacote</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
