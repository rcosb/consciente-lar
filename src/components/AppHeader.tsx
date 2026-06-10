import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppHeader() {
  const { profile, signOut } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();

  const isVolunteer = profile?.user_type === "volunteer";
  const home = isVolunteer ? "/dashboard-voluntario" : profile ? "/catalogo" : "/";

  const links = !profile
    ? []
    : isVolunteer
      ? [
        { to: "/dashboard-voluntario", label: "Dashboard" },
        { to: "/criar-curso", label: "Criar Curso" },
      ]
      : [
        { to: "/catalogo", label: "Catálogo" },
        { to: "/meus-cursos", label: "Meus Cursos" },
      ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur shadow-[var(--shadow-card)]">
      <div className="container flex h-16 items-center justify-between">
        <Link to={home} className="flex items-center gap-2">
          <img src="/conscientelar.png" alt="ConscienteLar" className="h-400 w-40 rounded-lg" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${loc.pathname === l.to
                ? "bg-secondary text-[hsl(var(--primary-dark))]"
                : "text-muted-foreground hover:bg-secondary hover:text-[hsl(var(--primary-dark))]"
                }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {profile ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                signOut();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/cadastro">Cadastrar-se</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}