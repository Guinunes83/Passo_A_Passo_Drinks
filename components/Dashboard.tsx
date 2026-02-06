import React, { useEffect, useState } from 'react';
import { AppEvent, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, Calendar, Users, TrendingUp, Sparkles, PieChart as PieChartIcon } from 'lucide-react';
import { analyzeFinancialHealth } from '../services/geminiService';

interface DashboardProps {
  events: AppEvent[];
  transactions: Transaction[];
}

const COLORS = ['#f59e0b', '#4f46e5', '#10b981', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ events, transactions }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('Carregando análise...');

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

  useEffect(() => {
    const fetchAdvice = async () => {
        if (!process.env.API_KEY) {
            setAiAnalysis("Configure sua API Key para receber insights.");
            return;
        }
        const advice = await analyzeFinancialHealth(totalRevenue, totalExpenses, upcomingEventsCount);
        setAiAnalysis(advice);
    };
    fetchAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard Geral</h2>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-100 shadow-sm">
            <Sparkles size={18} />
            <span className="text-sm font-medium italic">{aiAnalysis}</span>
        </div>
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