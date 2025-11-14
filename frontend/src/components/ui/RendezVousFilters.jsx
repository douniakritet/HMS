import React from 'react';
import { Search, Filter, UserCircle, Stethoscope } from 'lucide-react';

const RendezVousFilters = ({
                               searchTerm,
                               setSearchTerm,
                               filterStatus,
                               setFilterStatus,
                               filterType,
                               setFilterType,
                               selectedPatient,
                               setSelectedPatient,
                               selectedMedecin,
                               setSelectedMedecin,
                               patients,
                               medecins,
                               filteredCount
                           }) => {
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

    const handleReset = () => {
        setSearchTerm('');
        setFilterStatus('tous');
        setFilterType('tous');
        setSelectedPatient('');
        setSelectedMedecin('');
    };

    const getPatientName = (idPatient) => {
        const patient = patients.find(p => p.idPatient === parseInt(idPatient));
        return patient ? `${patient.prenom} ${patient.nom}` : '';
    };

    const getMedecinName = (idMedecin) => {
        const medecin = medecins.find(m => m.idMedecin === parseInt(idMedecin));
        return medecin ? medecin.nom : '';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <div className="space-y-4">
                {/* Recherche */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par patient, médecin ou motif..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>

                {/* Filtres */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Type de filtre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Filter className="w-4 h-4 inline mr-1" />
                            Filtrer par
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setSelectedPatient('');
                                setSelectedMedecin('');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="tous">Tous les rendez-vous</option>
                            <option value="patient">Par Patient</option>
                            <option value="medecin">Par Médecin</option>
                        </select>
                    </div>

                    {/* Sélection Patient */}
                    {filterType === 'patient' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <UserCircle className="w-4 h-4 inline mr-1" />
                                Patient
                            </label>
                            <select
                                value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="">Sélectionner un patient</option>
                                {patients.map(patient => (
                                    <option key={patient.idPatient} value={patient.idPatient}>
                                        {patient.prenom} {patient.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Sélection Médecin */}
                    {filterType === 'medecin' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Stethoscope className="w-4 h-4 inline mr-1" />
                                Médecin
                            </label>
                            <select
                                value={selectedMedecin}
                                onChange={(e) => setSelectedMedecin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="">Sélectionner un médecin</option>
                                {medecins.map(medecin => (
                                    <option key={medecin.idMedecin} value={medecin.idMedecin}>
                                        {medecin.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Filtre Statut */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Statut
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="tous">Tous les statuts</option>
                            {statuts.map(s => (
                                <option key={s} value={s}>{getStatusLabel(s)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Bouton Reset */}
                    <div className="flex items-end">
                        <button
                            onClick={handleReset}
                            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>

                {/* Résultats du filtre */}
                {(filterType === 'patient' && selectedPatient) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <UserCircle className="w-4 h-4 inline mr-1" />
                            <strong>Rendez-vous de {getPatientName(selectedPatient)}:</strong> {filteredCount} résultat(s)
                        </p>
                    </div>
                )}
                {(filterType === 'medecin' && selectedMedecin) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                            <Stethoscope className="w-4 h-4 inline mr-1" />
                            <strong>Rendez-vous de {getMedecinName(selectedMedecin)}:</strong> {filteredCount} résultat(s)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RendezVousFilters;