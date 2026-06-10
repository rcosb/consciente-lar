import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import FadeIn from "@/components/FadeIn";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Category } from "@/utils/supabase";
import { getCourse, updateCourse } from "@/services/courses";

const CATEGORIES: Category[] = [
  "Pré-adoção",
  "Pós-adoção",
  "Acolhimento Institucional",
  "Aspectos Jurídicos",
];

export default function EditarCurso() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const courseId = Number(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [videoUrl, setVideoUrl] = useState("");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(courseId)) {
      toast.error("Curso inválido.");
      navigate("/dashboard-voluntario");
      return;
    }
    getCourse(courseId)
      .then((c) => {
        if (!c) {
          toast.error("Curso não encontrado.");
          navigate("/dashboard-voluntario");
          return;
        }
        if (c.volunteer_id !== profile?.id) {
          toast.error("Você não tem permissão para editar este curso.");
          navigate("/dashboard-voluntario");
          return;
        }
        setTitle(c.title);
        setDescription(c.description);
        setCategory(c.category);
        setVideoUrl(c.video_url);
        setExtra(c.extra_material || "");
      })
      .catch(() => toast.error("Erro ao carregar curso."))
      .finally(() => setFetching(false));
  }, [courseId, profile?.id, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!category) return toast.error("Selecione uma categoria.");
    setLoading(true);
    try {
      await updateCourse(courseId, {
        title,
        description,
        category,
        video_url: videoUrl,
        extra_material: extra || null,
      });
      toast.success("Curso atualizado com sucesso!");
      navigate("/dashboard-voluntario");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 container py-10 max-w-2xl text-center">
          <p className="text-muted-foreground">Carregando curso...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 container py-10 max-w-2xl">
        <FadeIn>
          <h1 className="text-3xl font-bold text-[hsl(var(--primary-dark))]">
            Editar Curso
          </h1>
          <p className="text-muted-foreground mt-1">
            Atualize as informações do seu curso.
          </p>

          <form
            onSubmit={submit}
            className="mt-8 bg-card border border-border rounded-2xl p-6 space-y-5 shadow-[var(--shadow-card)]"
          >
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="desc">Descrição</Label>
            <Textarea
              id="desc"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="video">URL do Vídeo</Label>
            <Input
              id="video"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>
          <div>
            <Label htmlFor="extra">Material Complementar (opcional)</Label>
            <Textarea
              id="extra"
              rows={3}
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="Links, referências e materiais adicionais"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/dashboard-voluntario")}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
          </form>
        </FadeIn>
      </main>
    </div>
  );
}
