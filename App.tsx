import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  PackageSearch, 
  Users, 
  Receipt,
  LogOut,
  Menu,
  Martini,
  ListChecks,
  Handshake
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import EventManager from './components/EventManager';
import StaffManager from './components/StaffManager';
import FinanceManager from './components/FinanceManager';
import EventList from './components/EventList';
import PartnerManager from './components/PartnerManager';

// Mock Data imports (simulated here for simplicity of single-file restriction, ideally in constants.ts)
import { AppEvent, EventStatus, Product, Staff, StaffRole, StaffType, Transaction, PartnerRegistryItem } from './types';

// --- MOCK DATA START ---
const MOCK_PARTNERS_REGISTRY: PartnerRegistryItem[] = [
  { id: 'p1', name: 'DJ Alok Cover', category: 'DJ', phone: '(11) 91234-5678', contactPerson: 'Alok Jr.', notes: 'Especialista em eletrônica.' },
  { id: 'p2', name: 'Cerimonial das Rosas', category: 'Cerimonialista', phone: '(11) 98765-4321', contactPerson: 'Rosa Maria', notes: 'Muito organizada, exige cronograma.' },
  { id: 'p3', name: 'Buffet Kids', category: 'Buffet', phone: '(11) 3333-4444', contactPerson: 'Tia Ana', notes: 'Comida boa, mas atrasa as vezes.' },
  { id: 'p4', name: 'Villa Rizza', category: 'Salão de Eventos', phone: '(11) 2222-1111', contactPerson: 'Gerente Carlos', notes: 'Tem restrição de som após 22h.' },
  { id: 'p5', name: 'Foto & Arte', category: 'Fotografia', phone: '(11) 9999-0000', contactPerson: 'Paulo', notes: 'Entrega rápida.' },
];

const MOCK_EVENTS: AppEvent[] = [
  {
    id: '1', 
    name: 'Casamento Silva & Souza', 
    date: '2023-11-20T19:00:00', 
    clientName: 'Ana Silva', 
    contact: '(11) 99988-7766',
    responsible: 'André Gerente',
    negotiationStatus: 'Pago',
    guests: 250, 
    location: 'Villa Rizza', 
    eventType: 'Casamento', 
    groomBrideNames: 'Pedro & Ana',
    status: EventStatus.SCHEDULED, 
    budget: 15000,
    packageType: 'Gold Premium',
    selectedDrinks: [
        { name: 'Moscow Mule', notes: 'Caneca Cobre Original' },
        { name: 'Gin Tônica Clássico' },
        { name: 'Caipiroska de Frutas Vermelhas' },
        { name: 'Whisky Sour', notes: 'Usar clara pasteurizada' }
    ],
    allocatedItems: [], 
    allocatedStaff: [
        { staffId: 's1', staffName: 'Carlos Mix', role: StaffRole.CHEFE_DE_BAR, confirmed: true, cost: 400 },
        { staffId: 's2', staffName: 'João Shaker', role: StaffRole.BARTENDER, confirmed: true, cost: 250 },
        { staffId: 's3', staffName: 'Maria Apoio', role: StaffRole.BARBACK, confirmed: false, cost: 180 }
    ], 
    specificExpenses: [], 
    partners: [
      { id: 'p1', name: 'DJ Alok Cover', role: 'DJ', registryId: 'p1' },
      { id: 'p2', name: 'Cerimonial das Rosas', role: 'Cerimonialista', registryId: 'p2' }
    ],
    notes: 'Bar de Gin foco.'
  },
  {
    id: '2', 
    name: '15 Anos Julia', 
    date: '2023-11-25T20:00:00', 
    clientName: 'Roberta Maes', 
    contact: '(11) 98877-6655',
    responsible: 'Carla Vendas',
    negotiationStatus: 'Negociando',
    guests: 100, 
    location: 'Espaço Teen', 
    eventType: '15 Anos', 
    debutanteName: 'Julia Maes',
    status: EventStatus.SCHEDULED, 
    budget: 8000,
    packageType: 'Teen Standard',
    selectedDrinks: [
        { name: 'Coquetel de Frutas (Sem Álcool)' },
        { name: 'Mojito (Sem Álcool)' },
        { name: 'Soda Italiana de Maçã Verde' }
    ],
    allocatedItems: [], 
    allocatedStaff: [
        { staffId: 's1', staffName: 'Carlos Mix', role: StaffRole.CHEFE_DE_BAR, confirmed: true, cost: 400 }
    ], 
    specificExpenses: [], 
    partners: [
       { id: 'p3', name: 'Buffet Kids', role: 'Outro', registryId: 'p3' }
    ],
    notes: 'Drinks sem álcool coloridos.'
  },
  {
    id: '3', 
    name: 'Confraternização TechCorp', 
    date: '2023-12-10T18:00:00', 
    clientName: 'TechCorp RH', 
    contact: 'rh@techcorp.com',
    responsible: 'André Gerente',
    negotiationStatus: 'Cancelado',
    guests: 50, 
    location: 'Rooftop Centro', 
    eventType: 'Corporativo', 
    companyName: 'TechCorp Inovações',
    status: EventStatus.CANCELLED, 
    budget: 5000,
    packageType: 'Happy Hour Basic',
    selectedDrinks: [
        { name: 'Chopp Artesanal' },
        { name: 'Caipirinha de Limão' }
    ],
    allocatedItems: [], 
    allocatedStaff: [], 
    specificExpenses: [], 
    partners: [],
    notes: 'Serviço rápido.'
  }
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Vodka Absolut', category: 'Destilado', currentStock: 24, unit: 'un', costPrice: 89.90 },
  { id: '2', name: 'Gin Tanqueray', category: 'Destilado', currentStock: 12, unit: 'un', costPrice: 110.00 },
  { id: '3', name: 'Água Tônica', category: 'Não Alcoólico', currentStock: 150, unit: 'un', costPrice: 2.50 },
  { id: '4', name: 'Limão Taiti', category: 'Insumo', currentStock: 10, unit: 'kg', costPrice: 4.00 },
  { id: '5', name: 'Xarope de Açúcar', category: 'Insumo', currentStock: 5, unit: 'L', costPrice: 15.00 },
];

const MOCK_STAFF: Staff[] = [
  { id: 's1', name: 'Carlos Mix', role: StaffRole.CHEFE_DE_BAR, type: StaffType.PERMANENT, ratePerEvent: 400, phone: '11999999999', available: true },
  { id: 's2', name: 'João Shaker', role: StaffRole.BARTENDER, type: StaffType.FREELANCE, ratePerEvent: 250, phone: '11988888888', available: true },
  { id: 's3', name: 'Maria Apoio', role: StaffRole.BARBACK, type: StaffType.FREELANCE, ratePerEvent: 180, phone: '11977777777', available: false },
  { id: 's4', name: 'Pedro Copeiro', role: StaffRole.COPEIRO, type: StaffType.FREELANCE, ratePerEvent: 150, phone: '11966666666', available: true },
  { id: 's5', name: 'Ana Bar', role: StaffRole.BARTENDER, type: StaffType.FREELANCE, ratePerEvent: 250, phone: '11955555555', available: true },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2023-11-01', type: 'In', category: 'Evento', amount: 5000, description: 'Sinal Casamento Silva' },
  { id: 't2', date: '2023-11-05', type: 'Out', category: 'Estoque', amount: 2500, description: 'Compra Bebidas Atacadão' },
  { id: 't3', date: '2023-11-10', type: 'Out', category: 'Manutenção', amount: 300, description: 'Reparo Máquina Gelo' },
];
// --- MOCK DATA END ---

type View = 'dashboard' | 'eventList' | 'events' | 'inventory' | 'staff' | 'finance' | 'partners';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Global State (lifted up)
  const [events, setEvents] = useState<AppEvent[]>(MOCK_EVENTS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [partnersRegistry, setPartnersRegistry] = useState<PartnerRegistryItem[]>(MOCK_PARTNERS_REGISTRY);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard events={events} transactions={transactions} partnerRegistry={partnersRegistry} />;
      case 'eventList':
        return <EventList events={events} setEvents={setEvents} partnerRegistry={partnersRegistry} setPartnerRegistry={setPartnersRegistry} staffList={staff} />;
      case 'events':
        return <EventManager events={events} setEvents={setEvents} products={products} staffMembers={staff} />;
      case 'inventory':
        return <Inventory products={products} setProducts={setProducts} />;
      case 'staff':
        return <StaffManager staffList={staff} />;
      case 'finance':
        return <FinanceManager transactions={transactions} />;
      case 'partners':
        return <PartnerManager registry={partnersRegistry} setRegistry={setPartnersRegistry} events={events} />;
      default:
        return <Dashboard events={events} transactions={transactions} partnerRegistry={partnersRegistry} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors rounded-lg mb-1 ${
        currentView === view 
          ? 'bg-amber-500 text-slate-900 shadow-md font-semibold' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-amber-500'
      }`}
    >
      <Icon size={20} />
      {isSidebarOpen && <span>{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-950 text-white transition-all duration-300 flex flex-col shadow-2xl z-20`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 h-24">
          <div className="p-2 bg-slate-800 border border-amber-500/30 rounded-lg shrink-0">
             {/* Uses standard icon, but styled to match the gold/amber theme of the provided logo */}
            <Martini size={24} className="text-amber-500" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg leading-tight text-slate-100 whitespace-nowrap">Passo a Passo</h1>
              <p className="text-xs text-amber-500 font-bold tracking-widest uppercase">Drinks</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="eventList" icon={ListChecks} label="Eventos" />
          <NavItem view="events" icon={CalendarDays} label="Agenda" />
          <NavItem view="partners" icon={Handshake} label="Parceiros" />
          <NavItem view="inventory" icon={PackageSearch} label="Estoque" />
          <NavItem view="staff" icon={Users} label="Equipe" />
          <NavItem view="finance" icon={Receipt} label="Financeiro" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <button className="w-full mt-2 flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-xl font-semibold text-slate-700 capitalize">
            {currentView === 'events' ? 'Agenda de Eventos' : currentView === 'eventList' ? 'Lista de Eventos' : currentView}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-800">Admin User</span>
                <span className="text-xs text-slate-500">Gerente Geral</span>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm" />
          </div>
        </header>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-auto bg-slate-100 relative">
          <div className="max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;