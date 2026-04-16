import React, { useState } from 'react';
import { AppEvent, Partner, PartnerRegistryItem, PartnerCategory, Staff, SelectedDrink } from '../types';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus, 
  Trash2, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X,
  Heart,
  PartyPopper,
  Calendar,
  Baby,
  Building,
  Store,
  BookUser,
  Search,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  PackageSearch,
  Users,
  Martini,
  GlassWater
} from 'lucide-react';

interface EventListProps {
  events: AppEvent[];
  setEvents: React.Dispatch<React.SetStateAction<AppEvent[]>>;
  partnerRegistry: PartnerRegistryItem[]; 
  setPartnerRegistry: React.Dispatch<React.SetStateAction<PartnerRegistryItem[]>>; 
  staffList: Staff[];
}

const CATEGORIES: PartnerCategory[] = [
  'Cerimonialista', 'DJ', 'Salão de Eventos', 'Fotografia', 
  'Buffet', 'Bolo', 'Doces', 'Lembranças', 
  'Animação', 'Iluminação', 'Igreja', 'Outro'
];

const PACKAGES = [
  'Bronze Basic',
  'Silver Standard',
  'Gold Premium',
  'Platinum VIP',
  'Teen Standard',
  'Happy Hour Basic',
  'Personalizado'
];

// Mock list of available drinks for selection
const AVAILABLE_DRINKS = [
  'Moscow Mule', 'Gin Tônica Clássico', 'Gin Tônica Tropical', 
  'Caipirinha de Limão', 'Caipiroska de Frutas Vermelhas', 
  'Whisky Sour', 'Negroni', 'Aperol Spritz', 
  'Margarita', 'Mojito', 'Cosmopolitan', 
  'Sex on the Beach', 'Lagoa Azul', 'Piña Colada',
  'Fitzgerald', 'Dry Martini', 'Coquetel de Frutas (S/ Álcool)',
  'Soda Italiana', 'Água Aromatizada', 'Chopp', 'Cerveja'
];

const EventList: React.FC<EventListProps> = ({ events, setEvents, partnerRegistry, setPartnerRegistry, staffList }) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  
  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AppEvent | null>(null);

  // Partner Input State
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerRole, setNewPartnerRole] = useState<PartnerCategory>('Cerimonialista');
  const [showPartnerBook, setShowPartnerBook] = useState(false);
  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');

  // Partner Book - Create Mode State
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [newRegistryPartner, setNewRegistryPartner] = useState<Partial<PartnerRegistryItem>>({
    category: 'Cerimonialista'
  });

  const toggleExpand = (id: string) => {
    if (editingId === id) return;
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pago':
        return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold uppercase"><CheckCircle size={14} /> Pago</span>;
      case 'Negociando':
        return <span className="flex items-center gap-1 text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-xs font-bold uppercase"><Clock size={14} /> Negociando</span>;
      case 'Cancelado':
        return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-bold uppercase"><XCircle size={14} /> Cancelado</span>;
      default:
        return <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs">Desconhecido</span>;
    }
  };

  const getEventIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('casamento')) return <Heart size={18} className="text-pink-500" />;
    if (t.includes('15') || t.includes('aniversário')) return <PartyPopper size={18} className="text-purple-500" />;
    if (t.includes('corporativo') || t.includes('empresa')) return <Building size={18} className="text-slate-600" />;
    if (t.includes('batizado')) return <Baby size={18} className="text-sky-500" />;
    if (t.includes('feira')) return <Store size={18} className="text-amber-600" />;
    return <Calendar size={18} className="text-slate-400" />;
  };

  // --- Edit Handlers ---

  const startEdit = (e: React.MouseEvent, event: AppEvent) => {
    e.stopPropagation();
    setEditingId(event.id);
    setEditForm({ ...event });
    setExpandedEventId(event.id);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editForm) {
      setEvents(events.map(ev => ev.id === editForm.id ? editForm : ev));
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleFormChange = (field: keyof AppEvent, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  // --- Staff Selection Logic ---
  
  const handleAddStaff = (staffMember: Staff) => {
    if (!editForm) return;
    const newAllocation = {
      staffId: staffMember.id,
      staffName: staffMember.name,
      role: staffMember.role,
      confirmed: false,
      cost: staffMember.ratePerEvent
    };
    
    setEditForm({
      ...editForm,
      allocatedStaff: [...editForm.allocatedStaff, newAllocation]
    });
  };

  const handleRemoveStaff = (staffId: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      allocatedStaff: editForm.allocatedStaff.filter(s => s.staffId !== staffId)
    });
  };

  // --- Drinks Selection Logic ---

  const handleAddDrink = (drinkName: string) => {
    if (!editForm) return;
    const newDrink: SelectedDrink = { name: drinkName };
    setEditForm({
      ...editForm,
      selectedDrinks: [...(editForm.selectedDrinks || []), newDrink]
    });
  };

  const handleRemoveDrink = (drinkName: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      selectedDrinks: (editForm.selectedDrinks || []).filter(d => d.name !== drinkName)
    });
  };

  // --- Partner Handlers ---

  const handleAddPartner = (eventId: string, partnerFromBook?: PartnerRegistryItem) => {
    const nameToAdd = partnerFromBook ? partnerFromBook.name : newPartnerName;
    const roleToAdd = partnerFromBook ? partnerFromBook.category : newPartnerRole;
    
    if (!nameToAdd.trim()) return;

    const newPartner: Partner = {
      id: Date.now().toString(),
      name: nameToAdd,
      role: roleToAdd,
      registryId: partnerFromBook?.id
    };

    if (editingId === eventId && editForm) {
      setEditForm({
        ...editForm,
        partners: [...(editForm.partners || []), newPartner]
      });
    } else {
      const updatedEvents = events.map(ev => {
        if (ev.id === eventId) {
          return {
            ...ev,
            partners: [...(ev.partners || []), newPartner]
          };
        }
        return ev;
      });
      setEvents(updatedEvents);
    }
    setNewPartnerName('');
    setShowPartnerBook(false);
  };

  const handleRemovePartner = (eventId: string, partnerId: string) => {
    if (editingId === eventId && editForm) {
      setEditForm({
        ...editForm,
        partners: editForm.partners.filter(p => p.id !== partnerId)
      });
    } else {
      const updatedEvents = events.map(ev => {
        if (ev.id === eventId) {
          return {
            ...ev,
            partners: ev.partners.filter(p => p.id !== partnerId)
          };
        }
        return ev;
      });
      setEvents(updatedEvents);
    }
  };

  const handleSaveNewRegistryPartner = () => {
    if (!newRegistryPartner.name) return;
    
    const newItem: PartnerRegistryItem = {
      id: Date.now().toString(),
      name: newRegistryPartner.name,
      category: newRegistryPartner.category as PartnerCategory,
      phone: newRegistryPartner.phone || '',
      contactPerson: newRegistryPartner.contactPerson || '',
      notes: newRegistryPartner.notes || ''
    };

    setPartnerRegistry(prev => [...prev, newItem]);
    setIsAddingPartner(false);
    setNewRegistryPartner({ category: 'Cerimonialista' });
    setPartnerSearchTerm('');
  };

  // --- DYNAMIC FIELDS RENDERER ---
  const renderDynamicFields = (event: AppEvent, isEditing: boolean) => {
    const type = event.eventType;
    if (type === 'Casamento') {
      return (
         <div className="flex-1">
             <label className="text-xs text-slate-500 block">Nomes dos Noivos</label>
             {isEditing ? (
                 <input 
                    type="text" 
                    placeholder="Ex: João & Maria"
                    value={event.groomBrideNames || ''} 
                    onChange={(e) => handleFormChange('groomBrideNames', e.target.value)}
                    className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-sm"
                 />
             ) : (
                 <span className="font-medium text-slate-800 block mt-1">{event.groomBrideNames || '-'}</span>
             )}
         </div>
      );
    }
    if (type === '15 Anos') {
      return (
         <div className="flex-1">
             <label className="text-xs text-slate-500 block">Nome da Debutante</label>
             {isEditing ? (
                 <input 
                    type="text" 
                    placeholder="Ex: Julia Silva"
                    value={event.debutanteName || ''} 
                    onChange={(e) => handleFormChange('debutanteName', e.target.value)}
                    className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-sm"
                 />
             ) : (
                 <span className="font-medium text-slate-800 block mt-1">{event.debutanteName || '-'}</span>
             )}
         </div>
      );
    }
    if (type === 'Corporativo') {
      return (
         <div className="flex-1">
             <label className="text-xs text-slate-500 block">Empresa Contratante</label>
             {isEditing ? (
                 <input 
                    type="text" 
                    placeholder="Ex: Tech Solutions Ltda"
                    value={event.companyName || ''} 
                    onChange={(e) => handleFormChange('companyName', e.target.value)}
                    className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-sm"
                 />
             ) : (
                 <span className="font-medium text-slate-800 block mt-1">{event.companyName || '-'}</span>
             )}
         </div>
      );
    }
    if (type === 'Batizado') {
        return (
           <div className="flex-1">
               <label className="text-xs text-slate-500 block">Nome do Bebê</label>
               {isEditing ? (
                   <input 
                      type="text" 
                      placeholder="Ex: Gabriel"
                      value={event.babyName || ''} 
                      onChange={(e) => handleFormChange('babyName', e.target.value)}
                      className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-sm"
                   />
               ) : (
                   <span className="font-medium text-slate-800 block mt-1">{event.babyName || '-'}</span>
               )}
           </div>
        );
      }
    return (
         <div className="flex-1">
             <label className="text-xs text-slate-500 block">Nome/Detalhe do Evento</label>
             {isEditing ? (
                 <input 
                    type="text" 
                    placeholder="Ex: Evento Geral"
                    value={event.eventName || ''} 
                    onChange={(e) => handleFormChange('eventName', e.target.value)}
                    className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-sm"
                 />
             ) : (
                 <span className="font-medium text-slate-800 block mt-1">{event.eventName || '-'}</span>
             )}
         </div>
    );
  };

  const renderPartnerBookModal = (eventId: string) => {
    if (!showPartnerBook) return null;
    const filteredPartners = partnerRegistry.filter(p => 
      p.name.toLowerCase().includes(partnerSearchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(partnerSearchTerm.toLowerCase())
    );

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
           <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                 {isAddingPartner ? (
                    <button onClick={() => setIsAddingPartner(false)} className="mr-2 text-slate-500 hover:text-slate-800"><ArrowLeft size={20} /></button>
                 ) : (<BookUser className="text-indigo-600" size={20} />)}
                 <h3 className="font-bold text-slate-800">{isAddingPartner ? 'Novo Cadastro' : 'Agenda de Parceiros'}</h3>
              </div>
              <button onClick={() => { setShowPartnerBook(false); setIsAddingPartner(false); }}><X size={20} className="text-slate-400 hover:text-red-500" /></button>
           </div>
           <div className="p-4">
              {!isAddingPartner ? (
                <>
                  <div className="flex gap-2 mb-4">
                     <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                           className="w-full pl-9 p-2 border rounded-lg text-sm" 
                           placeholder="Buscar parceiro..."
                           value={partnerSearchTerm}
                           onChange={e => setPartnerSearchTerm(e.target.value)}
                           autoFocus
                        />
                     </div>
                     <button onClick={() => setIsAddingPartner(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"><Plus size={20} /></button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                     {filteredPartners.map(p => (
                       <button 
                          key={p.id}
                          onClick={() => handleAddPartner(eventId, p)}
                          className="w-full text-left p-3 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg flex justify-between items-center group"
                       >
                          <div><div className="font-medium text-slate-800">{p.name}</div><div className="text-xs text-slate-500">{p.category}</div></div>
                          <Plus size={18} className="text-slate-300 group-hover:text-green-500" />
                       </button>
                     ))}
                     {filteredPartners.length === 0 && <div className="text-center text-slate-400 text-sm py-4">Nenhum parceiro encontrado.</div>}
                  </div>
                </>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                    <div><label className="text-xs text-slate-500 font-bold uppercase">Nome</label><input type="text" className="w-full mt-1 p-2 border rounded focus:border-indigo-500 outline-none text-sm" value={newRegistryPartner.name || ''} onChange={e => setNewRegistryPartner({...newRegistryPartner, name: e.target.value})} placeholder="Nome da Empresa ou Parceiro" /></div>
                    <div><label className="text-xs text-slate-500 font-bold uppercase">Categoria</label><select className="w-full mt-1 p-2 border rounded focus:border-indigo-500 outline-none bg-white text-sm" value={newRegistryPartner.category} onChange={e => setNewRegistryPartner({...newRegistryPartner, category: e.target.value as PartnerCategory})}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs text-slate-500 font-bold uppercase">Telefone</label><input type="text" className="w-full mt-1 p-2 border rounded focus:border-indigo-500 outline-none text-sm" value={newRegistryPartner.phone || ''} onChange={e => setNewRegistryPartner({...newRegistryPartner, phone: e.target.value})} /></div>
                        <div><label className="text-xs text-slate-500 font-bold uppercase">Contato</label><input type="text" className="w-full mt-1 p-2 border rounded focus:border-indigo-500 outline-none text-sm" value={newRegistryPartner.contactPerson || ''} onChange={e => setNewRegistryPartner({...newRegistryPartner, contactPerson: e.target.value})} placeholder="Pessoa de contato" /></div>
                    </div>
                    <div><label className="text-xs text-slate-500 font-bold uppercase">Obs</label><textarea className="w-full mt-1 p-2 border rounded focus:border-indigo-500 outline-none text-sm" rows={2} value={newRegistryPartner.notes || ''} onChange={e => setNewRegistryPartner({...newRegistryPartner, notes: e.target.value})} /></div>
                    <button onClick={handleSaveNewRegistryPartner} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm mt-2">Salvar e Selecionar</button>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Lista de Eventos & Negociações</h2>
        <button className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors font-medium shadow-sm">
          + Novo Evento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header da Tabela */}
        <div className="grid grid-cols-12 bg-slate-50 p-4 font-semibold text-slate-600 text-sm border-b border-slate-200">
          <div className="col-span-1 text-center">Tipo</div>
          <div className="col-span-4 pl-2">Evento</div>
          <div className="col-span-3">Data</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-center">Ações</div>
        </div>

        {/* Lista */}
        <div className="divide-y divide-slate-100">
          {events.map(event => {
            const isEditing = editingId === event.id;
            const currentEvent = isEditing && editForm ? editForm : event;

            return (
              <div key={event.id} className="transition-colors hover:bg-slate-50/50">
                {/* Linha Principal */}
                <div 
                  className={`grid grid-cols-12 p-4 items-center cursor-pointer ${isEditing ? 'bg-amber-50' : ''}`}
                  onClick={() => !isEditing && toggleExpand(event.id)}
                >
                  {/* Coluna Tipo */}
                  <div className="col-span-1 flex justify-center" title={currentEvent.eventType}>
                    {getEventIcon(currentEvent.eventType)}
                  </div>

                  {/* Coluna Evento (Nome) */}
                  <div className="col-span-4 pl-2 font-medium text-slate-800">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={currentEvent.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      currentEvent.name
                    )}
                  </div>

                  {/* Coluna Data */}
                  <div className="col-span-3 text-slate-600 text-sm">
                    {isEditing ? (
                      <input 
                        type="datetime-local" 
                        value={currentEvent.date.substring(0, 16)}
                        onChange={(e) => handleFormChange('date', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      new Date(currentEvent.date).toLocaleDateString('pt-BR')
                    )}
                  </div>

                  {/* Coluna Status */}
                  <div className="col-span-2">
                    {isEditing ? (
                      <select 
                        value={currentEvent.negotiationStatus}
                        onChange={(e) => handleFormChange('negotiationStatus', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="Pago">Pago</option>
                        <option value="Negociando">Negociando</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    ) : (
                      getStatusBadge(currentEvent.negotiationStatus)
                    )}
                  </div>

                  {/* Coluna Ações */}
                  <div className="col-span-2 flex justify-center items-center gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={saveEdit} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors shadow-sm" title="Salvar"><Save size={16} /></button>
                        <button onClick={cancelEdit} className="p-1.5 bg-red-100 text-red-500 rounded hover:bg-red-200 transition-colors" title="Cancelar"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => startEdit(e, event)} className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Editar"><Edit size={16} /></button>
                        <div className="text-slate-300">{expandedEventId === event.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Área Expandida (REORGANIZADA) */}
                {expandedEventId === event.id && (
                  <div className="bg-slate-50 p-6 border-t border-b border-slate-100 animate-in slide-in-from-top-2 duration-200 cursor-default">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      {/* SECTION 1: DETALHES DO EVENTO */}
                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b border-slate-200 pb-2">Detalhes do Evento</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 block">Tipo de Evento</label>
                                {isEditing ? (
                                <select 
                                    value={currentEvent.eventType}
                                    onChange={(e) => handleFormChange('eventType', e.target.value)}
                                    className="w-full mt-1 px-2 py-1 border border-slate-300 rounded focus:outline-none bg-white text-sm"
                                >
                                    <option value="Casamento">Casamento</option>
                                    <option value="15 Anos">15 Anos</option>
                                    <option value="Corporativo">Corporativo</option>
                                    <option value="Batizado">Batizado</option>
                                    <option value="Feira">Feira</option>
                                    <option value="Outros">Outros</option>
                                    <option value="Aniversário">Aniversário</option>
                                </select>
                                ) : (
                                <div className="flex items-center gap-2 mt-1">
                                    {getEventIcon(currentEvent.eventType)}
                                    <span className="font-medium text-slate-800">{currentEvent.eventType}</span>
                                </div>
                                )}
                            </div>
                            {/* DYNAMIC FIELDS NEXT TO TYPE */}
                            {renderDynamicFields(currentEvent, isEditing)}
                          </div>

                          <div className="col-span-2">
                            <label className="text-xs text-slate-500 block">Contato / Cliente</label>
                            <div className="flex items-center gap-2 mt-1 bg-white p-2 rounded border border-slate-200">
                              <Phone size={14} className="text-slate-400" />
                              {isEditing ? (
                                <div className="flex gap-2 w-full">
                                    <input 
                                        type="text" 
                                        placeholder="Contato"
                                        value={currentEvent.contact}
                                        onChange={(e) => handleFormChange('contact', e.target.value)}
                                        className="w-1/2 px-1 border-b border-slate-300 focus:border-amber-500 outline-none text-sm"
                                    />
                                    <span className="text-slate-300">|</span>
                                    <input 
                                        type="text" 
                                        placeholder="Nome Cliente"
                                        value={currentEvent.clientName}
                                        onChange={(e) => handleFormChange('clientName', e.target.value)}
                                        className="w-1/2 px-1 border-b border-slate-300 focus:border-amber-500 outline-none text-sm"
                                    />
                                </div>
                              ) : (
                                <>
                                    <span className="font-medium text-slate-800">{currentEvent.contact}</span>
                                    <span className="text-slate-400 mx-1">|</span>
                                    <span className="text-slate-600">{currentEvent.clientName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: PARCEIROS & LOCALIZAÇÃO */}
                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                            <MapPin size={16} /> Parceiros & Localização
                        </h3>

                        {/* Localização e Obs (Moved Here) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 block">Localização Principal</label>
                                <div className="flex items-center gap-2 mt-1">
                                <MapPin size={14} className="text-slate-400" />
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={currentEvent.location}
                                        onChange={(e) => handleFormChange('location', e.target.value)}
                                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                                    />
                                ) : (
                                    <span className="text-slate-700">{currentEvent.location}</span>
                                )}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block">Obs. (2º Local / Detalhes)</label>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={currentEvent.locationNotes || ''}
                                        onChange={(e) => handleFormChange('locationNotes', e.target.value)}
                                        placeholder="Ex: Cerimônia na igreja..."
                                        className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-sm"
                                    />
                                ) : (
                                    <span className="text-slate-600 text-sm mt-1 block italic">{currentEvent.locationNotes || '-'}</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Input para adicionar Parceiro */}
                        <div className="flex gap-2 items-center">
                            <select 
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-amber-500 max-w-[140px]"
                            value={newPartnerRole}
                            onChange={(e) => setNewPartnerRole(e.target.value as any)}
                            >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            
                            <div className="flex-1 relative">
                            <input 
                                type="text" 
                                placeholder="Nome da empresa/pessoa" 
                                className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                                value={newPartnerName}
                                onChange={(e) => setNewPartnerName(e.target.value)}
                            />
                            {isEditing && (
                                <button 
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                                onClick={() => setShowPartnerBook(true)}
                                title="Buscar nos Parceiros Cadastrados"
                                >
                                <BookUser size={18} />
                                </button>
                            )}
                            </div>

                            <button 
                            onClick={() => handleAddPartner(currentEvent.id)}
                            className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700"
                            title="Adicionar"
                            >
                            <Plus size={18} />
                            </button>
                        </div>

                        {/* Lista de Parceiros */}
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {currentEvent.partners && currentEvent.partners.length > 0 ? (
                            currentEvent.partners.map(partner => (
                                <div key={partner.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 shadow-sm text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase max-w-[100px] truncate text-center">
                                    {partner.role}
                                    </span>
                                    <span className="text-slate-700 font-medium">{partner.name}</span>
                                </div>
                                <button 
                                    onClick={() => handleRemovePartner(currentEvent.id, partner.id)}
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded"
                                >
                                    <Trash2 size={14} />
                                </button>
                                </div>
                            ))
                            ) : (
                            <div className="text-slate-400 text-sm italic text-center py-4 bg-slate-100/50 rounded border border-dashed border-slate-200">
                                Nenhum parceiro vinculado.
                            </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: BAR DO EVENTO (New Section) */}
                    <div className="space-y-4 pt-6">
                        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                           <Martini size={16} className="text-amber-500" /> Bar do Evento
                        </h3>

                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            {/* Pacote */}
                            <div className="mb-6">
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Pacote Contratado</label>
                                {isEditing ? (
                                    <select 
                                        value={currentEvent.packageType || ''}
                                        onChange={(e) => handleFormChange('packageType', e.target.value)}
                                        className="w-full max-w-md px-3 py-2 border border-slate-300 rounded focus:outline-none bg-white text-sm"
                                    >
                                        <option value="">Selecione um pacote...</option>
                                        {PACKAGES.map(pkg => (
                                        <option key={pkg} value={pkg}>{pkg}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <PackageSearch size={16} className="text-amber-500" />
                                        <span className="font-medium text-slate-800 bg-amber-50 px-3 py-1 rounded border border-amber-100">
                                            {currentEvent.packageType || 'Não informado'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {/* Col 1: Equipe Escalada (Staff) */}
                                <div className="md:border-r md:border-slate-200 md:pr-8 pb-8 md:pb-0 border-b md:border-b-0 border-slate-200">
                                    <label className="text-xs text-slate-500 block mb-2 font-bold flex items-center gap-2">
                                        <Users size={14} /> Equipe Escalada
                                    </label>
                                    
                                    {isEditing ? (
                                        /* Edit Mode: Dual List Box for Staff */
                                        <div className="grid grid-cols-2 gap-2 h-48">
                                            {/* Left: Available */}
                                            <div className="flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden">
                                                <div className="bg-slate-100 p-1.5 text-[10px] font-bold text-slate-500 border-b border-slate-200 uppercase text-center">Disponíveis</div>
                                                <div className="flex-1 overflow-y-auto p-1 space-y-1 custom-scrollbar">
                                                    {staffList
                                                        .filter(s => !currentEvent.allocatedStaff.some(allocated => allocated.staffId === s.id))
                                                        .map(staff => (
                                                            <button key={staff.id} onClick={() => handleAddStaff(staff)} className="w-full text-left flex items-center justify-between p-1.5 hover:bg-green-50 rounded group transition-colors">
                                                                <div><div className="text-xs font-medium text-slate-700">{staff.name}</div><div className="text-[10px] text-slate-400">{staff.role}</div></div>
                                                                <ArrowRight size={12} className="text-slate-300 group-hover:text-green-500" />
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                            {/* Right: Selected */}
                                            <div className="flex flex-col border border-slate-200 rounded-lg bg-indigo-50/30 overflow-hidden">
                                                <div className="bg-indigo-100 p-1.5 text-[10px] font-bold text-indigo-700 border-b border-indigo-200 uppercase text-center">Selecionados</div>
                                                <div className="flex-1 overflow-y-auto p-1 space-y-1 custom-scrollbar">
                                                    {currentEvent.allocatedStaff.map(allocated => (
                                                        <button key={allocated.staffId} onClick={() => handleRemoveStaff(allocated.staffId)} className="w-full text-left flex items-center justify-between p-1.5 hover:bg-red-50 bg-white border border-transparent hover:border-red-100 rounded group transition-colors shadow-sm">
                                                            <ArrowLeft size={12} className="text-slate-300 group-hover:text-red-500" />
                                                            <div className="text-right"><div className="text-xs font-medium text-slate-700">{allocated.staffName}</div><div className="text-[10px] text-slate-400">{allocated.role}</div></div>
                                                        </button>
                                                    ))}
                                                    {currentEvent.allocatedStaff.length === 0 && <div className="text-center text-slate-400 text-[10px] py-4 italic">Vazio</div>}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* View Mode: List Only for Staff */
                                        <div className="grid grid-cols-2 gap-2">
                                            {currentEvent.allocatedStaff.length > 0 ? (
                                                currentEvent.allocatedStaff.map(allocated => (
                                                    <div key={allocated.staffId} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 shadow-sm">
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><UserCheck size={12} /></div>
                                                        <div><div className="text-xs font-medium text-slate-800">{allocated.staffName}</div><div className="text-[10px] text-slate-500 uppercase">{allocated.role}</div></div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 text-center py-4 text-slate-400 text-sm italic border border-dashed rounded-lg bg-white">Nenhuma equipe definida.</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Col 2: Drinks Escolhidos */}
                                <div className="md:pl-8 pt-8 md:pt-0">
                                    <label className="text-xs text-slate-500 block mb-2 font-bold flex items-center gap-2">
                                        <GlassWater size={14} /> Drinks Escolhidos
                                    </label>

                                    {isEditing ? (
                                        /* Edit Mode: Dual List Box for Drinks */
                                        <div className="grid grid-cols-2 gap-2 h-48">
                                            {/* Left: Available */}
                                            <div className="flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden">
                                                <div className="bg-slate-100 p-1.5 text-[10px] font-bold text-slate-500 border-b border-slate-200 uppercase text-center">Cardápio</div>
                                                <div className="flex-1 overflow-y-auto p-1 space-y-1 custom-scrollbar">
                                                    {AVAILABLE_DRINKS
                                                        .filter(d => !currentEvent.selectedDrinks?.some(selected => selected.name === d))
                                                        .map(drink => (
                                                            <button key={drink} onClick={() => handleAddDrink(drink)} className="w-full text-left flex items-center justify-between p-1.5 hover:bg-green-50 rounded group transition-colors">
                                                                <div className="text-xs font-medium text-slate-700 truncate" title={drink}>{drink}</div>
                                                                <ArrowRight size={12} className="text-slate-300 group-hover:text-green-500 shrink-0" />
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                            {/* Right: Selected */}
                                            <div className="flex flex-col border border-slate-200 rounded-lg bg-amber-50/30 overflow-hidden">
                                                <div className="bg-amber-100 p-1.5 text-[10px] font-bold text-amber-700 border-b border-amber-200 uppercase text-center">Selecionados</div>
                                                <div className="flex-1 overflow-y-auto p-1 space-y-1 custom-scrollbar">
                                                    {currentEvent.selectedDrinks?.map(drink => (
                                                        <button key={drink.name} onClick={() => handleRemoveDrink(drink.name)} className="w-full text-left flex items-center justify-between p-1.5 hover:bg-red-50 bg-white border border-transparent hover:border-red-100 rounded group transition-colors shadow-sm">
                                                            <ArrowLeft size={12} className="text-slate-300 group-hover:text-red-500 shrink-0" />
                                                            <div className="text-right text-xs font-medium text-slate-700 truncate" title={drink.name}>{drink.name}</div>
                                                        </button>
                                                    ))}
                                                    {(!currentEvent.selectedDrinks || currentEvent.selectedDrinks.length === 0) && <div className="text-center text-slate-400 text-[10px] py-4 italic">Vazio</div>}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* View Mode: List Only for Drinks */
                                        <div className="grid grid-cols-2 gap-2">
                                            {currentEvent.selectedDrinks && currentEvent.selectedDrinks.length > 0 ? (
                                                currentEvent.selectedDrinks.map((drink, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 shadow-sm">
                                                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><GlassWater size={12} /></div>
                                                        <div className="text-xs font-medium text-slate-800 truncate" title={drink.name}>{drink.name}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 text-center py-4 text-slate-400 text-sm italic border border-dashed rounded-lg bg-white">Nenhum drink selecionado.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                )}
                
                {/* Modal for Partner Book */}
                {renderPartnerBookModal(currentEvent.id)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EventList;