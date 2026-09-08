import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateStudentId, type Student } from "../types/student";

type StudentState = {
  student: Student | null;
  setStudent: (data: { name: string; className: string; attendanceNumber: number }) => void;
  clear: () => void;
};

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      student: null,
      setStudent: (data) =>
        set({
          student: {
            studentId: generateStudentId(data.name, data.className, data.attendanceNumber),
            name: data.name,
            className: data.className,
            attendanceNumber: data.attendanceNumber,
          },
        }),
      clear: () => set({ student: null }),
    }),
    { name: "vect-student" },
  ),
);
