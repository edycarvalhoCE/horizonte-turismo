import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, CalendarDays, Settings, Bell, Search, 
  TrendingUp, Users, DollarSign, Plus, Trash2, Edit2, Sparkles, CheckCircle, Loader2, XCircle, Mail, Phone, ChevronDown, Filter, Star, Calendar,
  Plane, Bus, Ship, Train, CheckSquare, Square, MinusCircle, PlusCircle
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TravelPackage, Booking, ChartData } from './types';
import { generatePackageDetails } from './services/geminiService';

interface AdminDashboardProps {
  packages: TravelPackage[];
  setPackages: React.Dispatch<React.SetStateAction<TravelPackage[]>>;
  bookings: Booking[];
  stats: ChartData[];
  onUpdateStatus: (id: string, status: 'Confirmado' | 'Pendente' | 'Cancelado') => void;
}

const INCLUDED_OPTIONS = [
  "Transporte em ônibus de turismo",
  "Aereo",
  "Guia de Turismo Credenciado",
  "Serviço de Bordo",
  "Sorteio de Brindes",
  "Hotel",
  "Café da manhã",
  "Almoço",
  "Jantar",
  "All inclusive",
  "Ingressos",
  "Passeios",
  "Seguro viagem"
];

const EXCLUDED_OPTIONS = [
  "Bebidas e sobremesas",
  "Ingressos nos locais visitados",
  "Passeios opcionais"
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ packages, setPackages, bookings, stats, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'bookings'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewPackageId, setViewPackageId] = useState<string | null>(null);
  
  // State for Editing
  const [editingId, setEditingId] = useState<string | null>(null);

  // Package Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'standard'>('all');
  const [priceRange, setPriceRange] = useState<{min: string, max: string}>({min: '', max: ''});
  
  // New/Edit Package Form State
  const [newPackage, setNewPackage] = useState<Partial<TravelPackage>>({
    title: '', location: '', price: 0, duration: '', image: '', description: '', featured: false, availableDates: [], transportTypes: [], includedItems: [], excludedItems: []
  });
  const [datesInput, setDatesInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter Packages Logic
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pkg.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFeatured = filterFeatured === 'all' 
      ? true 
      : filterFeatured === 'featured' ? pkg.featured : !pkg.featured;

    const min = priceRange.min === '' ? 0 : Number(priceRange.min);
    const max = priceRange.max === '' ? Infinity : Number(priceRange.max);
    const matchesPrice = pkg.price >= min && pkg.price <= max;

    return matchesSearch && matchesFeatured && matchesPrice;
  });

  // Toggle Transport Type
  const toggleTransport = (type: string) => {
    setNewPackage(prev => {
      const current = prev.transportTypes || [];
      if (current.includes(type)) {
        return { ...prev, transportTypes: current.filter(t => t !== type) };
      } else {
        return { ...prev, transportTypes: [...current, type] };
      }
    });
  };

  // Toggle Included Items
  const toggleIncluded = (item: string) => {
    setNewPackage(prev => {
        const current = prev.includedItems || [];
        if (current.includes(item)) {
            return { ...prev, includedItems: current.filter(i => i !== item) };
        } else {
            return { ...prev, includedItems: [...current, item] };
        }
    });
  };

  // Toggle Excluded Items
  const toggleExcluded = (item: string) => {
    setNewPackage(prev => {
        const current = prev.excludedItems || [];
        if (current.includes(item)) {
            return { ...prev, excludedItems: current.filter(i => i !== item) };
        } else {
            return { ...prev, excludedItems: [...current, item] };
        }
    });
  };

  // Gemini AI Handler for Description Generation
  const handleGenerateDescription = async () => {
    if (!newPackage.location || !newPackage.duration || !newPackage.price) {
      alert("Por favor, preencha Destino, Duração e Preço para que a IA possa gerar o conteúdo.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const data = await generatePackageDetails(
        newPackage.location, 
        newPackage.duration, 
        newPackage.price.toString()
      );
      setNewPackage(prev => ({
        ...prev,
        // In a real app we might store itinerary separately, appending to desc for now
        description: `${data.description}\n\nItinerário Sugerido:\n${data.itinerary}`
      }));
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar conteúdo com IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Open Modal for Editing
  const handleEditPackage = (pkg: TravelPackage) => {
    setNewPackage({
        title: pkg.title,
        location: pkg.location,
        price: pkg.price,
        duration: pkg.duration,
        image: pkg.image,
        description: pkg.description,
        featured: pkg.featured,
        availableDates: pkg.availableDates,
        transportTypes: pkg.transportTypes,
        includedItems: pkg.includedItems || [],
        excludedItems: pkg.excludedItems || []
    });
    setDatesInput(pkg.availableDates.join(', '));
    setEditingId(pkg.id);
    setShowAddModal(true);
  };

  // Close Modal and Reset Form
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setNewPackage({ title: '', location: '', price: 0, duration: '', image: '', description: '', featured: false, availableDates: [], transportTypes: [], includedItems: [], excludedItems: [] });
    setDatesInput('');
  };

  const handleSavePackage = () => {
    if(!newPackage.title || !newPackage.price) return;
    
    const datesArray = datesInput.split(',').map(d => d.trim()).filter(d => d !== '');

    if (editingId) {
        // UPDATE Existing Package
        setPackages(prev => prev.map(p => {
            if (p.id === editingId) {
                return {
                    ...p,
                    ...newPackage,
                    price: Number(newPackage.price),
                    availableDates: datesArray,
                    transportTypes: newPackage.transportTypes || [],
                    includedItems: newPackage.includedItems || [],
                    excludedItems: newPackage.excludedItems || []
                };
            }
            return p;
        }));
    } else {
        // CREATE New Package
        const pkg: TravelPackage = {
            id: Date.now().toString(),
            title: newPackage.title || '',
            location: newPackage.location || '',
            price: Number(newPackage.price),
            duration: newPackage.duration || '',
            image: newPackage.image || 'https://picsum.photos/400/300',
            description: newPackage.description || '',
            rating: 0, // New packages start with 0 or 5
            featured: newPackage.featured || false,
            availableDates: datesArray,
            reviews: [],
            transportTypes: newPackage.transportTypes || [],
            includedItems: newPackage.includedItems || [],
            excludedItems: newPackage.excludedItems || []
        };
        setPackages(prev => [pkg, ...prev]);
    }

    handleCloseModal();
  };

  const handleDeletePackage = (id: string) => {
    if(confirm("Tem certeza que deseja remover este pacote?")) {
      setPackages(prev => prev.filter(p => p.id !== id));
    }
  };

  // Derived state for viewing package details
  const viewedPackage = packages.find(p => p.id === viewPackageId);
  const viewedPackageBookings = bookings.filter(b => b.packageId === viewPackageId);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <TrendingUp className="text-cyan-500 w-6 h-6 mr-3" />
          <span className="font-bold text-white text-lg tracking-wide">Horizonte <span className="text-xs font-normal text-slate-400">Admin</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'packages' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <Package className="w-5 h-5 mr-3" />
            Pacotes
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'bookings' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <CalendarDays className="w-5 h-5 mr-3" />
            Reservas
          </button>
          <button className="w-full flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-slate-800 text-slate-400">
            <Users className="w-5 h-5 mr-3" />
            Clientes
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center px-4 py-2 text-sm hover:text-white transition-colors">
            <Settings className="w-4 h-4 mr-3" /> Configurações
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'overview' ? 'Painel de Controle' : 
               activeTab === 'packages' ? 'Gerenciar Pacotes' : 'Gestão de Reservas'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Bem-vindo de volta, Administrador.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-slate-400 hover:text-slate-600 cursor-pointer" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-100"></span>
            </div>
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold border border-cyan-200">
              AD
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
                <div className="p-4 bg-green-50 rounded-lg mr-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Receita Mensal</p>
                  <h3 className="text-2xl font-bold text-slate-900">R$ 145.200</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1" /> +12.5% vs mês anterior</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
                <div className="p-4 bg-blue-50 rounded-lg mr-4">
                  <CalendarDays className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Reservas Ativas</p>
                  <h3 className="text-2xl font-bold text-slate-900">{bookings.filter(b => b.status === 'Confirmado').length}</h3>
                  <p className="text-xs text-blue-600 flex items-center mt-1">Total Confirmado</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
                <div className="p-4 bg-purple-50 rounded-lg mr-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Reservas</p>
                  <h3 className="text-2xl font-bold text-slate-900">{bookings.length}</h3>
                  <p className="text-xs text-purple-600 flex items-center mt-1">Todos os status</p>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-6 text-slate-800">Desempenho de Vendas</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0891b2" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                        itemStyle={{color: '#0e7490'}}
                      />
                      <Area type="monotone" dataKey="value" stroke="#0891b2" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-6 text-slate-800">Últimas Reservas</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-3 font-semibold text-slate-500 text-sm">Cliente</th>
                        <th className="pb-3 font-semibold text-slate-500 text-sm">Destino</th>
                        <th className="pb-3 font-semibold text-slate-500 text-sm">Status</th>
                        <th className="pb-3 font-semibold text-slate-500 text-sm text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="py-4 font-medium text-slate-700">{booking.customerName}</td>
                          <td className="py-4 text-slate-500">{booking.packageName || packages.find(p => p.id === booking.packageId)?.title}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              booking.status === 'Confirmado' ? 'bg-green-100 text-green-700' :
                              booking.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-4 text-right font-medium text-slate-700">R$ {booking.amount.toLocaleString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar pacotes..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                  />
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Novo Pacote
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Filtros:</span>
                </div>
                
                {/* Featured Filter */}
                <select 
                    value={filterFeatured}
                    onChange={(e) => setFilterFeatured(e.target.value as 'all' | 'featured' | 'standard')}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                >
                    <option value="all">Todos os Status</option>
                    <option value="featured">Destaques</option>
                    <option value="standard">Padrão</option>
                </select>

                {/* Price Range */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Preço:</span>
                    <input 
                        type="number" 
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({...prev, min: e.target.value}))}
                        className="w-24 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <span className="text-slate-400">-</span>
                    <input 
                        type="number" 
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({...prev, max: e.target.value}))}
                        className="w-24 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>

                {/* Clear Filters */}
                {(searchTerm || filterFeatured !== 'all' || priceRange.min || priceRange.max) && (
                    <button 
                        onClick={() => {
                            setSearchTerm('');
                            setFilterFeatured('all');
                            setPriceRange({min: '', max: ''});
                        }}
                        className="text-sm text-red-500 hover:text-red-700 ml-auto"
                    >
                        Limpar Filtros
                    </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Pacote</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Localização</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Preço</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Duração</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-sm text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img src={pkg.image} alt="" className="w-10 h-10 rounded-lg object-cover mr-3" />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-slate-700">{pkg.title}</span>
                              {pkg.featured && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                            </div>
                            <div className="text-xs text-slate-400">
                              {pkg.availableDates && pkg.availableDates.length > 0 
                                ? `${pkg.availableDates.length} datas disponíveis` 
                                : 'Datas abertas'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{pkg.location}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">R$ {pkg.price.toLocaleString('pt-BR')}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{pkg.duration}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setViewPackageId(pkg.id)}
                            className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg"
                            title="Ver Interessados"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditPackage(pkg)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            title="Editar Pacote"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Remover Pacote"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPackages.length === 0 && (
                     <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                           Nenhum pacote encontrado com estes filtros.
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Detalhes da Reserva</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Cliente</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Data Viagem</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Valor</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">{booking.packageName}</span>
                          <span className="text-xs text-slate-500">Reserva: #{booking.id}</span>
                          <span className="text-xs text-slate-500">Pacote ID: {booking.packageId}</span>
                          <span className="text-xs font-semibold text-slate-600 mt-1">{booking.travelers} viajante(s)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">{booking.customerName}</span>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Mail className="w-3 h-3" /> {booking.email}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Phone className="w-3 h-3" /> {booking.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{booking.date}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm font-semibold">R$ {booking.amount.toLocaleString('pt-BR')}</td>
                      <td className="px-6 py-4">
                        <div className="relative w-40">
                          <select
                            value={booking.status}
                            onChange={(e) => onUpdateStatus(booking.id, e.target.value as 'Confirmado' | 'Pendente' | 'Cancelado')}
                            className={`appearance-none w-full pl-3 pr-8 py-2 rounded-lg text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-opacity-50 transition-all ${
                              booking.status === 'Confirmado' ? 'bg-green-100 text-green-700 focus:ring-green-500 hover:bg-green-200' :
                              booking.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700 focus:ring-yellow-500 hover:bg-yellow-200' :
                              'bg-red-100 text-red-700 focus:ring-red-500 hover:bg-red-200'
                            }`}
                          >
                            <option value="Pendente">Pendente</option>
                            <option value="Confirmado">Confirmado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                          <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                            booking.status === 'Confirmado' ? 'text-green-700' :
                            booking.status === 'Pendente' ? 'text-yellow-700' :
                            'text-red-700'
                          }`} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                     <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                           Nenhuma reserva encontrada.
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Package Interested View Modal */}
      {viewPackageId && viewedPackage && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                           <Users className="w-6 h-6 text-cyan-600" />
                           Interessados no Pacote
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                           {viewedPackage.title} • <span className="font-medium text-slate-700">{viewedPackage.location}</span>
                        </p>
                    </div>
                    <button onClick={() => setViewPackageId(null)} className="text-slate-400 hover:text-slate-600">
                       <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-white">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-600 uppercase">Total Reservas</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{viewedPackageBookings.length}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <p className="text-xs font-bold text-green-600 uppercase">Receita Estimada</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                                R$ {viewedPackageBookings.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('pt-BR')}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <p className="text-xs font-bold text-purple-600 uppercase">Total Viajantes</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">
                                {viewedPackageBookings.reduce((acc, curr) => acc + curr.travelers, 0)}
                            </p>
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Contato</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Data Viagem</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Viajantes</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {viewedPackageBookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-700">{booking.customerName}</td>
                                        <td className="px-4 py-3 text-slate-600">
                                            <div className="flex flex-col text-xs">
                                                <span>{booking.email}</span>
                                                <span className="opacity-75">{booking.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{booking.date}</td>
                                        <td className="px-4 py-3 text-center text-slate-700 font-medium">{booking.travelers}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                                booking.status === 'Confirmado' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {viewedPackageBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">
                                            Ainda não há interessados para este pacote.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button 
                        onClick={() => setViewPackageId(null)}
                        className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Add/Edit Package Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? 'Editar Pacote' : 'Criar Novo Pacote'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Pacote</label>
                  <input 
                    type="text" 
                    value={newPackage.title}
                    onChange={(e) => setNewPackage({...newPackage, title: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
                  <input 
                    type="text" 
                    value={newPackage.location}
                    onChange={(e) => setNewPackage({...newPackage, location: e.target.value})}
                    placeholder="Ex: Paris, França"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
                  <input 
                    type="number" 
                    value={newPackage.price}
                    onChange={(e) => setNewPackage({...newPackage, price: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duração</label>
                  <input 
                    type="text" 
                    value={newPackage.duration}
                    onChange={(e) => setNewPackage({...newPackage, duration: e.target.value})}
                    placeholder="Ex: 5 dias, 4 noites"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" 
                  />
                </div>
              </div>

              {/* Included Items Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      O que está incluído?
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                      {INCLUDED_OPTIONS.map((item) => {
                          const isIncluded = newPackage.includedItems?.includes(item);
                          return (
                              <button
                                  key={item}
                                  onClick={() => toggleIncluded(item)}
                                  className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg border transition-all text-left ${
                                      isIncluded 
                                      ? 'bg-green-100 border-green-200 text-green-800 font-medium' 
                                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                  }`}
                              >
                                  {isIncluded ? <CheckSquare className="w-3 h-3 shrink-0" /> : <Square className="w-3 h-3 shrink-0" />}
                                  {item}
                              </button>
                          );
                      })}
                  </div>
              </div>

              {/* Excluded Items Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      O que não está incluído?
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                      {EXCLUDED_OPTIONS.map((item) => {
                          const isExcluded = newPackage.excludedItems?.includes(item);
                          return (
                              <button
                                  key={item}
                                  onClick={() => toggleExcluded(item)}
                                  className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg border transition-all text-left ${
                                      isExcluded 
                                      ? 'bg-red-50 border-red-200 text-red-800 font-medium' 
                                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                  }`}
                              >
                                  {isExcluded ? <MinusCircle className="w-3 h-3 shrink-0" /> : <PlusCircle className="w-3 h-3 shrink-0" />}
                                  {item}
                              </button>
                          );
                      })}
                  </div>
              </div>

               {/* Transport Type Multi-Select */}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Meios de Transporte (Selecione um ou mais)</label>
                 <div className="flex flex-wrap gap-2">
                    {['Aéreo', 'Rodoviário', 'Cruzeiro', 'Ferroviário'].map((type) => {
                       const isSelected = newPackage.transportTypes?.includes(type);
                       let Icon = Plane;
                       if (type === 'Rodoviário') Icon = Bus;
                       if (type === 'Cruzeiro') Icon = Ship;
                       if (type === 'Ferroviário') Icon = Train;

                       return (
                          <button
                            key={type}
                            onClick={() => toggleTransport(type)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                              isSelected 
                                ? 'bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-600' : 'text-slate-400'}`} />
                            {type}
                          </button>
                       );
                    })}
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Datas Disponíveis (opcional)</label>
                 <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      value={datesInput}
                      onChange={(e) => setDatesInput(e.target.value)}
                      placeholder="Ex: 2023-12-15, 2024-01-20 (YYYY-MM-DD separadas por vírgula)"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none" 
                    />
                 </div>
                 <p className="text-xs text-slate-400 mt-1">Deixe em branco para permitir qualquer data.</p>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">URL da Imagem</label>
                  <input 
                    type="text" 
                    value={newPackage.image}
                    onChange={(e) => setNewPackage({...newPackage, image: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" 
                  />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Descrição & Itinerário</label>
                  <button 
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-semibold hover:bg-purple-200 transition-colors flex items-center gap-1"
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Gerar com IA
                  </button>
                </div>
                <textarea 
                  value={newPackage.description}
                  onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                  rows={6}
                  placeholder={isGenerating ? "A IA está escrevendo o conteúdo para você..." : "Escreva os detalhes ou use a IA para gerar..."}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSavePackage}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm shadow-cyan-600/20"
              >
                <CheckCircle className="w-4 h-4" />
                {editingId ? 'Atualizar Pacote' : 'Salvar Pacote'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper for modal close button
const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);