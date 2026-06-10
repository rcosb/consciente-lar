import { FormEvent, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Flag, MessageSquare } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getVolunteerEmail } from "@/services/courses";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import StarRating from "@/components/StarRating";
import { useAuth } from "@/contexts/AuthContext";
import { Course, Comment } from "@/utils/supabase";
import {
  addComment,
  enroll,
  getCourse,
  getRatings,
  isEnrolled,
  listComments,
  rateCourse,
  reportCourse,
} from "@/services/courses";



function toEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v"))
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    return url;
  } catch {
    return url;
  }
}

export default function CursoDetalhes() {
  const { id } = useParams();
  const { profile } = useAuth();
  const courseId = Number(id);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [volunteerEmail, setVolunteerEmail] = useState<string | null>(null);
  const [rating, setRating] = useState<{ avg: number; count: number; 
    mine?: number }>({
    avg: 0,
    count: 0,
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
useEffect(() => {
  console.log("courseId:", courseId, "isFinite:", Number.isFinite(courseId));
  if (!Number.isFinite(courseId)) return;
  refresh();
}, [courseId, profile?.id]);
  const refresh = async () => {
  try {
    const c = await getCourse(courseId);
    console.log("curso:", c);
    setCourse(c);
    if (c) {
      const email = await getVolunteerEmail(c.volunteer_id);
      setVolunteerEmail(email);
    }
    if (profile) setEnrolled(await isEnrolled(profile.id, courseId));
    setRating(await getRatings(courseId));
    setComments(await listComments(courseId));
  } catch (err) {
    console.error("erro no refresh:", err);
  }
};
  useEffect(() => {
    if (!Number.isFinite(courseId)) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, profile?.id]);

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 container py-12 text-center">
          <p className="text-muted-foreground">Carregando curso...</p>
          <Button className="mt-4" asChild>
            <Link to="/catalogo">voltar ao catálogo</Link>
          </Button>
        </main>
      </div>
    );
  }

  const isOwner = profile?.user_type === "volunteer" && profile.id === course.volunteer_id;
  const isAluno = profile?.user_type === "aluno";

  const handleEnroll = async () => {
    try {
      await enroll(profile!.id, course.id);
      setEnrolled(true);
      toast.success("Inscrição realizada com sucesso!");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleRate = async (stars: number) => {
    try {
      await rateCourse(profile!.id, course.id, stars);
      toast.success("Avaliação enviada!");
      setRating(await getRatings(course.id));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addComment(profile!.id, course.id, newComment.trim());
      setNewComment("");
      setComments(await listComments(course.id));
      toast.success("Comentário publicado!");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return toast.error("Descreva o motivo do reporte.");
    try {
      await reportCourse(profile!.id, course.id, reportReason.trim());
      toast.success("Reporte enviado. Obrigado!");
      setReportReason("");
      setReportOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const materials = (course.extra_material || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 container py-10 max-w-4xl">
        <FadeIn>
          <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-md bg-secondary text-[hsl(var(--primary-dark))]">
              {course.category}
            </span>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-[hsl(var(--primary-dark))]">
              {course.title}
            </h1>
            <div className="mt-3 text-sm text-muted-foreground">
              Por{" "}
              <span className="font-medium text-[hsl(var(--primary-dark))]">
                {course.volunteer?.full_name}
              </span>{" "}
              · {course.volunteer?.specialty}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <StarRating value={rating.avg} readOnly size={18} />
              <span className="text-sm text-muted-foreground">
                {rating.count > 0 ? `${rating.avg.toFixed(1)} (${rating.count})` : "Sem avaliações"}
              </span>
            </div>
          </div>

          {profile && !isOwner && (
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Flag className="h-4 w-4 mr-2" /> Reportar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reportar este curso</DialogTitle>
                </DialogHeader>
                <Textarea
                  rows={4}
                  placeholder="Descreva o motivo do reporte..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReportOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleReport}>Enviar reporte</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          </div>
        </FadeIn>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-[var(--shadow-soft)]"
        >
          <iframe
            src={toEmbed(course.video_url)}
            title={course.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>

        <FadeIn delay={3}>
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-[hsl(var(--primary-dark))]">
              Sobre o curso
          </h2>
          <p className="mt-3 text-muted-foreground whitespace-pre-line">
            {course.description}
          </p>
        </section>
        {volunteerEmail && (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" className="mt-4">
        ✉️ Entrar em contato
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Fale com {course.volunteer?.full_name}</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        Envie sua dúvida ou consulte os valores com o voluntário.
      </p>
      <div className="space-y-3 mt-2">
        <input
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Seu nome"
        />
        <input
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Seu email"
        />
        <Textarea
          rows={4}
          placeholder="Escreva o motivo do seu contato"
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button
            onClick={() => toast.success("Mensagem enviada! Em breve você receberá uma resposta no seu email.")}
          >
            Enviar mensagem
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}

        {materials.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-[hsl(var(--primary-dark))]">
              Material Complementar
            </h2>
            <ul className="mt-3 space-y-2">
              {materials.map((m, i) => {
                const url = m.match(/https?:\/\/\S+/)?.[0];
                return (
                  <li key={i} className="text-sm">
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {m}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">{m}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-10">
          {isOwner && (
            <div className="rounded-xl border border-border bg-secondary/50 p-4 text-sm font-medium text-[hsl(var(--primary-dark))]">
              Este é seu curso.
            </div>
          )}
          {isAluno && !enrolled && (
            <Button size="lg" className="w-full md:w-auto" onClick={handleEnroll}>
              Inscrever-se
            </Button>
          )}
          {isAluno && enrolled && (
            <div className="rounded-xl border border-primary/30 bg-secondary/40 p-4 flex items-center text-[hsl(var(--primary-dark))] font-medium">
              <CheckCircle2 className="h-5 w-5 mr-2" /> Você está inscrito neste curso
            </div>
          )}
        </div>

        {/* Avaliação - apenas inscritos */}
        {isAluno && enrolled && (
          <section className="mt-10 rounded-2xl border border-border p-6 bg-background shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-semibold text-[hsl(var(--primary-dark))]">
              Sua avaliação
            </h2>
            <p className="text-sm text-muted-foreground">
              Dê de 1 a 5 estrelas para este curso.
            </p>
            <div className="mt-3">
              <StarRating value={rating.mine || 0} onChange={handleRate} size={28} />
            </div>
          </section>
        )}

        {/* Comentários */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[hsl(var(--primary-dark))] flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Comentários ({comments.length})
          </h2>

          {isAluno && enrolled ? (
            <form onSubmit={handleComment} className="mt-4 space-y-2">
              <Textarea
                rows={3}
                placeholder="Compartilhe sua experiência..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={!newComment.trim()}>
                Publicar comentário
              </Button>
            </form>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {isAluno
                ? "Inscreva-se neste curso para deixar um comentário."
                : "Apenas alunos inscritos podem comentar."}
            </p>
          )}

          <div className="mt-6 space-y-4">
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum comentário ainda. Seja o primeiro!
              </p>
            )}
            {comments.map((c) => (
              <div
                key={c.id}
                className="border border-border rounded-xl p-4 bg-background"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-[hsl(var(--primary-dark))]">
                    {c.user?.full_name || "Usuário"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                  {c.content}
                </p>
              </div>
            ))}
          </div>
          </section>
        </FadeIn>
      </main>
    </div>
  );
}
