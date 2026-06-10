import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Cadastro from "./pages/Cadastro.tsx";
import DashboardVoluntario from "./pages/DashboardVoluntario.tsx";
import CriarCurso from "./pages/CriarCurso.tsx";
import EditarCurso from "./pages/EditarCurso.tsx";
import Catalogo from "./pages/Catalogo.tsx";
import CursoDetalhes from "./pages/CursoDetalhes.tsx";
import MeusCursos from "./pages/MeusCursos.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route
              path="/dashboard-voluntario"
              element={
                <ProtectedRoute allow="volunteer">
                  <DashboardVoluntario />
                </ProtectedRoute>
              }
            />
            <Route
              path="/criar-curso"
              element={
                <ProtectedRoute allow="volunteer">
                  <CriarCurso />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editar-curso/:id"
              element={
                <ProtectedRoute allow="volunteer">
                  <EditarCurso />
                </ProtectedRoute>
              }
            />
            <Route
              path="/catalogo"
              element={
                <ProtectedRoute allow="aluno">
                  <Catalogo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meus-cursos"
              element={
                <ProtectedRoute allow="aluno">
                  <MeusCursos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/curso/:id"
              element={
                <ProtectedRoute>
                  <CursoDetalhes />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
