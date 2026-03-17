import { Component, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import VisionApp from "./pages/VisionApp.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
          <h2>Something went wrong</h2>
          <p style={{ color: "#ef4444" }}>{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function SetupMessage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h2>Setup required</h2>
      <p>
        Open Lovable Project Settings → Environment Variables and add these 3 variables,
        then trigger a rebuild by making any small change to this file.
      </p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><strong>VITE_SUPABASE_URL</strong></li>
        <li><strong>VITE_SUPABASE_ANON_KEY</strong></li>
        <li><strong>VITE_HF_TOKEN</strong></li>
      </ul>
    </div>
  );
}

const App = () => {

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<VisionApp />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
