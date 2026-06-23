import { createContext, useState } from "react";

export const CheckoutContext = createContext(null);

// Holds the order currently being placed (product + variant) so the
// Checkout page knows what to build the WhatsApp message for, and
// remembers the customer's last-entered address values for this visit
// so a second order doesn't require retyping everything.
// This is in-memory only (React state) — resets on page refresh, which
// is intentional and avoids any browser storage APIs.
export function CheckoutProvider({ children }) {
  const [pendingOrder, setPendingOrder] = useState(null); // { product, selectedVariant }
  const [savedAddressValues, setSavedAddressValues] = useState({}); // { [fieldId]: value }

  function startOrder(product, selectedVariant) {
    setPendingOrder({ product, selectedVariant });
  }

  function clearOrder() {
    setPendingOrder(null);
  }

  function saveAddressValues(values) {
    setSavedAddressValues(values);
  }

  return (
    <CheckoutContext.Provider
      value={{ pendingOrder, startOrder, clearOrder, savedAddressValues, saveAddressValues }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}