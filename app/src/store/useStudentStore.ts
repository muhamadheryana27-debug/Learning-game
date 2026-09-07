import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingData } from "../lib/validation";

type StudentState = {
  student: OnboardingData | null;
  setStudent: (data: OnboardingData) => void;
  clear: () => void;
};

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      student: null,
      setStudent: (data) => set({ student: data }),
      clear: () => set({ student: null }),
    }),
    { name: "vect-student" },
  ),
);
