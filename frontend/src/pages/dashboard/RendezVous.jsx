import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { rendezvousApi } from '../../api/rendezvous';
import RendezVousTable from '../../components/ui/RendezVousTable';
import RendezVousModal from '../../components/ui/RendezVousModal';

const RendezVous = ({ patients: propsPatients = null, medecins: propsMedecins = null, rendezvous: propsRendezvous = null }) => {
    const [rendezvous, setRendezvous] = useState(propsRendezvous ?? []);
    const [patients, setPatients] = useState(propsPatients ?? []);
    const [medecins, setMedecins] = useState(propsMedecins ?? []);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentRdv, setCurrentRdv] = useState(null);
    const [formData, setFormData] = useState({
        dateRendezVous: '',
        heureRdv: '',
        idPatient: '',
        idMedecin: '',
        status: 'PLANIFIE',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            // Auto-login en dev si pas de token
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
                if (!token) {
                    console.log('[RendezVous] Aucun token trouvé, tentative de login automatique...');
                    const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: 'admin', password: 'admin123' })
                    });
                    if (res.ok) {
                        const json = await res.json();
                        const jwt = json?.token || json?.accessToken || json?.jwt;
                        if (jwt) {
                            localStorage.setItem('token', jwt);
                            console.log('[RendezVous] Login automatique réussi');
                        } else {
                            console.warn('[RendezVous] Login réussi mais pas de token retourné', json);
                        }
                    } else {
                        console.warn('[RendezVous] Login automatique échoué', res.status);
                    }
                }
            } catch (e) {
                console.warn('[RendezVous] Erreur login automatique', e);
            } finally {
                loadData();
            }
        })();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('[RendezVous] Chargement des données...');
            const drivers = [
                propsRendezvous == null ? rendezvousApi.getAll() : Promise.resolve(propsRendezvous),
                propsPatients == null ? rendezvousApi.getAllPatients() : Promise.resolve(propsPatients),
                propsMedecins == null ? rendezvousApi.getAllMedecins() : Promise.resolve(propsMedecins)
            ];

            const [rdvData, patientsData, medecinsData] = await Promise.all(drivers);

            // Si APIs renvoient null/undefined, garantir tableaux vides
            const safeRdv = Array.isArray(rdvData) ? rdvData : [];
            const safePatients = Array.isArray(patientsData) ? patientsData : [];
            const safeMedecins = Array.isArray(medecinsData) ? medecinsData : [];

            console.log('[RendezVous] rdvData:', safeRdv.length, safeRdv);
            console.log('[RendezVous] patientsData:', safePatients.length, safePatients);
            console.log('[RendezVous] medecinsData:', safeMedecins.length, safeMedecins);

            // si props fournis, ne pas écraser si on a obtenu des valeurs valides
            if (propsRendezvous == null) setRendezvous(safeRdv);
            if (propsPatients == null) setPatients(safePatients);
            if (propsMedecins == null) setMedecins(safeMedecins);

            // Si au moins une des APIs a renvoyé vide et l'autre non, montrer un warning
            if (safeRdv.length === 0 || safePatients.length === 0 || safeMedecins.length === 0) {
                // Construire message d'erreur utile si les appels ont échoué
                const parts = [];
                if (safeRdv.length === 0) parts.push('rendez-vous');
                if (safePatients.length === 0) parts.push('patients');
                if (safeMedecins.length === 0) parts.push('médecins');
                setError(`Impossible de charger: ${parts.join(', ')}. Vérifiez que les services backend sont démarrés.`);
            }
        } catch (err) {
            console.error('[RendezVous] Erreur lors du chargement des données', err);
            const message = err?.response?.data?.message || err?.message || 'Impossible de joindre le backend. Vérifiez que les services sont démarrés.';
            setError(message);
            // garantir empty lists
            setRendezvous([]);
            setPatients([]);
            setMedecins([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');

        try {
            if (currentRdv) {
                await rendezvousApi.update(currentRdv.idRendezVous, formData);
            } else {
                await rendezvousApi.create(formData);
            }
            await loadData();
            closeModal();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) return;

        try {
            await rendezvousApi.delete(id);
            await loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const openModal = (rdv = null) => {
        if (rdv) {
            setCurrentRdv(rdv);
            setFormData({
                dateRendezVous: rdv.dateRendezVous,
                heureRdv: rdv.heureRdv,
                idPatient: rdv.idPatient,
                idMedecin: rdv.idMedecin,
                status: rdv.status,
                notes: rdv.notes || ''
            });
        } else {
            setCurrentRdv(null);
            setFormData({
                dateRendezVous: '',
                heureRdv: '',
                idPatient: '',
                idMedecin: '',
                status: 'PLANIFIE',
                notes: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentRdv(null);
        setError('');
    };

    const getPatientName = (idPatient) => {
        const patient = patients.find(p => p.idPatient === idPatient);
        return patient ? `${patient.nom} ${patient.prenom}` : '';
    };

    const getMedecinName = (idMedecin) => {
        const medecin = medecins.find(m => m.idMedecin === idMedecin);
        return medecin ? `Dr. ${medecin.nom}` : '';
    };

    const filteredRendezVous = rendezvous.filter(rdv => {
        const patientName = getPatientName(rdv.idPatient).toLowerCase();
        const medecinName = getMedecinName(rdv.idMedecin).toLowerCase();
        const search = searchTerm.toLowerCase();
        return patientName.includes(search) || medecinName.includes(search);
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Rendez-vous</h1>
                            <p className="text-gray-600 mt-1">Bienvenue sur votre système de gestion hospitalière</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <AlertCircle className="w-6 h-6 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Toolbar */}
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Gestion des Rendez-vous</h2>
                            <button
                                onClick={() => openModal()}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <Plus className="w-5 h-5" />
                                Ajouter Rendez-vous
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher par patient ou médecin..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && !showModal && (
                        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
                            <div>{error}</div>
                            <div className="flex items-center space-x-2">
                                <button onClick={loadData} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Réessayer</button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <RendezVousTable
                        rendezvous={filteredRendezVous}
                        patients={patients}
                        medecins={medecins}
                        onEdit={openModal}
                        onDelete={handleDelete}
                        loading={loading}
                    />
                </div>
            </div>

            {/* Modal */}
            <RendezVousModal
                isOpen={showModal}
                onClose={closeModal}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                patients={patients}
                medecins={medecins}
                isEdit={!!currentRdv}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default RendezVous;
