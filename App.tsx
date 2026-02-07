
import React, { useState } from 'react';
import { PublicSite } from './PublicSite.tsx';
import { AdminDashboard } from './AdminDashboard.tsx';
import { TravelPackage, Booking, ChartData, Review, Customer } from './types.ts';
import { Monitor, Layout } from 'lucide-react';

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-9999', birthDate: '1985-05-20', joinedAt: '2023-01-10' },
  { id: 'c2', name: 'Maria Oliveira', email: 'maria@email.com', phone: '(21) 98888-8888', birthDate: new Date().toISOString().split('T')[0], joinedAt: '2023-03-15' },
  { id: 'c3', name: 'Carlos Souza', email: 'carlos@email.com', phone: '(31) 97777-7777', birthDate: '1992-12-10', joinedAt: '2023-05-20' },
];

const INITIAL_PACKAGES: TravelPackage[] = [
  {
    id: '1',
    title: 'Paraíso em Fernando de Noronha',
    location: 'Fernando de Noronha, BR',
    price: 4500,
    duration: '5 Dias',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=800',
    description: 'Mergulhe nas águas cristalinas do Sancho.',
    rating: 4.9,
    featured: true,
    availableDates: ['2023-11-15'],
    transportTypes: ['Aéreo'],
    includedItems: ['Aéreo', 'Hotel'],
    excludedItems: ['Jantar'],
    reviews: []
  }
];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [packages, setPackages] = useState<TravelPackage[]>(INITIAL_PACKAGES);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  const handleNewBooking = (data: any) => {
    alert("Reserva solicitada com sucesso!");
  };

  const handleUpdateStatus = (id: string, status: any) => {};
  const handleAddReview = (id: string, review: any) => {};

  return (
    <div className="relative">
      <div className="fixed bottom-4 left-4 z-[9999] bg-slate-900 text-white p-1 rounded-full shadow-2xl border border-slate-700 flex items-center gap-1">
        <button onClick={() => setViewMode('public')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${viewMode === 'public' ? 'bg-cyan-600' : 'text-slate-400 hover:text-white'}`}>
          Site
        </button>
        <button onClick={() => setViewMode('admin')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${viewMode === 'admin' ? 'bg-purple-600' : 'text-slate-400 hover:text-white'}`}>
          Admin
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
          stats={[]}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default App;
