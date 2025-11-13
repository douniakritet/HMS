import React, { useState, useEffect } from 'react';
import {
    Activity, Users, Calendar, Bell, Search, Menu, X, Settings, LogOut, Home,
    UserPlus, Edit, Trash2, List, BarChart3, AlertCircle, CheckCircle, Stethoscope,
    Loader, ChevronDown, ChevronRight, Clock, TrendingUp, TrendingDown, DollarSign,
    FileText, Phone, Mail, MapPin, Heart, Droplet, User, Building
} from 'lucide-react';

export default function MediConnectDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [expandedMenus, setExpandedMenus] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showEditMedecinModal, setShowEditMedecinModal] = useState(false);
    const [selectedMedecin, setSelectedMedecin] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [patients, setPatients] = useState([]);
    const [medecins, setMedecins] = useState([]);
    const [rendezvous, setRendezvous] = useState([]);
    const [newFacture, setNewFacture] = useState({
        patientId: '', medecinId: '', rendezVousId: '', amount: '', description: '',
        status: 'UNPAID', modePaiement: 'CASH'
    });

    const API_BASE_URL = 'http://localhost:8081/api/patients';
    const API_MEDECIN_URL = 'http://localhost:8082/api/doctors';
    const API_RDV_URL = 'http://localhost:8083/api/rendez-vous';
    const API_BILLING_URL = 'http://localhost:8084/api/billings';

    const BLOOD_UI_TO_ENUM = {
        'A+': 'A_POSITIVE',  'A-': 'A_NEGATIVE',
        'B+': 'B_POSITIVE',  'B-': 'B_NEGATIVE',
        'AB+': 'AB_POSITIVE','AB-': 'AB_NEGATIVE',
        'O+': 'O_POSITIVE',  'O-': 'O_NEGATIVE',
    };
    const BLOOD_ENUM_TO_UI = Object.fromEntries(
        Object.entries(BLOOD_UI_TO_ENUM).map(([ui, en]) => [en, ui])
    );

    const fromApi = (p) => ({
        ...p,
        phoneNumber: p.phoneNumber ?? p.phone ?? '',
        cin: p.cin ?? '',
        isActive: p.isActive ?? p.active ?? true,
        bloodType: BLOOD_ENUM_TO_UI[p.bloodType] ?? p.bloodType,
    });

    const toApi = (p) => ({
        id: p.id,
        firstName: p.firstName?.trim(),
        lastName: p.lastName?.trim(),
        email: p.email?.trim(),
        phoneNumber: p.phoneNumber?.trim(),
        cin: p.cin?.trim(),
        dateOfBirth: p.dateOfBirth || null,
        gender: p.gender,
        bloodType: BLOOD_UI_TO_ENUM[p.bloodType] ?? p.bloodType,
        address: p.address || null,
        emergencyContact: p.emergencyContact || null,
        allergies: p.allergies || null,
        medicalHistory: p.medicalHistory || null,
        isActive: p.isActive ?? true,
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

    const [newPatient, setNewPatient] = useState({
        firstName: '', lastName: '', cin: '', dateOfBirth: '', gender: 'MALE',
        email: '', phoneNumber: '', address: '', bloodType: 'O-',
        emergencyContact: '', allergies: '', medicalHistory: ''
    });

    const [newMedecin, setNewMedecin] = useState({
        firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE',
        phoneNumber: '', professionalEmail: '', registrationNumber: '', specialization: ''
    });

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        {
            id: 'patients',
            label: 'Patients',
            icon: Users,
            subItems: [
                { id: 'patients-list', label: 'Liste des Patients', icon: List },
                { id: 'add-patient', label: 'Ajouter Patient', icon: UserPlus },
            ]
        },
        {
            id: 'doctors',
            label: 'Médecins',
            icon: Stethoscope,
            subItems: [
                { id: 'doctors-list', label: 'Liste des Médecins', icon: List },
                { id: 'add-doctor', label: 'Ajouter Médecin', icon: UserPlus },
            ]
        },
        {
            id: 'appointments',
            label: 'Rendez-vous',
            icon: Calendar,
            subItems: [
                { id: 'appointments-list', label: 'Liste des RDV', icon: List },
                { id: 'add-appointment', label: 'Nouveau RDV', icon: Calendar },
            ]
        },
        {
            id: 'billing',
            label: 'Facturation',
            icon: BarChart3,
            subItems: [
                { id: 'invoices-list', label: 'Liste des Factures', icon: List },
                { id: 'add-invoice', label: 'Nouvelle Facture', icon: UserPlus },
            ]
        },
    ];

    const bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

    const toggleMenu = (menuId) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }));
    };

    useEffect(() => {
        fetchPatients();
        fetchStatistics();
        if (activeMenu === 'doctors-list' || activeMenu === 'add-doctor') {
            fetchMedecins();
        }
        if (activeMenu === 'add-invoice') {
            fetchMedecins();
            fetchRendezvous();
        }
    }, [currentPage, activeMenu]);

    const fetchPatients = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `${API_BASE_URL}?page=${currentPage}&size=20&sort=registrationDate,desc`;
            const res = await fetch(url, { headers: getHeaders() });

            if (res.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
                handleLogout();
                return;
            }
            if (!res.ok) throw new Error((await res.text()) || `Erreur ${res.status}`);

            const data = await res.json();
            const raw = Array.isArray(data) ? data : (data.content || []);
            setPatients(raw.map(fromApi));
            setTotalPages(Array.isArray(data) ? 1 : (data.totalPages || 1));
        } catch (e) {
            setError(e.message || 'Erreur chargement patients');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/statistics`, { headers: getHeaders() });
            if (!res.ok) return;
            const data = await res.json();
            setStatistics(data);
        } catch {
            /* ignore */
        }
    };

    // Normaliser les données médecins du backend
    // Normaliser les données médecins du backend
    const fromMedecinApi = (m) => ({
        ...m,
        phoneNumber: m.phoneNumber ?? m.phone ?? '',
        professionalEmail: m.professionalEmail ?? m.email ?? '',
        isActive: m.isActive ?? m.active ?? true,
    });

    const fetchMedecins = async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = getHeaders();
            console.log('🔑 Headers envoyés:', headers);

            // Utiliser la pagination comme pour les patients
            const url = `${API_MEDECIN_URL}?page=0&size=100&sort=createdAt,desc`;
            console.log('🌐 URL appelée:', url);

            const res = await fetch(url, { headers });

            if (res.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
                handleLogout();
                return;
            }

            if (!res.ok) {
                const errorText = await res.text();
                console.error('❌ Erreur HTTP', res.status, ':', errorText);
                throw new Error(`Erreur ${res.status}: ${errorText || 'Erreur chargement médecins'}`);
            }

            const data = await res.json();
            console.log('✅ Médecins reçus du backend:', data);

            // Extraire le contenu de la page
            const rawMedecins = Array.isArray(data) ? data : (data.content || []);
            console.log('📋 Nombre de médecins:', rawMedecins.length);

            setMedecins(rawMedecins.map(fromMedecinApi));
        } catch (e) {
            console.error('🔥 Erreur fetchMedecins:', e);
            setError(e.message || 'Erreur chargement médecins');
        } finally {
            setLoading(false);
        }
    };
    const fetchRendezvous = async () => {
        try {
            const res = await fetch(API_RDV_URL, { headers: getHeaders() });
            if (!res.ok) throw new Error('Erreur chargement rendez-vous');
            const data = await res.json();
            setRendezvous(Array.isArray(data) ? data : (data.content || []));
        } catch (e) {
            setError(e.message);
        }
    };

    const handleSearch = async (term) => {
        setSearchTerm(term);
        if (!term.trim()) { fetchPatients(); return; }
        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE_URL}/search?q=${encodeURIComponent(term)}&page=0&size=20`,
                { headers: getHeaders() }
            );
            if (!res.ok) throw new Error((await res.text()) || 'Erreur recherche');
            const data = await res.json();
            const raw = Array.isArray(data) ? data : (data.content || []);
            setPatients(raw.map(fromApi));
            setTotalPages(Array.isArray(data) ? 1 : (data.totalPages || 1));
            setCurrentPage(0);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const formatBloodType = (v) => v || '';
    const formatDate = (s) => (s ? new Date(s).toLocaleDateString('fr-FR') : '');
    const calculateAge = (dob) => {
        if (!dob) return '';
        const d = new Date(dob);
        const t = new Date();
        let a = t.getFullYear() - d.getFullYear();
        const m = t.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
        return a;
    };

    const handleAddPatient = async () => {
        if (!newPatient.firstName || !newPatient.lastName || !newPatient.email || !newPatient.phoneNumber || !newPatient.cin) {
            setError('Veuillez remplir tous les champs obligatoires (y compris le CIN)'); return;
        }
        setLoading(true); setError(null);
        try {
            const payload = toApi(newPatient);
            const res = await fetch(API_BASE_URL, {
                method: 'POST', headers: getHeaders(), body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error((await res.text()) || `Erreur ${res.status}`);

            await res.json();
            setSuccess('Patient créé avec succès !');
            setNewPatient({
                firstName:'', lastName:'', cin:'', dateOfBirth:'', gender:'MALE',
                email:'', phoneNumber:'', address:'', bloodType:'O-',
                emergencyContact:'', allergies:'', medicalHistory:''
            });
            setActiveMenu('patients-list');
            await fetchPatients(); await fetchStatistics();
            setTimeout(() => setSuccess(null), 3000);
        } catch (e) {
            setError(e.message || 'Échec création');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPatient = async () => {
        if (!selectedPatient.firstName || !selectedPatient.lastName || !selectedPatient.email ||
            !selectedPatient.phoneNumber || !selectedPatient.cin) {
            setError('Veuillez remplir tous les champs obligatoires (y compris le CIN)'); return;
        }
        setLoading(true);
        try {
            const payload = toApi(selectedPatient);
            const res = await fetch(`${API_BASE_URL}/${selectedPatient.id}`, {
                method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error((await res.text()) || 'Erreur modification');

            setSuccess('Patient modifié avec succès !');
            setShowEditModal(false); setSelectedPatient(null);
            await fetchPatients(); await fetchStatistics();
            setTimeout(() => setSuccess(null), 3000);
        } catch (e) {
            setError(e.message);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePatient = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir désactiver ce patient ?')) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE', headers: getHeaders() });
            if (!res.ok) throw new Error((await res.text()) || 'Erreur désactivation');

            setSuccess('Patient désactivé avec succès !');
            await fetchPatients(); await fetchStatistics();
            setTimeout(() => setSuccess(null), 3000);
        } catch (e) {
            setError(e.message);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivatePatient = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/${id}/reactivate`, { method: 'PATCH', headers: getHeaders() });
            if (!res.ok) throw new Error((await res.text()) || 'Erreur réactivation');

            setSuccess('Patient réactivé avec succès !');
            await fetchPatients(); await fetchStatistics();
            setTimeout(() => setSuccess(null), 3000);
        } catch (e) {
            setError(e.message);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (p) => {
        setSelectedPatient(fromApi(p));
        setShowEditModal(true);
    };

    // ============ HANDLERS MÉDECINS ============

    const toMedecinApi = (m, isUpdate = false) => {
        const payload = {
            firstName: m.firstName?.trim() || null,
            lastName: m.lastName?.trim() || null,
            dateOfBirth: m.dateOfBirth ? m.dateOfBirth.split('T')[0] : null,
            gender: m.gender || null,
            phoneNumber: m.phoneNumber?.replace(/[\s-]/g, '').trim() || null,
            professionalEmail: m.professionalEmail?.trim() || null,
            registrationNumber: m.registrationNumber?.trim() || null,
            specialization: m.specialization?.trim() || null,
        };

        // N'inclure l'ID que pour les mises à jour
        if (isUpdate && m.id) {
            payload.id = m.id;
        }

        // Enlever les valeurs null pour la création (le backend les validera)
        return Object.fromEntries(
            Object.entries(payload).filter(([_, v]) => v !== null && v !== '')
        );
    };

    const handleAddMedecin = async () => {
        // Validation de tous les champs obligatoires
        if (!newMedecin.firstName || !newMedecin.lastName || !newMedecin.professionalEmail ||
            !newMedecin.phoneNumber || !newMedecin.specialization || !newMedecin.dateOfBirth ||
            !newMedecin.registrationNumber) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const payload = toMedecinApi(newMedecin);
            console.log('Payload envoyé:', payload);

            const res = await fetch(API_MEDECIN_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Erreur backend:', errorText);
                throw new Error(errorText || `Erreur ${res.status}`);
            }

            setSuccess('Médecin créé avec succès !');
            setNewMedecin({
                firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE',
                phoneNumber: '', professionalEmail: '', registrationNumber: '', specialization: ''
            });
            setActiveMenu('doctors-list');
            await fetchMedecins();
            setTimeout(() => setSuccess(null), 3000);
        } catch (e) {
            console.error('Erreur complète:', e);
            setError(e.message || 'Échec création médecin');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

const handleEditMedecin = async () => {
    // Validation de tous les champs obligatoires
    if (!selectedMedecin.firstName || !selectedMedecin.lastName ||
        !selectedMedecin.professionalEmail || !selectedMedecin.phoneNumber ||
        !selectedMedecin.specialization || !selectedMedecin.dateOfBirth ||
        !selectedMedecin.registrationNumber) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
    }

    // Validation du format du téléphone
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(selectedMedecin.phoneNumber)) {
        setError('Le numéro de téléphone doit contenir entre 10 et 15 chiffres');
        return;
    }

    setLoading(true);
    try {
        const payload = toMedecinApi(selectedMedecin);
        payload.id = selectedMedecin.id;
        console.log('Payload modification:', payload);

        const res = await fetch(`${API_MEDECIN_URL}/${selectedMedecin.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Erreur backend:', errorText);
            throw new Error(errorText || 'Erreur modification');
        }

        setSuccess('Médecin modifié avec succès !');
        setShowEditMedecinModal(false);
        setSelectedMedecin(null);
        await fetchMedecins();
        setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
        console.error('Erreur complète:', e);
        setError(e.message);
        setTimeout(() => setError(null), 5000);
    } finally {
        setLoading(false);
    }
};

const handleDeleteMedecin = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver ce médecin ?')) return;
    setLoading(true);
    try {
        const res = await fetch(`${API_MEDECIN_URL}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error((await res.text()) || 'Erreur désactivation');

        setSuccess('Médecin désactivé avec succès !');
        await fetchMedecins();
        setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
        setError(e.message);
        setTimeout(() => setError(null), 5000);
    } finally {
        setLoading(false);
    }
};

const handleReactivateMedecin = async (id) => {
    setLoading(true);
    try {
        const res = await fetch(`${API_MEDECIN_URL}/${id}/reactivate`, {
            method: 'PATCH',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error((await res.text()) || 'Erreur réactivation');

        setSuccess('Médecin réactivé avec succès !');
        await fetchMedecins();
        setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
        setError(e.message);
        setTimeout(() => setError(null), 5000);
    } finally {
        setLoading(false);
    }
};

const openEditMedecinModal = (m) => {
    setSelectedMedecin(m);
    setShowEditMedecinModal(true);
};

const handleAddFacture = async () => {
    if (!newFacture.patientId || !newFacture.medecinId || !newFacture.rendezVousId || !newFacture.amount) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const payload = {
            patientId: parseInt(newFacture.patientId),
            amount: parseFloat(newFacture.amount),
            description: newFacture.description,
            status: newFacture.status,
            paymentMode: newFacture.modePaiement
        };

        const res = await fetch(API_BILLING_URL, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error((await res.text()) || `Erreur ${res.status}`);

        setSuccess('Facture créée avec succès !');
        setNewFacture({
            patientId: '', medecinId: '', rendezVousId: '', amount: '', description: '',
            status: 'UNPAID', modePaiement: 'CASH'
        });
        setActiveMenu('invoices-list');
        setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
        setError(e.message || 'Échec création facture');
        setTimeout(() => setError(null), 5000);
    } finally {
        setLoading(false);
    }
};

const renderDashboard = () => (
    <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Patients</p>
                        <p className="text-4xl font-bold mt-2">{statistics?.totalPatients ?? patients.length}</p>
                        <div className="flex items-center mt-2 text-blue-100">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="text-sm">+12% ce mois</span>
                        </div>
                    </div>
                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <Users className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Patients Actifs</p>
                        <p className="text-4xl font-bold mt-2">{statistics?.activePatients ?? patients.filter(p => p.isActive).length}</p>
                        <div className="flex items-center mt-2 text-green-100">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">Statut vérifié</span>
                        </div>
                    </div>
                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <Heart className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">RDV Aujourd'hui</p>
                        <p className="text-4xl font-bold mt-2">28</p>
                        <div className="flex items-center mt-2 text-purple-100">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="text-sm">8 en attente</span>
                        </div>
                    </div>
                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <Calendar className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Revenus Mois</p>
                        <p className="text-4xl font-bold mt-2">84K</p>
                        <div className="flex items-center mt-2 text-orange-100">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="text-sm">+8% vs dernier</span>
                        </div>
                    </div>
                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <DollarSign className="w-8 h-8" />
                    </div>
                </div>
            </div>
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Activités Récentes</h3>
                    <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-4">
                    {[
                        { type: 'patient', name: 'Ahmed Benali', action: 'Nouveau patient enregistré', time: 'Il y a 5 min', icon: UserPlus, color: 'blue' },
                        { type: 'appointment', name: 'Dr. Alami', action: 'Rendez-vous confirmé avec Fatima Z.', time: 'Il y a 12 min', icon: Calendar, color: 'green' },
                        { type: 'billing', name: 'Facture #1247', action: 'Paiement reçu - 2,500 DH', time: 'Il y a 23 min', icon: DollarSign, color: 'orange' },
                        { type: 'patient', name: 'Mohamed Idrissi', action: 'Dossier médical mis à jour', time: 'Il y a 45 min', icon: FileText, color: 'purple' },
                        { type: 'appointment', name: 'Dr. Zahra', action: 'Consultation terminée - Aisha K.', time: 'Il y a 1h', icon: CheckCircle, color: 'green' },
                    ].map((activity, idx) => (
                        <div key={idx} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                            <div className={`p-3 rounded-full bg-${activity.color}-100`}>
                                <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{activity.name}</p>
                                <p className="text-sm text-gray-500">{activity.action}</p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Statistiques Rapides</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Nouveaux Patients</p>
                                    <p className="text-lg font-bold text-gray-800">{statistics?.newThisMonth ?? 12}</p>
                                </div>
                            </div>
                            <span className="text-green-600 text-sm font-semibold">+15%</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Stethoscope className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Médecins Actifs</p>
                                    <p className="text-lg font-bold text-gray-800">24</p>
                                </div>
                            </div>
                            <span className="text-green-600 text-sm font-semibold">+2</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">RDV Cette Semaine</p>
                                    <p className="text-lg font-bold text-gray-800">156</p>
                                </div>
                            </div>
                            <span className="text-red-600 text-sm font-semibold">-8%</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Factures en Attente</p>
                                    <p className="text-lg font-bold text-gray-800">8</p>
                                </div>
                            </div>
                            <span className="text-orange-600 text-sm font-semibold">!</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-lg font-bold mb-2">Accès Rapide</h3>
                    <p className="text-blue-100 text-sm mb-4">Gérez votre système en un clic</p>
                    <div className="space-y-2">
                        <button onClick={() => setActiveMenu('add-patient')} className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                            <UserPlus className="w-4 h-4" />
                            <span>Nouveau Patient</span>
                        </button>
                        <button onClick={() => setActiveMenu('add-appointment')} className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Nouveau RDV</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Recent Patients & Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Patients Récents</h3>
                    <button onClick={() => setActiveMenu('patients-list')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Voir tout →
                    </button>
                </div>
                <div className="space-y-3">
                    {patients.slice(0, 5).map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg hover:from-blue-100 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{p.firstName} {p.lastName}</p>
                                    <p className="text-xs text-gray-500">{p.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {formatDate(p.registrationDate)}
                                    </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Rendez-vous Aujourd'hui</h3>
                    <button onClick={() => setActiveMenu('appointments-list')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Voir tout →
                    </button>
                </div>
                <div className="space-y-3">
                    {[
                        { patient: 'Ahmed Benali', doctor: 'Dr. Alami', time: '09:00', type: 'Consultation', status: 'confirmed' },
                        { patient: 'Fatima Zahra', doctor: 'Dr. Idrissi', time: '10:30', type: 'Contrôle', status: 'confirmed' },
                        { patient: 'Mohamed Alami', doctor: 'Dr. Benani', time: '11:00', type: 'Urgence', status: 'waiting' },
                        { patient: 'Aisha Idrissi', doctor: 'Dr. Alami', time: '14:00', type: 'Suivi', status: 'confirmed' },
                        { patient: 'Youssef Tazi', doctor: 'Dr. Zahra', time: '16:00', type: 'Consultation', status: 'pending' },
                    ].map((apt, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-transparent rounded-lg hover:from-gray-100 transition-colors border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${apt.status === 'confirmed' ? 'bg-green-500' : apt.status === 'waiting' ? 'bg-orange-500' : 'bg-gray-400'}`} />
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{apt.patient}</p>
                                    <p className="text-xs text-gray-500">{apt.doctor} • {apt.type}</p>
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

const renderPatientsList = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Liste des Patients</h2>
                <button onClick={() => setActiveMenu('add-patient')}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center space-x-2 shadow-md transition-all">
                    <UserPlus className="w-4 h-4" />
                    <span className="font-medium">Ajouter Patient</span>
                </button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text" placeholder="Rechercher par nom, email, téléphone ou CIN..."
                    value={searchTerm} onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                    {['Patient', 'CIN', 'Contact', 'Âge', 'Genre', 'Groupe Sanguin', 'Statut', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {loading ? (
                    <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                            <p className="text-gray-500 mt-2">Chargement...</p>
                        </td>
                    </tr>
                ) : patients.map(p => (
                    <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                                    {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{p.firstName} {p.lastName}</p>
                                    <p className="text-sm text-gray-500">{p.address}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{p.cin || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                            <p className="text-gray-800">{p.email}</p>
                            <p className="text-sm text-gray-500">{p.phoneNumber}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">{calculateAge(p.dateOfBirth)} ans</td>
                        <td className="px-6 py-4">
                                <span className="text-gray-700">
                                    {p.gender === 'MALE' ? 'Homme' : p.gender === 'FEMALE' ? 'Femme' : 'Autre'}
                                </span>
                        </td>
                        <td className="px-6 py-4"><span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">{formatBloodType(p.bloodType)}</span></td>
                        <td className="px-6 py-4">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {p.isActive ? 'Actif' : 'Inactif'}
                                </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex space-x-2">
                                <button onClick={() => openEditModal(p)} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                                    <Edit className="w-5 h-5" />
                                </button>
                                {p.isActive ? (
                                    <button onClick={() => handleDeletePatient(p.id)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Désactiver">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button onClick={() => handleReactivatePatient(p.id)} className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors" title="Réactiver">
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

        {!loading && patients.length === 0 && (
            <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucun patient trouvé</p>
            </div>
        )}

        {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700">
                    Précédent
                </button>
                <span className="text-gray-600">Page {currentPage + 1} sur {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700">
                    Suivant
                </button>
            </div>
        )}
    </div>
);

const renderAddPatientForm = () => (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajouter un Nouveau Patient</h2>
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { label: 'Prénom *', key: 'firstName', type: 'text', placeholder: 'Ex: Ahmed' },
                    { label: 'Nom *', key: 'lastName', type: 'text', placeholder: 'Ex: Benali' },
                    { label: 'CIN *', key: 'cin', type: 'text', placeholder: 'Ex: AB123456' },
                    { label: 'Date de Naissance', key: 'dateOfBirth', type: 'date' },
                    { label: 'Email *', key: 'email', type: 'email', placeholder: 'patient@email.com' },
                    { label: 'Téléphone *', key: 'phoneNumber', type: 'tel', placeholder: '0612345678' },
                    { label: 'Adresse', key: 'address', type: 'text', placeholder: 'Ville, Pays' },
                    { label: "Contact d'Urgence", key: 'emergencyContact', type: 'tel', placeholder: '0612345678' },
                ].map(f => (
                    <div key={f.key}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                        <input
                            type={f.type}
                            value={newPatient[f.key]}
                            onChange={(e) => setNewPatient({ ...newPatient, [f.key]: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={f.placeholder}
                        />
                    </div>
                ))}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Genre</label>
                    <select
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="MALE">Homme</option>
                        <option value="FEMALE">Femme</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Groupe Sanguin</label>
                    <select
                        value={newPatient.bloodType}
                        onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {bloodTypes.map(t => (<option key={t} value={t}>{formatBloodType(t)}</option>))}
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
                    <textarea
                        value={newPatient.allergies}
                        onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Liste des allergies..." rows="3" maxLength="500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Historique Médical</label>
                    <textarea
                        value={newPatient.medicalHistory}
                        onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Antécédents médicaux..." rows="4" maxLength="1000"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                    onClick={() => {
                        setNewPatient({
                            firstName:'', lastName:'', cin:'', dateOfBirth:'', gender:'MALE',
                            email:'', phoneNumber:'', address:'', bloodType:'O-',
                            emergencyContact:'', allergies:'', medicalHistory:''
                        });
                        setActiveMenu('patients-list');
                    }}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                    Annuler
                </button>
                <button
                    onClick={handleAddPatient}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md disabled:opacity-50 flex items-center space-x-2">
                    {loading && <Loader className="w-4 h-4 animate-spin" />}
                    <span>Enregistrer</span>
                </button>
            </div>
        </div>
    </div>
);

// ============ RENDER MÉDECINS ============
const renderDoctorsList = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Liste des Médecins</h2>
                <button onClick={() => setActiveMenu('add-doctor')}
                        className="bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 flex items-center space-x-2 shadow-md transition-all">
                    <UserPlus className="w-4 h-4" />
                    <span className="font-medium">Ajouter Médecin</span>
                </button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text" placeholder="Rechercher par nom, email ou spécialité..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                    {['Médecin', 'Contact', 'Âge', 'Genre', 'Spécialité', 'Statut', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {loading ? (
                    <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                            <Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                            <p className="text-gray-500 mt-2">Chargement...</p>
                        </td>
                    </tr>
                ) : medecins.map(m => (
                    <tr key={m.id} className="hover:bg-purple-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                                    {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Dr. {m.firstName} {m.lastName}</p>
                                    <p className="text-sm text-gray-500">{m.registrationNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <p className="text-gray-800">{m.professionalEmail || m.email}</p>
                            <p className="text-sm text-gray-500">{m.phoneNumber || m.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">{calculateAge(m.dateOfBirth)} ans</td>
                        <td className="px-6 py-4">
                                <span className="text-gray-700">
                                    {m.gender === 'MALE' ? 'Homme' : m.gender === 'FEMALE' ? 'Femme' : 'Autre'}
                                </span>
                        </td>
                        <td className="px-6 py-4">
                                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {m.specialization || 'Non définie'}
                                </span>
                        </td>
                        <td className="px-6 py-4">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${(m.isActive ?? m.active) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {(m.isActive ?? m.active) ? 'Actif' : 'Inactif'}
                                </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex space-x-2">
                                <button onClick={() => openEditMedecinModal(m)} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                                    <Edit className="w-5 h-5" />
                                </button>
                                {(m.isActive ?? m.active) ? (
                                    <button onClick={() => handleDeleteMedecin(m.id)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Désactiver">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button onClick={() => handleReactivateMedecin(m.id)} className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors" title="Réactiver">
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

        {!loading && medecins.length === 0 && (
            <div className="p-12 text-center">
                <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucun médecin trouvé</p>
            </div>
        )}
    </div>
);

const renderAddDoctorForm = () => (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajouter un Nouveau Médecin</h2>
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { label: 'Prénom *', key: 'firstName', type: 'text', placeholder: 'Ex: Ahmed' },
                    { label: 'Nom *', key: 'lastName', type: 'text', placeholder: 'Ex: Benali' },
                    { label: 'Date de Naissance *', key: 'dateOfBirth', type: 'date' },
                    { label: 'Email Professionnel *', key: 'professionalEmail', type: 'email', placeholder: 'medecin@email.com' },
                    { label: 'Téléphone *', key: 'phoneNumber', type: 'tel', placeholder: '0612345678' },
                    { label: "Numéro d'Inscription *", key: 'registrationNumber', type: 'text', placeholder: 'Ex: 12345' },
                    { label: 'Spécialité *', key: 'specialization', type: 'text', placeholder: 'Ex: Cardiologie' },
                ].map(f => (
                    <div key={f.key}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                        <input
                            type={f.type}
                            value={newMedecin[f.key]}
                            onChange={(e) => setNewMedecin({ ...newMedecin, [f.key]: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder={f.placeholder}
                        />
                    </div>
                ))}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Genre</label>
                    <select
                        value={newMedecin.gender}
                        onChange={(e) => setNewMedecin({ ...newMedecin, gender: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        setNewMedecin({
                            firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE',
                            phoneNumber: '', professionalEmail: '', registrationNumber: '', specialization: ''
                        });
                        setActiveMenu('doctors-list');
                    }}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                    Annuler
                </button>
                <button
                    onClick={handleAddMedecin}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 shadow-md disabled:opacity-50 flex items-center space-x-2">
                    {loading && <Loader className="w-4 h-4 animate-spin" />}
                    <span>Enregistrer</span>
                </button>
            </div>
        </div>
    </div>
);

return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50">
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl transition-all duration-300 flex flex-col border-r border-gray-200`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {sidebarOpen && (
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MediConnect</span>
                    </div>
                )}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">A</div>
                    {sidebarOpen && (
                        <div>
                            <p className="font-semibold text-gray-800">Admin</p>
                            <p className="text-sm text-gray-500">admin@mediconnect.com</p>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map(item => (
                    <div key={item.id}>
                        {item.subItems ? (
                            <div>
                                <button
                                    onClick={() => toggleMenu(item.id)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-gray-600 hover:bg-blue-50"
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon className="w-5 h-5" />
                                        {sidebarOpen && <span className="font-medium">{item.label}</span>}
                                    </div>
                                    {sidebarOpen && (
                                        expandedMenus[item.id] ?
                                            <ChevronDown className="w-4 h-4" /> :
                                            <ChevronRight className="w-4 h-4" />
                                    )}
                                </button>
                                {sidebarOpen && expandedMenus[item.id] && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {item.subItems.map(subItem => (
                                            <button
                                                key={subItem.id}
                                                onClick={() => setActiveMenu(subItem.id)}
                                                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all text-sm ${
                                                    activeMenu === subItem.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50'
                                                }`}
                                            >
                                                <subItem.icon className="w-4 h-4" />
                                                <span>{subItem.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => setActiveMenu(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                    activeMenu === item.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </button>
                        )}
                    </div>
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
                        <h1 className="text-2xl font-bold text-gray-800">
                            {(() => {
                                for (const item of menuItems) {
                                    if (item.id === activeMenu) return item.label;
                                    if (item.subItems) {
                                        const subItem = item.subItems.find(si => si.id === activeMenu);
                                        if (subItem) return subItem.label;
                                    }
                                }
                                return 'Dashboard';
                            })()}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Bienvenue sur votre système de gestion hospitalière</p>
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
                {activeMenu === 'patients-list' && renderPatientsList()}
                {activeMenu === 'add-patient' && renderAddPatientForm()}

                {/* Médecins */}
                {activeMenu === 'doctors-list' && renderDoctorsList()}
                {activeMenu === 'add-doctor' && renderAddDoctorForm()}

                {/* Rendez-vous */}
                {activeMenu === 'appointments-list' && (
                    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800">Liste des Rendez-vous</h2>
                        <p className="text-gray-500 mt-2">Module en cours de développement...</p>
                    </div>
                )}
                {activeMenu === 'add-appointment' && (
                    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800">Nouveau Rendez-vous</h2>
                        <p className="text-gray-500 mt-2">Module en cours de développement...</p>
                    </div>
                )}

                {/* Facturation */}
                {activeMenu === 'invoices-list' && (
                    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
                        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800">Liste des Factures</h2>
                        <p className="text-gray-500 mt-2">Module en cours de développement...</p>
                    </div>
                )}
                {activeMenu === 'add-invoice' && (
                    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Créer une Nouvelle Facture</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Formulaire */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Patient */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <User className="w-4 h-4 inline mr-2" />
                                            Patient *
                                        </label>
                                        <select
                                            value={newFacture.patientId}
                                            onChange={(e) => setNewFacture({ ...newFacture, patientId: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Sélectionner un patient</option>
                                            {patients.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.firstName} {p.lastName} - {p.cin}
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
                                            value={newFacture.medecinId}
                                            onChange={(e) => setNewFacture({ ...newFacture, medecinId: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Sélectionner un médecin</option>
                                            {medecins.map(m => (
                                                <option key={m.id} value={m.id}>
                                                    Dr. {m.firstName} {m.lastName} - {m.specialization}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Rendez-vous */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-2" />
                                            Rendez-vous *
                                        </label>
                                        <select
                                            value={newFacture.rendezVousId}
                                            onChange={(e) => setNewFacture({ ...newFacture, rendezVousId: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Sélectionner un RDV</option>
                                            {rendezvous.map(r => (
                                                <option key={r.id} value={r.id}>
                                                    {formatDate(r.dateRendezVous)} - {r.motif}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Montant */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <DollarSign className="w-4 h-4 inline mr-2" />
                                            Montant (MAD) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={newFacture.amount}
                                            onChange={(e) => setNewFacture({ ...newFacture, amount: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ex: 500.00"
                                        />
                                    </div>

                                    {/* Mode de Paiement */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <DollarSign className="w-4 h-4 inline mr-2" />
                                            Mode de Paiement *
                                        </label>
                                        <select
                                            value={newFacture.modePaiement}
                                            onChange={(e) => setNewFacture({ ...newFacture, modePaiement: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="CASH">Espèces</option>
                                            <option value="CARD">Carte Bancaire</option>
                                            <option value="CHECK">Chèque</option>
                                            <option value="TRANSFER">Virement</option>
                                            <option value="INSURANCE">Assurance</option>
                                        </select>
                                    </div>

                                    {/* Statut */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <CheckCircle className="w-4 h-4 inline mr-2" />
                                            Statut *
                                        </label>
                                        <select
                                            value={newFacture.status}
                                            onChange={(e) => setNewFacture({ ...newFacture, status: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="UNPAID">Non Payée</option>
                                            <option value="PAID">Payée</option>
                                            <option value="PARTIALLY_PAID">Partiellement Payée</option>
                                            <option value="CANCELLED">Annulée</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        Description
                                    </label>
                                    <textarea
                                        value={newFacture.description}
                                        onChange={(e) => setNewFacture({ ...newFacture, description: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Détails de la consultation, actes médicaux..."
                                        rows="4"
                                        maxLength="500"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            setNewFacture({
                                                patientId: '', medecinId: '', rendezVousId: '', amount: '', description: '',
                                                status: 'UNPAID', modePaiement: 'CASH'
                                            });
                                            setActiveMenu('invoices-list');
                                        }}
                                        className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleAddFacture}
                                        disabled={loading}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md disabled:opacity-50 flex items-center space-x-2"
                                    >
                                        {loading && <Loader className="w-4 h-4 animate-spin" />}
                                        <span>Créer la Facture</span>
                                    </button>
                                </div>
                            </div>

                            {/* Prévisualisation */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 h-fit sticky top-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                    Aperçu de la Facture
                                </h3>

                                <div className="space-y-4">
                                    {/* Patient Info */}
                                    {newFacture.patientId && (
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Patient</p>
                                            <p className="font-semibold text-gray-800">
                                                {patients.find(p => p.id === parseInt(newFacture.patientId))?.firstName} {patients.find(p => p.id === parseInt(newFacture.patientId))?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {patients.find(p => p.id === parseInt(newFacture.patientId))?.email}
                                            </p>
                                        </div>
                                    )}

                                    {/* Medecin Info */}
                                    {newFacture.medecinId && (
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Médecin</p>
                                            <p className="font-semibold text-gray-800">
                                                Dr. {medecins.find(m => m.id === parseInt(newFacture.medecinId))?.firstName} {medecins.find(m => m.id === parseInt(newFacture.medecinId))?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {medecins.find(m => m.id === parseInt(newFacture.medecinId))?.specialization}
                                            </p>
                                        </div>
                                    )}

                                    {/* RDV Info */}
                                    {newFacture.rendezVousId && (
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Rendez-vous</p>
                                            <p className="font-semibold text-gray-800">
                                                {formatDate(rendezvous.find(r => r.id === parseInt(newFacture.rendezVousId))?.dateRendezVous)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {rendezvous.find(r => r.id === parseInt(newFacture.rendezVousId))?.motif}
                                            </p>
                                        </div>
                                    )}

                                    {/* Amount & Payment */}
                                    {newFacture.amount && (
                                        <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-blue-200">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Montant Total</p>
                                            <p className="text-3xl font-bold text-blue-600">
                                                {parseFloat(newFacture.amount).toFixed(2)} MAD
                                            </p>
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-sm text-gray-600">
                                                    Mode: <span className="font-semibold">
                                                            {newFacture.modePaiement === 'CASH' ? 'Espèces' :
                                                                newFacture.modePaiement === 'CARD' ? 'Carte' :
                                                                    newFacture.modePaiement === 'CHECK' ? 'Chèque' :
                                                                        newFacture.modePaiement === 'TRANSFER' ? 'Virement' : 'Assurance'}
                                                        </span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Statut: <span className={`font-semibold ${
                                                    newFacture.status === 'PAID' ? 'text-green-600' :
                                                        newFacture.status === 'PARTIALLY_PAID' ? 'text-orange-600' :
                                                            newFacture.status === 'CANCELLED' ? 'text-red-600' : 'text-gray-600'
                                                }`}>
                                                            {newFacture.status === 'PAID' ? 'Payée' :
                                                                newFacture.status === 'PARTIALLY_PAID' ? 'Partiellement Payée' :
                                                                    newFacture.status === 'CANCELLED' ? 'Annulée' : 'Non Payée'}
                                                        </span>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {(!newFacture.patientId || !newFacture.medecinId || !newFacture.rendezVousId || !newFacture.amount) && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                                            <p className="text-sm text-yellow-700">
                                                Remplissez le formulaire pour voir l'aperçu
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>

        {/* MODAL MODIFIER PATIENT */}
        {showEditModal && selectedPatient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Modifier Patient</h2>
                        <button
                            onClick={() => { setShowEditModal(false); setSelectedPatient(null); }}
                            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Prénom *', key: 'firstName', type: 'text' },
                                { label: 'Nom *', key: 'lastName', type: 'text' },
                                { label: 'CIN *', key: 'cin', type: 'text' },
                                { label: 'Date de Naissance', key: 'dateOfBirth', type: 'date' },
                                { label: 'Email *', key: 'email', type: 'email' },
                                { label: 'Téléphone *', key: 'phoneNumber', type: 'tel' },
                                { label: 'Adresse', key: 'address', type: 'text' },
                                { label: "Contact d'Urgence", key: 'emergencyContact', type: 'tel' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                                    <input
                                        type={f.type}
                                        value={
                                            f.key === 'dateOfBirth'
                                                ? (selectedPatient[f.key] ? selectedPatient[f.key].split('T')[0] : '')
                                                : (selectedPatient[f.key] ?? '')
                                        }
                                        onChange={(e) => setSelectedPatient({ ...selectedPatient, [f.key]: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Genre</label>
                                <select
                                    value={selectedPatient.gender}
                                    onChange={(e) => setSelectedPatient({ ...selectedPatient, gender: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="MALE">Homme</option>
                                    <option value="FEMALE">Femme</option>
                                    <option value="OTHER">Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Groupe Sanguin</label>
                                <select
                                    value={selectedPatient.bloodType}
                                    onChange={(e) => setSelectedPatient({ ...selectedPatient, bloodType: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {bloodTypes.map(t => (<option key={t} value={t}>{formatBloodType(t)}</option>))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
                                <textarea
                                    value={selectedPatient.allergies || ''}
                                    onChange={(e) => setSelectedPatient({ ...selectedPatient, allergies: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3" maxLength="500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Historique Médical</label>
                                <textarea
                                    value={selectedPatient.medicalHistory || ''}
                                    onChange={(e) => setSelectedPatient({ ...selectedPatient, medicalHistory: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="4" maxLength="1000"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => { setShowEditModal(false); setSelectedPatient(null); }}
                                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                Annuler
                            </button>
                            <button
                                onClick={handleEditPatient}
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 flex items-center space-x-2">
                                {loading && <Loader className="w-4 h-4 animate-spin" />}
                                <span>Enregistrer</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL MODIFIER MÉDECIN */}
        {showEditMedecinModal && selectedMedecin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Modifier Médecin</h2>
                        <button
                            onClick={() => { setShowEditMedecinModal(false); setSelectedMedecin(null); }}
                            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Prénom *', key: 'firstName', type: 'text' },
                                { label: 'Nom *', key: 'lastName', type: 'text' },
                                { label: 'Date de Naissance *', key: 'dateOfBirth', type: 'date' },
                                { label: 'Email Professionnel *', key: 'professionalEmail', type: 'email' },
                                { label: 'Téléphone *', key: 'phoneNumber', type: 'tel' },
                                { label: "Numéro d'Inscription *", key: 'registrationNumber', type: 'text' },
                                { label: 'Spécialité *', key: 'specialization', type: 'text' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                                    <input
                                        type={f.type}
                                        value={
                                            f.key === 'dateOfBirth'
                                                ? (selectedMedecin[f.key] ? selectedMedecin[f.key].split('T')[0] : '')
                                                : (selectedMedecin[f.key] ?? '')
                                        }
                                        onChange={(e) => setSelectedMedecin({ ...selectedMedecin, [f.key]: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Genre</label>
                                <select
                                    value={selectedMedecin.gender}
                                    onChange={(e) => setSelectedMedecin({ ...selectedMedecin, gender: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="MALE">Homme</option>
                                    <option value="FEMALE">Femme</option>
                                    <option value="OTHER">Autre</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => { setShowEditMedecinModal(false); setSelectedMedecin(null); }}
                                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                Annuler
                            </button>
                            <button
                                onClick={handleEditMedecin}
                                disabled={loading}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 shadow-md transition-all disabled:opacity-50 flex items-center space-x-2">
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
}
