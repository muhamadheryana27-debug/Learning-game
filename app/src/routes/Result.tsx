import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../store/useStudentStore";
import { useProgressStore } from "../store/useProgressStore";
import { computeFinalScore } from "../engine/scoring/scoring";
import { Card } from "../components/shared/Card";
import { Button, SecondaryButton } from "../components/shared/Button";

export default function Result() {
  const nav = useNavigate();
  const student = useStudentStore((s) => s.student);
  const { mod1Score, mod2Score, waterCorrect, hintsUsed, debuggingAttempts, reasoning } = useProgressStore();
  const finalScore = computeFinalScore(mod1Score, mod2Score, hintsUsed);
  const reflectionRaw = localStorage.getItem("vect-reflection");
  const reflection = reflectionRaw ? JSON.parse(reflectionRaw) : null;

  if (!student) { nav("/onboarding"); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent p-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full text-center">
        <div className="text-5xl mb-2">🏆</div>
        <h1 className="text-3xl font-bold text-primary">CASE SOLVED!</h1>
        <p className="text-gray-600 mb-4">Kamu berhasil menemukan pola dari data tidak lengkap — {student.name}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-left">
          <div className="bg-muted rounded p-3"><div className="text-sm text-gray-500">M1 Adonan</div><div className="text-xl font-bold">{mod1Score}%</div></div>
          <div className="bg-muted rounded p-3"><div className="text-sm text-gray-500">M2 Pupuk</div><div className="text-xl font-bold">{mod2Score}%</div></div>
          <div className="bg-muted rounded p-3"><div className="text-sm text-gray-500">Air Benar</div><div className="text-xl font-bold">{waterCorrect ? "YES" : "NO"}</div></div>
          <div className="bg-primary text-white rounded p-3"><div className="text-sm opacity-80">Final</div><div className="text-xl font-bold">{finalScore}</div></div>
        </div>

        <div className="text-left bg-white border rounded-card p-3 mb-4">
          <p className="font-semibold mb-1">🧠 CT Skill Breakdown</p>
          <ul className="text-sm space-y-0.5">
            <li>Pattern Recognition: {mod2Score === 100 ? "90+" : mod2Score}%</li>
            <li>Algorithmic Thinking: {mod1Score}%</li>
            <li>Debugging: {Math.max(0, 100 - hintsUsed * 20)} (hints {hintsUsed}, debug {debuggingAttempts})</li>
            <li>Reflection: {reflection ? `${reflection.correct}/3 benar` : "—"}</li>
          </ul>
          {reasoning && <p className="text-xs text-gray-500 mt-2">Reasoning: “{reasoning.slice(0, 120)}”</p>}
        </div>

        <div className="grid gap-2">
          <Button onClick={() => nav("/hub")}>Kembali ke Hub</Button>
          <SecondaryButton onClick={() => nav("/reflection")}>Ulangi Refleksi</SecondaryButton>
          <button onClick={() => nav("/dashboard")} className="text-sm text-accent underline">Lihat Dashboard Guru →</button>
        </div>
      </Card>
    </div>
  );
}
