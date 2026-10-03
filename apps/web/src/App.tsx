import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreatePage from "./pages/CreatePage";
import PalacePage from "./pages/PalacePage";

const ArchitecturePage = lazy(() => import("./pages/ArchitecturePage"));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink text-sm text-slate-400">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/architecture"
          element={<ArchitecturePage />}
        />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/palace" element={<PalacePage />} />
      </Routes>
    </Suspense>
  );
}
