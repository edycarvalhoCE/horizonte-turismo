
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string; // YYYY-MM-DD
  address?: string;
  joinedAt: string;
}

export interface TravelPackage {
  id: string;
  title: string;
  location: string;
  price: number;
  duration: string;
  image: string;
  description: string;
  rating: number;
  featured: boolean;
  availableDates: string[];
  transportTypes: string[]; // ['Aéreo', 'Rodoviário', 'Cruzeiro', 'Ferroviário']
  includedItems: string[];
  excludedItems: string[];
  reviews: Review[];
}

export interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  travelers: number;
  packageId: string;
  packageName: string; // Facilitar exibição
  date: string;
  status: 'Confirmado' | 'Pendente' | 'Cancelado';
  amount: number;
}

export interface ChartData {
  name: string;
  value: number;
  bookings?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
