import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "./pages/Index";
import Header from "./components/Header";

const App = () => (
  <div className="min-h-screen bg-background">
    <Toaster />
    <Sonner />
    <Header />
    <Index />
  </div>
);

export default App;
