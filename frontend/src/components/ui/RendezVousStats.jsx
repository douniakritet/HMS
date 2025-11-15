import React from 'react';
import { Calendar, Clock, Check, X } from 'lucide-react';

const RendezVousStats = ({ rendezvous }) => {
    const stats = {
        total: rendezvous.length,
        confirme: rendezvous.filter(r => r.status === 'CONFIRME').length,
        planifie: rendezvous.filter(r => r.status === 'PLANIFIE').length,
        annule: rendezvous.filter(r => r.status === 'ANNULE').length
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Confirmés</p>
                        <p className="text-2xl font-bold text-green-600">{stats.confirme}</p>
                    </div>
                    <Check className="w-8 h-8 text-green-500" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Planifiés</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.planifie}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Annulés</p>
                        <p className="text-2xl font-bold text-red-600">{stats.annule}</p>
                    </div>
                    <X className="w-8 h-8 text-red-500" />
                </div>
            </div>
        </div>
    );
};

export default RendezVousStats;