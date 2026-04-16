import React, { useState } from 'react';
import { AppEvent, PartnerCategory, PartnerRegistryItem } from '../types';
import { 
  Users, 
  Phone, 
  User, 
  ChevronDown, 
  ChevronUp, 
  ClipboardList, 
  X, 
  Search, 
  Plus, 
  Briefcase,
  Edit2
} from 'lucide-react';

interface PartnerManagerProps {
  registry: PartnerRegistryItem[];
  setRegistry: React.Dispatch<React.SetStateAction<PartnerRegistryItem[]>>;
  events: AppEvent[];
}

const CATEGORIES: PartnerCategory[] = [
  'Cerimonialista', 'DJ', 'Salão de Eventos', 'Fotografia', 
  'Buffet', 'Bolo', 'Doces', 'Lembranças', 
  'Animação', 'Iluminação', 'Igreja', 'Outro'
];

const PartnerManager: React.FC<PartnerManagerProps> = ({ registry, setRegistry, events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<string | null>(null);
  
  // Create/Edit State
  const [isAdding, setIsAdding] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [partnerForm, setPartnerForm] = useState<Partial<PartnerRegistryItem>>({
    category: 'Cerimonialista'
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const startEdit = (e: React.MouseEvent, partner: PartnerRegistryItem) => {
    e.stopPropagation();
    setPartnerForm({ ...partner });
    setEditingPartnerId(partner.id);
    setIsAdding(true);
  };

  const handleSavePartner = () => {
    if (!partnerForm.name) return;

    if (editingPartnerId) {
      // Update existing
      setRegistry(registry.map(p => p.id === editingPartnerId ? { ...p, ...partnerForm } as PartnerRegistryItem : p));
    } else {
      // Create new
      const item: PartnerRegistryItem = {
        id: Date.now().toString(),
        name: partnerForm.name,
        category: partnerForm.category as PartnerCategory,
        phone: partnerForm.phone || '',
        contactPerson: partnerForm.contactPerson || '',
        notes: partnerForm.notes || ''
      };
      setRegistry([...registry, item]);
    }
    
    setIsAdding(false);
    setEditingPartnerId(null);
    setPartnerForm({ category: 'Cerimonialista' });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingPartnerId(null);
    setPartnerForm({ category: 'Cerimonialista' });
  };

  const filteredRegistry = registry.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to find common events
  const getCommonEvents = (partnerName: string) => {
    return events.filter(e => 
      e.partners.some(p => p.name.toLowerCase() === partnerName.toLowerCase())
    );
  };

  const renderHistoryModal = () => {
    if (!showHistoryModal) return null;
    const partner = registry.find(p => p.id === showHistoryModal);
    if (!partner) return null;

    const commonEvents = getCommonEvents(partner.name);

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <ClipboardList className="text-amber-500" size={20} />
               Histórico de Parcerias
             </h3>
             <button onClick={() => setShowHistoryModal(null)} className="text-slate-400 hover:text-red-500">
               <X size={20} />
             </button>
          </div>
          <div className="p-6">
            <div className="mb-4">
               <p className="text-sm text-slate-500">Parceiro:</p>
               <p className="text-lg font-bold text-slate-800">{partner.name}</p>
               <p className="text-sm text-slate-600">{partner.category}</p>
            </div>
            
            <h4 className="font-semibold text-slate-700 mb-2 text-sm uppercase tracking-wide border-b pb-1">Eventos Realizados Juntos ({commonEvents.length})</h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {commonEvents.length > 0 ? (
                commonEvents.map(ev => (
                  <div key={ev.id} className="bg-slate-50 p-3 rounded border border-slate-100 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{ev.name}</div>
                      <div className="text-xs text-slate-500">{new Date(ev.date).toLocaleDateString()}</div>
                    </div>
                    <span className="text-xs bg-white border px-2 py-1 rounded text-slate-600">{ev.eventType}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-sm text-center py-4">Nenhum evento registrado com este parceiro ainda.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Parceiros Cadastrados</h2>
        <button 
          onClick={() => { setIsAdding(true); setEditingPartnerId(null); setPartnerForm({category: 'Cerimonialista'}); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Novo Parceiro
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar parceiro por nome ou categoria..." 
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 animate-in slide-in-from-top-2">
           <h3 className="font-bold text-lg mb-4 text-indigo-900">{editingPartnerId ? 'Editar Parceiro' : 'Cadastrar Novo Parceiro'}</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase">Nome da Empresa/Parceiro</label>
                <input 
                  type="text" 
                  className="w-full mt-1 p-2 border rounded focus:border-indigo-500 outline-none"
                  value={partnerForm.name || ''}
                  onChange={e => setPartnerForm({...partnerForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase">Categoria</label>
                <select 
                  className="w-full mt-1 p-2 border rounded focus:border-indigo-500 outline-none bg-white"
                  value={partnerForm.category}
                  onChange={e => setPartnerForm({...partnerForm, category: e.target.value as PartnerCategory})}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase">Telefone</label>
                <input 
                  type="text" 
                  className="w-full mt-1 p-2 border rounded focus:border-indigo-500 outline-none"
                  value={partnerForm.phone || ''}
                  onChange={e => setPartnerForm({...partnerForm, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase">Contato (Pessoa)</label>
                <input 
                  type="text" 
                  className="w-full mt-1 p-2 border rounded focus:border-indigo-500 outline-none"
                  value={partnerForm.contactPerson || ''}
                  onChange={e => setPartnerForm({...partnerForm, contactPerson: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 font-bold uppercase">Observações</label>
                <textarea 
                  className="w-full mt-1 p-2 border rounded focus:border-indigo-500 outline-none"
                  rows={2}
                  value={partnerForm.notes || ''}
                  onChange={e => setPartnerForm({...partnerForm, notes: e.target.value})}
                />
              </div>
           </div>
           <div className="flex justify-end gap-2 mt-4">
              <button onClick={handleCancel} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
              <button onClick={handleSavePartner} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  {editingPartnerId ? 'Atualizar Parceiro' : 'Salvar Parceiro'}
              </button>
           </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredRegistry.map((partner) => {
          const eventCount = getCommonEvents(partner.name).length;
          const isExpanded = expandedId === partner.id;

          return (
            <div key={partner.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
              <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(partner.id)}>
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{partner.name}</h4>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase font-semibold border border-indigo-100">
                      {partner.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mr-4">
                   <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-400 uppercase">Eventos Juntos</div>
                      <div className="font-bold text-slate-700 text-lg">{eventCount}</div>
                   </div>
                   
                   {/* Actions Buttons */}
                   <div className="flex items-center gap-1">
                        <button 
                            onClick={(e) => startEdit(e, partner)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowHistoryModal(partner.id); }}
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Ver histórico de eventos"
                        >
                            <ClipboardList size={18} />
                        </button>
                   </div>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-16 pb-6 pt-2 bg-slate-50/30">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <div className="flex items-center gap-3 text-slate-700">
                            <Phone size={18} className="text-slate-400" />
                            <div>
                               <span className="text-xs text-slate-500 block">Telefone</span>
                               <span className="font-medium">{partner.phone || '-'}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 text-slate-700">
                            <User size={18} className="text-slate-400" />
                            <div>
                               <span className="text-xs text-slate-500 block">Contato (Pessoa)</span>
                               <span className="font-medium">{partner.contactPerson || '-'}</span>
                            </div>
                         </div>
                      </div>
                      <div>
                         <span className="text-xs text-slate-500 block mb-1">Observações</span>
                         <div className="p-3 bg-white border border-slate-200 rounded text-sm text-slate-600 italic min-h-[60px]">
                            {partner.notes || 'Sem observações registradas.'}
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredRegistry.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            Nenhum parceiro encontrado.
          </div>
        )}
      </div>

      {renderHistoryModal()}
    </div>
  );
};

export default PartnerManager;