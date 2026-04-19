import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { GlobalLocaleBar } from "@/components/GlobalLocaleBar";
import Landing from "./pages/Landing.tsx";
import Index from "./pages/Index.tsx";
import PosterTemplateQa from "./pages/PosterTemplateQa.tsx";
import NotFound from "./pages/NotFound.tsx";
import { Analytics } from "@vercel/analytics/react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LocaleProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GlobalLocaleBar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create" element={<Index />} />
            <Route path="/create/qa-posters" element={<PosterTemplateQa />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LocaleProvider>
    <Analytics />
  </QueryClientProvider>
);

export default App;
