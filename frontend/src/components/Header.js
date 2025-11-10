import React from "react";
import "../styles/Facture.css";

function Header() {
    return (
        <div className="header">
            <h1>Créer une Facture</h1>
            <div className="user-info">
                <span>Dr. Admin</span>
                <div className="user-avatar">DA</div>
            </div>
        </div>
    );
}

export default Header;
