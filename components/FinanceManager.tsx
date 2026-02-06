import React from 'react';
import { Transaction } from '../types';
import { ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';

interface FinanceManagerProps {
  transactions: Transaction[];
}

const FinanceManager: React.FC<FinanceManagerProps> = ({ transactions }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Financeiro</h2>
        <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                <Filter size={18} /> Filtrar
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                + Nova Receita
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                - Nova Despesa
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                    <th className="p-4">Data</th>
                    <th className="p-4">Descrição</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4 text-right">Valor</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-4 text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="p-4 font-medium text-slate-800">{t.description}</td>
                        <td className="p-4">
                            <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">{t.category}</span>
                        </td>
                        <td className={`p-4 text-right font-bold flex items-center justify-end gap-2 ${t.type === 'In' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'In' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                            R$ {t.amount.toFixed(2)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceManager;