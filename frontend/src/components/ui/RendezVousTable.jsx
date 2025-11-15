import React from 'react';
import { Calendar, Clock, User, Eye, Edit2, Trash2, Loader } from 'lucide-react';

const RendezVousTable = ({
                             rendezvous,
                             patients,
                             medecins,
                             onEdit,
                             onDelete,
                             onView,
                             loading
                         }) => {
    const getPatientName = (idPatient) => {
        const patient = patients.find(p => p.idPatient === idPatient);
        return patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu';
    };

    const getMedecinName = (idMedecin) => {
        const medecin = medecins.find(m => m.idMedecin === idMedecin);
        return medecin ? medecin.nom : 'Médecin inconnu';
    };

    const getMedecinSpecialite = (idMedecin) => {
        const medecin = medecins.find(m => m.idMedecin === idMedecin);
        return medecin?.specialite || '';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PLANIFIE': 'Planifié',
            'CONFIRME': 'Confirmé',
            'ANNULE': 'Annulé',
            'TERMINE': 'Terminé'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'CONFIRME': return 'bg-green-100 text-green-800';
            case 'PLANIFIE': return 'bg-yellow-100 text-yellow-800';
            case 'ANNULE': return 'bg-red-100 text-red-800';
            case 'TERMINE': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médecin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motif</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="px-6 py-12 text-center">
                                <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                                <p className="text-gray-500 mt-2">Chargement...</p>
                            </td>
                        </tr>
                    ) : rendezvous.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">Aucun rendez-vous trouvé</p>
                                <p className="text-sm mt-1">Essayez de modifier vos critères de recherche</p>
                            </td>
                        </tr>
                    ) : (
                        rendezvous.map((rdv) => (
                            <tr key={rdv.idRendezVous} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-medium text-gray-900">{getPatientName(rdv.idPatient)}</p>
                                            <p className="text-sm text-gray-500">ID: {rdv.idPatient}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <p className="font-medium text-gray-900">{getMedecinName(rdv.idMedecin)}</p>
                                        <p className="text-sm text-gray-500">{getMedecinSpecialite(rdv.idMedecin)}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-gray-900 max-w-xs truncate">{rdv.motif || 'Non spécifié'}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                    {rdv.typeRendezVous || 'Non spécifié'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                    {new Date(rdv.dateRendezVous).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-gray-900">
                                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                        {rdv.heureRdv}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(rdv.status)}`}>
                                            {getStatusLabel(rdv.status)}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onView(rdv)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Voir détails"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(rdv)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Modifier"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(rdv.idRendezVous)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RendezVousTable;