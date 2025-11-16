import React, { useState } from 'react';
import {
    Calendar, Clock, User, Stethoscope, FileText, Loader,
    CheckCircle, AlertCircle, X
} from 'lucide-react';

export default function RendezVousForm({ patients, medecins, onCreated, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        patientId: '',
        medecinId: '',
        dateRendezVous: '',
        heureRdv: '',
        motif: '',
        typeRendezVous: 'Consultation',
        status: 'PLANIFIE',
        notes: ''
    });

    const getAuthToken = () =>
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken') ||
        '';

    const getHeaders = () => {
        const token = getAuthToken();
        const h = { 'Content-Type': 'application/json' };
        if (token) h['Authorization'] = `Bearer ${token}`;
        return h;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.patientId || !formData.medecinId || !formData.dateRendezVous || !formData.heureRdv) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Combine date et heure
            const dateTime = `${formData.dateRendezVous}T${formData.heureRdv}:00`;

            const payload = {
                patientId: parseInt(formData.patientId),
                medecinId: parseInt(formData.medecinId),
                dateRendezVous: dateTime,
                motif: formData.motif || 'Consultation',
                typeRendezVous: formData.typeRendezVous,
                status: formData.status,
                notes: formData.notes
            };

            const res = await fetch('/api/rendezvous', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || `Erreur ${res.status}`);
            }

            setSuccess('Rendez-vous créé avec succès !');

            // Réinitialiser le formulaire
            setFormData({
                patientId: '',
                medecinId: '',
                dateRendezVous: '',
                heureRdv: '',
                motif: '',
                typeRendezVous: 'Consultation',
                status: 'PLANIFIE',
                notes: ''
            });

            // Attendre 1.5 secondes puis revenir à la liste
            setTimeout(() => {
                if (onCreated) onCreated();
            }, 1500);

        } catch (e) {
            setError(e.message || 'Échec de la création du rendez-vous');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Nouveau Rendez-vous</h2>
                        <p className="text-gray-500 text-sm mt-1">Planifier un nouveau rendez-vous médical</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Messages de succès/erreur */}
            {success && (
                <div className="mx-6 mt-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">{success}</p>
                </div>
            )}

            {error && (
                <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Patient */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Patient *
                        </label>
                        <select
                            value={formData.patientId}
                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Sélectionner un patient</option>
                            {patients.map(p => (
                                <option key={p.idPatient} value={p.idPatient}>
                                    {p.prenom} {p.nom} - {p.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Médecin */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Stethoscope className="w-4 h-4 inline mr-2" />
                            Médecin *
                        </label>
                        <select
                            value={formData.medecinId}
                            onChange={(e) => setFormData({ ...formData, medecinId: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Sélectionner un médecin</option>
                            {medecins.map(m => (
                                <option key={m.idMedecin} value={m.idMedecin}>
                                    Dr. {m.nom} {m.prenom} - {m.specialite}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Date du Rendez-vous *
                        </label>
                        <input
                            type="date"
                            value={formData.dateRendezVous}
                            onChange={(e) => setFormData({ ...formData, dateRendezVous: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Heure */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-2" />
                            Heure *
                        </label>
                        <input
                            type="time"
                            value={formData.heureRdv}
                            onChange={(e) => setFormData({ ...formData, heureRdv: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Type de Rendez-vous
                        </label>
                        <select
                            value={formData.typeRendezVous}
                            onChange={(e) => setFormData({ ...formData, typeRendezVous: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Consultation">Consultation</option>
                            <option value="Controle">Contrôle</option>
                            <option value="Urgence">Urgence</option>
                            <option value="Suivi">Suivi</option>
                        </select>
                    </div>

                    {/* Statut */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Statut
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="PLANIFIE">Planifié</option>
                            <option value="CONFIRME">Confirmé</option>
                            <option value="ANNULE">Annulé</option>
                            <option value="TERMINE">Terminé</option>
                        </select>
                    </div>

                    {/* Motif */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-2" />
                            Motif de Consultation
                        </label>
                        <input
                            type="text"
                            value={formData.motif}
                            onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Consultation générale, Contrôle..."
                        />
                    </div>

                    {/* Notes */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Notes additionnelles..."
                            rows="4"
                            maxLength="500"
                        />
                    </div>
                </div>

                {/* Boutons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md disabled:opacity-50 flex items-center space-x-2 transition-all"
                    >
                        {loading && <Loader className="w-4 h-4 animate-spin" />}
                        <Calendar className="w-4 h-4" />
                        <span>Créer le Rendez-vous</span>
                    </button>
                </div>
            </form>
        </div>
    );
}