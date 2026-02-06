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

export interface AppEvent {
  id: string;
  name: string;
  date: string; // ISO String
  clientName: string;
  guests: number;
  location: string;
  eventType: string; // Casamento, 15 Anos, Corporativo
  status: EventStatus;
  budget: number; // Valor cobrado do cliente
  
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