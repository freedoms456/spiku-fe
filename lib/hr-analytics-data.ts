export interface Employee {
  id: number
  name: string
  nip_bpk: string
  nip_bkn: string
  jenis_kelamin: "Laki-laki" | "Perempuan"
  unit: string
  jabatan: string
  golongan: "I" | "II" | "III" | "IV"
  pangkat: string
  age: number
  education_level: string
  program_study: string
  start_date: string
  children_count: number
}

export interface JobHistory {
  id: number
  employee_id: number
  position: string
  unit: string
  start_date: string
  end_date: string | null
  rank: string
}

export interface Certification {
  id: number
  employee_id: number
  certification_name: string
  skill_type: string
  issue_date: string
  expiry_date: string | null
}

export interface Training {
  id: number
  employee_id: number
  training_name: string
  training_type: string
  completion_date: string
  duration_hours: number
}

export interface Assistance {
  id: number
  employee_id: number
  satker: string
  task_description: string
  start_date: string
  end_date: string
  role: string
}

export interface Audit {
  id: number
  employee_id: number
  audit_name: string
  account_type: string
  role: "Leader" | "Deputy" | "Member"
  year: number
  start_date: string
  end_date: string
}

// Mock data
export const employees: Employee[] = [
  {
    id: 1,
    name: "Dr. Ahmad Wijaya, M.Kom",
    nip_bpk: "198501012010011001",
    nip_bkn: "198501012010011001",
    jenis_kelamin: "Laki-laki",
    unit: "Fakultas Teknik Informatika",
    jabatan: "Dekan",
    golongan: "IV",
    pangkat: "Pembina Utama Muda",
    age: 39,
    education_level: "S3",
    program_study: "Teknik Informatika",
    start_date: "2010-01-01",
    children_count: 2,
  },
  {
    id: 2,
    name: "Prof. Dr. Sari Dewi, M.Si",
    nip_bpk: "199002152012012002",
    nip_bkn: "199002152012012002",
    jenis_kelamin: "Perempuan",
    unit: "Fakultas Ekonomi",
    jabatan: "Guru Besar",
    golongan: "IV",
    pangkat: "Pembina Utama",
    age: 34,
    education_level: "S3",
    program_study: "Ekonomi",
    start_date: "2012-02-15",
    children_count: 1,
  },
  {
    id: 3,
    name: "Budi Santoso, S.Kom, M.T",
    nip_bpk: "198803202008011003",
    nip_bkn: "198803202008011003",
    jenis_kelamin: "Laki-laki",
    unit: "Fakultas Teknik Informatika",
    jabatan: "Dosen",
    golongan: "III",
    pangkat: "Penata",
    age: 36,
    education_level: "S2",
    program_study: "Teknik Informatika",
    start_date: "2008-03-20",
    children_count: 3,
  },
  {
    id: 4,
    name: "Rina Kusuma, S.E, M.M",
    nip_bpk: "199205102015012004",
    nip_bkn: "199205102015012004",
    jenis_kelamin: "Perempuan",
    unit: "Fakultas Ekonomi",
    jabatan: "Dosen",
    golongan: "III",
    pangkat: "Penata Muda Tingkat I",
    age: 32,
    education_level: "S2",
    program_study: "Manajemen",
    start_date: "2015-05-10",
    children_count: 1,
  },
  {
    id: 5,
    name: "Dedi Kurniawan, S.T, M.Eng",
    nip_bpk: "198707252009011005",
    nip_bkn: "198707252009011005",
    jenis_kelamin: "Laki-laki",
    unit: "Fakultas Teknik Sipil",
    jabatan: "Kepala Laboratorium",
    golongan: "III",
    pangkat: "Penata Tingkat I",
    age: 37,
    education_level: "S2",
    program_study: "Teknik Sipil",
    start_date: "2009-07-25",
    children_count: 2,
  },
  // Add more employees...
  {
    id: 6,
    name: "Maya Sari, S.Psi, M.Psi",
    nip_bpk: "199408152016012006",
    nip_bkn: "199408152016012006",
    jenis_kelamin: "Perempuan",
    unit: "Fakultas Psikologi",
    jabatan: "Dosen",
    golongan: "II",
    pangkat: "Pengatur Tingkat I",
    age: 30,
    education_level: "S2",
    program_study: "Psikologi",
    start_date: "2016-08-15",
    children_count: 0,
  },
  {
    id: 7,
    name: "Agus Setiawan, S.H, M.H",
    nip_bpk: "198212032007011007",
    nip_bkn: "198212032007011007",
    jenis_kelamin: "Laki-laki",
    unit: "Fakultas Hukum",
    jabatan: "Wakil Dekan",
    golongan: "IV",
    pangkat: "Pembina",
    age: 42,
    education_level: "S2",
    program_study: "Hukum",
    start_date: "2007-12-03",
    children_count: 2,
  },
  {
    id: 8,
    name: "Fitri Handayani, S.Pd, M.Pd",
    nip_bpk: "199106202013012008",
    nip_bkn: "199106202013012008",
    jenis_kelamin: "Perempuan",
    unit: "Fakultas Keguruan",
    jabatan: "Dosen",
    golongan: "III",
    pangkat: "Penata Muda",
    age: 33,
    education_level: "S2",
    program_study: "Pendidikan",
    start_date: "2013-06-20",
    children_count: 2,
  },
]

