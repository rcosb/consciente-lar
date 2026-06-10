import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { createCourse } from "@/services/courses";

const CATEGORIES: Category[] = [
  "Pré-adoção",
  "Pós-adoção",
  "Acolhimento Institucional",
  "Aspectos Jurídicos",
];

export default function CriarCurso() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [videoUrl, setVideoUrl] = useState("");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!category) return toast.error("Selecione uma categoria.");
    setLoading(true);
    try {
      await createCourse({
        volunteer_id: profile!.id,
        title,
        description,
        category,
        video_url: videoUrl,
        extra_material: extra || null,
      });
      toast.success("Curso publicado com sucesso!");
      navigate("/dashboard-voluntario");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 container py-10 max-w-2xl">
        <FadeIn>
          <h1 className="text-3xl font-bold text-[hsl(var(--primary-dark))]">
            Criar Novo Curso
          </h1>
          <p className="text-muted-foreground mt-1">
            Compartilhe seu conhecimento com a comunidade.
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
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Publicando..." : "Publicar Curso"}
          </Button>
          </form>
        </FadeIn>
      </main>
    </div>
  );
}
