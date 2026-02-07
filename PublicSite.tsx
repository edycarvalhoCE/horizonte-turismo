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
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
              <MapPin className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-800">Horizonte</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-cyan-600 transition-colors">Destinos</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Pacotes</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Ofertas</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Contato</a>
          </div>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
            Planejar Viagem
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://picsum.photos/1920/1080?random=1" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-slate-900/30"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex flex-col justify-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Descubra o <span className="text-cyan-400">Inexplorado</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl">
            Experiências curadas para viajantes exigentes. Os melhores destinos do mundo ao seu alcance.
          </p>

          {/* Search Bar - Fixed black inputs to white background with dark text */}
          <div className="bg-white p-4 rounded-2xl shadow-xl max-w-4xl flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-3 px-4 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0">
              <MapPin className="text-slate-400" />
              <div className="w-full">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Onde?</label>
                <input 
                  type="text" 
                  placeholder="Qual seu destino?" 
                  className="w-full outline-none bg-white text-slate-900 placeholder-slate-400 py-1" 
                />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0">
              <Calendar className="text-slate-400" />
              <div className="w-full">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Quando?</label>
                <input 
                  type="text" 
                  placeholder="Adicionar datas" 
                  className="w-full outline-none bg-white text-slate-900 placeholder-slate-400 py-1" 
                />
              </div>
            </div>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Featured Packages */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Destinos em Destaque</h2>
            <p className="text-slate-500">Explore nossa seleção de pacotes premium</p>
          </div>
          <button className="text-cyan-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
            Ver todos <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={pkg.image} 
                  alt={pkg.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold text-slate-800">{pkg.rating}</span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{pkg.title}</h3>
                  <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold">{pkg.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 mb-4 text-sm">
                  <MapPin className="w-4 h-4" />
                  {pkg.location}
                </div>
                <p className="text-slate-600 text-sm mb-6 line-clamp-2 flex-1">{pkg.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 uppercase block">A partir de</span>
                    <span className="text-2xl font-bold text-cyan-700">R$ {pkg.price.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => openDetailsModal(pkg)}
                        className="px-3 py-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors border border-slate-200 hover:border-cyan-200"
                        title="Ver Avaliações e Detalhes"
                      >
                         <MessageSquare className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openBookingModal(pkg)}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                      >
                        Reservar
                      </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Chat Widget */}
      <div className="fixed bottom-8 right-8 z-50">
        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="font-semibold pr-2">Assistente IA</span>
          </button>
        )}

        {isChatOpen && (
          <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Horizonte Guide</h3>
                  <p className="text-xs text-cyan-100">IA Online • Resposta rápida</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-96 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white self-end rounded-br-none' 
                      : 'bg-white text-slate-700 border border-slate-100 self-start rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="self-start bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Pergunte sobre destinos..."
                  className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-cyan-600 text-white p-3 rounded-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details & Reviews Modal */}
      {isDetailsModalOpen && selectedPackage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="relative h-48 bg-slate-900 shrink-0">
                    <img src={selectedPackage.image} className="w-full h-full object-cover opacity-60" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex flex-col justify-end p-6">
                         <div className="flex justify-between items-end">
                             <div>
                                <h2 className="text-3xl font-bold text-white">{selectedPackage.title}</h2>
                                <p className="text-cyan-400 flex items-center gap-1 mt-1">
                                    <MapPin className="w-4 h-4" /> {selectedPackage.location}
                                </p>
                             </div>
                             <div className="text-right">
                                 <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-500/30">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-white font-bold">{selectedPackage.rating}</span>
                                    <span className="text-white/70 text-xs ml-1">({selectedPackage.reviews.length} avaliações)</span>
                                 </div>
                             </div>
                         </div>
                    </div>
                    <button onClick={() => setIsDetailsModalOpen(false)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="md:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Sobre a Experiência</h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{selectedPackage.description}</p>
                        </div>

                        {(selectedPackage.includedItems?.length > 0 || selectedPackage.excludedItems?.length > 0) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                {selectedPackage.includedItems?.length > 0 && (
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                        <h4 className="font-bold text-green-800 text-sm mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> O que está incluído
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedPackage.includedItems.map((item) => (
                                                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {selectedPackage.excludedItems?.length > 0 && (
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <h4 className="font-bold text-red-800 text-sm mb-3 flex items-center gap-2">
                                            <XCircle className="w-4 h-4" /> O que NÃO está incluído
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedPackage.excludedItems.map((item) => (
                                                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                                                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="pt-6 border-t border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                Avaliações de Clientes
                            </h3>
                            
                            <div className="space-y-6">
                                {selectedPackage.reviews.length === 0 ? (
                                    <p className="text-slate-500 italic">Seja o primeiro a avaliar esta experiência!</p>
                                ) : (
                                    selectedPackage.reviews.map(review => (
                                        <div key={review.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold text-xs">
                                                        {review.userName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{review.userName}</p>
                                                        <p className="text-xs text-slate-400">{review.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-300'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 text-sm">{review.comment}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-4 text-sm">Adicionar sua avaliação</h4>
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sua Nota</label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star 
                                                        className={`w-6 h-6 ${star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seu Nome</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={reviewForm.userName}
                                            onChange={e => setReviewForm({...reviewForm, userName: e.target.value})}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none bg-white text-slate-900"
                                            placeholder="Ex: Maria Silva"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Comentário</label>
                                        <textarea 
                                            required
                                            rows={3}
                                            value={reviewForm.comment}
                                            onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none resize-none bg-white text-slate-900"
                                            placeholder="O que você achou desta viagem?"
                                        />
                                    </div>
                                    <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                                        Enviar Avaliação
                                    </button>
                                </form>
                            </div>
                        </div>
                     </div>

                     <div className="md:col-span-1">
                         <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-0">
                             <p className="text-slate-500 text-sm mb-1">Preço por pessoa</p>
                             <div className="mb-6">
                                 <span className="text-3xl font-bold text-slate-900">R$ {selectedPackage.price.toLocaleString('pt-BR')}</span>
                             </div>

                             <div className="space-y-4 mb-6">
                                 <div className="flex items-center gap-3 text-sm text-slate-600">
                                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                         <Calendar className="w-4 h-4" />
                                     </div>
                                     <span>Duração: <strong>{selectedPackage.duration}</strong></span>
                                 </div>
                                 <div className="flex items-center gap-3 text-sm text-slate-600">
                                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                         <User className="w-4 h-4" />
                                     </div>
                                     <span>Ideal para famílias e casais</span>
                                 </div>

                                 {selectedPackage.transportTypes && selectedPackage.transportTypes.length > 0 && (
                                     <div className="flex items-start gap-3 text-sm text-slate-600 border-t border-slate-100 pt-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                            <Plane className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="font-bold block text-slate-900 mb-2">Transporte Incluso</span>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedPackage.transportTypes.map((type) => {
                                                    const Icon = getTransportIcon(type);
                                                    return (
                                                        <span key={type} className="flex items-center gap-1.5 bg-cyan-50 text-cyan-700 px-2 py-1 rounded-md text-xs font-medium border border-cyan-100">
                                                            <Icon className="w-3 h-3" />
                                                            {type}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                 )}

                                 <div className="flex items-start gap-3 text-sm text-slate-600 border-t border-slate-100 pt-4">
                                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                         <CalendarClock className="w-4 h-4" />
                                     </div>
                                     <div>
                                         <span className="font-bold block text-slate-900 mb-2">Datas Disponíveis</span>
                                         {selectedPackage.availableDates && selectedPackage.availableDates.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedPackage.availableDates.map((date) => (
                                                    <span key={date} className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-1 rounded-md text-xs font-medium">
                                                        {date}
                                                    </span>
                                                ))}
                                            </div>
                                         ) : (
                                            <span className="text-slate-400 text-xs italic">Consulte disponibilidade para sua data.</span>
                                         )}
                                     </div>
                                 </div>
                             </div>

                             <button 
                                onClick={() => openBookingModal(selectedPackage)}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-cyan-600/20 transition-all transform active:scale-95 mb-3"
                             >
                                Reservar Agora
                             </button>
                             <p className="text-xs text-center text-slate-400">Reserva segura e cancelamento grátis até 7 dias antes.</p>
                         </div>
                     </div>
                </div>
             </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBookingModalOpen && selectedPackage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {bookingStep === 'processing' ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-16 h-16 text-cyan-600 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-slate-800">Enviando Solicitação</h3>
                <p className="text-slate-500 mt-2">Por favor, aguarde enquanto registramos seu interesse...</p>
              </div>
            ) : bookingStep === 'success' ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Solicitação Enviada!</h3>
                <p className="text-slate-500 mt-4 leading-relaxed">
                  Recebemos seu interesse no pacote para <strong>{selectedPackage.location}</strong>.
                  <br/>
                  Em breve entraremos em contato via e-mail ou WhatsApp com o link para pagamento seguro.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-slate-900 p-6 flex justify-between items-start text-white">
                  <div>
                    <h2 className="text-xl font-bold">Solicitar Reserva</h2>
                    <p className="text-cyan-400 text-sm mt-1">{selectedPackage.title}</p>
                  </div>
                  <button onClick={() => setIsBookingModalOpen(false)} className="text-white/60 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleBookingSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Ida</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                          {selectedPackage.availableDates && selectedPackage.availableDates.length > 0 ? (
                              selectedPackage.availableDates.length === 1 ? (
                                  <input 
                                    type="text" 
                                    disabled
                                    value={selectedPackage.availableDates[0]}
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 bg-slate-100 rounded-lg text-sm text-slate-600 cursor-not-allowed outline-none" 
                                  />
                              ) : (
                                  <div className="relative">
                                    <select 
                                        required
                                        value={bookingData.date}
                                        onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                                        className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none appearance-none bg-white text-slate-900"
                                    >
                                        <option value="">Selecione...</option>
                                        {selectedPackage.availableDates.map(date => (
                                            <option key={date} value={date}>{date}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                  </div>
                              )
                          ) : (
                              <input 
                                type="date" 
                                required
                                value={bookingData.date}
                                onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none bg-white text-slate-900" 
                              />
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Viajantes</label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                          <input 
                            type="number" 
                            min="1"
                            max="10"
                            required
                            value={bookingData.travelers}
                            onChange={(e) => setBookingData({...bookingData, travelers: parseInt(e.target.value)})}
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none bg-white text-slate-900" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-800 pb-2 border-b border-slate-100">Dados do Contato</h3>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                         <input 
                            type="text" 
                            required
                            placeholder="Seu nome completo"
                            value={bookingData.name}
                            onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none bg-white text-slate-900" 
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                           <div className="relative">
                              <Mail className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                              <input 
                                type="email" 
                                required
                                placeholder="seu@email.com"
                                value={bookingData.email}
                                onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                                className="w-full pl-9 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none bg-white text-slate-900" 
                              />
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                           <div className="relative">
                              <Phone className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                              <input 
                                type="tel" 
                                required
                                placeholder="(00) 00000-0000"
                                value={bookingData.phone}
                                onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                                className="w-full pl-9 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none bg-white text-slate-900" 
                              />
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100 flex items-start gap-3">
                       <CalendarClock className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                       <div className="text-sm text-cyan-900">
                          <p className="font-semibold mb-1">Como funciona o pagamento?</p>
                          <p className="opacity-80">
                            Ao solicitar a reserva, bloqueamos as datas para você. Nossa equipe enviará um link de pagamento seguro em até 24h para confirmar sua viagem.
                          </p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <span className="text-xs text-slate-500 uppercase block">Valor Estimado</span>
                        <span className="text-2xl font-bold text-slate-900">
                          R$ {(selectedPackage.price * bookingData.travelers).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <button 
                        type="submit"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-cyan-600/20 transition-all transform active:scale-95"
                      >
                        Solicitar Reserva
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};