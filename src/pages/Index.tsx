import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Settings, Heart, HandHeart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import FadeIn from "@/components/FadeIn";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile)
    return (
      <Navigate
        to={profile.user_type === "volunteer" ? "/dashboard-voluntario" : "/catalogo"}
        replace
      />
    );

  return (
    <div
      className="min-h-screen flex flex-col bg-fixed bg-center bg-cover bg-no-repeat"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1920")',
      }}
    >
      <div className="bg-background/85 backdrop-blur-sm flex flex-col min-h-screen">
        <AppHeader />

        {/* Hero */}
        <section className="py-20 md:py-28">
          <div className="container grid md:grid-cols-2 gap-10 items-center">
            <FadeIn>
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="text-4xl md:text-5xl font-bold leading-tight text-[hsl(var(--primary-dark))]"
              >
                Conhecimento especializado para transformar a jornada da adoção
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-6 text-lg text-muted-foreground"
              >
                O Portal ConscienteLar conecta profissionais voluntários a pais
                adotantes e instituições de acolhimento, oferecendo cursos gratuitos
                sobre os desafios reais de quem acolhe e adota.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <Button size="lg" asChild>
                  <Link to="/cadastro?tipo=voluntario">Quero ser Voluntário</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/cadastro?tipo=aluno">Quero Aprender</Link>
                </Button>
              </motion.div>
            </FadeIn>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
              className="hidden md:flex justify-center"
            >
              <div className="relative w-full max-w-md aspect-square rounded-3xl bg-card shadow-[var(--shadow-soft)] flex items-center justify-center">
                <div className="grid grid-cols-2 gap-6 p-10">
                  {[GraduationCap, Heart, Users, HandHeart].map((Icon, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.15, type: "spring", stiffness: 200 }}
                      className={`aspect-square rounded-2xl flex items-center justify-center ${i % 2 === 0 ? "bg-secondary" : "bg-primary"}`}
                    >
                      <Icon className={`h-12 w-12 ${i % 2 === 0 ? "text-primary" : "text-primary-foreground"}`} fill={i % 2 !== 0 ? "currentColor" : undefined} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="py-20 bg-background">
          <div className="container">
            <FadeIn>
              <h2 className="text-3xl font-bold text-center text-[hsl(var(--primary-dark))]">
                Como Funciona
              </h2>
            </FadeIn>
            <div className="mt-12 grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: GraduationCap,
                  title: "1. Profissionais se Voluntariam",
                  text: "Psicólogos, pedagogos, advogados e outros especialistas compartilham seu conhecimento criando cursos gratuitos.",
                },
                {
                  icon: Settings,
                  title: "2. A Plataforma Organiza",
                  text: "Os cursos são organizados por categorias como Pré-adoção, Pós-adoção e Acolhimento Institucional.",
                },
                {
                  icon: Heart,
                  title: "3. Famílias e Instituições Aprendem",
                  text: "Pais adotantes e profissionais de abrigos acessam os cursos gratuitamente e aplicam o conhecimento.",
                },
              ].map(({ icon: Icon, title, text }, i) => (
                <FadeIn key={title} delay={i}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-center p-6 rounded-xl border border-border shadow-[var(--shadow-card)] bg-card"
                  >
                    <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-secondary flex items-center justify-center">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-[hsl(var(--primary-dark))]">
                      {title}
                    </h3>
                    <p className="mt-2 text-muted-foreground">{text}</p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Para quem */}
        <section className="py-20 bg-secondary">
          <div className="container">
            <FadeIn>
              <h2 className="text-3xl font-bold text-center text-[hsl(var(--primary-dark))]">
                Feito Para
              </h2>
            </FadeIn>
            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <FadeIn delay={0}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-card rounded-2xl p-8 shadow-[var(--shadow-card)] h-full"
                >
                  <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center">
                    <HandHeart className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-[hsl(var(--primary-dark))]">
                    Você, Profissional
                  </h3>
                  <p className="mt-1 font-medium text-primary">Doe seu conhecimento</p>
                  <p className="mt-3 text-muted-foreground">
                    Transforme sua expertise em impacto social. Crie cursos e ajude a
                    capacitar quem está na linha de frente do acolhimento.
                  </p>
                  <Button className="mt-6" asChild>
                    <Link to="/cadastro?tipo=voluntario">Cadastrar como Voluntário</Link>
                  </Button>
                </motion.div>
              </FadeIn>
              <FadeIn delay={1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-card rounded-2xl p-8 shadow-[var(--shadow-card)] h-full"
                >
                  <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-[hsl(var(--primary-dark))]">
                    Você, Pai/Mãe ou Instituição
                  </h3>
                  <p className="mt-1 font-medium text-primary">Acesse conhecimento</p>
                  <p className="mt-3 text-muted-foreground">
                    Encontre cursos práticos sobre adaptação familiar, traumas, aspectos
                    jurídicos e muito mais.
                  </p>
                  <Button className="mt-6" variant="outline" asChild>
                    <Link to="/cadastro?tipo=aluno">Explorar Cursos</Link>
                  </Button>
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </section>

        <footer className="bg-[hsl(var(--primary-dark))] text-white py-8 mt-auto">
          <div className="container text-center text-sm">
            Portal ConscienteLar — Projeto Acadêmico 2026. Conectando conhecimento,
            transformando vidas.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;