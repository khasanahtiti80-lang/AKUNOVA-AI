import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import {
  BookOpen,
  Bot,
  GraduationCap,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
  Send,
  User,
  Award,
  Flame,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Plus,
  Copy,
  Check,
  Zap,
  BookMarked,
  ShieldCheck,
  HelpCircle,
  Lightbulb,
  TrendingUp,
  PieChart as PieChartIcon,
  Search,
  Bell,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  LogOut,
  Sliders
} from 'lucide-react';

// --- Firebase Configuration & Setup ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "demo-api-key",
      authDomain: "akunova-ai.firebaseapp.com",
      projectId: "akunova-ai",
      storageBucket: "akunova-ai.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef123456"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'akunova-smk-app';

// --- Curriculum Data Structure ---
const CURRICULUM = {
  kelas10: {
    title: "Kelas 10 SMK - Dasar-Dasar Akuntansi",
    topics: [
      { id: "k10-1", name: "Persamaan Dasar Akuntansi", desc: "Aset = Liabilitas + Ekuitas" },
      { id: "k10-2", name: "Pengenalan Jurnal Umum", desc: "Mekanisme Debet & Kredit" },
      { id: "k10-3", name: "Etika Profesi & K3LH Akuntansi", desc: "Prinsip Etika & Keselamatan Kerja" },
      { id: "k10-4", name: "Dokumen Transaksi", desc: "Faktur, Nota, Kuitansi, Memo" }
    ]
  },
  kelas11: {
    title: "Kelas 11 SMK - Akuntansi Keuangan & Perusahaan",
    topics: [
      { id: "k11-1", name: "Praktikum Akuntansi Perusahaan Jasa", desc: "Siklus Lengkap hingga Laporan Keuangan" },
      { id: "k11-2", name: "Praktikum Akuntansi Perusahaan Dagang", desc: "Jurnal Khusus, PPn, Kartu Persediaan" },
      { id: "k11-3", name: "Akuntansi Kas & Piutang", desc: "Kas Kecil, Rekonsiliasi Bank, Cadangan Kerugian" },
      { id: "k11-4", name: "Akuntansi Aset Tetap", desc: "Penyusutan, Pelepasan Aset Tetap" }
    ]
  },
  kelas12: {
    title: "Kelas 12 SMK - Laboratorium, Pajak & Manufaktur",
    topics: [
      { id: "k12-1", name: "Praktikum Perusahaan Manufaktur", desc: "BOP, BBB, BTK, HPP & Harga Pokok Penjualan" },
      { id: "k12-2", name: "Akuntansi Lembaga / Pemerintah", desc: "Penerimaan & Pengeluaran Daerah, LRA" },
      { id: "k12-3", name: "Perpajakan Indonesia", desc: "PPh Pasal 21, PPh 23, PPN, PBB" },
      { id: "k12-4", name: "Spreadsheet & Lab Akuntansi", desc: "Model Excel Keuangan & MYOB/Accurate" }
    ]
  }
};

const INITIAL_PRACTICE_QUESTIONS = [
  {
    id: 'q1',
    grade: 'kelas10',
    topic: 'Persamaan Dasar Akuntansi',
    question: "Pemilik menyetorkan uang tunai sebesar Rp 15.000.000 dan peralatan kantor senilai Rp 5.000.000 sebagai modal awal usaha. Bagaimana analisis transaksi terhadap Persamaan Dasar Akuntansi?",
    options: [
      "Aset (Kas +15jt, Peralatan +5jt) bertambah Rp 20.000.000; Ekuitas (Modal) bertambah Rp 20.000.000",
      "Aset (Kas) bertambah Rp 15.000.000; Liabilitas bertambah Rp 5.000.000; Ekuitas bertambah Rp 20.000.000",
      "Aset (Kas) bertambah Rp 20.000.000; Ekuitas bertambah Rp 15.000.000",
      "Aset (Peralatan) bertambah Rp 20.000.000; Liabilitas bertambah Rp 20.000.000"
    ],
    correctAnswer: 0,
    explanation: "Setoran modal berupa kas dan barang akan menambah Aset total sebesar 20jt (Kas 15jt + Peralatan 5jt) dan seimbang menambah Ekuitas Pemilik sebesar Rp 20.000.000.",
    journalHint: "Debet: Kas Rp 15.000.000, Peralatan Rp 5.000.000 | Kredit: Modal Pemilik Rp 20.000.000"
  },
  {
    id: 'q2',
    grade: 'kelas11',
    topic: 'Jurnal Khusus Perusahaan Dagang',
    question: "Toko Akunova membeli barang dagangan dari PT Jaya secara kredit senilai Rp 8.000.000 dengan syarat 2/10, n/30. Pencatatan jurnal yang tepat dalam metode periodik adalah...",
    options: [
      "Debet: Pembelian Rp 8.000.000 | Kredit: Utang Dagang Rp 8.000.000",
      "Debet: Persediaan Barang Rp 8.000.000 | Kredit: Kas Rp 8.000.000",
      "Debet: Utang Dagang Rp 8.000.000 | Kredit: Pembelian Rp 8.000.000",
      "Debet: Kas Rp 8.000.000 | Kredit: Penjualan Rp 8.000.000"
    ],
    correctAnswer: 0,
    explanation: "Dalam pencatatan metode periodik, pembelian barang dagang secara kredit dicatat akun Pembelian (Debet) dan Utang Dagang (Kredit). Syarat 2/10,n/30 menunjukkan transaksi kredit.",
    journalHint: "Debet: Pembelian Rp 8.000.000 | Kredit: Utang Dagang (PT Jaya) Rp 8.000.000"
  },
  {
    id: 'q3',
    grade: 'kelas12',
    topic: 'Akuntansi Perusahaan Manufaktur',
    question: "Elemen biaya yang termasuk dalam Biaya Utama (Prime Cost) pada produksi perusahaan manufaktur adalah...",
    options: [
      "Biaya Bahan Baku Langsung + Biaya Tenaga Kerja Langsung",
      "Biaya Tenaga Kerja Langsung + Biaya Overhead Pabrik",
      "Biaya Bahan Baku Langsung + Biaya Pemasaran",
      "Biaya Overhead Pabrik + Biaya Administrasi"
    ],
    correctAnswer: 0,
    explanation: "Biaya Utama (Prime Cost) adalah akumulasi biaya langsung pembuatan produk, yaitu Biaya Bahan Baku Langsung (Direct Materials) ditambah Biaya Tenaga Kerja Langsung (Direct Labor).",
    journalHint: "Prime Cost = BBB + BTKL. Sedangkan Conversion Cost = BTKL + BOP."
  }
];

