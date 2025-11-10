package com.billing.enums;

public enum BillingStatus {
    PENDING("En attente"),
    PAID("Payé"),
    PARTIALLY_PAID("Partiellement payé"),
    OVERDUE("En retard"),
    CANCELLED("Annulé");

    private final String displayName;

    BillingStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static BillingStatus fromString(String status) {
        if (status == null) {
            return PENDING;
        }
        try {
            return BillingStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return PENDING;
        }
    }
}