export type Student = {
  studentId: string;
  name: string;
  className: string;
  attendanceNumber: number;
};

export type RegisterStudentInput = {
  name: string;
  className: string;
  attendanceNumber: number;
};

export function generateStudentId(name: string, className: string, attendanceNumber: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${className}-${String(attendanceNumber).padStart(2, "0")}-${slug}`;
}
