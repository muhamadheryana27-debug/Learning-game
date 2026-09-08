import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gameApi } from "../services/api";
import type { DashboardRow } from "../services/api/gameApi";
import { Card } from "../components/shared/Card";
import { SecondaryButton } from "../components/shared/Button";

export default function Dashboard() {
  const nav = useNavigate();
  const [rows, setRows] = useState<DashboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    gameApi.dashboard().then((result) => {
      if (cancelled) return;
      setApiAvailable(result.ok);
      setRows(result.data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const exportCSV = () => {
    const header = "Timestamp,Student_Name,Class,Attendance_Num,Module_1_Score,Module_2_Matrix_Score,Water_Glass_Correct,Reasoning_Text,Status";
    const csvRows = rows
      .map((r) => `"${r.startedAt}","${r.name}","${r.className}","${r.attendanceNumber}","${r.totalScore}%","","","","${r.status?.toUpperCase()}"`)
      .join("\n");
    const blob = new Blob([header + "\n" + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `dashboard-${Date.now()}.csv`; a.click();
  };

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">📊 Teacher Dashboard</h1>
          <SecondaryButton onClick={() => nav("/hub")}>← Hub</SecondaryButton>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <Card><div className="text-sm text-gray-500">Total Sesi</div><div className="text-2xl font-bold">{rows.length}</div></Card>
          <Card><div className="text-sm text-gray-500">Backend</div><div className="text-lg font-bold">{apiAvailable ? "Connected" : "Offline Mode"}</div></Card>
          <Card><button onClick={exportCSV} className="w-full bg-success text-white rounded px-4 py-2">⬇ Export CSV</button></Card>
        </div>

        <Card>
          <h2 className="font-bold mb-2">Sesi Terbaru</h2>
          {loading ? <p>Memuat...</p> : !apiAvailable ? (
            <div className="text-sm text-gray-600">
              <p>Google Apps Script belum terhubung — set <code>VITE_GOOGLE_APPS_SCRIPT_URL</code> di <code>.env</code>.</p>
              <p className="mt-2">Data lokal tetap tersimpan di IndexedDB & localStorage (Zustand persist).</p>
            </div>
          ) : rows.length === 0 ? <p className="text-gray-500">Belum ada sesi.</p> : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b"><th>Nama</th><th>Kelas</th><th>Absen</th><th>Skor</th><th>Status</th></tr></thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b"><td>{r.name}</td><td>{r.className}</td><td>{r.attendanceNumber}</td><td>{r.totalScore}%</td><td>{r.status}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
