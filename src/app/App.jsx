import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../contexts/AuthContext";
import { FavouritesProvider } from "../contexts/FavouritesContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import AppRoutes from "./Routes";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <FavouritesProvider>
            <Toaster position="top-right" />
            <AppRoutes />
          </FavouritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
