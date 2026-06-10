import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GraduationCap, HandHeart } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { isValidCnpj, isValidCpf, maskCnpj, maskCpf } from "@/lib/masks";

type Mode = null | "volunteer" | "aluno";
type AlunoSub = null | "instituicao" | "familia";

export default function Cadastro() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(null);
  const [alunoSub, setAlunoSub] = useState<AlunoSub>(null);

  useEffect(() => {
    const t = params.get("tipo");
    if (t === "voluntario") setMode("volunteer");
    else if (t === "aluno") setMode("aluno");
  }, [params]);

  // Shared fields
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [instName, setInstName] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateCpf = () => {
    if (cpf && !isValidCpf(cpf))
      setErrors((e) => ({ ...e, cpf: "CPF inválido. Use o formato XXX.XXX.XXX-XX" }));
    else setErrors(({ cpf: _, ...rest }) => rest);
  };
  const validateCnpj = () => {
    if (cnpj && !isValidCnpj(cnpj))
      setErrors((e) => ({
        ...e,
        cnpj: "CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX",
      }));
    else setErrors(({ cnpj: _, ...rest }) => rest);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidCpf(cpf)) return toast.error("CPF inválido.");
    if (password.length < 6) return toast.error("Senha deve ter no mínimo 6 caracteres.");
    if (mode === "aluno" && alunoSub === "instituicao" && !isValidCnpj(cnpj))
      return toast.error("CNPJ inválido.");

    setLoading(true);
    try {
      const p = await signUp({
        email,
        password,
        full_name: fullName,
        cpf,
        user_type: mode === "volunteer" ? "volunteer" : "aluno",
        specialty: mode === "volunteer" ? specialty : undefined,
        institution:
          mode === "aluno" && alunoSub === "instituicao"
            ? { cnpj, nome_fantasia: instName }
            : undefined,
      });
      toast.success("Cadastro realizado com sucesso!");
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
      <div className="flex-1 py-12 px-4">
        <div className="container max-w-3xl">
          {!mode && (
            <FadeIn>
              <h1 className="text-3xl font-bold text-center text-[hsl(var(--primary-dark))]">
                Como você quer participar?
              </h1>
              <div className="mt-10 grid md:grid-cols-2 gap-6">
                <motion.button
                  whileHover={{ y: -4 }}
                  onClick={() => setMode("volunteer")}
                  className="text-left bg-card border border-border rounded-2xl p-8 hover:border-primary hover:shadow-[var(--shadow-soft)] transition-colors"
                >
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                    <HandHeart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[hsl(var(--primary-dark))]">
                    Sou Voluntário
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Quero doar meu conhecimento criando cursos gratuitos.
                  </p>
                </motion.button>
                <motion.button
                  whileHover={{ y: -4 }}
                  onClick={() => setMode("aluno")}
                  className="text-left bg-card border border-border rounded-2xl p-8 hover:border-primary hover:shadow-[var(--shadow-soft)] transition-colors"
                >
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[hsl(var(--primary-dark))]">
                    Sou Aluno
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Sou pai/mãe adotante ou trabalho em uma instituição de
                    acolhimento.
                  </p>
                </motion.button>
              </div>
            </FadeIn>
          )}

          {mode === "aluno" && !alunoSub && (
            <div className="bg-background border border-border rounded-2xl p-8">
              <button
                onClick={() => setMode(null)}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ← Voltar
              </button>
              <h2 className="mt-4 text-2xl font-bold text-[hsl(var(--primary-dark))]">
                Você está vinculado a uma instituição de acolhimento?
              </h2>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setAlunoSub("instituicao")}
                >
                  Sim — Trabalho em uma instituição
                </Button>
                <Button size="lg" onClick={() => setAlunoSub("familia")}>
                  Não — Sou pai/mãe adotante
                </Button>
              </div>
            </div>
          )}

          {(mode === "volunteer" || (mode === "aluno" && alunoSub)) && (
            <FadeIn>
              <div className="bg-card border border-border rounded-2xl p-8 shadow-[var(--shadow-card)]">
              <button
                onClick={() => {
                  if (mode === "aluno" && alunoSub) setAlunoSub(null);
                  else setMode(null);
                }}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ← Voltar
              </button>
              <h2 className="mt-4 text-2xl font-bold text-[hsl(var(--primary-dark))]">
                {mode === "volunteer"
                  ? "Cadastro de Voluntário"
                  : alunoSub === "instituicao"
                    ? "Cadastro - Funcionário de Instituição"
                    : "Cadastro - Pai/Mãe Adotante"}
              </h2>

              <form onSubmit={submit} className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    required
                    value={cpf}
                    onChange={(e) => setCpf(maskCpf(e.target.value))}
                    onBlur={validateCpf}
                    placeholder="XXX.XXX.XXX-XX"
                  />
                  {errors.cpf && (
                    <p className="text-xs text-destructive mt-1">{errors.cpf}</p>
                  )}
                </div>

                {mode === "volunteer" && (
                  <div>
                    <Label htmlFor="specialty">Especialidade/Profissão</Label>
                    <Input
                      id="specialty"
                      required
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="Ex: Psicólogo, Pedagogo, Advogado de Família"
                    />
                  </div>
                )}

                {mode === "aluno" && alunoSub === "instituicao" && (
                  <>
                    <div>
                      <Label htmlFor="cnpj">CNPJ da Instituição</Label>
                      <Input
                        id="cnpj"
                        required
                        value={cnpj}
                        onChange={(e) => setCnpj(maskCnpj(e.target.value))}
                        onBlur={validateCnpj}
                        placeholder="XX.XXX.XXX/XXXX-XX"
                      />
                      {errors.cnpj && (
                        <p className="text-xs text-destructive mt-1">{errors.cnpj}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="instName">Nome da Instituição</Label>
                      <Input
                        id="instName"
                        required
                        value={instName}
                        onChange={(e) => setInstName(e.target.value)}
                      />
                    </div>
                  </>
                )}

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
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading
                      ? "Cadastrando..."
                      : mode === "volunteer"
                        ? "Cadastrar como Voluntário"
                        : "Criar Conta"}
                  </Button>
                </div>
              </form>
              </div>
            </FadeIn>
          )}

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
