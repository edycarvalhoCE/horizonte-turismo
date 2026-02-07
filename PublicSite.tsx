
import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Star, MessageCircle, X, Send, ArrowRight, User, Mail, Phone, CheckCircle, Loader2, CalendarClock, ChevronDown, MessageSquare, Plane, Bus, Ship, Train, XCircle } from 'lucide-react';
import { TravelPackage, ChatMessage, Booking } from './types.ts';
import { getTravelAssistantResponse } from './services/geminiService.ts';

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);
    try {
      const responseText = await getTravelAssistantResponse(messages.map(m => ({ role: m.role, text: m.text })), userMsg.text);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText || "Não entendi", timestamp: new Date() }]);
    } catch (err) { console.error(err); } finally { setIsTyping(false); }
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
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">Planejar Viagem</button>
        </div>
      </nav>

      <div className="relative h-[400px] w-full overflow-hidden bg-slate-900 flex items-center justify-center">
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Explore Novos Horizontes</h1>
          <p className="text-lg opacity-80">As melhores experiências curadas para você.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Pacotes Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map(pkg => (
            <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-lg transition-shadow">
              <img src={pkg.image} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{pkg.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{pkg.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-cyan-700">R$ {pkg.price.toLocaleString('pt-BR')}</span>
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Reservar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        {!isChatOpen ? (
          <button onClick={() => setIsChatOpen(true)} className="bg-cyan-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2">
            <MessageCircle /> Assistente
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col overflow-hidden border">
            <div className="bg-cyan-600 p-4 flex justify-between items-center text-white font-bold">
              <span>Horizonte Guide</span>
              <button onClick={() => setIsChatOpen(false)}><X /></button>
            </div>
            <div className="h-80 p-4 overflow-y-auto bg-slate-50 space-y-2">
              {messages.map(m => (
                <div key={m.id} className={`p-2 rounded-lg text-sm ${m.role === 'user' ? 'bg-cyan-600 text-white self-end text-right' : 'bg-white border'}`}>{m.text}</div>
              ))}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-slate-100 rounded-lg px-3 py-2 text-sm outline-none" placeholder="Pergunte algo..." />
              <button onClick={handleSendMessage} className="bg-cyan-600 text-white p-2 rounded-lg"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