export const jobHistory: JobHistory[] = [
  {
    id: 1,
    employee_id: 1,
    position: "Dosen",
    unit: "Fakultas Teknik Informatika",
    start_date: "2010-01-01",
    end_date: "2018-12-31",
    rank: "III",
  },
  {
    id: 2,
    employee_id: 1,
    position: "Dekan",
    unit: "Fakultas Teknik Informatika",
    start_date: "2019-01-01",
    end_date: null,
    rank: "IV",
  },
  {
    id: 3,
    employee_id: 3,
    position: "Asisten Dosen",
    unit: "Fakultas Teknik Informatika",
    start_date: "2008-03-20",
    end_date: "2015-12-31",
    rank: "II",
  },
  {
    id: 4,
    employee_id: 3,
    position: "Dosen",
    unit: "Fakultas Teknik Informatika",
    start_date: "2016-01-01",
    end_date: null,
    rank: "III",
  },
]

export const certifications: Certification[] = [
  {
    id: 1,
    employee_id: 1,
    certification_name: "Certified Information Systems Auditor (CISA)",
    skill_type: "IT Audit",
    issue_date: "2020-06-15",
    expiry_date: "2023-06-15",
  },
  {
    id: 2,
    employee_id: 1,
    certification_name: "Project Management Professional (PMP)",
    skill_type: "Project Management",
    issue_date: "2019-03-20",
    expiry_date: "2022-03-20",
  },
  {
    id: 3,
    employee_id: 3,
    certification_name: "Oracle Certified Professional",
    skill_type: "Database Management",
    issue_date: "2021-01-10",
    expiry_date: "2024-01-10",
  },
  {
    id: 4,
    employee_id: 4,
    certification_name: "Certified Public Accountant (CPA)",
    skill_type: "Accounting",
    issue_date: "2020-09-15",
    expiry_date: null,
  },
]

export const trainings: Training[] = [
  {
    id: 1,
    employee_id: 1,
    training_name: "Leadership Development Program",
    training_type: "Leadership",
    completion_date: "2023-03-15",
    duration_hours: 40,
  },
  {
    id: 2,
    employee_id: 1,
    training_name: "Digital Transformation Workshop",
    training_type: "Technology",
    completion_date: "2023-06-20",
    duration_hours: 24,
  },
  {
    id: 3,
    employee_id: 2,
    training_name: "Research Methodology",
    training_type: "Academic",
    completion_date: "2023-01-10",
    duration_hours: 32,
  },
  {
    id: 4,
    employee_id: 3,
    training_name: "Software Development Best Practices",
    training_type: "Technology",
    completion_date: "2023-04-25",
    duration_hours: 16,
  },
]

export const assistanceRecords: Assistance[] = [
  {
    id: 1,
    employee_id: 1,
    satker: "Kementerian Pendidikan",
    task_description: "IT System Implementation",
    start_date: "2023-01-15",
    end_date: "2023-03-15",
    role: "Technical Lead",
  },
  {
    id: 2,
    employee_id: 3,
    satker: "Universitas Partner",
    task_description: "Database Migration Support",
    start_date: "2023-02-01",
    end_date: "2023-02-28",
    role: "Database Specialist",
  },
  {
    id: 3,
    employee_id: 4,
    satker: "Kementerian Keuangan",
    task_description: "Financial Audit Support",
    start_date: "2023-03-01",
    end_date: "2023-04-30",
    role: "Financial Analyst",
  },
]

export const auditRecords: Audit[] = [
  {
    id: 1,
    employee_id: 1,
    audit_name: "IT Infrastructure Audit",
    account_type: "Assets",
    role: "Leader",
    year: 2023,
    start_date: "2023-01-01",
    end_date: "2023-02-28",
  },
  {
    id: 2,
    employee_id: 3,
    audit_name: "Database Security Audit",
    account_type: "IT Systems",
    role: "Member",
    year: 2023,
    start_date: "2023-03-01",
    end_date: "2023-03-31",
  },
  {
    id: 3,
    employee_id: 4,
    audit_name: "Financial Compliance Audit",
    account_type: "Expenses",
    role: "Deputy",
    year: 2023,
    start_date: "2023-04-01",
    end_date: "2023-05-15",
  },
  {
    id: 4,
    employee_id: 1,
    audit_name: "Operational Audit",
    account_type: "Operations",
    role: "Leader",
    year: 2022,
    start_date: "2022-10-01",
    end_date: "2022-11-30",
  },
]
