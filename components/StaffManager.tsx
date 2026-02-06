import React from 'react';
import { Staff, StaffRole, StaffType } from '../types';
import { User, Phone, Briefcase, Star, CheckCircle, XCircle } from 'lucide-react';

interface StaffManagerProps {
  staffList: Staff[];
}

const StaffManager: React.FC<StaffManagerProps> = ({ staffList }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Equipe & Freelancers</h2>
        <button className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
            Cadastrar Profissional
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.map(staff => (
            <div key={staff.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{staff.name}</h3>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">{staff.type}</span>
                        </div>
                    </div>
                    {staff.available ? (
                        <span className="text-green-500"><CheckCircle size={18} /></span>
                    ) : (
                        <span className="text-red-300"><XCircle size={18} /></span>
                    )}
                </div>
                
                <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Briefcase size={16} className="text-slate-400" />
                        <span>{staff.role}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={16} className="text-slate-400" />
                        <span>{staff.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Star size={16} className="text-slate-400" />
                        <span>R$ {staff.ratePerEvent.toFixed(2)} / evento</span>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default StaffManager;