export enum EventStatus {
  SCHEDULED = 'Agendado',
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Concluído',
  CANCELLED = 'Cancelado'
}

export enum StaffRole {
  BARTENDER = 'Bartender',
  BARBACK = 'Barback',
  CHEFE_DE_BAR = 'Chefe de Bar',
  COPEIRO = 'Copeiro'
}

export enum StaffType {
  PERMANENT = 'Fixo',
  FREELANCE = 'Extra'
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  type: StaffType;
  ratePerEvent: number; // Valor base por evento
  phone: string;
  available: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'Destilado' | 'Fermentado' | 'Não Alcoólico' | 'Insumo' | 'Utensílio';
  currentStock: number;
  unit: 'un' | 'L' | 'kg' | 'cx';
  costPrice: number;
  supplier?: string;
}

export interface EventItemAllocation {
  productId: string;
  productName: string;
  quantityPlanned: number;
  quantityUsed?: number;
  returned?: number;
}

export interface EventStaffAllocation {
  staffId: string;
  staffName: string;
  role: StaffRole;
  confirmed: boolean;
  cost: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'Logística' | 'Alimentação' | 'Material Extra' | 'Outros';
}

export interface SelectedDrink {
  name: string;
  notes?: string; // Ex: "Sem açúcar", "Marca específica"
}

export type PartnerCategory = 
  | 'DJ' 
  | 'Cerimonialista' 
  | 'Salão de Eventos' 
  | 'Igreja' 
  | 'Fotografia' 
  | 'Buffet' 
  | 'Bolo' 
  | 'Doces' 
  | 'Lembranças' 
  | 'Animação' 
  | 'Iluminação' 
  | 'Outro';

export interface Partner {
  id: string;
  name: string;
  role: PartnerCategory;
  registryId?: string; // Link to the global registry if exists
}

// Global Registry for Partners (The "Contact Book")
export interface PartnerRegistryItem {
  id: string;
  name: string;
  category: PartnerCategory;
  phone: string;
  contactPerson: string; // "Contato" (Name of the person to talk to)
  notes?: string;
}

export interface AppEvent {
  id: string;
  name: string;
  date: string; // ISO String
  clientName: string;
  guests: number;
  location: string;
  locationNotes?: string; // Obs de local secundário
  
  eventType: 'Casamento' | '15 Anos' | 'Corporativo' | 'Batizado' | 'Feira' | 'Outros' | string;
  
  // Dynamic Fields based on eventType
  groomBrideNames?: string; // For Casamento
  debutanteName?: string;   // For 15 Anos
  companyName?: string;     // For Corporativo
  babyName?: string;        // For Batizado
  eventName?: string;       // For Outros/Feira

  status: EventStatus; // Status Operacional
  budget: number; // Valor cobrado do cliente
  
  // Negotiation Fields
  negotiationStatus: 'Pago' | 'Negociando' | 'Cancelado';
  responsible: string; // Quem fechou o evento (Removed from UI but kept in type for compatibility if needed, or remove completely)
  contact: string; // Telefone/Email de contato
  partners: Partner[];

  // New Fields
  packageType?: string; // Ex: "Premium", "Standard", "Personalizado"
  selectedDrinks: SelectedDrink[];

  allocatedItems: EventItemAllocation[];
  allocatedStaff: EventStaffAllocation[];
  specificExpenses: Expense[];
  notes: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'In' | 'Out';
  category: string;
  amount: number;
  description: string;
  relatedEventId?: string; // Link to an event if applicable
}