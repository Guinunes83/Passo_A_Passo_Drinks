import React from 'react';
import { AppEvent, Transaction, PartnerRegistryItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, Calendar, Users, TrendingUp, PieChart as PieChartIcon, Award } from 'lucide-react';

interface DashboardProps {
  events: AppEvent[];
  transactions: Transaction[];
  partnerRegistry: PartnerRegistryItem[];
}

const COLORS = ['#f59e0b', '#4f46e5', '#10b981', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ events, transactions, partnerRegistry }) => {
  // --- KPI Calculations ---
  const totalRevenue = transactions
    .filter(t => t.type === 'In')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'Out')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const profit = totalRevenue - totalExpenses;
  const upcomingEventsCount = events.filter(e => e.status === 'Agendado').length;
  
  // --- Chart Data Preparation ---

  // 1. Financial Chart (Mocked + Real mix for demo)
  const financialData = [
    { name: 'Jan', entrada: 4000, saida: 2400 },
    { name: 'Fev', entrada: 3000, saida: 1398 },
    { name: 'Mar', entrada: 9800, saida: 5000 },
    { name: 'Abr', entrada: 3908, saida: 2000 },
    { name: 'Mai', entrada: 4800, saida: 2800 },
    { name: 'Jun', entrada: 3800, saida: 1908 },
    { name: 'Jul', entrada: totalRevenue / 2, saida: totalExpenses / 2 },
  ];

  // 2. Events Per Month (Dynamic from mock events)
  const eventsByMonth = events.reduce((acc, event) => {
    const month = new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Fill in some standard months for the chart if empty or sparse
  const standardMonths = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const eventsPerMonthData = standardMonths.map(m => ({
    name: m,
    events: eventsByMonth[m] || 0 // Use actual count or 0
  }));
  // Inject some fake data for months without events just for visualization in this demo
  if (events.length <= 3) {
      eventsPerMonthData[9].events = 4; // out
      eventsPerMonthData[10].events = eventsByMonth['nov'] || 6; // nov
      eventsPerMonthData[11].events = 8; // dez
  }

  // 3. Event Types Distribution
  const eventsByType = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventTypeData = Object.keys(eventsByType).map(type => ({
    name: type,
    value: eventsByType[type]
  }));

  // --- Top 10 Partners Logic ---
  const getTopPartners = () => {
    // 1. Calculate frequency
    const counts: Record<string, number> = {};
    events.forEach(ev => {
       ev.partners.forEach(p => {
           // Try to match with registry ID if possible, else match name
           const key = p.registryId || p.name;
           counts[key] = (counts[key] || 0) + 1;
       });
    });

    // 2. Map back to partner objects (or create temp ones if not in registry)
    const partnerStats = Object.keys(counts).map(key => {
       const registryItem = partnerRegistry.find(r => r.id === key || r.name === key);
       return {
           id: key,
           name: registryItem ? registryItem.name : key, // Fallback if name used as key
           category: registryItem ? registryItem.category : 'Outro',
           count: counts[key]
       };
    });

    // 3. Sort and take top 10
    return partnerStats.sort((a, b) => b.count - a.count).slice(0, 10);
 };

 const topPartners = getTopPartners();

  return (
    <div className="p-6 space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard Geral</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Faturamento</p>
            <h3 className="text-2xl font-bold text-slate-800">R$ {totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Despesas</p>
            <h3 className="text-2xl font-bold text-slate-800">R$ {totalExpenses.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Eventos (Mês)</p>
            <h3 className="text-2xl font-bold text-slate-800">{upcomingEventsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Lucro Líquido</p>
            <h3 className={`text-2xl font-bold ${profit >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                R$ {profit.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* TREND TOP 10 SECTION (Moved from PartnerManager) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
         <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-500 p-2 rounded-lg text-slate-900"><TrendingUp size={24} /></div>
            <div>
                <h3 className="font-bold text-lg">TrendTop 10 Parceiros</h3>
                <p className="text-slate-400 text-xs">Parceiros com maior frequência em eventos</p>
            </div>
         </div>
         
         <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
             {topPartners.length > 0 ? (
                 topPartners.map((p, index) => (
                    <div key={p.id} className="min-w-[140px] bg-white/10 rounded-lg p-3 border border-white/10 flex flex-col items-center text-center relative group">
                        <div className="absolute top-2 right-2 text-xs font-bold text-amber-500">#{index + 1}</div>
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 mb-2">
                             <Award size={18} className={index < 3 ? 'text-amber-400' : 'text-slate-400'} />
                        </div>
                        <div className="font-semibold text-sm truncate w-full" title={p.name}>{p.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide truncate w-full">{p.category}</div>
                        <div className="mt-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">{p.count} eventos</div>
                    </div>
                 ))
             ) : (
                 <div className="text-slate-400 text-sm italic w-full text-center py-4">Ainda não há dados suficientes de eventos.</div>
             )}
         </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Financial Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Fluxo Financeiro</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend />
              <Bar dataKey="entrada" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Entradas" />
              <Bar dataKey="saida" fill="#ef4444" radius={[4, 4, 0, 0]} name="Saídas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Event Types Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
           <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
             <PieChartIcon size={20} /> Tipos de Eventos Contratados
           </h3>
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend verticalAlign="middle" align="right" layout="vertical" />
             </PieChart>
           </ResponsiveContainer>
        </div>

        {/* Events per Month Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Média de Eventos por Mês</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventsPerMonthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} className="uppercase text-xs" />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="events" fill="#f59e0b" radius={[4, 4, 4, 4]} name="Quantidade de Eventos" barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;