export default function App() {
  // --- States ---
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('siswa'); // 'siswa' | 'guru'
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [selectedGrade, setSelectedGrade] = useState('kelas10');
  const [streakCount, setStreakCount] = useState(5);
  const [xpPoints, setXpPoints] = useState(340);
  
  // Custom API Key (optional user override)
  const [customApiKey, setCustomApiKey] = useState('');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { 
      sender: 'ai', 
      text: 'Halo! Saya AKUNOVA AI Tutor. Mau dibantu analisis jurnal, penjelasan aturan debit-kredit, atau penyusunan Laporan Keuangan hari ini?',
      time: 'Baru saja'
    }
  ]);
  const [inputChat, setInputChat] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Quiz state
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Teacher Module Generator state
  const [moduleSubject, setModuleSubject] = useState('Dasar-Dasar Akuntansi SMK Kelas 10');
  const [moduleTopic, setModuleTopic] = useState('Mekanisme Debet Kredit & Jurnal Umum');
  const [moduleType, setModuleType] = useState('Modul Ajar Kurikulum Merdeka');
  const [generatedModule, setGeneratedModule] = useState('');
  const [isGeneratingModule, setIsGeneratingModule] = useState(false);
  const [savedModules, setSavedModules] = useState([]);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const chatEndRef = useRef(null);

  // --- Auth Initialization ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- Sync Saved Modules & User Stats from Firestore ---
  useEffect(() => {
    if (!user) return;

    // Listen to saved teacher modules
    const modulesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'teacher_modules');
    const unsubModules = onSnapshot(modulesRef, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSavedModules(list);
    }, (err) => console.log("Error loading modules:", err));

    return () => unsubModules();
  }, [user]);

  // Scroll Chat to Bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // --- Gemini API Handler ---
  const callGemini = async (prompt, systemInstruction = '') => {
    const apiKey = customApiKey || ''; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API call status: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return answer || "Maaf, sistem tidak dapat menghasilkan tanggapan saat ini.";
    } catch (error) {
      console.warn("Using smart fallback due to API error or missing custom key:", error);
      // Smart local fallback generator
      return generateMockAiResponse(prompt, systemInstruction);
    }
  };

  // Local fallback responder for smooth demo experience
  const generateMockAiResponse = (prompt, systemInstruction) => {
    const lower = prompt.toLowerCase();
    if (systemInstruction.includes("Modul Ajar") || lower.includes("modul")) {
      return `### MODUL AJAR KURIKULUM MERDEKA - AKUNOVA AI
**Mata Pelajaran:** ${moduleSubject}
**Topik:** ${moduleTopic}
**Fase / Kelas:** E / F (SMK Akuntansi)

---

#### 1. CAPAIAN PEMBELAJARAN (CP)
Peserta didik mampu memahami aturan debet-kredit, menganalisis dokumen transaksi, serta melakukan pencatatan ke dalam jurnal umum secara cermat dan sistematis.

#### 2. TUJUAN PEMBELAJARAN (TP)
1. Siswa mampu mengidentifikasi akun Aset, Liabilitas, Ekuitas, Pendapatan, dan Beban.
2. Siswa mampu menerapkan analisis Debet dan Kredit pada transaksi bisnis.
3. Siswa mampu menyusun Jurnal Umum sederhana berdasarkan kuitansi/faktur.

#### 3. MODEL & METODE PEMBELAJARAN
- **Model:** Problem-Based Learning (PBL) berbantuan AKUNOVA AI Tutor
- **Metode:** Diskusi Kelompok, Studi Kasus Interaktif, Simulasi Jurnal

#### 4. KEGIATAN PEMBELAJARAN (2 JP @ 45 Menit)
- **Pendahuluan (15 Menit):** Aperseptif singkat tentang Persamaan Dasar Akuntansi. Pre-test cepat di aplikasi AKUNOVA AI.
- **Kegiatan Inti (60 Menit):** 
  1. Guru memberikan studi kasus transaksi perusahaan.
  2. Siswa secara mandiri menginput transaksi ke AI Tutor untuk verifikasi logika debit/kredit.
  3. Diskusi kelompok membandingkan hasil jurnal manual vs masukan AI.
- **Penutup (15 Menit):** Refleksi hasil belajar & kuis singkat di AKUNOVA AI.

#### 5. RUBRIK PENILAIAN
| Kriteria | Skor 4 (Sangat Baik) | Skor 3 (Baik) | Skor 2 (Cukup) |
|---|---|---|---|
| **Ketepatan Posisi** | Debet & Kredit 100% tepat | Terdapat 1 kesalahan nominal | Banyak kesalahan posisi |
| **Kerapihan & Logika** | Disertai penjelasan akun yang jelas | Cukup rapi | Kurang terstruktur |`;
    }

    if (lower.includes("jurnal") || lower.includes("debit") || lower.includes("kredit")) {
      return `**Penjelasan Analisis Jurnal Akuntansi:**

Dalam aturan **Mekanisme Debet & Kredit**:
1. **Aset & Beban**: Bertambah di sisi **Debet (+)**, Berkurang di sisi **Kredit (-)**.
2. **Liabilitas, Ekuitas & Pendapatan**: Bertambah di sisi **Kredit (+)**, Berkurang di sisi **Debet (-)**.

*Contoh Kasus:*
Membeli perlengkapan secara tunai Rp 1.000.000.
- **Analisis:** Aset berupa Perlengkapan bertambah (Debet), Aset berupa Kas berkurang (Kredit).
- **Jurnal Umum:**
  - *(D)* Perlengkapan: Rp 1.000.000
  - *(K)* Kas: Rp 1.000.000

Apakah ada transaksi spesifik lain yang ingin kamu tanyakan?`;
    }

    return `AKUNOVA AI membantu kamu memahami materi **${CURRICULUM[selectedGrade].title}**.

Langkah penting dalam analisis transaksi akuntansi:
1. Identifikasi dokumen transaksi (Faktur/Kuitansi).
2. Tentukan akun apa saja yang terpengaruh (Aset/Utang/Modal/Pendapatan/Beban).
3. Tentukan perubahan bertambah/berkurang.
4. Terapkan aturan saldo normal Debet & Kredit.

Ingin mencoba latihan soal atau butuh pembahasan transaksi lain?`;
  };

  // --- Handlers ---
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputChat.trim() || isChatLoading) return;

    const userMsg = inputChat.trim();
    setInputChat('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: 'Baru saja' }]);
    setIsChatLoading(true);

    const systemPrompt = `Kamu adalah AKUNOVA AI, asisten dan tutor cerdas pembelajaran Akuntansi SMK (Sekolah Menengah Kejuruan) di Indonesia.
Gaya komunikasimu ramah, interaktif, bertahap, dan mudah dipahami siswa SMK.
Jika diminta analisis transaksi, berikan breakdown:
1. Akun yang terpengaruh
2. Perubahan (Bertambah/Berkurang)
3. Posisi Debet/Kredit
4. Bentuk Jurnal Umum.`;

    const reply = await callGemini(userMsg, systemPrompt);
    setChatMessages(prev => [...prev, { sender: 'ai', text: reply, time: 'Baru saja' }]);
    setIsChatLoading(false);
  };

  const handleSelectQuizOption = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerSubmitted(true);
    const currentQ = INITIAL_PRACTICE_QUESTIONS[currentQuizIdx];
    if (selectedAnswer === currentQ.correctAnswer) {
      setQuizScore(prev => prev + 100);
      setXpPoints(prev => prev + 25);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setCurrentQuizIdx((prev) => (prev + 1) % INITIAL_PRACTICE_QUESTIONS.length);
  };

  const handleGenerateTeacherModule = async () => {
    setIsGeneratingModule(true);
    const systemPrompt = `Kamu adalah pakar kurikulum pembelajaran Akuntansi SMK Kurikulum Merdeka di Indonesia. Buatlah dokumen perangkat pembelajaran yang lengkap, terstruktur, profesional, dan siap pakai.`;
    const prompt = `Buatlah ${moduleType} untuk mata pelajaran: "${moduleSubject}" dengan topik/materi spesifik: "${moduleTopic}". Lengkapi dengan Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), Langkah Pembelajaran, dan Rubrik Penilaian.`;

    const res = await callGemini(prompt, systemPrompt);
    setGeneratedModule(res);
    setIsGeneratingModule(false);

    // Auto save to Firestore if authenticated
    if (user) {
      try {
        const modulesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'teacher_modules');
        await addDoc(modulesRef, {
          title: moduleTopic,
          subject: moduleSubject,
          type: moduleType,
          content: res,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Firestore save error:", e);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f3eff8] text-slate-800 font-sans p-2 sm:p-4 md:p-6 flex justify-center items-center">
      {/* Main Soft Neumorphic App Container */}
      <div className="w-full max-w-7xl bg-[#f6f2fb] rounded-[32px] shadow-[12px_12px_24px_#d1c7e0,-12px_-12px_24px_#ffffff] p-3 sm:p-5 flex flex-col md:flex-row gap-5 border border-white/60">

        {/* ================= SIDEBAR (Aesthetic Soft Lavender 3D Neumorphism) ================= */}
        <aside className="w-full md:w-72 bg-gradient-to-b from-[#8b72e6] to-[#7355dc] rounded-[28px] p-5 text-white flex flex-col justify-between shadow-[8px_8px_20px_rgba(115,85,220,0.3)] relative overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-900/20 rounded-full blur-xl pointer-events-none" />

          <div>
            {/* Top User Card */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border border-white/20 shadow-inner mb-6">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-200 to-pink-300 p-1 shadow-md">
                  <div className="w-full h-full rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                    {role === 'guru' ? 'GR' : 'AK'}
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-purple-600 rounded-full" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm text-white truncate">
                  {role === 'guru' ? 'Ibu Anita, S.Pd.' : 'Ahmad Fauzi'}
                </h3>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] bg-white/20 text-purple-100 px-2 py-0.5 rounded-full font-medium capitalize">
                    {role === 'guru' ? 'Guru Akuntansi' : 'Siswa SMK Cls 11'}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Switcher Pill */}
            <div className="bg-purple-950/20 p-1 rounded-2xl flex mb-6 shadow-inner border border-white/10">
              <button
                onClick={() => setRole('siswa')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  role === 'siswa' 
                    ? 'bg-white text-purple-700 shadow-sm font-bold' 
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Mode Siswa
              </button>
              <button
                onClick={() => setRole('guru')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  role === 'guru' 
                    ? 'bg-white text-purple-700 shadow-sm font-bold' 
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Mode Guru
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-purple-800 shadow-[4px_4px_12px_rgba(0,0,0,0.15)] font-bold translate-x-1'
                    : 'text-purple-100 hover:bg-white/10 hover:translate-x-1'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('tutor')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  activeTab === 'tutor'
                    ? 'bg-white text-purple-800 shadow-[4px_4px_12px_rgba(0,0,0,0.15)] font-bold translate-x-1'
                    : 'text-purple-100 hover:bg-white/10 hover:translate-x-1'
                }`}
              >
                <Bot className="w-5 h-5" />
                AI Tutor Chat
              </button>

              <button
                onClick={() => setActiveTab('latihan')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  activeTab === 'latihan'
                    ? 'bg-white text-purple-800 shadow-[4px_4px_12px_rgba(0,0,0,0.15)] font-bold translate-x-1'
                    : 'text-purple-100 hover:bg-white/10 hover:translate-x-1'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                Latihan & Simulasi
              </button>

              {role === 'guru' && (
                <button
                  onClick={() => setActiveTab('generator')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    activeTab === 'generator'
                      ? 'bg-white text-purple-800 shadow-[4px_4px_12px_rgba(0,0,0,0.15)] font-bold translate-x-1'
                      : 'text-purple-100 hover:bg-white/10 hover:translate-x-1'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  Generator Perangkat
                </button>
              )}

              <button
                onClick={() => setActiveTab('analisis')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  activeTab === 'analisis'
                    ? 'bg-white text-purple-800 shadow-[4px_4px_12px_rgba(0,0,0,0.15)] font-bold translate-x-1'
                    : 'text-purple-100 hover:bg-white/10 hover:translate-x-1'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Analisis & Nilai
              </button>

              <button
                onClick={() => setActiveTab('pengaturan')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  activeTab === 'pengaturan'
                    ? 'bg-white text-purple-800 shadow-[4px_4px_12px_rgba(0,0,0,0.15)] font-bold translate-x-1'
                    : 'text-purple-100 hover:bg-white/10 hover:translate-x-1'
                }`}
              >
                <Settings className="w-5 h-5" />
                Pengaturan API
              </button>
            </nav>
          </div>

          {/* Bottom Upgrade/Streak Banner (3D Neumorphic Clay Style) */}
          <div className="mt-6 bg-gradient-to-r from-amber-300 to-pink-300 rounded-2xl p-4 text-purple-950 shadow-lg relative border border-white/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center shadow-md text-amber-600">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-900/70">Study Streak</p>
                <p className="text-lg font-extrabold leading-none">{streakCount} Hari Beruntun!</p>
              </div>
            </div>
            <p className="text-[11px] text-purple-900/80 font-medium">
              Selesaikan 1 kasus akuntansi lagi hari ini untuk mempertahankan streak!
            </p>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex-1 flex flex-col gap-5 overflow-hidden">

          {/* Top Bar Header */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#f6f2fb] p-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                  AKUNOVA AI v2.5
                </span>
                <span className="text-xs text-slate-500 font-medium">SMK Akuntansi & Keuangan</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-800 mt-1">
                {activeTab === 'dashboard' && `Selamat Datang, ${role === 'guru' ? 'Ibu Anita!' : 'Ahmad!'}`}
                {activeTab === 'tutor' && "AI Tutor Akuntansi Interaktif"}
                {activeTab === 'latihan' && "Simulasi & Latihan Kasus"}
                {activeTab === 'generator' && "AI Perangkat Pembelajaran Guru"}
                {activeTab === 'analisis' && "Laporan & Evaluasi Pembelajaran"}
                {activeTab === 'pengaturan' && "Pengaturan Kunci API Gemini"}
              </h1>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3">
              <div className="bg-[#f6f2fb] shadow-[4px_4px_8px_#d1c7e0,-4px_-4px_8px_#ffffff] rounded-2xl px-3.5 py-2 flex items-center gap-2 border border-white">
                <Award className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold leading-none">TOTAL XP</div>
                  <div className="text-sm font-extrabold text-slate-700">{xpPoints} XP</div>
                </div>
              </div>

              <div className="bg-[#f6f2fb] shadow-[4px_4px_8px_#d1c7e0,-4px_-4px_8px_#ffffff] rounded-2xl px-3.5 py-2 flex items-center gap-2 border border-white">
                <Flame className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold leading-none">STREAK</div>
                  <div className="text-sm font-extrabold text-slate-700">{streakCount} Hari</div>
                </div>
              </div>
            </div>
          </header>

          {/* ================= TAB 1: DASHBOARD OVERVIEW ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5 overflow-y-auto pr-1">

              {/* Class Grade Selector Pills */}
              <div className="bg-[#f6f2fb] p-2 rounded-2xl shadow-[inset_3px_3px_6px_#d1c7e0,inset_-3px_-3px_6px_#ffffff] flex flex-wrap gap-2">
                {Object.keys(CURRICULUM).map((gradeKey) => (
                  <button
                    key={gradeKey}
                    onClick={() => setSelectedGrade(gradeKey)}
                    className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center ${
                      selectedGrade === gradeKey
                        ? 'bg-purple-600 text-white shadow-[4px_4px_10px_rgba(115,85,220,0.4)]'
                        : 'text-slate-600 hover:bg-white/50'
                    }`}
                  >
                    {CURRICULUM[gradeKey].title.split(' - ')[0]}
                  </button>
                ))}
              </div>

              {/* Hero Banner Card */}
              <div className="bg-gradient-to-r from-purple-200 via-indigo-100 to-pink-100 rounded-3xl p-6 shadow-[8px_8px_16px_#d1c7e0,-8px_-8px_16px_#ffffff] border border-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Materi Aktif: {CURRICULUM[selectedGrade].title.split(' - ')[1]}
                  </span>
                  <h2 className="text-xl font-bold text-slate-800">
                    Siap Menguasai Siklus Akuntansi Hari Ini?
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pelajari pencatatan jurnal umum, penyesuaian neraca saldo, hingga laporan laba rugi dengan bimbingan AI Tutor pintar yang disesuaikan untuk SMK.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('tutor')}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-[4px_4px_10px_rgba(115,85,220,0.3)] transition flex items-center gap-2"
                    >
                      <Bot className="w-4 h-4" />
                      Tanya AI Tutor
                    </button>
                    <button
                      onClick={() => setActiveTab('latihan')}
                      className="bg-white/80 hover:bg-white text-purple-700 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md border border-white transition flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Mulai Latihan Soal
                    </button>
                  </div>
                </div>
                <div className="w-28 h-28 rounded-3xl bg-white/60 p-3 shadow-inner flex items-center justify-center border border-white/80">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <BookMarked className="w-12 h-12" />
                  </div>
                </div>
              </div>

              {/* 4 Soft Pastel Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Card 1 */}
                <div className="bg-[#fbebee] rounded-2xl p-4 shadow-[6px_6px_12px_#d1c7e0,-6px_-6px_12px_#ffffff] border border-white">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-600 flex items-center justify-center mb-2 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">Soal Selesai</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-0.5">42 Transaksi</p>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                    <TrendingUp className="w-3 h-3" /> +12 minggu ini
                  </span>
                </div>

                {/* Card 2 */}
                <div className="bg-[#fff8e7] rounded-2xl p-4 shadow-[6px_6px_12px_#d1c7e0,-6px_-6px_12px_#ffffff] border border-white">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center mb-2 font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">Akurasi Jurnal</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-0.5">88.5%</p>
                  <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-1">
                    Sangat Baik
                  </span>
                </div>

                {/* Card 3 */}
                <div className="bg-[#eef8f3] rounded-2xl p-4 shadow-[6px_6px_12px_#d1c7e0,-6px_-6px_12px_#ffffff] border border-white">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center mb-2 font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">Waktu Belajar</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-0.5">14.2 Jam</p>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                    +2.4 jam minggu ini
                  </span>
                </div>

                {/* Card 4 */}
                <div className="bg-[#f0f4ff] rounded-2xl p-4 shadow-[6px_6px_12px_#d1c7e0,-6px_-6px_12px_#ffffff] border border-white">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center mb-2 font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">Modul Dikuasai</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-0.5">8 / 12 Topic</p>
                  <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 mt-1">
                    Level 3 SMK
                  </span>
                </div>
              </div>

              {/* Topics Grid for Selected Grade */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Materi Pokok Pembelajaran - {CURRICULUM[selectedGrade].title}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CURRICULUM[selectedGrade].topics.map((tp, idx) => (
                    <div 
                      key={tp.id}
                      className="bg-[#f6f2fb] rounded-2xl p-4 shadow-[6px_6px_12px_#d1c7e0,-6px_-6px_12px_#ffffff] border border-white flex items-start justify-between gap-3 hover:translate-y-[-2px] transition duration-200"
                    >
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-inner">
                          0{idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{tp.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{tp.desc}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-md">
                              Praktikum & Teori
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('tutor')}
                        className="p-2 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-600 transition shadow-sm"
                        title="Pelajari bersama AI Tutor"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: AI TUTOR CHATBOT ================= */}
          {activeTab === 'tutor' && (
            <div className="flex-1 flex flex-col bg-[#f6f2fb] rounded-3xl p-4 shadow-[inset_4px_4px_8px_#d1c7e0,inset_-4px_-4px_8px_#ffffff] border border-white overflow-hidden h-[560px]">
              
              {/* Chat Header */}
              <div className="pb-3 border-b border-purple-100/80 flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">AKUNOVA AI Accounting Assistant</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Siap Membantu Debit/Kredit & Analisis Transaksi
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setChatMessages([{ sender: 'ai', text: 'Halo! Ada transaksi akuntansi yang perlu kita analisis bersama?', time: 'Baru saja' }])}
                  className="p-2 text-slate-400 hover:text-purple-600 rounded-xl hover:bg-white/50 transition"
                  title="Reset Percakapan"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 px-2">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none shadow-[4px_4px_10px_rgba(115,85,220,0.3)]'
                        : 'bg-white text-slate-800 rounded-bl-none shadow-[4px_4px_12px_#d1c7e0] border border-white'
                    }`}>
                      <div className="whitespace-pre-wrap font-sans">
                        {msg.text}
                      </div>
                      <div className={`text-[9px] mt-2 text-right ${msg.sender === 'user' ? 'text-purple-200' : 'text-slate-400'}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-bl-none p-3 shadow-md flex items-center gap-2 text-xs text-purple-700 font-semibold">
                      <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
                      AKUNOVA AI sedang mengalisis jurnal & menghitung...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Quick Suggestion Chips */}
              <div className="py-2 flex gap-2 overflow-x-auto text-[11px] px-2 no-scrollbar">
                <button
                  onClick={() => setInputChat("Jelaskan aturan Debet dan Kredit untuk akun Beban dan Aset!")}
                  className="shrink-0 bg-white hover:bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200 shadow-sm font-medium"
                >
                  💡 Aturan Debet Kredit
                </button>
                <button
                  onClick={() => setInputChat("Bagaimana cara membuat Jurnal Penyesuaian Beban Perlengkapan?")}
                  className="shrink-0 bg-white hover:bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200 shadow-sm font-medium"
                >
                  📊 Jurnal Penyesuaian
                </button>
                <button
                  onClick={() => setInputChat("Apa perbedaan Akuntansi Perusahaan Dagang dan Manufaktur?")}
                  className="shrink-0 bg-white hover:bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200 shadow-sm font-medium"
                >
                  🏭 Jasa vs Dagang vs Manufaktur
                </button>
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={inputChat}
                  onChange={(e) => setInputChat(e.target.value)}
                  placeholder="Ketik soal akuntansi atau pertanyaan transaksi di sini..."
                  className="flex-1 bg-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] border border-purple-100"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !inputChat.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-2xl shadow-[4px_4px_10px_rgba(115,85,220,0.4)] transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* ================= TAB 3: LATIHAN SOAL & SIMULASI ================= */}
          {activeTab === 'latihan' && (
            <div className="space-y-5 overflow-y-auto pr-1">
              {/* Question Header & Counter */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] bg-white/20 text-purple-100 px-2.5 py-1 rounded-full font-bold uppercase">
                    Studi Kasus #{currentQuizIdx + 1} / {INITIAL_PRACTICE_QUESTIONS.length}
                  </span>
                  <h3 className="text-base font-bold mt-1">
                    {INITIAL_PRACTICE_QUESTIONS[currentQuizIdx].topic}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-purple-200">Skor Sesi Ini</span>
                  <div className="text-xl font-extrabold text-amber-300">{quizScore} PTS</div>
                </div>
              </div>

              {/* Question Card (Claymorphic) */}
              <div className="bg-[#f6f2fb] rounded-3xl p-6 shadow-[8px_8px_16px_#d1c7e0,-8px_-8px_16px_#ffffff] border border-white space-y-4">
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                  {INITIAL_PRACTICE_QUESTIONS[currentQuizIdx].question}
                </p>

                {/* Multiple Choice Options */}
                <div className="space-y-3 pt-2">
                  {INITIAL_PRACTICE_QUESTIONS[currentQuizIdx].options.map((opt, idx) => {
                    let btnStyle = "bg-white text-slate-700 hover:bg-purple-50 border-purple-100";
                    if (isAnswerSubmitted) {
                      if (idx === INITIAL_PRACTICE_QUESTIONS[currentQuizIdx].correctAnswer) {
                        btnStyle = "bg-emerald-500 text-white font-bold border-emerald-600 shadow-md";
                      } else if (selectedAnswer === idx) {
                        btnStyle = "bg-rose-500 text-white font-bold border-rose-600";
                      }
                    } else if (selectedAnswer === idx) {
                      btnStyle = "bg-purple-100 border-purple-500 text-purple-800 font-bold shadow-inner";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectQuizOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full text-left p-4 rounded-2xl text-xs transition-all border shadow-[3px_3px_6px_#d1c7e0] flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswerSubmitted && idx === INITIAL_PRACTICE_QUESTIONS[currentQuizIdx].correctAnswer && (
                          <CheckCircle2 className="w-5 h-5 shrink-0 ml-2 text-white" />
                        )}
                        {isAnswerSubmitted && selectedAnswer === idx && idx !== INITIAL_PRACTICE_QUESTIONS[currentQuizIdx].correctAnswer && (
                          <XCircle className="w-5 h-5 shrink-0 ml-2 text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Action Controls */}
                <div className="pt-3 flex items-center justify-between">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-[4px_4px_10px_rgba(115,85,220,0.4)] transition"
                    >
                      Kirim Jawaban
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition flex items-center gap-2"
                    >
                      Lanjut Soal Berikutnya <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* AI Explanation & Journal Hint Box */}
                {isAnswerSubmitted && (
                  <div className="mt-4 p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Pembahasan & Logika Jurnal AKUNOVA AI:
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {INITIAL_PRACTICE_QUESTIONS[currentQuizIdx].explanation}
                    </p>
                    <div className="p-2.5 rounded-xl bg-white text-[11px] font-mono text-purple-900 border border-purple-100">
                      <strong>Format Jurnal:</strong> {INITIAL_PRACTICE_QUESTIONS[currentQuizIdx].journalHint}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 4: GENERATOR PERANGKAT GURU (TEACHER MODE ONLY) ================= */}
          {activeTab === 'generator' && role === 'guru' && (
            <div className="space-y-5 overflow-y-auto pr-1">
              <div className="bg-[#f6f2fb] rounded-3xl p-5 shadow-[8px_8px_16px_#d1c7e0,-8px_-8px_16px_#ffffff] border border-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Generator Perangkat Pembelajaran AI</h3>
                    <p className="text-xs text-slate-500">Susun Modul Ajar, ATP, RPP, dan Rubrik Penilaian otomatis berstandar Kurikulum Merdeka SMK.</p>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Mata Pelajaran / Tingkat</label>
                    <select
                      value={moduleSubject}
                      onChange={(e) => setModuleSubject(e.target.value)}
                      className="w-full bg-white rounded-xl p-2.5 text-xs border border-purple-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Dasar-Dasar Akuntansi SMK Kelas 10">Dasar-Dasar Akuntansi SMK Kelas 10</option>
                      <option value="Akuntansi Keuangan SMK Kelas 11">Akuntansi Keuangan SMK Kelas 11</option>
                      <option value="Praktikum Perusahaan Dagang Kelas 11">Praktikum Perusahaan Dagang Kelas 11</option>
                      <option value="Akuntansi Manufaktur Kelas 12">Akuntansi Manufaktur Kelas 12</option>
                      <option value="Akuntansi Lembaga / Pemerintah Kelas 12">Akuntansi Lembaga / Pemerintah Kelas 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Jenis Dokumen</label>
                    <select
                      value={moduleType}
                      onChange={(e) => setModuleType(e.target.value)}
                      className="w-full bg-white rounded-xl p-2.5 text-xs border border-purple-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Modul Ajar Kurikulum Merdeka">Modul Ajar Kurikulum Merdeka</option>
                      <option value="Alur Tujuan Pembelajaran (ATP)">Alur Tujuan Pembelajaran (ATP)</option>
                      <option value="Soal Ujian & AKM Akuntansi">Soal Ujian & AKM Akuntansi</option>
                      <option value="Rubrik Penilaian Unjuk Kerja">Rubrik Penilaian Unjuk Kerja</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Topik Spesifik</label>
                    <input
                      type="text"
                      value={moduleTopic}
                      onChange={(e) => setModuleTopic(e.target.value)}
                      placeholder="Contoh: Jurnal Khusus Penjualan & Kas"
                      className="w-full bg-white rounded-xl p-2.5 text-xs border border-purple-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateTeacherModule}
                  disabled={isGeneratingModule}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs py-3 rounded-2xl shadow-[4px_4px_12px_rgba(115,85,220,0.4)] transition flex items-center justify-center gap-2"
                >
                  {isGeneratingModule ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      AKUNOVA AI sedang menyusun dokumen...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Buat Perangkat Pembelajaran Sekarang
                    </>
                  )}
                </button>
              </div>

              {/* Generated Result Output */}
              {generatedModule && (
                <div className="bg-[#f6f2fb] rounded-3xl p-5 shadow-[8px_8px_16px_#d1c7e0,-8px_-8px_16px_#ffffff] border border-white space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                    <span className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Hasil Perangkat Pembelajaran AI
                    </span>
                    <button
                      onClick={() => copyToClipboard(generatedModule)}
                      className="bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-200 shadow-sm flex items-center gap-1"
                    >
                      {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedNotification ? "Tersalin!" : "Salin Teks"}
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-4 font-mono text-xs leading-relaxed text-slate-800 max-h-96 overflow-y-auto whitespace-pre-wrap border border-purple-50 shadow-inner">
                    {generatedModule}
                  </div>
                </div>
              )}

              {/* Saved Modules History */}
              {savedModules.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Dokumen Tersimpan di Cloud Firestore</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedModules.map((doc) => (
                      <div key={doc.id} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-bold text-xs text-slate-800">{doc.title}</h5>
                          <p className="text-[10px] text-slate-500 mt-0.5">{doc.subject}</p>
                          <span className="inline-block text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md mt-2 font-bold">
                            {doc.type}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(doc.content)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl"
                          title="Salin Dokumen"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 5: ANALISIS & EVALUASI ================= */}
          {activeTab === 'analisis' && (
            <div className="space-y-5 overflow-y-auto pr-1">

              {/* Analytics Header Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#f6f2fb] rounded-2xl p-5 shadow-[6px_6px_12px_#d1c7e0,-6px_-6px_12px_#ffffff] border border-white">
                  <div className="text-xs text-slate-500 font-bold">Rata-Rata Nilai Kuis</div>
                  <div className="text-2xl font-extrabold text-purple-700 mt-1">92.4 / 100</div>
                  <div className="w-full bg-purple-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-purple-600 h-full w-[92%]" />
                  </div>
                </div>

                <div className="bg-[#f6f2fb] rounded-2xl p-5 shadow-[6px_6px_12px_#d1c7e0,-6px_-6px_12px_#ffffff] border border-white">
                  <div className="text-xs text-slate-500 font-bold">Tingkat Penguasaan Akun</div>
                  <div className="text-2xl font-extrabold text-emerald-600 mt-1">85% Tuntas</div>
                  <div className="w-full bg-emerald-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[85%]" />
                  </div>
                </div>

                <div className="bg-[#f6f2fb] rounded-2xl p-5 shadow-[6px_6px_12px_#d1c7e0,-6px_-6px_12px_#ffffff] border border-white">
                  <div className="text-xs text-slate-500 font-bold">Rekomendasi Fokus AI</div>
                  <div className="text-sm font-bold text-amber-700 mt-1">Jurnal Penyesuaian & Beban Dibayar Dimuka</div>
                  <p className="text-[10px] text-slate-500 mt-1">Perlu 2 kali latihan lagi untuk mencapai 100% tuntas.</p>
                </div>
              </div>

              {/* Visual Topic Breakdown List */}
              <div className="bg-[#f6f2fb] rounded-3xl p-5 shadow-[8px_8px_16px_#d1c7e0,-8px_-8px_16px_#ffffff] border border-white space-y-4">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-purple-600" />
                  Peta Penguasaan Materi Akuntansi SMK
                </h3>

                <div className="space-y-3">
                  {[
                    { topic: "Persamaan Dasar Akuntansi", progress: 95, status: "Sangat Kuat" },
                    { topic: "Jurnal Umum Perusahaan Jasa", progress: 88, status: "Kuat" },
                    { topic: "Jurnal Khusus Perusahaan Dagang", progress: 75, status: "Cukup" },
                    { topic: "Harga Pokok Produksi (Manufaktur)", progress: 60, status: "Perlu Latihan" }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-3.5 shadow-sm border border-purple-50">
                      <div className="flex justify-between items-center mb-1.5 text-xs">
                        <span className="font-bold text-slate-700">{item.topic}</span>
                        <span className="text-purple-700 font-extrabold">{item.progress}% ({item.status})</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 6: PENGATURAN API KEY ================= */}
          {activeTab === 'pengaturan' && (
            <div className="space-y-5 overflow-y-auto pr-1">
              <div className="bg-[#f6f2fb] rounded-3xl p-6 shadow-[8px_8px_16px_#d1c7e0,-8px_-8px_16px_#ffffff] border border-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Pengaturan Kunci API Gemini</h3>
                    <p className="text-xs text-slate-500">Kustomisasi API Key untuk integrasi langsung ke model Gemini 3 Flash.</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700 block">Kunci API Gemini (Opsional Override)</label>
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="Masukkan Gemini API Key kustom Anda..."
                    className="w-full bg-white rounded-2xl p-3 text-xs border border-purple-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    *Jika dikosongkan, aplikasi AKUNOVA AI akan menggunakan simulasi asisten lokal cerdas yang dikalibrasi khusus untuk kurikulum akuntansi SMK.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      alert("Pengaturan API tersimpan!");
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
                  >
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}