package com.billing.enums;

public enum PaymentMode {
    CASH("Espèces"),
    CREDIT_CARD("Carte de crédit"),
    DEBIT_CARD("Carte de débit"),
    BANK_TRANSFER("Virement bancaire"),
    CHEQUE("Chèque"),
    MOBILE_PAYMENT("Paiement mobile"),
    INSURANCE("Assurance");

    private final String displayName;

    PaymentMode(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}