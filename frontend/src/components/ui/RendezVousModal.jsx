import React from 'react';
import { X, AlertCircle, Loader, User, Stethoscope } from 'lucide-react';

const RendezVousModal = ({
                             isOpen,
                             onClose,
                             formData,
                             setFormData,
                             onSave,
                             patients,
                             medecins,
                             isEdit,
                             loading,
                             error,
                             mode = 'edit'
                         }) => {
    if (!isOpen) return null;

    const statuts = ['PLANIFIE', 'CONFIRME', 'ANNULE', 'TERMINE'];

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

    const getPatientName = (idPatient) => {
        const patient = patients.find(p => p.idPatient === parseInt(idPatient));
        return patient ? `${patient.prenom} ${patient.nom}` : '';
    };

    const getMedecinInfo = (idMedecin) => {
        return medecins.find(m => m.idMedecin === parseInt(idMedecin)) || {};
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {mode === 'add' && 'Nouveau Rendez-vous'}
                        {mode === 'edit' && 'Modifier le Rendez-vous'}
                        {mode === 'view' && 'Détails du Rendez-vous'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Content */}
                {mode === 'view' ? (
                    // Mode Visualisation
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-600 font-medium mb-2">Informations du patient</p>
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-blue-700" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{getPatientName(formData.idPatient)}</p>
                                        <p className="text-sm text-gray-600">ID Patient: {formData.idPatient}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-green-600 font-medium mb-2">Informations du médecin</p>
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                                        <Stethoscope className="w-6 h-6 text-green-700" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{getMedecinInfo(formData.idMedecin).nom}</p>
                                        <p className="text-sm text-gray-600">{getMedecinInfo(formData.idMedecin).specialite}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">Date</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(formData.dateRendezVous).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Heure</p>
                                <p className="font-medium text-gray-900">{formData.heureRdv}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500 mb-1">Statut</p>
                                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(formData.status)}`}>
                                    {getStatusLabel(formData.status)}
                                </span>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-500 mb-1">Motif de consultation</p>
                            <p className="font-medium text-gray-900">{formData.motif || 'Non spécifié'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">Type de rendez-vous</p>
                            <p className="font-medium text-gray-900">{formData.typeRendezVous || 'Non spécifié'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">Notes</p>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                {formData.notes || 'Aucune note'}
                            </p>
                        </div>
                    </div>
                ) : (
                    // Mode Édition/Ajout
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Patient */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Patient *
                                    </label>
                                    <select
                                        value={formData.idPatient}
                                        onChange={(e) => setFormData({ ...formData, idPatient: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        required
                                    >
                                        <option value="">Sélectionner un patient</option>
                                        {patients.map(patient => (
                                            <option key={patient.idPatient} value={patient.idPatient}>
                                                {patient.prenom} {patient.nom}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Médecin */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Médecin *
                                    </label>
                                    <select
                                        value={formData.idMedecin}
                                        onChange={(e) => setFormData({ ...formData, idMedecin: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        required
                                    >
                                        <option value="">Sélectionner un médecin</option>
                                        {medecins.map(medecin => (
                                            <option key={medecin.idMedecin} value={medecin.idMedecin}>
                                                {medecin.nom} - {medecin.specialite}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dateRendezVous}
                                        onChange={(e) => setFormData({ ...formData, dateRendezVous: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        required
                                    />
                                </div>

                                {/* Heure */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Heure *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.heureRdv}
                                        onChange={(e) => setFormData({ ...formData, heureRdv: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        required
                                    />
                                </div>

                                {/* Statut */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut *
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        required
                                    >
                                        <option value="">Sélectionner un statut</option>
                                        {statuts.map(statut => (
                                            <option key={statut} value={statut}>
                                                {getStatusLabel(statut)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Motif */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Motif de consultation *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.motif}
                                        onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="Ex: Consultation de routine"
                                        required
                                    />
                                </div>

                                {/* Type de rendez-vous */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type de rendez-vous *
                                    </label>
                                    <select
                                        value={formData.typeRendezVous}
                                        onChange={(e) =>
                                            setFormData({ ...formData, typeRendezVous: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        required
                                    >
                                        <option value="">Sélectionner un type</option>
                                        <option value="CONSULTATION">Consultation</option>
                                        <option value="CONTROLE">Contrôle</option>
                                        <option value="URGENCE">Urgence</option>
                                        <option value="SUIVI">Suivi</option>
                                    </select>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    rows="3"
                                    placeholder="Notes additionnelles..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        {mode === 'view' ? 'Fermer' : 'Annuler'}
                    </button>
                    {mode !== 'view' && (
                        <button
                            onClick={onSave}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RendezVousModal;
