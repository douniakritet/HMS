import React, { useState, useEffect } from "react";
import "../styles/Facture.css";

export default function CreateFacturePage() {
    const [items, setItems] = useState([
        { service: "Consultation", description: "", qty: 1, price: 0 },
    ]);
    const [addPayment, setAddPayment] = useState(false);

    const [form, setForm] = useState({
        patientId: "",
        nom: "",
        prenom: "",
        telephone: "",
        medecin: "",
        specialite: "",
        dateRdv: "",
        typeService: "",
        factureId: "",
        dateFacture: new Date().toISOString().split("T")[0],
        statut: "",
        datePaiement: "",
        montantPaye: "",
        modePaiement: "",
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setForm({ ...form, [id]: value });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { service: "", description: "", qty: 1, price: 0 }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const calculateTotal = () =>
        items.reduce((acc, item) => acc + item.qty * item.price, 0);

    const handlePreview = () => {
        if (!form.nom || !form.prenom || !form.medecin || !form.factureId || !form.statut) {
            alert("⚠️ Veuillez remplir tous les champs obligatoires (*)");
            return;
        }

        const services = items
            .filter((i) => i.service)
            .map(
                (i) => `• ${i.service}: ${i.qty} × ${i.price} MAD = ${(i.qty * i.price).toFixed(2)} MAD`
            )
            .join("\n");

        if (!services) {
            alert("⚠️ Veuillez ajouter au moins un service");
            return;
        }

        alert(
            `📄 APERÇU DE LA FACTURE\n\n👤 PATIENT\n${form.prenom} ${form.nom}\n\n👨‍⚕️ MÉDECIN\n${form.medecin}\n\n══════════════════\nFacture N°: ${form.factureId}\nStatut: ${form.statut}\n══════════════════\nSERVICES:\n${services}\n══════════════════\nTOTAL: ${calculateTotal().toFixed(2)} MAD`
        );
    };

    const handleSave = () => {
        if (!form.nom || !form.prenom || !form.medecin || !form.factureId || !form.statut) {
            alert("⚠️ Veuillez remplir tous les champs obligatoires (*)");
            return;
        }

        if (addPayment && (!form.modePaiement || !form.montantPaye || !form.datePaiement)) {
            alert("⚠️ Veuillez remplir tous les champs de paiement");
            return;
        }

        const hasService = items.some((i) => i.service);
        if (!hasService) {
            alert("⚠️ Veuillez ajouter au moins un service");
            return;
        }

        alert(
            `✅ Facture enregistrée avec succès!\n\nPatient: ${form.prenom} ${form.nom}\nMédecin: ${form.medecin}\nFacture N°: ${form.factureId}\nTotal: ${calculateTotal().toFixed(2)} MAD`
        );
    };

    const resetForm = () => {
        if (window.confirm("⚠️ Voulez-vous réinitialiser le formulaire ?")) {
            window.location.reload();
        }
    };

    return (
        <div className="page-wrapper">

            <div className="main-content">

                {/* === Information Patient === */}
                <div className="form-container">
                    <div className="section-header">
                        <div className="section-number">1</div>
                        <h2 className="section-title">Information Patient</h2>
                    </div>
                    <div className="form-grid">
                        {[
                            ["patientId", "ID Patient", "P-001", true],
                            ["nom", "Nom", "Nom du patient", true],
                            ["prenom", "Prénom", "Prénom du patient", true],
                            ["telephone", "Téléphone", "+212 600 000 000", false],
                        ].map(([id, label, placeholder, required]) => (
                            <div key={id} className="form-group">
                                <label>
                                    {label} {required && <span>*</span>}
                                </label>
                                <input
                                    type="text"
                                    id={id}
                                    placeholder={placeholder}
                                    value={form[id]}
                                    onChange={handleChange}
                                    required={required}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* === Information Médecin === */}
                <div className="form-container">
                    <div className="section-header">
                        <div className="section-number">2</div>
                        <h2 className="section-title">Information Médecin</h2>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>
                                Nom du Médecin <span>*</span>
                            </label>
                            <input
                                type="text"
                                id="medecin"
                                placeholder="Dr. Nom Prénom"
                                value={form.medecin}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Spécialité</label>
                            <select id="specialite" value={form.specialite} onChange={handleChange}>
                                <option value="">Sélectionner une spécialité</option>
                                {[
                                    "Médecine générale",
                                    "Cardiologie",
                                    "Dermatologie",
                                    "Pédiatrie",
                                    "Gynécologie",
                                    "Neurologie",
                                    "Orthopédie",
                                    "Ophtalmologie",
                                ].map((sp) => (
                                    <option key={sp} value={sp}>
                                        {sp}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Date du Rendez-vous</label>
                            <input
                                type="date"
                                id="dateRdv"
                                value={form.dateRdv}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Type de Service</label>
                            <input
                                type="text"
                                id="typeService"
                                placeholder="Consultation, Examen, etc."
                                value={form.typeService}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* === Détails de la Facture === */}
                <div className="form-container">
                    <div className="section-header">
                        <div className="section-number">3</div>
                        <h2 className="section-title">Détails de la Facture</h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>
                                Numéro de Facture <span>*</span>
                            </label>
                            <input
                                type="text"
                                id="factureId"
                                placeholder="F-2025-001"
                                value={form.factureId}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Date de Facture <span>*</span></label>
                            <input
                                type="date"
                                id="dateFacture"
                                value={form.dateFacture}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Statut <span>*</span></label>
                            <select id="statut" value={form.statut} onChange={handleChange} required>
                                <option value="">Sélectionner un statut</option>
                                <option value="En attente">En attente</option>
                                <option value="Payée">Payée</option>
                                <option value="Annulée">Annulée</option>
                            </select>
                        </div>
                    </div>

                    {/* === Tableau des services === */}
                    <h3 className="table-title">Services / Articles</h3>
                    <table className="items-table">
                        <thead>
                        <tr>
                            <th>Service</th>
                            <th>Description</th>
                            <th>Quantité</th>
                            <th>Prix Unit. (MAD)</th>
                            <th>Total (MAD)</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((item, i) => (
                            <tr key={i}>
                                <td>
                                    <input
                                        type="text"
                                        value={item.service}
                                        onChange={(e) => handleItemChange(i, "service", e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) =>
                                            handleItemChange(i, "description", e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.qty}
                                        min="1"
                                        onChange={(e) =>
                                            handleItemChange(i, "qty", parseFloat(e.target.value))
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.price}
                                        min="0"
                                        step="0.01"
                                        onChange={(e) =>
                                            handleItemChange(i, "price", parseFloat(e.target.value))
                                        }
                                    />
                                </td>
                                <td className="item-total">
                                    {(item.qty * item.price).toFixed(2)}
                                </td>
                                <td>
                                    <button className="btn-remove" onClick={() => removeItem(i)}>
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <button className="btn-add" onClick={addItem}>
                        + Ajouter une ligne
                    </button>

                    <div className="total-section">
                        <div className="label">Montant Total:</div>
                        <div className="amount">{calculateTotal().toFixed(2)} MAD</div>
                    </div>

                    {/* === Paiement optionnel === */}
                    <div style={{ marginTop: 25 }}>
                        <h3 style={{ color: "#3949ab", fontSize: 16, marginBottom: 15 }}>
                            Paiement (optionnel)
                        </h3>
                        <div className="payment-toggle">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={addPayment}
                                    onChange={() => setAddPayment(!addPayment)}
                                />
                                <span>Enregistrer un paiement pour cette facture</span>
                            </label>
                        </div>

                        {addPayment && (
                            <div id="paymentFields">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Date de Paiement <span>*</span></label>
                                        <input
                                            type="date"
                                            id="datePaiement"
                                            value={form.datePaiement}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Montant Payé (MAD) <span>*</span></label>
                                        <input
                                            type="number"
                                            id="montantPaye"
                                            value={form.montantPaye}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mode de Paiement <span>*</span></label>
                                        <select
                                            id="modePaiement"
                                            value={form.modePaiement}
                                            onChange={handleChange}
                                        >
                                            <option value="">Sélectionner un mode</option>
                                            <option value="Espèces">💵 Espèces</option>
                                            <option value="Carte bancaire">💳 Carte bancaire</option>
                                            <option value="Chèque">📝 Chèque</option>
                                            <option value="Virement">🏦 Virement bancaire</option>
                                            <option value="Mobile Money">📱 Mobile Money</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="action-buttons">
                    <button className="btn btn-cancel" onClick={resetForm}>
                        Annuler
                    </button>
                    <button className="btn btn-preview" onClick={handlePreview}>
                        Aperçu
                    </button>
                    <button className="btn btn-save" onClick={handleSave}>
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
}
