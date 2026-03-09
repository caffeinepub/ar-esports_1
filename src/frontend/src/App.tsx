import { Toaster } from "@/components/ui/sonner";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AdminPage } from "./pages/AdminPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { RegisterPage } from "./pages/RegisterPage";

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-background font-body">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register/:tournamentId" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </div>
    </HashRouter>
  );
}
