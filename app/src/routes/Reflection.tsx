import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { toast } from "sonner";

const Q = [
  { q: "Ketika kamu memecah masalah menjadi beberapa bagian, kamu sedang melakukan...", opts: ["Abstraksi", "Dekomposisi", "Debugging"], ans: 1 },
  { q: "Ketika mencari kesamaan antara eksperimen 1 dan 3, kamu sedang melakukan...", opts: ["Pattern Recognition", "Algorithm", "Programming"], ans: 0 },
  { q: "Ketika mencoba solusi dan memperbaiki dugaan yang salah, kamu sedang melakukan...", opts: ["Debugging", "Decomposition", "Input"], ans: 0 },
];

export default function Reflection() {
  const nav = useNavigate();
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1]);
  const [essay, setEssay] = useState("");

  const submit = () => {
    if (answers.includes(-1)) { toast.error("Jawab 3 pertanyaan dulu"); return; }
    if (essay.trim().length < 10) { toast.error("Tulis refleksi minimal 10 karakter"); return; }
    const correct = answers.filter((a, i) => a === Q[i].ans).length;
    toast.success(`Refleksi disimpan! Benar ${correct}/3 — CT Skill +${correct * 10}`);
    // Simpan ke localStorage untuk Result
    localStorage.setItem("vect-reflection", JSON.stringify({ answers, essay, correct }));
    nav("/result");
  };

  return (
    <div className="min-h-screen bg-muted p-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-primary mb-2">🧠 Apa yang sebenarnya kamu lakukan?</h1>
        <p className="text-gray-600 mb-4">Refleksi Computational Thinking</p>
        <div className="space-y-4">
          {Q.map((item, idx) => (
            <div key={idx} className="border rounded-lg p-3 bg-white">
              <p className="font-medium mb-2">{idx + 1}. {item.q}</p>
              <div className="space-y-1">
                {item.opts.map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-2">
                    <input type="radio" name={`q${idx}`} checked={answers[idx] === oi} onChange={() => setAnswers((a) => { const n = [...a]; n[idx] = oi; return n; })} /> {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className="block font-medium mb-1">Jelaskan dengan kata-katamu bagaimana kamu menemukan 2 gelas air</label>
            <textarea value={essay} onChange={(e) => setEssay(e.target.value)} rows={3} className="w-full border-2 border-muted rounded-lg p-3 focus:border-accent outline-none" placeholder="Saya melihat pola..." />
          </div>
          <Button onClick={submit} className="w-full">Kirim & Lihat Hasil</Button>
        </div>
      </Card>
    </div>
  );
}
