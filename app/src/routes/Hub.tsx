import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../store/useStudentStore";
import { useProgressStore } from "../store/useProgressStore";
import { Card } from "../components/shared/Card";
import { Button, SecondaryButton } from "../components/shared/Button";
import { computeFinalScore } from "../engine/scoring/scoring";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { toast } from "sonner";

export default function Hub() {
  const nav = useNavigate();
  const student = useStudentStore((s) => s.student);
  const { mod1Score, mod2Score, reasoning, waterCorrect, hintsUsed, reset } = useProgressStore();

  if (!student) {
    nav("/onboarding");
    return null;
  }

  const finalScore = computeFinalScore(mod1Score, mod2Score, hintsUsed);
  const progress = (mod1Score > 0 ? 50 : 0) + (mod2Score > 0 ? 50 : 0);

  const handleSubmit = async () => {
    if (!reasoning && mod2Score === 0) {
      toast.error("Selesaikan minimal satu modul dulu!");
      return;
    }
    if (isSupabaseConfigured) {
      try {
        const { data: stu } = await supabase.from("students").select("id").eq("name", student.name).eq("class", student.class).eq("absen", student.absen).maybeSingle();
        if (stu) {
          await supabase.from("sessions").insert({
            student_id: stu.id,
            mod1_score: mod1Score,
            mod2_score: mod2Score,
            water_correct: waterCorrect,
            reasoning: reasoning || "Belum mengisi",
            status: "completed",
            attempts: 1,
            hints_used: hintsUsed,
          });
          toast.success("Laporan terkirim ke Supabase!");
        }
      } catch (e) {
        console.error(e);
        toast.error("Gagal sync, data tetap tersimpan lokal");
      }
    } else {
      toast.success("Laporan disimpan lokal (CSV-compatible). Final Score: " + finalScore);
    }
    // Export CSV fallback (V4 compatible)
    const csv = `Timestamp,Student_Name,Class,Attendance_Num,Module_1_Score,Module_2_Matrix_Score,Water_Glass_Correct,Reasoning_Text,Status\n"${new Date().toISOString()}","${student.name}","${student.class}","${student.absen}","${mod1Score}%","${mod2Score}%","${waterCorrect ? "YES" : "NO"}","${reasoning.replace(/\n/g, " ")}","COMPLETED"`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `laporan-${student.name}-${Date.now()}.csv`; a.click();
  };

  return (
    <div className="min-h-screen bg-muted p-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-accent">Halo, {student.name} ({student.class})</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm mb-3">
          <p className="font-bold">📖 Urutan Disarankan:</p>
          <p><b>1.</b> Modul 1 Adonan (Easy → Medium, toggle Pipeline/Pabrik) → <b>2.</b> Modul 2 Pupuk (Lab → Eksperimen → Sort → Uji → Alasan) → <b>3.</b> Refleksi → <b>4.</b> Kirim Laporan</p>
          <p className="text-xs text-gray-500">Lihat panduan detail tiap level via tombol <b>❓ Panduan</b> di dalam modul.</p>
        </div>
        <p className="text-gray-600 mb-2">Pilih Modul Tantangan Berpikir Komputasional:</p>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div className="bg-success h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-gray-500 mb-4">Progress: {progress}% • Final Score prediksi: {finalScore}</p>

        <div className="grid gap-3">
          <button onClick={() => nav("/module/1")} className="text-left p-4 rounded-card border-2 border-primary/20 hover:border-primary bg-white flex justify-between items-center">
            <div><div className="font-bold">🍪 Modul 1: Mesin Pembentuk Adonan</div><div className="text-sm text-gray-500">Algorithm Lab — tracing pipeline</div></div>
            <span className={`px-3 py-1 rounded-pill text-sm ${mod1Score ? "bg-success text-white" : "bg-muted"}`}>{mod1Score ? `${mod1Score}%` : "Mulai"}</span>
          </button>
          <button onClick={() => nav("/module/2")} className="text-left p-4 rounded-card border-2 border-primary/20 hover:border-primary bg-white flex justify-between items-center">
            <div><div className="font-bold">🌱 Modul 2: Pupuk Ajaib</div><div className="text-sm text-gray-500">Pattern Lab — 3 eksperimen + drag & drop</div></div>
            <span className={`px-3 py-1 rounded-pill text-sm ${mod2Score ? "bg-success text-white" : "bg-muted"}`}>{mod2Score ? `${mod2Score}%` : "Mulai"}</span>
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          <Button onClick={handleSubmit}>Selesai & Kirim Laporan ke Guru</Button>
          <SecondaryButton onClick={() => { reset(); toast.info("Progress direset"); }}>Reset Progress</SecondaryButton>
          <button onClick={() => nav("/dashboard")} className="text-sm text-accent underline">Lihat Dashboard Guru →</button>
        </div>
      </Card>
    </div>
  );
}
