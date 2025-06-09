-- Seed data for schools
insert into public.schools (id, name, type, district, state, address, website, phone, principal_name, total_students)
values 
  ('d2a4b5c6-e7f8-4a3b-9c2d-1e0f3a4b5c6d', 'SMK Batu Unjur', 'SMK', 'Klang', 'Selangor', 'Jalan Batu Unjur, 41200 Klang, Selangor', 'http://www.smkbatuunjur.edu.my', '03-33714433', 'Puan Rosmah binti Abdullah', 1200),
  ('f8e7d6c5-b4a3-2f1e-9d8c-7b6a5f4e3d2c', 'MRSM Tawau', 'MRSM', 'Tawau', 'Sabah', 'KM 32 Jalan Tawau Semporna, 91000 Tawau, Sabah', 'http://mrsmtawau.edu.my', '089-987654', 'Encik Ahmad bin Hassan', 850),
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'SMKA Sheikh Haji Mohd Said', 'SMKA', 'Seremban', 'N. Sembilan', 'Jalan Sheikh Said, 70300 Seremban, N. Sembilan', 'http://www.smkashms.edu.my', '06-6011234', 'Tuan Haji Ismail bin Ibrahim', 950),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Kolej Vokasional Shah Alam', 'KV', 'Petaling', 'Selangor', 'Persiaran Kayangan, 40000 Shah Alam', 'http://www.kvsa.edu.my', '03-55101234', 'Puan Hasnah binti Mohd', 750),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'SBP Integrasi Gombak', 'SBP', 'Gombak', 'Selangor', 'Jalan Gombak, 53100 Gombak, Selangor', 'http://www.sbpigombak.edu.my', '03-61891234', 'Encik Razali bin Omar', 600),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Sekolah Seni Malaysia Kuching', 'Sekolah Seni', 'Kuching', 'Sarawak', 'Petra Jaya, 93050 Kuching, Sarawak', 'http://www.ssmkuching.edu.my', '082-441234', 'Puan Linda anak James', 480),
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'SMJK Chung Ling', 'SMJK', 'Timur Laut', 'Pulau Pinang', 'Jalan Kampung Baru, 11400 Pulau Pinang', 'http://www.chungling.edu.my', '04-2291234', 'Mr. Tan Cheng Huat', 2200),
  ('f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'Sekolah Sukan Bukit Jalil', 'Sekolah Sukan', 'Kuala Lumpur', 'W.P. Kuala Lumpur', 'Jalan Kelab Jalil, 57000 Bukit Jalil', 'http://www.ssbj.edu.my', '03-89961234', 'Dato Dr. Zulkifli bin Rahman', 800),
  ('a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d', 'SMK Sultan Abdul Samad', 'SMK', 'Petaling', 'Selangor', 'Jalan SS1/21, 47300 Petaling Jaya', 'http://www.smksas.edu.my', '03-78761234', 'Puan Siti Aminah binti Yusof', 1500),
  ('b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e', 'MRSM Pengkalan Chepa', 'MRSM', 'Kota Bharu', 'Kelantan', 'Lot 2345 Pengkalan Chepa, 16100 Kota Bharu', 'http://www.mrsmpengkalanchepa.edu.my', '09-7741234', 'Tuan Haji Abdul Rahman bin Abdullah', 720),
  ('c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f', 'Sekolah Menengah Sains Tuanku Jaafar', 'Sekolah Sains', 'Kuala Pilah', 'N. Sembilan', 'Jalan TJ, 72000 Kuala Pilah', 'http://www.smstj.edu.my', '06-4811234', 'Dr. Mohd Faizal bin Ahmad', 600),
  ('d0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a', 'SMKA Maahad Hamidiah', 'SMKA', 'Kajang', 'Selangor', 'Jalan Hamidiah, 43000 Kajang', 'http://www.maahad-hamidiah.edu.my', '03-87391234', 'Ustaz Muhammad bin Abdullah', 900)
on conflict (id) do update set
  name = excluded.name,
  type = excluded.type,
  district = excluded.district,
  state = excluded.state,
  address = excluded.address,
  website = excluded.website,
  phone = excluded.phone,
  principal_name = excluded.principal_name,
  total_students = excluded.total_students;

-- Initialize school stats for each school
insert into public.school_stats (school_id, average_score, participation_rate, total_quizzes_taken)
select 
  id as school_id,
  random() * 30 + 70 as average_score,  -- Random score between 70-100
  random() * 40 + 60 as participation_rate,  -- Random rate between 60-100
  floor(random() * 5000 + 1000) as total_quizzes_taken  -- Random between 1000-6000
from public.schools
on conflict (school_id) do update set
  average_score = excluded.average_score,
  participation_rate = excluded.participation_rate,
  total_quizzes_taken = excluded.total_quizzes_taken;
