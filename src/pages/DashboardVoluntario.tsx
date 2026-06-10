import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, BookOpen, Pencil, Trash2 } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Course } from "@/utils/supabase";
import { myCourses, deleteCourse } from "@/services/courses";
import { toast } from "sonner";

export default function DashboardVoluntario() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => {
    if (profile) myCourses(profile.id).then(setCourses).catch(() => setCourses([]));
  };

  useEffect(() => {
    load();
  }, [profile]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCourse(deleteId);
      toast.success("Curso excluído com sucesso.");
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 container py-10">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[hsl(var(--primary-dark))]">
                Olá, {profile?.full_name}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie e crie cursos para a comunidade.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link to="/criar-curso">
                <Plus className="h-5 w-5 mr-2" /> Criar Novo Curso
              </Link>
            </Button>
          </div>
        </FadeIn>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[hsl(var(--primary-dark))]">
            Meus Cursos
          </h2>
          {courses.length === 0 ? (
            <div className="mt-6 border border-dashed border-border rounded-2xl p-12 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">
                Você ainda não publicou nenhum curso.
              </p>
              <Button className="mt-4" asChild>
                <Link to="/criar-curso">Criar primeiro curso</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
                  className="bg-card border border-border rounded-xl p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block text-xs font-medium px-2 py-1 rounded-md bg-secondary text-[hsl(var(--primary-dark))]">
                      {c.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/editar-curso/${c.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(c.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Link to={`/curso/${c.id}`}>
                    <h3 className="mt-3 font-semibold text-[hsl(var(--primary-dark))]">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Publicado em{" "}
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir curso</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
