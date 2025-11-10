import React from "react";
import "../styles/Facture.css";

function Sidebar() {
    const menu = [
        { icon: "📊", label: "Dashboard" },
        { icon: "👥", label: "Patients" },
        { icon: "📄", label: "Factures", active: true },
        { icon: "💳", label: "Paiements" },
        { icon: "📅", label: "Rendez-vous" },
        { icon: "📈", label: "Rapports" },
        { icon: "⚙️", label: "Paramètres" },
    ];

    return (
        <div className="sidebar">
            <div className="logo">
                <h2>🏥 MediCare</h2>
            </div>
            {menu.map((item) => (
                <div
                    key={item.label}
                    className={`menu-item ${item.active ? "active" : ""}`}
                >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    );
}

export default Sidebar;
