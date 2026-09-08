import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Briefing from "./routes/Briefing";
import Onboarding from "./routes/Onboarding";
import Hub from "./routes/Hub";
import Module1 from "./routes/Module1";
import Module2 from "./routes/Module2";
import Module2IntroFruit from "./routes/Module2IntroFruit";
import Reflection from "./routes/Reflection";
import Result from "./routes/Result";
import Dashboard from "./routes/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<Briefing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/module/1" element={<Module1 />} />
        <Route path="/module/2/intro" element={<Module2IntroFruit />} />
        <Route path="/module/2" element={<Module2 />} />
        <Route path="/reflection" element={<Reflection />} />
        <Route path="/result" element={<Result />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
