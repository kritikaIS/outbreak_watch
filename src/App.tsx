import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ClinicalDashboard from "./pages/ClinicalDashboard";
import Trends from "./pages/Trends";
import HealthcarePortal from "./pages/HealthcarePortal";
import PublicAuth from "./pages/PublicAuth";
import PublicDashboard from "./pages/PublicDashboard";
import Header from "./components/Header";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('jwt') : null;
  if (!token) return <Navigate to="/" replace />;
  return children;
};

const App = () => (
  <BrowserRouter>
    <div className="min-h-screen bg-background">
      <Toaster />
      <Sonner />
      <Header />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/public-auth" element={<PublicAuth />} />
        <Route path="/public" element={<PublicDashboard />} />
        <Route path="/dashboard" element={
          <RequireAuth>
            <ClinicalDashboard />
          </RequireAuth>
        } />
        <Route path="/portal" element={
          <RequireAuth>
            <HealthcarePortal />
          </RequireAuth>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  </BrowserRouter>
);

export default App;
