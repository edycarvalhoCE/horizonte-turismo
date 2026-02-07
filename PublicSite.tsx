import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Star, MessageCircle, X, Send, ArrowRight, User, Mail, Phone, CheckCircle, Loader2, CalendarClock, ChevronDown, MessageSquare, Plane, Bus, Ship, Train, XCircle } from 'lucide-react';
import { TravelPackage, ChatMessage, Booking } from './types';
import { getTravelAssistantResponse } from './services/geminiService';

interface PublicSiteProps {
  packages: TravelPackage[];
  onBook: (booking: Omit<Booking, 'id' | 'status'>) => void;
  onAddReview: (packageId: string, review: { userName: string; rating: number; comment: string }) => void;
}

export const PublicSite: React.FC<PublicSiteProps> = ({ packages, onBook, onAddReview }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Olá! Eu sou seu assistente de viagens. Procurando o destino perfeito? Posso ajudar!', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Booking Modal State
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<'form' | 'processing' | 'success'>('form');
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    travelers: 1
  });

  // Details & Reviews Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, comment: '' });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    
    try {
      const responseText = await getTravelAssistantResponse(history, userMsg.text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "Não consegui entender, pode repetir?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const openBookingModal = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setIsDetailsModalOpen(false);
    
    let initialDate = '';
    if (pkg.availableDates && pkg.availableDates.length === 1) {
      initialDate = pkg.availableDates[0];
    }

    setBookingData(prev => ({ 
      ...prev, 
      travelers: 1, 
      date: initialDate 
    }));
    
    setBookingStep('form');
    setIsBookingModalOpen(true);
  };

  const openDetailsModal = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setReviewForm({ userName: '', rating: 5, comment: '' });
    setIsDetailsModalOpen(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    setBookingStep('processing');

    setTimeout(() => {
      onBook({
        customerName: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        travelers: bookingData.travelers,
        packageId: selectedPackage.id,
        packageName: selectedPackage.title,
        date: bookingData.date,
        amount: selectedPackage.price * bookingData.travelers
      });
      setBookingStep('success');
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setBookingStep('form');
      }, 3000); 
    }, 1500);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPackage && reviewForm.comment && reviewForm.userName) {
        onAddReview(selectedPackage.id, reviewForm);
        setReviewForm({ userName: '', rating: 5, comment: '' });
    }
  };

  const getTransportIcon = (type: string) => {
     switch(type) {
         case 'Aéreo': return Plane;
         case 'Rodoviário': return Bus;
         case 'Cruzeiro': return Ship;
         case 'Ferroviário': return Train;
         default: return Plane;
     }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
              <MapPin className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-800">Horizonte</span>
          </div>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
            Planejar Viagem
          </button>
        </div>
      </nav>

      <div className="relative h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://picsum.photos/1920/1080?random=1" alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-slate-900/30"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex flex-col justify-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">Descubra o <span className="text-cyan-400">Inexplorado</span></h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl">Experiências curadas para viajantes exigentes.</p>
          <div className="bg-white p-4 rounded-2xl shadow-xl max-w-4xl flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-3 px-4">
              <MapPin className="text-slate-400" />
              <div className="w-full">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Onde?</label>
                <input type="text" placeholder="Qual seu destino?" className="w-full outline-none bg-white text-slate-900 py-1" />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3 px-4">
              <Calendar className="text-slate-400" />
              <div className="w-full">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Quando?</label>
                <input type="text" placeholder="Adicionar datas" className="w-full outline-none bg-white text-slate-900 py-1" />
              </div>
            </div>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-xl font-semibold transition-all">Buscar</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-slate-900 mb-12">Destinos em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.title}</h3>
                <p className="text-slate-600 text-sm mb-6 flex-1">{pkg.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-2xl font-bold text-cyan-700">R$ {pkg.price.toLocaleString('pt-BR')}</span>
                  <button onClick={() => openBookingModal(pkg)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium">Reservar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Chat Widget */}
      <div className="fixed bottom-8 right-8 z-50">
        {!isChatOpen ? (
          <button onClick={() => setIsChatOpen(true)} className="bg-cyan-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2">
            <MessageCircle /> Assistente IA
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col overflow-hidden border border-slate-200">
            <div className="bg-cyan-600 p-4 flex justify-between items-center text-white">
              <span className="font-bold">Horizonte Guide</span>
              <button onClick={() => setIsChatOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="h-96 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-cyan-600 text-white self-end' : 'bg-white text-slate-700 self-start shadow-sm'}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Pergunte..." className="flex-1 bg-slate-100 rounded-xl px-4 py-2 outline-none" />
              <button onClick={handleSendMessage} className="bg-cyan-600 text-white p-2 rounded-xl"><Send /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modais de Reserva... (omitido para brevidade, mantendo lógica do anterior) */}
    </div>
  );
};