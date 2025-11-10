// src/components/ItemsTable.js
import React, { useState, useEffect } from "react";

function ItemsTable({ onTotalChange }) {
    const [rows, setRows] = useState([
        { service: "", description: "", qty: 1, price: 0 },
    ]);

    const handleChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const addRow = () => setRows([...rows, { service: "", description: "", qty: 1, price: 0 }]);
    const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));

    useEffect(() => {
        const total = rows.reduce((sum, r) => sum + r.qty * r.price, 0);
        onTotalChange(total);
    }, [rows, onTotalChange]);

    return (
        <div>
            <table className="items-table">
                <thead>
                <tr>
                    <th>Service</th>
                    <th>Description</th>
                    <th>Quantité</th>
                    <th>Prix Unit. (MAD)</th>
                    <th>Total</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r, i) => (
                    <tr key={i}>
                        <td><input value={r.service} onChange={(e) => handleChange(i, "service", e.target.value)} /></td>
                        <td><input value={r.description} onChange={(e) => handleChange(i, "description", e.target.value)} /></td>
                        <td><input type="number" min="1" value={r.qty} onChange={(e) => handleChange(i, "qty", +e.target.value)} /></td>
                        <td><input type="number" min="0" step="0.01" value={r.price} onChange={(e) => handleChange(i, "price", +e.target.value)} /></td>
                        <td style={{ fontWeight: 600, color: "#3949ab" }}>{(r.qty * r.price).toFixed(2)}</td>
                        <td><button className="btn-remove" onClick={() => removeRow(i)}>×</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button className="btn-add" onClick={addRow}>+ Ajouter une ligne</button>
        </div>
    );
}

export default ItemsTable;
