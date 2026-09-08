import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { onboardingSchema, type OnboardingData } from "../lib/validation";
import { useStudentStore } from "../store/useStudentStore";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { gameApi } from "../services/api";
import { enqueue } from "../engine/sync/syncEngine";
import { toast } from "sonner";

export default function Onboarding() {
  const nav = useNavigate();
  const setStudent = useStudentStore((s) => s.setStudent);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { class: "VIII-A" as const },
  });

  const onSubmit = async (data: unknown) => {
    const parsed = data as OnboardingData;
    setStudent({ name: parsed.name, className: parsed.class, attendanceNumber: parsed.absen });

    const studentId = `${parsed.class}-${String(parsed.absen).padStart(2, "0")}-${parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

    const result = await gameApi.registerStudent({
      studentId,
      name: parsed.name,
      className: parsed.class,
      attendanceNumber: parsed.absen,
    });

    if (result.ok) {
      toast.success("Identitas tersimpan");
    } else {
      await enqueue("register_student", "", studentId, { studentId, name: parsed.name, className: parsed.class, attendanceNumber: parsed.absen });
      toast.info("Offline — identitas disimpan lokal, akan sync nanti");
    }
    nav("/hub");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <h1 className="text-2xl font-bold text-primary text-center">SELAMAT DATANG DI VECT GAME</h1>
        <p className="text-center text-gray-600 mb-6">Identitas Siswa (Pembelajaran Daring)</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
            <input {...register("name")} className="w-full border-2 border-muted rounded-lg px-3 py-2 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" placeholder="Budi Santoso" />
            {errors.name && <p className="text-danger text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kelas *</label>
            <select {...register("class")} className="w-full border-2 border-muted rounded-lg px-3 py-2 focus:border-accent outline-none">
              <option>VIII-A</option><option>VIII-B</option><option>VIII-C</option><option>VIII-D</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">No. Presensi / Absen *</label>
            <input type="number" {...register("absen")} className="w-full border-2 border-muted rounded-lg px-3 py-2 focus:border-accent outline-none" placeholder="12" />
            {errors.absen && <p className="text-danger text-sm mt-1">{errors.absen.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Menyimpan..." : "Masuk Lab →"}</Button>
        </form>
      </Card>
    </div>
  );
}
