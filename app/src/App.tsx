import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

const Briefing = lazy(() => import("./routes/Briefing"));
const Onboarding = lazy(() => import("./routes/Onboarding"));
const Hub = lazy(() => import("./routes/Hub"));
const Module1 = lazy(() => import("./routes/Module1"));
const Module2 = lazy(() => import("./routes/Module2"));
const Module2IntroFruit = lazy(() => import("./routes/Module2IntroFruit"));
const Reflection = lazy(() => import("./routes/Reflection"));
const Result = lazy(() => import("./routes/Result"));
const Dashboard = lazy(() => import("./routes/Dashboard"));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <Suspense fallback={<LoadingScreen />}>
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
      </Suspense>
    </BrowserRouter>
  );
}
