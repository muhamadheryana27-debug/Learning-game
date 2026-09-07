-- Enable realtime untuk dashboard live (jalankan setelah 001)
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table students;
alter publication supabase_realtime add table module1_traces;
alter publication supabase_realtime add table module2_answers;
alter publication supabase_realtime add table lab_experiments;
