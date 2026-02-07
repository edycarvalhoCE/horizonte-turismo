
import React, { useState } from 'react';
import { PublicSite } from './PublicSite';
import { AdminDashboard } from './AdminDashboard';
import { TravelPackage, Booking, ChartData, Review, Customer } from './types';
import { Monitor, Layout } from 'lucide-react';

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-9999', birthDate: '1985-05-20', joinedAt: '2023-01-10' },
  { id: 'c2', name: 'Maria Oliveira', email: 'maria@email.com', phone: '(21) 98888-8888', birthDate: new Date().toISOString().split('T')[0], joinedAt: '2023-03-15' }, // Aniversário Hoje!
  { id: 'c3', name: 'Carlos Souza', email: 'carlos@email.com', phone: '(31) 97777-7777', birthDate: '1992-12-10', joinedAt: '2023-05-20' },
  { id: 'c4', name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 91234-5678', birthDate: '1990-11-25', joinedAt: '2023-08-05' },
];

const INITIAL_PACKAGES: TravelPackage[] = [
  {
    id: '1',
    title: 'Paraíso em Fernando de Noronha',
    location: 'Fernando de Noronha, BR',
    price: 4500,
    duration: '5 Dias',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=800',
    description: 'Mergulhe nas águas cristalinas do Sancho. Inclui passeio de barco, trilhas e hospedagem em pousada de charme.',
    rating: 4.9,
    featured: true,
    availableDates: ['2023-11-15', '2023-12-10', '2024-01-20'],
    transportTypes: ['Aéreo', 'Cruzeiro'],
    includedItems: ['Aéreo', 'Hotel', 'Café da manhã', 'Passeios', 'Guia de Turismo Credenciado'],
    excludedItems: ['Jantar', 'Bebidas e sobremesas'],
    reviews: [
      { id: 'r1', userName: 'Ana Costa', rating: 5, comment: 'Lugar mágico! A pousada era incrível.', date: '2023-09-10' },
      { id: 'r2', userName: 'Pedro Santos', rating: 4, comment: 'Passeios ótimos, mas o preço da alimentação na ilha é alto.', date: '2023-08-15' }
    ]
  },
  {
    id: '2',
    title: 'Inverno Europeu em Gramado',
    location: 'Gramado, RS',
    price: 2800,
    duration: '4 Dias',
    image: 'https://images.unsplash.com/photo-1543362140-54737976e82a?auto=format&fit=crop&q=80&w=800',
    description: 'Curta o frio da serra gaúcha com muito chocolate, vinhos e passeios românticos pelo Lago Negro.',
    rating: 4.7,
    featured: true,
    availableDates: ['2024-06-20'],
    transportTypes: ['Aéreo', 'Rodoviário'],
    includedItems: ['Aéreo', 'Transporte em ônibus de turismo', 'Hotel', 'Café da manhã', 'Ingressos'],
    excludedItems: ['Almoço', 'Jantar', 'Bebidas e sobremesas'],
    reviews: [
      { id: 'r3', userName: 'Mariana Lima', rating: 5, comment: 'Tudo perfeito. O fondue incluso valeu muito a pena.', date: '2023-07-20' }
    ]
  }
];

const INITIAL_BOOKINGS: Booking[] = [
  { id: '101', customerName: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-9999', travelers: 2, packageId: '1', packageName: 'Paraíso em Fernando de Noronha', date: '2023-10-15', status: 'Confirmado', amount: 9000 },
  { id: '102', customerName: 'Maria Oliveira', email: 'maria@email.com', phone: '(21) 98888-8888', travelers: 1, packageId: '2', packageName: 'Inverno Europeu em Gramado', date: '2023-10-16', status: 'Pendente', amount: 2800 },
];

const STATS_DATA: ChartData[] = [
  { name: 'Jan', value: 40000 },
  { name: 'Fev', value: 30000 },
  { name: 'Mar', value: 20000 },
  { name: 'Abr', value: 27800 },
  { name: 'Mai', value: 18900 },
  { name: 'Jun', value: 23900 },
  { name: 'Jul', value: 34900 },
  { name: 'Ago', value: 45000 },
];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [packages, setPackages] = useState<TravelPackage[]>(INITIAL_PACKAGES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [stats] = useState<ChartData[]>(STATS_DATA);

  const handleNewBooking = (newBookingData: Omit<Booking, 'id' | 'status'>) => {
    const newBooking: Booking = {
      ...newBookingData,
      id: Date.now().toString(),
      status: 'Pendente',
    };

    // Auto-create customer if doesn't exist
    if (!customers.find(c => c.email === newBooking.email)) {
      const newCustomer: Customer = {
        id: `c_${Date.now()}`,
        name: newBooking.customerName,
        email: newBooking.email,
        phone: newBooking.phone,
        birthDate: '1990-01-01', // Default, needs to be updated by admin or user profile
        joinedAt: new Date().toISOString().split('T')[0]
      };
      setCustomers(prev => [...prev, newCustomer]);
    }

    setBookings(prev => [newBooking, ...prev]);
    alert("Solicitação de reserva recebida! Verifique seu e-mail.");
  };

  const handleUpdateBookingStatus = (id: string, newStatus: 'Confirmado' | 'Pendente' | 'Cancelado') => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const handleAddReview = (packageId: string, reviewData: { userName: string; rating: number; comment: string }) => {
    setPackages(prevPackages => prevPackages.map(pkg => {
      if (pkg.id !== packageId) return pkg;
      const newReview: Review = {
        id: Date.now().toString(),
        ...reviewData,
        date: new Date().toISOString().split('T')[0]
      };
      const updatedReviews = [newReview, ...pkg.reviews];
      const totalStars = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
      return {
        ...pkg,
        reviews: updatedReviews,
        rating: Number((totalStars / updatedReviews.length).toFixed(1))
      };
    }));
  };

  return (
    <div className="relative">
      <div className="fixed bottom-4 left-4 z-[9999] bg-slate-900 text-white p-1 rounded-full shadow-2xl border border-slate-700 flex items-center gap-1 scale-90 opacity-80 hover:opacity-100 hover:scale-100 transition-all">
        <button onClick={() => setViewMode('public')} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-colors ${viewMode === 'public' ? 'bg-cyan-600' : 'hover:bg-slate-800'}`}>
          <Monitor className="w-4 h-4" /> Site
        </button>
        <button onClick={() => setViewMode('admin')} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-colors ${viewMode === 'admin' ? 'bg-purple-600' : 'hover:bg-slate-800'}`}>
          <Layout className="w-4 h-4" /> Admin
        </button>
      </div>

      {viewMode === 'public' ? (
        <PublicSite packages={packages} onBook={handleNewBooking} onAddReview={handleAddReview} />
      ) : (
        <AdminDashboard 
          packages={packages} 
          setPackages={setPackages}
          bookings={bookings}
          customers={customers}
          setCustomers={setCustomers}
          stats={stats}
          onUpdateStatus={handleUpdateBookingStatus}
        />
      )}
    </div>
  );
};

export default App;
