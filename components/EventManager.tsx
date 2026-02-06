import React, { useState } from 'react';
import { AppEvent, EventStatus, Product, Staff, EventItemAllocation, EventStaffAllocation, StaffRole } from '../types';
import { Calendar as CalendarIcon, MapPin, Users, Clock, Edit2, CheckCircle, Trash2, Wand2, Plus, Box, UserPlus, ChevronLeft, ChevronRight, X, Wine } from 'lucide-react';
import { generateEventStockSuggestion, AISuggestion } from '../services/geminiService';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventManagerProps {
  events: AppEvent[];
  setEvents: React.Dispatch<React.SetStateAction<AppEvent[]>>;
  products: Product[];
  staffMembers: Staff[];
}

const EventManager: React.FC<EventManagerProps> = ({ events, setEvents, products, staffMembers }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'stock' | 'staff'>('info');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Calendar Navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generate Calendar Days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Helper to update specific event
  const updateEvent = (updated: AppEvent) => {
    setEvents(events.map(e => e.id === updated.id ? updated : e));
  };

  const handleAiSuggestion = async () => {
    if (!selectedEvent) return;
    if (!process.env.API_KEY) {
        alert("API Key não encontrada no environment.");
        return;
    }

    setIsAiLoading(true);
    const duration = 6;
    const suggestions = await generateEventStockSuggestion(selectedEvent.eventType, selectedEvent.guests, duration);
    
    if (suggestions.length > 0) {
      const allocations: EventItemAllocation[] = suggestions.map(s => ({
        productId: `ai-${Date.now()}-${Math.random()}`,
        productName: s.productName,
        quantityPlanned: s.quantity,
        quantityUsed: 0
      }));
      
      updateEvent({
        ...selectedEvent,
        allocatedItems: [...selectedEvent.allocatedItems, ...allocations],
        notes: selectedEvent.notes + `\n\n[IA] Sugestão gerada em ${new Date().toLocaleDateString()}`
      });
    }
    setIsAiLoading(false);
  };

  const getEventColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.SCHEDULED: return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200';
      case EventStatus.COMPLETED: return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case EventStatus.CANCELLED: return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case EventStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Views ---

  const renderCalendar = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-600"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-600"><ChevronRight size={20} /></button>
          </div>
          <button onClick={goToToday} className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1 rounded-md">Hoje</button>
        </div>
        <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium">
          <Plus size={20} /> Novo Evento
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] min-h-0">
        {/* Weekday Headers */}
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            {day}
          </div>
        ))}
        
        {/* Days */}
        {calendarDays.map((day, dayIdx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));

          return (
            <div 
              key={day.toISOString()} 
              className={`min-h-[120px] p-2 border-b border-r border-slate-100 relative group transition-colors ${!isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'}`}
            >
              <div className="flex justify-between items-start mb-1">
                 <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                   isToday ? 'bg-amber-500 text-white' : 
                   !isCurrentMonth ? 'text-slate-300' : 'text-slate-700'
                 }`}>
                   {format(day, 'd')}
                 </span>
                 {dayEvents.length > 0 && <span className="text-[10px] text-slate-400 font-semibold">{dayEvents.length} eventos</span>}
              </div>

              <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                {dayEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    className={`text-left px-2 py-1 rounded text-xs border truncate font-medium transition-all ${getEventColor(event.status)}`}
                  >
                    {format(new Date(event.date), 'HH:mm')} • {event.name}
                  </button>
                ))}
              </div>
              
              {/* Add hint on hover */}
              <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-1 bg-slate-100 hover:bg-amber-100 text-slate-400 hover:text-amber-600 rounded-full">
                    <Plus size={14} />
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderModal = () => {
    if (!selectedEvent) return null;

    const chefesDeBar = selectedEvent.allocatedStaff.filter(s => s.role === StaffRole.CHEFE_DE_BAR);
    const extras = selectedEvent.allocatedStaff.filter(s => s.role !== StaffRole.CHEFE_DE_BAR);

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-800">{selectedEvent.name}</h2>
                        <span className={`px-2 py-0.5 text-xs rounded-full border font-semibold ${
                            selectedEvent.status === EventStatus.SCHEDULED ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                        {selectedEvent.status}
                        </span>
                    </div>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <CalendarIcon size={14} /> {format(new Date(selectedEvent.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {locale: ptBR})}
                        <span className="text-slate-300">|</span>
                        <MapPin size={14} /> {selectedEvent.location}
                    </p>
                </div>
                <button 
                    onClick={() => setSelectedEventId(null)} 
                    className="p-2 bg-white rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm border border-slate-100"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Modal Body with Tabs */}
            <div className="flex border-b border-slate-100 bg-white">
                <button onClick={() => setActiveTab('info')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'info' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Visão Geral</button>
                <button onClick={() => setActiveTab('stock')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'stock' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Estoque & Insumos</button>
                <button onClick={() => setActiveTab('staff')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'staff' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Financeiro Staff</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Details */}
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">Detalhes do Contrato</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                        <span className="text-slate-500">Pacote Contratado</span>
                                        <span className="font-semibold text-slate-800">{selectedEvent.packageType || 'Não informado'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                        <span className="text-slate-500">Convidados</span>
                                        <span className="font-semibold text-slate-800">{selectedEvent.guests} pax</span>
                                    </div>
                                    <div className="flex justify-between pb-2">
                                        <span className="text-slate-500">Cliente</span>
                                        <span className="font-semibold text-slate-800">{selectedEvent.clientName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">Equipe Alocada</h3>
                                
                                {/* Chefe de Bar */}
                                <div className="mb-4">
                                    <span className="text-xs text-amber-600 font-semibold uppercase bg-amber-50 px-2 py-1 rounded">Chefe de Bar</span>
                                    {chefesDeBar.length > 0 ? (
                                        chefesDeBar.map((c, i) => (
                                            <div key={i} className="mt-2 flex items-center gap-2 text-slate-700 font-medium">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">{c.staffName.substring(0,2)}</div>
                                                {c.staffName}
                                            </div>
                                        ))
                                    ) : <div className="mt-1 text-sm text-slate-400 italic">Pendente alocação</div>}
                                </div>

                                {/* Extras */}
                                <div>
                                    <span className="text-xs text-slate-500 font-semibold uppercase bg-slate-100 px-2 py-1 rounded">Equipe Extra</span>
                                    <div className="mt-2 space-y-2">
                                        {extras.length > 0 ? (
                                            extras.map((e, i) => (
                                                <div key={i} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                                        {e.staffName}
                                                    </div>
                                                    <span className="text-xs text-slate-400">{e.role}</span>
                                                </div>
                                            ))
                                        ) : <div className="text-sm text-slate-400 italic">Nenhum extra escalado</div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Drinks & Notes */}
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm h-full">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Wine size={16} /> Carta de Drinks
                                </h3>
                                
                                {selectedEvent.selectedDrinks && selectedEvent.selectedDrinks.length > 0 ? (
                                    <ul className="space-y-3">
                                        {selectedEvent.selectedDrinks.map((drink, idx) => (
                                            <li key={idx} className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <span className="font-semibold text-slate-800">{drink.name}</span>
                                                {drink.notes && (
                                                    <span className="text-xs text-amber-600 mt-1 italic">Obs: {drink.notes}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-8 text-slate-400 italic border-2 border-dashed rounded-lg">
                                        Nenhum drink selecionado.
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Observações Gerais</h3>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedEvent.notes}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Other Tabs Logic (Simplified for brevity as focus was on the "Info" tab request) --- */}
                {activeTab === 'stock' && (
                     <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Controle de Estoque do Evento</h3>
                            <button 
                                onClick={handleAiSuggestion}
                                disabled={isAiLoading}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${isAiLoading ? 'bg-slate-400' : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md'}`}
                            >
                                <Wand2 size={16} />
                                {isAiLoading ? 'Gerando Sugestão...' : 'IA: Sugerir Estoque Ideal'}
                            </button>
                        </div>
                        <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="p-3 rounded-l-lg">Produto</th>
                                <th className="p-3">Qtd. Planejada</th>
                                <th className="p-3 rounded-r-lg">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {selectedEvent.allocatedItems.length === 0 ? (
                                <tr><td colSpan={3} className="p-8 text-center text-slate-400 italic">Nenhum item alocado.</td></tr>
                            ) : (
                                selectedEvent.allocatedItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3 font-medium">{item.productName}</td>
                                        <td className="p-3">{item.quantityPlanned}</td>
                                        <td className="p-3">
                                            <button className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                     </div>
                )}

                {activeTab === 'staff' && (
                     <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-lg">Custo de Pessoal</h3>
                             <button className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium">+ Add Staff</button>
                         </div>
                         <div className="grid gap-3">
                            {selectedEvent.allocatedStaff.map((staff, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg">
                                    <div>
                                        <div className="font-medium text-slate-800">{staff.staffName}</div>
                                        <div className="text-xs text-slate-500">{staff.role}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-slate-700">R$ {staff.cost}</div>
                                        <div className={`text-xs ${staff.confirmed ? 'text-green-600' : 'text-amber-600'}`}>
                                            {staff.confirmed ? 'Confirmado' : 'Pendente'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                         </div>
                     </div>
                )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-2">
                <button onClick={() => setSelectedEventId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Fechar</button>
                <button className="px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-lg font-medium flex items-center gap-2">
                    <Edit2 size={16} /> Editar Evento
                </button>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col">
        {renderCalendar()}
        {renderModal()}
    </div>
  );
};

export default EventManager;