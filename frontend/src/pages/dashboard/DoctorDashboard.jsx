import React, { useState, useEffect } from 'react';
import {
    Activity, Users, Calendar, Bell, Search, Menu, X, Settings, LogOut, Home,
    UserPlus, Edit, Trash2, List, BarChart3, AlertCircle, CheckCircle, Stethoscope, Loader
} from 'lucide-react';
export default function MediConnectDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [doctors, setDoctors] = useState([]);

    const API_BASE_URL = 'http://localhost:8081/api/doctors';

    const fromApi = (d) => ({
        ...d,
        phoneNumber: d.phoneNumber ?? d.phone ?? '',
        isActive: d.isActive ?? d.active ?? true,
        professionalEmail: d.professionalEmail ?? d.email ?? '',
        registrationNumber: d.registrationNumber ?? d.registrationNumber  ?? '',
        specialization: d.specialization ?? 'Non définie',
        gender: d.gender ?? 'Other',
        //dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
    });
    const toApi = (d) => ({
        id: d.id,
        firstName: d.firstName?.trim(),
        lastName: d.lastName?.trim(),
        dateOfBirth: d.dateOfBirth || null,
        gender: d.gender,
        phoneNumber: d.phoneNumber?.trim(),
        professionalEmail: d.professionalEmail?.trim(),
        registrationNumber: d.registrationNumber?.trim(),
        specialization: d.specialization?.trim(),
        isActive: d.isActive ?? true,
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
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        window.location.href = '/login';
    };
    const [newDoctor, setNewDoctor] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'MALE',
        phoneNumber: '',
        professionalEmail: '',
        registrationNumber: '',
        specialization: ''
    });
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'doctors', label: 'Liste des Docteurs', icon: List },
        { id: 'add-doctor', label: 'Ajouter Docteur', icon: UserPlus },
        { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
        { id: 'reports', label: 'Rapports', icon: BarChart3 },
    ];

    useEffect(() => {
        fetchDoctors();
        fetchDoctorStatistics();
    }, [currentPage]);

    const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `${API_BASE_URL}?page=${currentPage}&size=20&sort=createdAt,desc`;
            const res = await fetch(url, { headers: getHeaders() });

            if (res.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
                handleLogout();
                return;
            }

            if (!res.ok) throw new Error((await res.text()) || `Erreur ${res.status}`);

            const data = await res.json();
            const raw = Array.isArray(data) ? data : (data.content || []);
            setDoctors(raw.map(fromApi));
            setTotalPages(Array.isArray(data) ? 1 : (data.totalPages || 1));
        } catch (e) {
            setError(e.message || 'Erreur chargement docteurs');
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctorStatistics = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/statistics`, { headers: getHeaders() });
            if (!res.ok) return;
            const data = await res.json();
            setStatistics(data);
        } catch {
            /* ignore */
        }
    };

    const handleSearch = async (term) => {
        setSearchTerm(term);

        if (!term.trim()) {
            fetchDoctors();
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE_URL}/search?q=${encodeURIComponent(term)}&page=0&size=20`,
                { headers: getHeaders() }
            );

            if (!res.ok) throw new Error((await res.text()) || 'Erreur recherche');

            const data = await res.json();

            // hna raw ghadi ykoon li jay men API dyal doctors
            const raw = Array.isArray(data) ? data : (data.content || []);

            // fromApi ghadi ykoun mapper dyal doctor
            setDoctors(raw.map(fromApi));

            setTotalPages(Array.isArray(data) ? 1 : (data.totalPages || 1));
            setCurrentPage(0);

        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (s) => (s ? new Date(s).toLocaleDateString('fr-FR') : '');

    // Calcule l'âge du doctor à partir de sa date de naissance
    const calculateAge = (dob) => {
        if (!dob) return '';
        const d = new Date(dob);
        const t = new Date();
        let age = t.getFullYear() - d.getFullYear();
        const m = t.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
        return age;
    };

    const handleAddDoctor = async () => {
        // Vérifie les champs obligatoires pour un doctor
        if (!newDoctor.firstName || !newDoctor.lastName || !newDoctor.professionalEmail || !newDoctor.phoneNumber) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = toApi(newDoctor);

            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error((await res.text()) || `Erreur ${res.status}`);

            await res.json();
            setSuccess('Docteur créé avec succès !');

            // Réinitialise le formulaire
            setNewDoctor({
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                gender: 'MALE',
                phoneNumber: '',
                professionalEmail: '',
                registrationNumber: '',
                specialization: ''
            });

            setActiveMenu('doctors');
            await fetchDoctors();
            await fetchDoctorStatistics();

            setTimeout(() => setSuccess(null), 3000);

        } catch (e) {
            setError(e.message || 'Échec création');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleEditDoctor = async () => {
        if (!selectedDoctor.firstName || !selectedDoctor.lastName || !selectedDoctor.professionalEmail ||
            !selectedDoctor.phoneNumber) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setLoading(true);
        try {
            const payload = toApi(selectedDoctor);
            const res = await fetch(`${API_BASE_URL}/${selectedDoctor.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error((await res.text()) || 'Erreur modification');

            setSuccess('Docteur modifié avec succès !');
            setShowEditModal(false);
            setSelectedDoctor(null);

            await fetchDoctors();      // rafraîchir la liste des docteurs
            await fetchDoctorStatistics();   // si tu affiches des stats globales

            setTimeout(() => setSuccess(null), 3000);
        } catch (e) {
            setError(e.message);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteDoctor = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir désactiver ce docteur ?')) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (!res.ok) throw new Error((await res.text()) || 'Erreur désactivation');

            setSuccess('Docteur désactivé avec succès !');
            await fetchDoctors();
            await fetchDoctorStatistics();
            setTimeout(() => setSuccess(null), 3000);

        } catch (e) {
            setError(e.message);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivateDoctor = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/${id}/reactivate`, {
                method: 'PATCH',
                headers: getHeaders()
            });

            if (!res.ok) throw new Error((await res.text()) || 'Erreur réactivation');

            setSuccess('Docteur réactivé avec succès !');
            await fetchDoctors();
            await fetchDoctorStatistics();
            setTimeout(() => setSuccess(null), 3000);

        } catch (e) {
            setError(e.message);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (d) => {
        setSelectedDoctor(fromApi(d));
        setShowEditModal(true);
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Docteurs</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{statistics?.totalDoctors ?? doctors.length}</p>
                        </div>
                        <div className="bg-blue-400 p-4 rounded-xl shadow-lg">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Docteurs Actifs</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{statistics?.activeDoctors ?? doctors.filter(d => d.isActive).length}</p>
                        </div>
                        <div className="bg-green-400 p-4 rounded-xl shadow-lg">
                            <CheckCircle className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Nouveaux ce Mois</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{statistics?.thisMonthRegistrations ?? 0}</p>
                        </div>
                        <div className="bg-purple-400 p-4 rounded-xl shadow-lg">
                            <UserPlus className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Rendez-vous Aujourd'hui</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">12</p>
                        </div>
                        <div className="bg-orange-400 p-4 rounded-xl shadow-lg">
                            <Calendar className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Docteurs Récents</h3>
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-3">
                        {doctors.slice(0, 4).map(d => (
                            <div key={d.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg hover:from-blue-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-[#5B9BD5] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {d.firstName?.charAt(0)}{d.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{d.firstName} {d.lastName}</p>
                                        <p className="text-sm text-gray-500">{d.professionalEmail}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {formatDate(d.createdAt)}
                            </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Rendez-vous Prochains</h3>
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-3">
                        {[
                            { doctor: 'Dr. Ahmed Benali', time: '09:00', type: 'Consultation' },
                            { doctor: 'Dr. Fatima Zahra', time: '10:30', type: 'Contrôle' },
                            { doctor: 'Dr. Mohamed Alami', time: '14:00', type: 'Urgence' },
                            { doctor: 'Dr. Aisha Idrissi', time: '16:00', type: 'Suivi' },
                        ].map((apt, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-lg hover:from-gray-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{apt.doctor}</p>
                                        <p className="text-sm text-gray-500">{apt.type}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{apt.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDoctorsList = () => (
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Liste des Docteurs</h2>
                    <button onClick={() => setActiveMenu('add-doctor')}
                            className="bg-[#5B9BD5] text-white px-5 py-2.5 rounded-lg hover:bg-[#4A8BC2] flex items-center space-x-2 shadow-md transition-all">
                        <UserPlus className="w-4 h-4" />
                        <span className="font-medium">Ajouter Docteur</span>
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text" placeholder="Rechercher..."
                        value={searchTerm} onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                        {['Docteur', 'Contact', 'Âge', 'Genre', 'Spécialité', 'Statut', 'Actions'].map(h => (
                            <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="px-6 py-12 text-center">
                                <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                                <p className="text-gray-500 mt-2">Chargement...</p>
                            </td>
                        </tr>
                    ) : doctors.map(d => (
                        <tr key={d.id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-[#5B9BD5] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                                        {d.firstName?.charAt(0)}{d.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{d.firstName} {d.lastName}</p>
                                        <p className="text-sm text-gray-500">{d.registrationNumber}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-gray-800">{d.professionalEmail}</p>
                                <p className="text-sm text-gray-500">{d.phoneNumber}</p>
                            </td>
                            <td className="px-6 py-4 text-gray-700 font-medium">{calculateAge(d.dateOfBirth)} ans</td>
                            <td className="px-6 py-4"><span className="text-gray-700">{d.gender === 'MALE' ? 'Homme' : d.gender === 'FEMALE' ? 'Femme' : 'Autre'}</span></td>
                            <td className="px-6 py-4"><span className="text-gray-700">{d.specialization || 'Non définie'}</span></td>
                            <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${d.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {d.isActive ? 'Actif' : 'Inactif'}
                            </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                    <button onClick={() => openEditModal(d)} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    {d.isActive ? (
                                        <button onClick={() => handleDeleteDoctor(d.id)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Désactiver">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button onClick={() => handleReactivateDoctor(d.id)} className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors" title="Réactiver">
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {!loading && doctors.length === 0 && (
                <div className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Aucun docteur trouvé</p>
                </div>
            )}

            {totalPages > 1 && (
                <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                    <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="px-4 py-2 bg-[#5B9BD5] text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#4A8BC2]">
                        Précédent
                    </button>
                    <span className="text-gray-600">Page {currentPage + 1} sur {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="px-4 py-2 bg-[#5B9BD5] text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#4A8BC2]">
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );

    const renderAddDoctorForm = () => (
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajouter un Nouveau Docteur</h2>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { label: 'Prénom *', key: 'firstName', type: 'text', placeholder: 'Ex: Ahmed' },
                        { label: 'Nom *', key: 'lastName', type: 'text', placeholder: 'Ex: Benali' },
                        { label: 'Date de Naissance', key: 'dateOfBirth', type: 'date' },
                        { label: 'Email Professionnel *', key: 'professionalEmail', type: 'email', placeholder: 'doctor@email.com' },
                        { label: 'Téléphone *', key: 'phoneNumber', type: 'tel', placeholder: '0612345678' },
                        { label: "Numéro d'Inscription", key: 'registrationNumber', type: 'text', placeholder: '12345' },
                        { label: 'Spécialité', key: 'specialization', type: 'text', placeholder: 'Cardiologie' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                            <input
                                type={f.type}
                                value={newDoctor[f.key]}
                                onChange={(e) => setNewDoctor({ ...newDoctor, [f.key]: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={f.placeholder}
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Genre</label>
                        <select
                            value={newDoctor.gender}
                            onChange={(e) => setNewDoctor({ ...newDoctor, gender: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="MALE">Homme</option>
                            <option value="FEMALE">Femme</option>
                            <option value="OTHER">Autre</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                        onClick={() => {
                            setNewDoctor({
                                firstName:'', lastName:'', dateOfBirth:'', gender:'MALE',
                                professionalEmail:'', phoneNumber:'', registrationNumber:'', specialization:''
                            });
                            setActiveMenu('doctors');
                        }}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                        Annuler
                    </button>
                    <button
                        onClick={handleAddDoctor}
                        disabled={loading}
                        className="px-6 py-3 bg-[#5B9BD5] text-white rounded-lg font-medium hover:bg-[#4A8BC2] shadow-md disabled:opacity-50 flex items-center space-x-2">
                        {loading && <Loader className="w-4 h-4 animate-spin" />}
                        <span>Enregistrer</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl transition-all duration-300 flex flex-col border-r border-gray-200`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    {sidebarOpen && (
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#5B9BD5] rounded-2xl flex items-center justify-center shadow-lg">
                                <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-800">MediConnect</span>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-[#5B9BD5] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">D</div>
                        {sidebarOpen && (
                            <div>
                                <p className="font-semibold text-gray-800">Docteur</p>
                                <p className="text-sm text-gray-500">doctor@mediconnect.com</p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveMenu(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                activeMenu === item.id ? 'bg-[#5B9BD5] text-white shadow-md' : 'text-gray-600 hover:bg-blue-50'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {sidebarOpen && <span className="font-medium">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="font-medium">Déconnexion</span>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{menuItems.find(m => m.id === activeMenu)?.label || 'Dashboard'}</h1>
                            <p className="text-gray-500 text-sm mt-1">Bienvenue sur votre système de gestion médicale</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <Settings className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </header>

                {success && (
                    <div className="mx-6 mt-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-center space-x-3 shadow-md">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-green-800 font-medium">{success}</p>
                        <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-center space-x-3 shadow-md">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 font-medium">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="p-6">
                    {activeMenu === 'dashboard' && renderDashboard()}
                    {activeMenu === 'doctors' && renderDoctorsList()}
                    {activeMenu === 'add-doctor' && renderAddDoctorForm()}
                    {activeMenu === 'appointments' && (
                        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-800">Gestion des Rendez-vous</h2>
                            <p className="text-gray-500 mt-2">Module en cours de développement...</p>
                        </div>
                    )}
                    {activeMenu === 'reports' && (
                        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
                            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-800">Rapports et Statistiques</h2>
                            <p className="text-gray-500 mt-2">Module en cours de développement...</p>
                        </div>
                    )}
                </div>
            </main>

            {showEditModal && selectedDoctor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200">

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Modifier Docteur</h2>
                            <button
                                onClick={() => { setShowEditModal(false); setSelectedDoctor(null); }}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {[
                                    { label: 'Prénom *', key: 'firstName', type: 'text' },
                                    { label: 'Nom *', key: 'lastName', type: 'text' },
                                    { label: 'Date de Naissance', key: 'dateOfBirth', type: 'date' },
                                    { label: 'Email Professionnel *', key: 'professionalEmail', type: 'email' },
                                    { label: 'Téléphone *', key: 'phoneNumber', type: 'tel' },
                                    { label: "Numéro d'Inscription", key: 'registrationNumber', type: 'text' },
                                    { label: 'Spécialité', key: 'specialization', type: 'text' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                                        <input
                                            type={f.type}
                                            value={
                                                f.key === 'dateOfBirth'
                                                    ? (selectedDoctor[f.key] ? selectedDoctor[f.key].split('T')[0] : '')
                                                    : (selectedDoctor[f.key] ?? '')
                                            }
                                            onChange={(e) => setSelectedDoctor({
                                                ...selectedDoctor,
                                                [f.key]: e.target.value
                                            })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                ))}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Genre</label>
                                    <select
                                        value={selectedDoctor.gender}
                                        onChange={(e) => setSelectedDoctor({ ...selectedDoctor, gender: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="MALE">Homme</option>
                                        <option value="FEMALE">Femme</option>
                                        <option value="OTHER">Autre</option>
                                    </select>
                                </div>

                            </div>

                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => { setShowEditModal(false); setSelectedDoctor(null); }}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                    Annuler
                                </button>

                                <button
                                    onClick={handleEditDoctor}
                                    disabled={loading}
                                    className="px-6 py-3 bg-[#5B9BD5] text-white rounded-lg font-medium hover:bg-[#4A8BC2] shadow-md transition-all disabled:opacity-50 flex items-center space-x-2">
                                    {loading && <Loader className="w-4 h-4 animate-spin" />}
                                    <span>Enregistrer</span>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );



};