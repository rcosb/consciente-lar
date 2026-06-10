import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FadeIn from "@/components/FadeIn";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const p = await signIn(email, password);
      toast.success("Bem-vindo de volta!");
      navigate(p.user_type === "volunteer" ? "/dashboard-voluntario" : "/catalogo");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <FadeIn>
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-[var(--shadow-soft)] p-8">
          <h1 className="text-2xl font-bold text-[hsl(var(--primary-dark))]">Entrar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acesse sua conta no Portal ConscienteLar
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <p className="mt-6 text-sm text-center text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-primary font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
