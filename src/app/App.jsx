import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../contexts/AuthContext";
import { FavouritesProvider } from "../contexts/FavouritesContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { CheckoutProvider } from "../contexts/Checkoutcontext ";
import AppRoutes from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <FavouritesProvider>
              <CheckoutProvider>
                <Toaster position="top-right" />
                <AppRoutes />
              </CheckoutProvider>
            </FavouritesProvider>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}