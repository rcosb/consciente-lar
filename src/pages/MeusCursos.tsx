import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Enrollment } from "@/utils/supabase";
import { myEnrollments } from "@/services/courses";

export default function MeusCursos() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (profile) myEnrollments(profile.id).then(setItems).catch(() => setItems([]));
  }, [profile]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 container py-10">
        <FadeIn>
          <h1 className="text-3xl font-bold text-[hsl(var(--primary-dark))]">
            Meus Cursos
          </h1>
        </FadeIn>
        {items.length === 0 ? (
          <div className="mt-8 border border-dashed border-border rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">
              Você ainda não se inscreveu em nenhum curso. Visite o catálogo!
            </p>
            <Button className="mt-4" asChild>
              <Link to="/catalogo">Ir ao Catálogo</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {items.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -2, transition: { type: "spring", stiffness: 300 } }}
                className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-[var(--shadow-card)]"
              >
                <div>
                  <span className="inline-block text-xs font-medium px-2 py-1 rounded-md bg-secondary text-[hsl(var(--primary-dark))]">
                    {e.course?.category}
                  </span>
                  <h3 className="mt-2 font-semibold text-[hsl(var(--primary-dark))]">
                    {e.course?.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inscrito em{" "}
                    {new Date(e.enrolled_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link to={`/curso/${e.course_id}`}>Ver Curso</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
