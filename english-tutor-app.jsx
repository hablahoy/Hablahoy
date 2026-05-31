import { useState, useRef, useEffect } from "react";

// ── LEVELS ────────────────────────────────────────────────────────────────────
const LEVELS = [
  { id: "basic", label: "Basic", es: "Básico", color: "#70c870", desc: "Everyday conversational English", icon: "🟢" },
  { id: "advanced", label: "Advanced", es: "Avanzado", color: "#f5c842", desc: "Professional & trades English", icon: "🔵" },
  { id: "examprep", label: "Exam Prep", es: "Examen", color: "#e87070", desc: "Pass your licensing exam", icon: "🏆" },
];

// ── EXAM TRACKS ───────────────────────────────────────────────────────────────
const EXAM_TRACKS = [
  {
    id: "cdl", emoji: "🚛", title: "CDL Written Exam", es: "Examen escrito de CDL",
    desc: "Commercial Driver's License — pass the written test",
    color: "#f5c842",
    studyPrompt: `You are a bilingual CDL exam study coach for Spanish speakers. You know the entire CDL manual — traffic laws, vehicle inspection, air brakes, hazmat, pre-trip inspection, hours of service, and DOT regulations. Explain concepts in simple English with Spanish hints in parentheses. When the learner asks a question, answer clearly, use examples from real driving situations, and quiz them occasionally. Be encouraging and practical.`,
    simPrompt: `You are a strict but fair DOT officer conducting a CDL pre-trip inspection and oral exam. The learner is a Spanish-speaking truck driver candidate taking their CDL skills test. Ask them to identify vehicle components, explain safety procedures, and demonstrate knowledge of hours of service. Use real CDL exam language. Correct major errors. Be professional. Only speak as the DOT examiner.`,
    quizPrompt: `Generate a CDL written exam practice question in English. Make it realistic and based on actual CDL exam content (traffic laws, vehicle inspection, air brakes, hazmat, hours of service, pre-trip). Format EXACTLY as JSON: {"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A","explanation":"...","spanish_hint":"..."}. No extra text.`,
    vocab: [
      { en: "Pre-trip inspection", es: "Inspección previa al viaje", example: "You must complete a pre-trip inspection before every drive.", phonetic: "priː-trɪp ɪnˈspɛkʃən" },
      { en: "Air brake system", es: "Sistema de frenos de aire", example: "Check your air brake system before leaving the terminal.", phonetic: "ɛr breɪk ˈsɪstəm" },
      { en: "Hours of service", es: "Horas de servicio", example: "Federal hours of service rules limit your driving time.", phonetic: "ˈaʊərz əv ˈsɜːrvɪs" },
      { en: "Gross vehicle weight", es: "Peso bruto del vehículo", example: "The maximum gross vehicle weight is 80,000 pounds.", phonetic: "ɡroʊs ˈviːɪkl weɪt" },
      { en: "Hazardous materials", es: "Materiales peligrosos", example: "You need a hazmat endorsement to carry hazardous materials.", phonetic: "ˈhæzərdəs məˈtɪriəlz" },
      { en: "Right of way", es: "Derecho de paso", example: "At an intersection, yield the right of way to traffic.", phonetic: "raɪt əv weɪ" },
      { en: "Blind spot", es: "Punto ciego", example: "Always check your blind spots before changing lanes.", phonetic: "blaɪnd spɒt" },
      { en: "Jackknife", es: "Navaja / Doblar el camión", example: "Braking too hard can cause a tractor-trailer to jackknife.", phonetic: "ˈdʒæknaɪf" },
      { en: "Coupling system", es: "Sistema de acoplamiento", example: "Inspect the coupling system to ensure it is locked.", phonetic: "ˈkʌplɪŋ ˈsɪstəm" },
      { en: "Weigh station", es: "Báscula / Estación de pesaje", example: "All commercial trucks must stop at the weigh station.", phonetic: "weɪ ˈsteɪʃən" },
      { en: "Electronic logging device", es: "Dispositivo de registro electrónico", example: "Your electronic logging device must be working at all times.", phonetic: "ɪˌlɛkˈtrɒnɪk ˈlɒɡɪŋ dɪˈvaɪs" },
      { en: "Cargo securement", es: "Aseguramiento de carga", example: "Proper cargo securement prevents shifting during transport.", phonetic: "ˈkɑːrɡoʊ sɪˈkjʊərmənt" },
    ]
  },
  {
    id: "osha", emoji: "🦺", title: "OSHA 10 Certification", es: "Certificación OSHA 10",
    desc: "Workplace safety — required on most job sites",
    color: "#e8a530",
    studyPrompt: `You are a bilingual OSHA 10 safety certification study coach for Spanish speakers in construction and general industry. You know all OSHA standards — fall protection, electrical safety, PPE, hazard communication, scaffolding, trenching, fire safety, and emergency procedures. Explain in simple English with Spanish hints. Quiz the learner occasionally. Be practical and use real job site examples.`,
    simPrompt: `You are a strict OSHA compliance safety inspector conducting a surprise inspection at a construction site. The learner is a Spanish-speaking worker or supervisor being interviewed. Ask about safety procedures, PPE requirements, fall protection, chemical handling, and emergency procedures. Use real OSHA language and citation numbers when relevant. Be professional and thorough. Only speak as the OSHA inspector.`,
    quizPrompt: `Generate an OSHA 10 certification practice question in English. Base it on real OSHA exam content (fall protection, PPE, electrical safety, hazcom, scaffolding, trenching, fire safety). Format EXACTLY as JSON: {"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A","explanation":"...","spanish_hint":"..."}. No extra text.`,
    vocab: [
      { en: "Personal protective equipment", es: "Equipo de protección personal", example: "You must wear personal protective equipment at all times on site.", phonetic: "ˈpɜːrsənl prəˈtɛktɪv ɪˈkwɪpmənt" },
      { en: "Fall protection", es: "Protección contra caídas", example: "Fall protection is required when working above 6 feet.", phonetic: "fɔːl prəˈtɛkʃən" },
      { en: "Hazard communication", es: "Comunicación de peligros", example: "Hazard communication training is required for all workers.", phonetic: "ˈhæzərd kəˌmjuːnɪˈkeɪʃən" },
      { en: "Safety Data Sheet", es: "Hoja de datos de seguridad", example: "The Safety Data Sheet tells you how to handle chemicals safely.", phonetic: "ˈseɪfti ˈdeɪtə ʃiːt" },
      { en: "Lockout/tagout", es: "Bloqueo y etiquetado", example: "Always perform lockout/tagout before servicing machinery.", phonetic: "ˈlɒkaʊt ˈtæɡaʊt" },
      { en: "Scaffold", es: "Andamio", example: "The scaffold must be inspected before workers can use it.", phonetic: "ˈskæfəld" },
      { en: "Trenching and excavation", es: "Zanjas y excavación", example: "Trenching and excavation deeper than 5 feet requires shoring.", phonetic: "ˈtrɛntʃɪŋ ænd ˌɛkskəˈveɪʃən" },
      { en: "Electrical hazard", es: "Peligro eléctrico", example: "Stay at least 10 feet away from overhead electrical hazards.", phonetic: "ɪˈlɛktrɪkl ˈhæzərd" },
      { en: "Fire extinguisher", es: "Extintor de incendios", example: "Know where the fire extinguisher is before you start working.", phonetic: "faɪər ɪkˈstɪŋɡwɪʃər" },
      { en: "Incident report", es: "Reporte de incidente", example: "You must file an incident report within 24 hours of any accident.", phonetic: "ˈɪnsɪdənt rɪˈpɔːrt" },
      { en: "Competent person", es: "Persona competente", example: "A competent person must inspect the site daily.", phonetic: "ˈkɒmpɪtənt ˈpɜːrsən" },
      { en: "Right to know", es: "Derecho a saber", example: "Every worker has the right to know about chemical hazards.", phonetic: "raɪt tə noʊ" },
    ]
  },
  {
    id: "servsafe", emoji: "🍽️", title: "ServSafe Certification", es: "Certificación ServSafe",
    desc: "Food handler & manager — required in food service",
    color: "#70c870",
    studyPrompt: `You are a bilingual ServSafe food safety certification study coach for Spanish speakers working in restaurants, hotels, and food service. You know all ServSafe content — foodborne illness, temperature danger zones, cross-contamination, personal hygiene, HACCP, cleaning and sanitizing, pest control, and food storage. Explain in simple English with Spanish hints. Use real kitchen examples. Quiz occasionally.`,
    simPrompt: `You are a strict health department inspector conducting a surprise food safety inspection at a restaurant. The learner is a Spanish-speaking food service worker or manager being questioned. Ask about food temperatures, storage procedures, personal hygiene, cross-contamination prevention, and cleaning schedules. Use real food safety language. Be professional. Only speak as the health inspector.`,
    quizPrompt: `Generate a ServSafe food safety certification practice question in English. Base it on real ServSafe exam content (temperature danger zone, foodborne illness, cross-contamination, hygiene, HACCP, storage, sanitizing). Format EXACTLY as JSON: {"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A","explanation":"...","spanish_hint":"..."}. No extra text.`,
    vocab: [
      { en: "Temperature danger zone", es: "Zona de temperatura peligrosa", example: "Bacteria grow fastest in the temperature danger zone: 41°F to 135°F.", phonetic: "ˈtɛmprɪtʃər ˈdeɪndʒər zoʊn" },
      { en: "Cross-contamination", es: "Contaminación cruzada", example: "Use separate cutting boards to prevent cross-contamination.", phonetic: "krɒs kənˌtæmɪˈneɪʃən" },
      { en: "Food-borne illness", es: "Enfermedad transmitida por alimentos", example: "Improper cooking temperatures can cause food-borne illness.", phonetic: "fuːd-bɔːrn ˈɪlnɪs" },
      { en: "HACCP", es: "HACCP — Control de puntos críticos", example: "HACCP is a system to identify and control food safety hazards.", phonetic: "ˈhæsɪp" },
      { en: "Sanitize", es: "Sanitizar / Desinfectar", example: "You must sanitize all food contact surfaces after cleaning.", phonetic: "ˈsænɪtaɪz" },
      { en: "First in, first out", es: "Primero en entrar, primero en salir", example: "Always use first in, first out to rotate your food inventory.", phonetic: "fɜːrst ɪn fɜːrst aʊt" },
      { en: "Internal temperature", es: "Temperatura interna", example: "Chicken must reach an internal temperature of 165°F.", phonetic: "ɪnˈtɜːrnl ˈtɛmprɪtʃər" },
      { en: "Personal hygiene", es: "Higiene personal", example: "Good personal hygiene starts with proper hand washing.", phonetic: "ˈpɜːrsənl ˈhaɪdʒiːn" },
      { en: "TCS food", es: "Alimento de control de temperatura", example: "Meat, dairy, and eggs are TCS foods that need temperature control.", phonetic: "tiː siː ɛs fuːd" },
      { en: "Pest control", es: "Control de plagas", example: "A licensed pest control operator must treat the facility regularly.", phonetic: "pɛst kənˈtroʊl" },
      { en: "Allergen", es: "Alérgeno", example: "Always inform customers about food allergens in your dishes.", phonetic: "ˈælərдʒən" },
      { en: "Calibrate thermometer", es: "Calibrar termómetro", example: "Calibrate your thermometer daily for accurate temperature readings.", phonetic: "ˈkælɪbreɪt θərˈmɒmɪtər" },
    ]
  },
  {
    id: "nclex", emoji: "🩺", title: "NCLEX — Nursing Exam", es: "Examen NCLEX de Enfermería",
    desc: "Pass the nursing licensing exam — RN & LPN",
    color: "#7ac8f5",
    studyPrompt: `You are a bilingual NCLEX nursing exam study coach for Spanish-speaking nursing students. You know all NCLEX content — safe patient care, pharmacology, medical-surgical nursing, pediatrics, maternity, mental health, infection control, and prioritization. Explain in simple clear English with Spanish hints in parentheses. Use Maslow's hierarchy and the nursing process (ADPIE). Quiz the learner using NCLEX-style questions. Be warm, encouraging, and thorough. This exam determines their career.`,
    simPrompt: `You are a patient in a US hospital with a complex medical situation. The learner is a Spanish-speaking nursing student practicing professional clinical English for their NCLEX exam. Present realistic patient symptoms, ask nursing assessment questions, respond to interventions, and occasionally ask clarifying questions about medications and care. Use real medical terminology. Make it clinically realistic. Only speak as the patient or family member.`,
    quizPrompt: `Generate an NCLEX-style nursing practice question in English. Use realistic clinical scenarios. Cover NCLEX topics: safe care, infection control, pharmacology, med-surg, prioritization, therapeutic communication. Use NCLEX style (select all that apply OR multiple choice). Format EXACTLY as JSON: {"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A","explanation":"...","spanish_hint":"..."}. No extra text.`,
    vocab: [
      { en: "Assessment", es: "Evaluación / Valoración", example: "Begin with a head-to-toe assessment of the patient.", phonetic: "əˈsɛsmənt" },
      { en: "Nursing diagnosis", es: "Diagnóstico de enfermería", example: "The nursing diagnosis is impaired gas exchange.", phonetic: "ˈnɜːrsɪŋ ˌdaɪəɡˈnoʊsɪs" },
      { en: "Administer medication", es: "Administrar medicamento", example: "Verify allergies before you administer medication.", phonetic: "ədˈmɪnɪstər ˌmɛdɪˈkeɪʃən" },
      { en: "Informed consent", es: "Consentimiento informado", example: "The patient must sign informed consent before surgery.", phonetic: "ɪnˈfɔːrmd kənˈsɛnt" },
      { en: "Vital signs", es: "Signos vitales", example: "Take vital signs every 4 hours and document the results.", phonetic: "ˈvaɪtl saɪnz" },
      { en: "Airway, breathing, circulation", es: "Vía aérea, respiración, circulación", example: "Always prioritize airway, breathing, circulation — the ABCs.", phonetic: "ˈɛrweɪ ˈbriːðɪŋ ˌsɜːrkjʊˈleɪʃən" },
      { en: "Standard precautions", es: "Precauciones estándar", example: "Use standard precautions with every patient, every time.", phonetic: "ˈstændərd prɪˈkɔːʃənz" },
      { en: "Therapeutic communication", es: "Comunicación terapéutica", example: "Use therapeutic communication to build trust with patients.", phonetic: "ˌθɛrəˈpjuːtɪk kəˌmjuːnɪˈkeɪʃən" },
      { en: "Contraindication", es: "Contraindicación", example: "Aspirin is a contraindication for patients with bleeding disorders.", phonetic: "ˌkɒntrəˌɪndɪˈkeɪʃən" },
      { en: "IV infiltration", es: "Infiltración intravenosa", example: "Check the IV site for infiltration every hour.", phonetic: "aɪ viː ˌɪnfɪlˈtreɪʃən" },
      { en: "Discharge planning", es: "Planificación del alta", example: "Begin discharge planning on the day of admission.", phonetic: "ˈdɪstʃɑːrdʒ ˈplænɪŋ" },
      { en: "Scope of practice", es: "Alcance de la práctica", example: "Always stay within your scope of practice as a nurse.", phonetic: "skoʊp əv ˈpræktɪs" },
    ]
  },
  {
    id: "cna", emoji: "👩‍⚕️", title: "CNA Certification Exam", es: "Examen de Certificación CNA",
    desc: "Certified Nursing Assistant — care for patients with compassion",
    color: "#c890f0",
    studyPrompt: `You are a bilingual CNA certification exam study coach for Spanish speakers who want to become Certified Nursing Assistants. You know all CNA exam content — patient rights, basic nursing skills, personal care, vital signs, communication, infection control, safety, emergency procedures, and restorative care. Explain in simple English with Spanish hints. Use real nursing home and hospital examples. Be warm and encouraging — CNAs do incredibly important, caring work. Quiz occasionally.`,
    simPrompt: `You are an elderly patient in a nursing home or a supervising nurse. The learner is a Spanish-speaking CNA candidate practicing professional English for their certification exam. As a patient: ask for help with personal care, express needs and concerns, describe discomfort. As a nurse: give care instructions, ask about patient status, correct technique. Use realistic CNA vocabulary. Only speak as the patient or supervising nurse.`,
    quizPrompt: `Generate a CNA certification exam practice question in English. Use realistic nursing home or hospital scenarios. Cover CNA exam topics: patient rights, personal care, vital signs, infection control, safety, communication, restorative care, emergency procedures. Format EXACTLY as JSON: {"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A","explanation":"...","spanish_hint":"..."}. No extra text.`,
    vocab: [
      { en: "Patient rights", es: "Derechos del paciente", example: "Every patient has the right to privacy and dignity.", phonetic: "ˈpeɪʃənt raɪts" },
      { en: "Activities of daily living", es: "Actividades de la vida diaria", example: "Help the patient with activities of daily living like bathing and dressing.", phonetic: "ækˈtɪvɪtiz əv ˈdeɪli ˈlɪvɪŋ" },
      { en: "Range of motion", es: "Rango de movimiento", example: "Perform range of motion exercises to prevent stiffness.", phonetic: "reɪndʒ əv ˈmoʊʃən" },
      { en: "Bed sore / Pressure ulcer", es: "Úlcera por presión / Llaga", example: "Reposition the patient every 2 hours to prevent bed sores.", phonetic: "bɛd sɔːr / ˈprɛʃər ˈʌlsər" },
      { en: "Dignity and respect", es: "Dignidad y respeto", example: "Always treat patients with dignity and respect.", phonetic: "ˈdɪɡnɪti ænd rɪˈspɛkt" },
      { en: "Infection control", es: "Control de infecciones", example: "Wash your hands before and after every patient contact.", phonetic: "ɪnˈfɛkʃən kənˈtroʊl" },
      { en: "Vital signs", es: "Signos vitales", example: "Record vital signs accurately and report any changes immediately.", phonetic: "ˈvaɪtl saɪnz" },
      { en: "Catheter care", es: "Cuidado del catéter", example: "Proper catheter care prevents urinary tract infections.", phonetic: "ˈkæθɪtər kɛr" },
      { en: "Restraint", es: "Restricción física", example: "A restraint can only be used with a doctor's order.", phonetic: "rɪˈstreɪnt" },
      { en: "Incident report", es: "Reporte de incidente", example: "Any fall or injury must be documented in an incident report.", phonetic: "ˈɪnsɪdənt rɪˈpɔːrt" },
      { en: "Restorative care", es: "Cuidado restaurativo", example: "Restorative care helps patients regain their independence.", phonetic: "rɪˈstɔːrətɪv kɛr" },
      { en: "Observe and report", es: "Observar y reportar", example: "Your job is to observe and report changes to the nurse.", phonetic: "əbˈzɜːrv ænd rɪˈpɔːrt" },
    ]
  },
];

// ── BASIC SCENARIOS ───────────────────────────────────────────────────────────
const SCENARIOS = {
  basic: [
    { id: "cafe", emoji: "☕", title: "At the Café", es: "En el café", category: "Daily Life", description: "Order coffee and food", prompt: "You are a friendly barista at an American café. The learner is a Spanish speaker practicing basic English. Keep responses short and natural. Correct major errors gently. Speak only as the barista." },
    { id: "airport", emoji: "✈️", title: "At the Airport", es: "En el aeropuerto", category: "Daily Life", description: "Check in and ask for help", prompt: "You are an airline check-in agent at a US airport. The learner is a Spanish speaker practicing basic English. Keep it realistic. Correct major errors gently. Only speak as the agent." },
    { id: "job", emoji: "💼", title: "Job Interview", es: "Entrevista de trabajo", category: "Daily Life", description: "Practice interview answers", prompt: "You are a friendly HR interviewer. The learner is a Spanish speaker practicing basic English. Ask simple interview questions one at a time. Give brief feedback. Only speak as the interviewer." },
    { id: "doctor", emoji: "🏥", title: "Doctor's Office", es: "En el médico", category: "Daily Life", description: "Describe symptoms", prompt: "You are a friendly doctor at a US clinic. The learner is a Spanish speaker practicing basic English. Ask about symptoms naturally. Only speak as the doctor." },
    { id: "shopping", emoji: "🛍️", title: "Shopping", es: "De compras", category: "Daily Life", description: "Ask about prices and sizes", prompt: "You are a store assistant at an American shop. The learner is a Spanish speaker practicing basic English. Help them naturally. Only speak as the store assistant." },
    { id: "directions", emoji: "🗺️", title: "Asking Directions", es: "Pidiendo direcciones", category: "Daily Life", description: "Navigate around the city", prompt: "You are a helpful local on an American street. The learner is a Spanish speaker practicing basic English. Give simple directions. Only speak as the local." },
    { id: "farmers", emoji: "🌽", title: "Farmers Market", es: "Mercado", category: "Daily Life", description: "Shop and chat at the market", prompt: "You are a friendly vendor at an American farmers market. The learner is a Spanish speaker practicing basic English. Chat naturally about produce and prices. Only speak as the vendor." },
    { id: "uber", emoji: "🚗", title: "Uber/Lyft Driver", es: "Conductor de Uber/Lyft", category: "Daily Life", description: "Talk to passengers in English", prompt: "You are an American passenger in an Uber. The learner is a Spanish-speaking driver practicing basic English. Have a friendly natural conversation. Only speak as the passenger." },
    { id: "customer_service", emoji: "📞", title: "Customer Service", es: "Servicio al cliente", category: "Daily Life", description: "Handle calls and complaints", prompt: "You are a customer calling with a complaint. The learner is a Spanish speaker in customer service practicing basic English. Be realistic but patient. Only speak as the customer." },
    { id: "hospitality_basic", emoji: "🏨", title: "Hotel & Hospitality", es: "Hotelería", category: "Daily Life", description: "Serve guests at a hotel", prompt: "You are a hotel guest at an American hotel. The learner is a Spanish speaker in hospitality practicing basic English. Ask for basic things. Only speak as the guest." },
  ],
  advanced: [
    { id: "truck_basic", emoji: "🚛", title: "Truck Driver — Weigh Station", es: "Camionero — Báscula", category: "Trades", description: "Talk to DOT officers", prompt: "You are a DOT officer at a weigh station. The learner is a Spanish-speaking truck driver practicing professional English. Ask about logbooks, weight limits, and documentation. Use DOT vocabulary. Only speak as the officer." },
    { id: "truck_dispatch", emoji: "📡", title: "Truck Driver — Dispatch", es: "Camionero — Despacho", category: "Trades", description: "Communicate with dispatch", prompt: "You are a dispatcher at a trucking company. The learner is a Spanish-speaking truck driver practicing professional English. Give load and delivery information. Use trucking vocabulary. Only speak as the dispatcher." },
    { id: "nursing", emoji: "🩺", title: "Nursing — Patient Care", es: "Enfermería — Pacientes", category: "Healthcare", description: "Communicate with patients", prompt: "You are a patient in a US hospital. The learner is a Spanish-speaking nursing student practicing medical English. Describe symptoms, ask about medications. Use medical vocabulary. Only speak as the patient." },
    { id: "nursing_doctor", emoji: "👨‍⚕️", title: "Nursing — Doctor Communication", es: "Enfermería — Médicos", category: "Healthcare", description: "Report to doctors professionally", prompt: "You are a supervising doctor on rounds. The learner is a Spanish-speaking nurse practicing professional English. Ask for patient reports and vital signs. Use SBAR and clinical vocabulary. Only speak as the doctor." },
    { id: "electrician", emoji: "⚡", title: "Electrician — Job Site", es: "Electricista — Obra", category: "Trades", description: "Communicate on electrical job sites", prompt: "You are a site supervisor on an electrical job. The learner is a Spanish-speaking electrician practicing professional English. Discuss wiring, safety, and code compliance. Use NEC vocabulary. Only speak as the supervisor." },
    { id: "plumber", emoji: "🔧", title: "Plumber — Job Site", es: "Plomero — Obra", category: "Trades", description: "Discuss plumbing work professionally", prompt: "You are a building inspector. The learner is a Spanish-speaking plumber practicing professional English. Inspect plumbing work and ask about code compliance. Only speak as the inspector." },
    { id: "hvac", emoji: "❄️", title: "AC/HVAC Technician", es: "Técnico de HVAC", category: "Trades", description: "Diagnose and explain HVAC issues", prompt: "You are a Florida homeowner whose AC is broken. The learner is a Spanish-speaking HVAC technician practicing professional English. Describe the problem and discuss repairs. Use HVAC vocabulary. Only speak as the homeowner." },
    { id: "fpl", emoji: "💡", title: "FPL/Utility Worker", es: "Trabajador de utilidades", category: "Trades", description: "Safety protocols and work orders", prompt: "You are a safety supervisor at a power utility. The learner is a Spanish-speaking utility worker practicing professional English. Conduct a safety briefing and review work orders. Use utility vocabulary. Only speak as the supervisor." },
    { id: "handyman", emoji: "🔨", title: "Handyman — Client Jobs", es: "Mantenimiento — Clientes", category: "Trades", description: "Quote jobs and talk to clients", prompt: "You are an American homeowner needing repairs. The learner is a Spanish-speaking handyman practicing professional English. Discuss repairs, get a quote, agree on a schedule. Only speak as the homeowner." },
    { id: "hospitality_adv", emoji: "🌟", title: "Hospitality — VIP Service", es: "Hospitalidad avanzada", category: "Hospitality", description: "Handle VIP guests professionally", prompt: "You are a VIP guest at a luxury hotel with a serious complaint. The learner is a Spanish-speaking hospitality worker practicing professional English. Make realistic complaints. Use hospitality vocabulary. Only speak as the guest." },
  ],
};

// ── VOCAB SETS ────────────────────────────────────────────────────────────────
const VOCAB_SETS = {
  basic: [
    { id: "greetings", title: "Greetings", es: "Saludos", words: [
      { en: "Good morning", es: "Buenos días", example: "Good morning! How are you?", phonetic: "gʊd ˈmɔːrnɪŋ" },
      { en: "Nice to meet you", es: "Mucho gusto", example: "Nice to meet you, I'm Ana.", phonetic: "naɪs tə miːt juː" },
      { en: "How are you?", es: "¿Cómo estás?", example: "Hi! How are you today?", phonetic: "haʊ ɑːr juː" },
      { en: "See you later", es: "Hasta luego", example: "Goodbye! See you later!", phonetic: "siː juː ˈleɪtər" },
      { en: "You're welcome", es: "De nada", example: "Thank you! — You're welcome.", phonetic: "jʊər ˈwɛlkəm" },
      { en: "Excuse me", es: "Disculpe", example: "Excuse me, where is the bathroom?", phonetic: "ɪkˈskjuːz miː" },
    ]},
    { id: "work", title: "At Work", es: "En el trabajo", words: [
      { en: "I have a question", es: "Tengo una pregunta", example: "Hi, I have a question about the project.", phonetic: "aɪ hæv ə ˈkwɛstʃən" },
      { en: "Let me check", es: "Déjame verificar", example: "Let me check my schedule.", phonetic: "lɛt miː tʃɛk" },
      { en: "I'll get back to you", es: "Te respondo después", example: "I'll get back to you by Friday.", phonetic: "aɪl ɡɛt bæk tə juː" },
      { en: "Could you clarify?", es: "¿Podría aclarar?", example: "Could you clarify what you mean?", phonetic: "kʊd juː ˈklærɪfaɪ" },
      { en: "I agree", es: "Estoy de acuerdo", example: "I agree with your suggestion.", phonetic: "aɪ əˈɡriː" },
      { en: "That makes sense", es: "Tiene sentido", example: "Oh, that makes sense. Thank you!", phonetic: "ðæt meɪks sɛns" },
    ]},
    { id: "daily", title: "Daily Life", es: "Vida cotidiana", words: [
      { en: "Could I have the bill?", es: "¿Me trae la cuenta?", example: "Excuse me, could I have the bill please?", phonetic: "kʊd aɪ hæv ðə bɪl" },
      { en: "I'd like to order", es: "Quisiera ordenar", example: "Hi, I'd like to order a coffee please.", phonetic: "aɪd laɪk tə ˈɔːrdər" },
      { en: "What do you recommend?", es: "¿Qué recomienda?", example: "This is my first time. What do you recommend?", phonetic: "wɒt duː juː ˌrɛkəˈmɛnd" },
      { en: "Can I try it on?", es: "¿Puedo probármelo?", example: "I love this jacket. Can I try it on?", phonetic: "kæn aɪ traɪ ɪt ɒn" },
      { en: "What time does it open?", es: "¿A qué hora abre?", example: "What time does the museum open?", phonetic: "wɒt taɪm dʌz ɪt ˈoʊpən" },
      { en: "Is there a discount?", es: "¿Hay descuento?", example: "Is there a student discount?", phonetic: "ɪz ðɛr ə ˈdɪskaʊnt" },
    ]},
  ],
  advanced: [
    { id: "trucking", title: "Trucking", es: "Camionería", words: [
      { en: "Bill of lading", es: "Carta de porte", example: "Can I see your bill of lading for this shipment?", phonetic: "bɪl əv ˈleɪdɪŋ" },
      { en: "Hours of service", es: "Horas de servicio", example: "You must log your hours of service accurately.", phonetic: "ˈaʊərz əv ˈsɜːrvɪs" },
      { en: "Gross vehicle weight", es: "Peso bruto vehicular", example: "Your gross vehicle weight must not exceed 80,000 lbs.", phonetic: "ɡroʊs ˈviːɪkl weɪt" },
      { en: "Hazmat placard", es: "Etiqueta de materiales peligrosos", example: "Does your load require a hazmat placard?", phonetic: "ˈhæzmæt ˈplækɑːrd" },
      { en: "Lockout/tagout", es: "Bloqueo/etiquetado", example: "Always follow lockout/tagout before working on machinery.", phonetic: "ˈlɒkaʊt ˈtæɡaʊt" },
      { en: "Circuit breaker", es: "Interruptor de circuito", example: "The circuit breaker tripped — we need to reset it.", phonetic: "ˈsɜːrkɪt ˈbreɪkər" },
    ]},
    { id: "medical_adv", title: "Healthcare", es: "Salud", words: [
      { en: "Blood pressure", es: "Presión arterial", example: "The patient's blood pressure is 140 over 90.", phonetic: "blʌd ˈprɛʃər" },
      { en: "Vital signs", es: "Signos vitales", example: "Please take the patient's vital signs every hour.", phonetic: "ˈvaɪtl saɪnz" },
      { en: "Administer medication", es: "Administrar medicamento", example: "Verify allergies before you administer any medication.", phonetic: "ədˈmɪnɪstər ˌmɛdɪˈkeɪʃən" },
      { en: "Chief complaint", es: "Queja principal", example: "What is the patient's chief complaint today?", phonetic: "tʃiːf kəmˈpleɪnt" },
      { en: "Discharge instructions", es: "Instrucciones de alta", example: "Review the discharge instructions with the patient.", phonetic: "ˈdɪstʃɑːrdʒ ɪnˈstrʌkʃənz" },
      { en: "Patient is allergic to", es: "El paciente es alérgico a", example: "The patient is allergic to penicillin — note it on the chart.", phonetic: "ˈpeɪʃənt ɪz əˈlɜːrdʒɪk tuː" },
    ]},
  ],
};

// ── PRONUNCIATION ─────────────────────────────────────────────────────────────
const PRONUN_EXERCISES = [
  { id: "th", title: "The 'TH' Sound", es: "El sonido 'TH'", difficulty: "Hard", color: "#e87070", words: ["the", "this", "that", "think", "thank you", "three", "through"], tip: "Put your tongue between your teeth and blow air. ¡Pon la lengua entre los dientes y sopla!" },
  { id: "r", title: "American 'R'", es: "La 'R' americana", difficulty: "Hard", color: "#e87070", words: ["right", "really", "remember", "river", "red", "restaurant", "around"], tip: "Curl your tongue back slightly — don't trill like in Spanish. ¡No vibre la lengua!" },
  { id: "vowels", title: "Short Vowels", es: "Vocales cortas", difficulty: "Medium", color: "#e8a530", words: ["sit", "seat", "ship", "sheep", "bit", "beat", "live", "leave"], tip: "Short 'i' is like 'ee' but shorter and relaxed. Practice the contrast!" },
  { id: "endings", title: "Word Endings -ed", es: "Terminaciones -ed", difficulty: "Medium", color: "#e8a530", words: ["walked", "talked", "worked", "helped", "asked", "laughed", "watched"], tip: "The '-ed' sounds like 't' after most consonants. ¡Suena como 't' al final!" },
  { id: "contractions", title: "Contractions", es: "Contracciones", difficulty: "Easy", color: "#70c870", words: ["I'm", "you're", "it's", "don't", "can't", "I'll", "we're"], tip: "Use contractions to sound natural and fluent in spoken English!" },
];

// ── API ───────────────────────────────────────────────────────────────────────
async function callClaude(messages, systemPrompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: systemPrompt, messages }),
  });
  const data = await response.json();
  return data.content?.map(b => b.text || "").join("") || "Sorry, try again.";
}

function speak(text, rate = 0.88) {
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US"; utt.rate = rate; utt.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(v => v.lang === "en-US" && v.name.includes("Samantha"))
    || voices.find(v => v.lang === "en-US" && !v.name.includes("Google"))
    || voices.find(v => v.lang === "en-US");
  if (v) utt.voice = v;
  window.speechSynthesis.speak(utt);
  return utt;
}

function SpeakBtn({ text, rate }) {
  const [playing, setPlaying] = useState(false);
  return (
    <button className={`speak-btn ${playing ? "playing" : ""}`} onClick={e => {
      e.stopPropagation();
      setPlaying(true);
      const u = speak(text, rate);
      u.onend = u.onerror = () => setPlaying(false);
    }}>{playing ? "🔊" : "🔈"}</button>
  );
}

function useSpeechInput(onResult) {
  const [recording, setRecording] = useState(false);
  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input needs Chrome! ¡Necesitas Chrome!"); return; }
    const r = new SR(); r.lang = "en-US"; r.interimResults = false;
    r.onresult = e => { onResult(e.results[0][0].transcript); setRecording(false); };
    r.onerror = r.onend = () => setRecording(false);
    r.start(); setRecording(true);
  };
  return { recording, start };
}

// ── LEVEL SELECTOR ────────────────────────────────────────────────────────────
function LevelSelector({ level, setLevel, onExamSelect }) {
  return (
    <div className="level-selector">
      {LEVELS.map(l => (
        <button key={l.id}
          className={`level-btn ${level === l.id ? "active" : ""}`}
          style={level === l.id ? { borderColor: l.color, color: l.color } : {}}
          onClick={() => setLevel(l.id)}>
          <span className="level-icon">{l.icon}</span>
          <div>
            <div className="level-name">{l.label} · {l.es}</div>
            <div className="level-desc">{l.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── EXAM SELECTOR ─────────────────────────────────────────────────────────────
function ExamSelector({ onSelect }) {
  return (
    <div className="exam-selector">
      <p className="section-hint">Choose your exam · <em>Elige tu examen</em></p>
      <div className="exam-grid">
        {EXAM_TRACKS.map(ex => (
          <div key={ex.id} className="exam-card" style={{ borderColor: ex.color + "44" }} onClick={() => onSelect(ex)}>
            <div className="exam-emoji">{ex.emoji}</div>
            <div className="exam-title" style={{ color: ex.color }}>{ex.title}</div>
            <div className="exam-es">{ex.es}</div>
            <div className="exam-desc">{ex.desc}</div>
            <div className="exam-start" style={{ background: ex.color }}>Start Prep →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── QUIZ MODE ─────────────────────────────────────────────────────────────────
function QuizMode({ exam }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);

  const loadQuestion = async () => {
    setLoading(true); setSelected(null); setShowResult(false); setQuestion(null);
    const raw = await callClaude(
      [{ role: "user", content: "Generate one practice question now." }],
      exam.quizPrompt
    );
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setQuestion(parsed);
    } catch { setQuestion({ question: "Error loading question. Try again.", options: ["A) Try again"], correct: "A", explanation: "", spanish_hint: "" }); }
    setLoading(false);
  };

  const answer = (opt) => {
    if (selected) return;
    setSelected(opt);
    setShowResult(true);
    const letter = opt.charAt(0);
    setScore(s => ({ correct: s.correct + (letter === question.correct ? 1 : 0), total: s.total + 1 }));
  };

  useEffect(() => { loadQuestion(); }, []);

  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="quiz-container">
      <div className="quiz-score-bar">
        <div className="quiz-score-text">Score: {score.correct}/{score.total}</div>
        <div className="quiz-score-pct" style={{ color: pct >= 70 ? "#70c870" : "#e87070" }}>{score.total > 0 ? pct + "%" : "—"}</div>
        <div className="quiz-exam-name">{exam.emoji} {exam.title}</div>
      </div>

      {loading && <div className="quiz-loading">⏳ Generating question... / Generando pregunta...</div>}

      {question && !loading && (
        <div className="quiz-card">
          <div className="quiz-question">{question.question}</div>
          {question.spanish_hint && <div className="quiz-hint">💡 {question.spanish_hint}</div>}
          <div className="quiz-options">
            {question.options.map((opt, i) => {
              const letter = opt.charAt(0);
              let cls = "quiz-option";
              if (selected) {
                if (letter === question.correct) cls += " correct";
                else if (opt === selected) cls += " wrong";
                else cls += " dimmed";
              }
              return (
                <button key={i} className={cls} onClick={() => answer(opt)}>
                  {opt}
                </button>
              );
            })}
          </div>
          {showResult && (
            <div className={`quiz-result ${selected?.charAt(0) === question.correct ? "pass" : "fail"}`}>
              <div className="quiz-result-icon">{selected?.charAt(0) === question.correct ? "✅ Correct! ¡Correcto!" : "❌ Incorrect · Incorrecto"}</div>
              {question.explanation && <div className="quiz-explanation">{question.explanation}</div>}
              <button className="quiz-next" onClick={loadQuestion}>Next Question →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── EXAM PREP HUB ─────────────────────────────────────────────────────────────
function ExamPrepHub() {
  const [exam, setExam] = useState(null);
  const [examTab, setExamTab] = useState("study");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ got: 0, total: 0 });
  const [drillDone, setDrillDone] = useState(false);
  const [simMessages, setSimMessages] = useState([]);
  const [simInput, setSimInput] = useState("");
  const [simLoading, setSimLoading] = useState(false);
  const bottomRef = useRef();
  const simBottomRef = useRef();
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { simBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [simMessages]);
  const { recording: studyRec, start: startStudyRec } = useSpeechInput(t => setInput(t));
  const { recording: simRec, start: startSimRec } = useSpeechInput(t => setSimInput(t));

  const selectExam = (ex) => {
    setExam(ex);
    setExamTab("study");
    setMessages([{ role: "assistant", content: `¡Hola! I'm your ${ex.title} study coach 🎓\n\nI know everything on this exam. Ask me any question, and I'll explain it in clear English with Spanish hints.\n\n¿Por dónde empezamos? Where should we start?` }]);
    setSimMessages([]);
    setCardIdx(0); setFlipped(false); setScore({ got: 0, total: 0 }); setDrillDone(false);
  };

  const sendStudy = async () => {
    if (!input.trim() || loading) return;
    const next = [...messages, { role: "user", content: input }];
    setMessages(next); setInput(""); setLoading(true);
    const reply = await callClaude(next, exam.studyPrompt);
    setMessages(p => [...p, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  const startSim = async () => {
    if (simMessages.length > 0) return;
    setSimLoading(true);
    const reply = await callClaude([{ role: "user", content: "Start the scenario." }], exam.simPrompt + " Start naturally in 1-2 sentences.");
    setSimMessages([{ role: "assistant", content: reply }]);
    setSimLoading(false);
  };

  useEffect(() => { if (examTab === "sim" && simMessages.length === 0) startSim(); }, [examTab]);

  const sendSim = async () => {
    if (!simInput.trim() || simLoading) return;
    const next = [...simMessages, { role: "user", content: simInput }];
    setSimMessages(next); setSimInput(""); setSimLoading(true);
    const reply = await callClaude(next, exam.simPrompt);
    setSimMessages(p => [...p, { role: "assistant", content: reply }]);
    setSimLoading(false);
  };

  const card = exam?.vocab[cardIdx];
  const nextCard = (ok) => {
    setScore(s => ({ got: s.got + (ok ? 1 : 0), total: s.total + 1 }));
    setFlipped(false);
    if (cardIdx + 1 >= exam.vocab.length) setDrillDone(true);
    else setCardIdx(i => i + 1);
  };
  const restartDrill = () => { setCardIdx(0); setFlipped(false); setScore({ got: 0, total: 0 }); setDrillDone(false); };

  if (!exam) return <ExamSelector onSelect={selectExam} />;

  const EXAM_TABS = [
    { id: "study", icon: "🎓", label: "Study Coach" },
    { id: "vocab", icon: "🃏", label: "Exam Vocab" },
    { id: "sim", icon: "🎭", label: "Simulation" },
    { id: "quiz", icon: "❓", label: "Quiz Mode" },
  ];

  return (
    <div className="exam-hub">
      <div className="exam-header">
        <button className="back-btn" onClick={() => setExam(null)}>← Exams</button>
        <span style={{ color: exam.color }}>{exam.emoji} {exam.title}</span>
      </div>

      <div className="exam-tabs">
        {EXAM_TABS.map(t => (
          <button key={t.id} className={`exam-tab ${examTab === t.id ? "active" : ""}`}
            style={examTab === t.id ? { borderColor: exam.color, color: exam.color } : {}}
            onClick={() => setExamTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* STUDY COACH */}
      {examTab === "study" && (
        <div className="chat-container" style={{ height: "calc(100vh - 340px)" }}>
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                {m.role === "assistant" && <span className="avatar">🎓</span>}
                <div className="text">{m.content}{m.role === "assistant" && <SpeakBtn text={m.content} />}</div>
              </div>
            ))}
            {loading && <div className="bubble assistant"><span className="avatar">🎓</span><div className="text typing"><span/><span/><span/></div></div>}
            <div ref={bottomRef} />
          </div>
          <div className="input-row">
            <button className={`mic-btn ${studyRec ? "rec" : ""}`} onClick={startStudyRec}>{studyRec ? "⏹" : "🎤"}</button>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendStudy()} placeholder="Ask anything about the exam... / Pregunta lo que quieras..." disabled={loading} />
            <button className="send-btn" onClick={sendStudy} disabled={loading || !input.trim()}>Send</button>
          </div>
        </div>
      )}

      {/* VOCAB DRILLS */}
      {examTab === "vocab" && (
        <div className="vocab-container" style={{ marginTop: 12 }}>
          {drillDone ? (
            <div className="done-card">
              <div className="done-emoji">🎉</div>
              <div className="done-score">{score.got}/{score.total}</div>
              <div className="done-msg">{score.got === score.total ? "¡Perfecto! Ready for the exam!" : score.got >= score.total * 0.7 ? "¡Muy bien! Keep practicing!" : "¡Sigue estudiando! Keep going!"}</div>
              <button className="restart-btn" onClick={restartDrill}>Try Again</button>
            </div>
          ) : card ? (
            <>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(cardIdx / exam.vocab.length) * 100}%`, background: exam.color }} /></div>
              <div className="card-count">{cardIdx + 1} / {exam.vocab.length} · {exam.title}</div>
              <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(f => !f)}>
                <div className="card-front" style={{ borderColor: exam.color + "44" }}>
                  <div className="card-es">{card.es}</div>
                  <div className="card-hint">Tap to reveal · Toca para ver</div>
                </div>
                <div className="card-back">
                  <div className="card-en-row"><div className="card-en" style={{ color: exam.color }}>{card.en}</div><SpeakBtn text={card.en} /></div>
                  <div className="card-phonetic">{card.phonetic}</div>
                  <div className="card-example">"{card.example}"</div>
                </div>
              </div>
              {flipped && <div className="card-actions"><button className="btn-wrong" onClick={() => nextCard(false)}>✗ Need practice</button><button className="btn-right" onClick={() => nextCard(true)}>✓ Got it!</button></div>}
              {!flipped && <p className="flip-hint">👆 Tap the card to flip</p>}
            </>
          ) : null}
        </div>
      )}

      {/* SIMULATION */}
      {examTab === "sim" && (
        <div className="chat-container" style={{ height: "calc(100vh - 340px)" }}>
          <div className="sim-banner" style={{ background: exam.color + "22", borderColor: exam.color + "44" }}>
            🎭 You are being tested. Respond in professional English. / Responde en inglés profesional.
          </div>
          <div className="messages">
            {simMessages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                {m.role === "assistant" && <span className="avatar">{exam.emoji}</span>}
                <div className="text">{m.content}{m.role === "assistant" && <SpeakBtn text={m.content} />}</div>
              </div>
            ))}
            {simLoading && <div className="bubble assistant"><span className="avatar">{exam.emoji}</span><div className="text typing"><span/><span/><span/></div></div>}
            <div ref={simBottomRef} />
          </div>
          <div className="input-row">
            <button className={`mic-btn ${simRec ? "rec" : ""}`} onClick={startSimRec}>{simRec ? "⏹" : "🎤"}</button>
            <input value={simInput} onChange={e => setSimInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendSim()} placeholder="Respond in English..." disabled={simLoading} />
            <button className="send-btn" onClick={sendSim} disabled={simLoading || !simInput.trim()}>Send</button>
          </div>
        </div>
      )}

      {/* QUIZ */}
      {examTab === "quiz" && <QuizMode exam={exam} />}
    </div>
  );
}

// ── TUTOR CHAT ────────────────────────────────────────────────────────────────
function TutorChat({ level }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: level === "basic"
      ? "¡Hola! I'm your English tutor 🎓 Let's practice everyday English. Tap 🔈 to hear me!\n\nHow was your day?"
      : "¡Hola! I'm your Professional English coach 🎓 Let's practice workplace English.\n\nWhat is your profession or trade?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const { recording, start } = useSpeechInput(t => setInput(t));

  const systemPrompt = level === "basic"
    ? `You are a warm English tutor for Spanish speakers who need basic conversation practice. Have natural chats, gently correct errors by restating correctly, add Spanish hints in parentheses, keep replies 2-4 sentences, ask follow-up questions.`
    : `You are a professional English coach for Spanish-speaking tradespeople in the US. Help them practice workplace English and technical vocabulary. Correct errors professionally, introduce industry terms naturally, keep replies practical. Ask about their specific trade to tailor vocabulary.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const next = [...messages, { role: "user", content: input }];
    setMessages(next); setInput(""); setLoading(true);
    const reply = await callClaude(next, systemPrompt);
    setMessages(p => [...p, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.role === "assistant" && <span className="avatar">🎓</span>}
            <div className="text">{m.content}{m.role === "assistant" && <SpeakBtn text={m.content} />}</div>
          </div>
        ))}
        {loading && <div className="bubble assistant"><span className="avatar">🎓</span><div className="text typing"><span/><span/><span/></div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="input-row">
        <button className={`mic-btn ${recording ? "rec" : ""}`} onClick={start}>{recording ? "⏹" : "🎤"}</button>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type or tap 🎤 to speak..." disabled={loading} />
        <button className="send-btn" onClick={send} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}

// ── ROLEPLAY ──────────────────────────────────────────────────────────────────
function Roleplay({ level }) {
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const bottomRef = useRef();
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const { recording, start } = useSpeechInput(t => setInput(t));

  const scenarios = SCENARIOS[level];
  const categories = ["All", ...new Set(scenarios.map(s => s.category))];
  const filtered = categoryFilter === "All" ? scenarios : scenarios.filter(s => s.category === categoryFilter);

  const startScenario = async (s) => {
    setSelected(s); setMessages([]); setLoading(true);
    const reply = await callClaude([{ role: "user", content: "Start the scenario." }], s.prompt + " Start naturally in 1-2 sentences.");
    setMessages([{ role: "assistant", content: reply }]); setLoading(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const next = [...messages, { role: "user", content: input }];
    setMessages(next); setInput(""); setLoading(true);
    const reply = await callClaude(next, selected.prompt);
    setMessages(p => [...p, { role: "assistant", content: reply }]); setLoading(false);
  };

  if (!selected) return (
    <div>
      <p className="section-hint">{level === "basic" ? "Choose a daily life situation · Elige una situación" : "Choose a career scenario · Elige un escenario profesional"}</p>
      <div className="cat-filter">{categories.map(c => <button key={c} className={`cat-btn ${categoryFilter === c ? "active" : ""}`} onClick={() => setCategoryFilter(c)}>{c}</button>)}</div>
      <div className="scenario-grid">
        {filtered.map(s => (
          <div key={s.id} className="scenario-card" onClick={() => startScenario(s)}>
            <span className="s-emoji">{s.emoji}</span>
            <div><div className="s-title">{s.title}</div><div className="s-es">{s.es}</div><div className="s-desc">{s.description}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="chat-container">
      <div className="scenario-header">
        <button className="back-btn" onClick={() => setSelected(null)}>← Back</button>
        <span>{selected.emoji} {selected.title}</span>
      </div>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.role === "assistant" && <span className="avatar">{selected.emoji}</span>}
            <div className="text">{m.content}{m.role === "assistant" && <SpeakBtn text={m.content} />}</div>
          </div>
        ))}
        {loading && <div className="bubble assistant"><span className="avatar">{selected.emoji}</span><div className="text typing"><span/><span/><span/></div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="input-row">
        <button className={`mic-btn ${recording ? "rec" : ""}`} onClick={start}>{recording ? "⏹" : "🎤"}</button>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Respond in English..." disabled={loading} />
        <button className="send-btn" onClick={send} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}

// ── VOCAB DRILLS ──────────────────────────────────────────────────────────────
function VocabDrills({ level, vocabBank, setVocabBank }) {
  const sets = VOCAB_SETS[level];
  const [setIdx, setSetIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ got: 0, total: 0 });
  const [done, setDone] = useState(false);
  useEffect(() => { setSetIdx(0); setCardIdx(0); setFlipped(false); setDone(false); setScore({ got: 0, total: 0 }); }, [level]);

  const current = sets[setIdx];
  const card = current?.words[cardIdx];
  if (!current || !card) return null;

  const next = (ok) => { setScore(s => ({ got: s.got + (ok ? 1 : 0), total: s.total + 1 })); setFlipped(false); if (cardIdx + 1 >= current.words.length) setDone(true); else setCardIdx(i => i + 1); };
  const restart = () => { setCardIdx(0); setFlipped(false); setDone(false); setScore({ got: 0, total: 0 }); };
  const inBank = vocabBank.find(w => w.en === card.en);

  return (
    <div className="vocab-container">
      <div className="set-tabs">{sets.map((s, i) => <button key={s.id} className={`set-tab ${i === setIdx ? "active" : ""}`} onClick={() => { setSetIdx(i); restart(); }}>{s.title}</button>)}</div>
      {done ? (
        <div className="done-card"><div className="done-emoji">🎉</div><div className="done-score">{score.got}/{score.total}</div><div className="done-msg">{score.got === score.total ? "¡Perfecto!" : score.got >= score.total * 0.7 ? "¡Muy bien!" : "¡Sigue practicando!"}</div><button className="restart-btn" onClick={restart}>Try Again</button></div>
      ) : (
        <>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${(cardIdx / current.words.length) * 100}%` }} /></div>
          <div className="card-count">{cardIdx + 1} / {current.words.length}</div>
          <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(f => !f)}>
            <div className="card-front"><div className="card-es">{card.es}</div><div className="card-hint">Tap to reveal · Toca para ver</div></div>
            <div className="card-back">
              <div className="card-en-row"><div className="card-en">{card.en}</div><SpeakBtn text={card.en} /></div>
              <div className="card-phonetic">{card.phonetic}</div>
              <div className="card-example">"{card.example}"</div>
              <button className={`save-btn ${inBank ? "saved" : ""}`} onClick={e => { e.stopPropagation(); if (!inBank) setVocabBank(p => [...p, { ...card, addedAt: Date.now(), mastered: false }]); }}>{inBank ? "✓ Saved" : "+ Save to My Words"}</button>
            </div>
          </div>
          {flipped && <div className="card-actions"><button className="btn-wrong" onClick={() => next(false)}>✗ Need practice</button><button className="btn-right" onClick={() => next(true)}>✓ Got it!</button></div>}
          {!flipped && <p className="flip-hint">👆 Tap the card to flip</p>}
        </>
      )}
    </div>
  );
}

// ── PRONUNCIATION ─────────────────────────────────────────────────────────────
function PronunciationLab() {
  const [selected, setSelected] = useState(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loadingFb, setLoadingFb] = useState(false);
  const [recording, setRecording] = useState(false);
  const ex = selected;
  const word = ex?.words[wordIdx];

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice needs Chrome!"); return; }
    setTranscript(""); setFeedback(null);
    const r = new SR(); r.lang = "en-US"; r.interimResults = false;
    r.onresult = async e => {
      const said = e.results[0][0].transcript;
      const conf = e.results[0][0].confidence;
      setTranscript(said); setRecording(false); setLoadingFb(true);
      const fb = await callClaude([{ role: "user", content: `A Spanish speaker tried to say "${word}". They said: "${said}" (confidence: ${Math.round(conf * 100)}%). Give 2-3 sentences of friendly pronunciation coaching. Celebrate if close, give one specific tip if off. End with Spanish encouragement.` }], "You are a friendly English pronunciation coach for Spanish speakers. Be brief and encouraging.");
      setFeedback(fb); setLoadingFb(false);
    };
    r.onerror = r.onend = () => setRecording(false);
    r.start(); setRecording(true);
  };

  const navWord = (dir) => { setWordIdx(i => i + dir); setTranscript(""); setFeedback(null); };

  if (!selected) return (
    <div>
      <p className="section-hint">Practice tricky English sounds · <em>Practica los sonidos difíciles</em></p>
      <div className="pronun-grid">
        {PRONUN_EXERCISES.map(ex => (
          <div key={ex.id} className="pronun-card" onClick={() => { setSelected(ex); setWordIdx(0); setTranscript(""); setFeedback(null); }}>
            <div className="pronun-top"><div><div className="pronun-title">{ex.title}</div><div className="pronun-es">{ex.es}</div></div><span className="diff-badge" style={{ background: ex.color + "22", color: ex.color }}>{ex.difficulty}</span></div>
            <div className="pronun-preview">{ex.words.slice(0, 4).join(" · ")}...</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pronun-practice">
      <div className="scenario-header"><button className="back-btn" onClick={() => setSelected(null)}>← Back</button><span>{ex.title}</span></div>
      <div className="tip-box">💡 {ex.tip}</div>
      <div className="word-nav">{ex.words.map((w, i) => <button key={i} className={`word-pill ${i === wordIdx ? "active" : ""}`} onClick={() => navWord(i - wordIdx)}>{w}</button>)}</div>
      <div className="practice-card">
        <div className="practice-word">{word}</div>
        <div className="practice-actions"><button className="listen-btn" onClick={() => speak(word, 0.65)}>🔈 Slow</button><button className="listen-btn" onClick={() => speak(word, 1)}>🔊 Normal</button></div>
        <div className="record-area">
          <button className={`record-btn ${recording ? "rec-active" : ""}`} onClick={startRecording} disabled={recording || loadingFb}>{recording ? <><span className="rec-dot"/>Listening...</> : "🎤 Say it!"}</button>
          {transcript && <div className="transcript-box"><span className="transcript-label">You said: </span>"{transcript}"</div>}
          {loadingFb && <div className="feedback-loading">Analyzing... 🎧</div>}
          {feedback && <div className="feedback-box"><div className="feedback-label">🎓 Coach says:</div>{feedback}</div>}
        </div>
      </div>
      <div className="word-footer"><button className="nav-btn" disabled={wordIdx === 0} onClick={() => navWord(-1)}>← Prev</button><span className="word-counter">{wordIdx + 1} / {ex.words.length}</span><button className="nav-btn" disabled={wordIdx === ex.words.length - 1} onClick={() => navWord(1)}>Next →</button></div>
    </div>
  );
}

// ── VOCAB BUILDER ─────────────────────────────────────────────────────────────
function VocabBuilder({ vocabBank, setVocabBank }) {
  const [newEn, setNewEn] = useState(""); const [newEs, setNewEs] = useState(""); const [newEx, setNewEx] = useState("");
  const [adding, setAdding] = useState(false); const [looking, setLooking] = useState(false); const [filter, setFilter] = useState("all");

  const autoFill = async () => {
    if (!newEn.trim()) return; setLooking(true);
    const r = await callClaude([{ role: "user", content: `For English word/phrase "${newEn}", give Spanish translation and one short example. Reply ONLY as JSON: {"es":"...","example":"..."}` }], "You are a bilingual dictionary. Reply only with valid JSON, no markdown.");
    try { const p = JSON.parse(r.replace(/```json|```/g, "").trim()); setNewEs(p.es || ""); setNewEx(p.example || ""); } catch {}
    setLooking(false);
  };

  const addWord = () => { if (!newEn.trim()) return; setVocabBank(p => [...p, { en: newEn.trim(), es: newEs.trim(), example: newEx.trim(), addedAt: Date.now(), mastered: false }]); setNewEn(""); setNewEs(""); setNewEx(""); setAdding(false); };
  const filtered = filter === "all" ? vocabBank : filter === "mastered" ? vocabBank.filter(w => w.mastered) : vocabBank.filter(w => !w.mastered);

  return (
    <div className="builder-container">
      <div className="builder-stats">
        <div className="stat"><div className="stat-num">{vocabBank.length}</div><div className="stat-label">Total Words</div></div>
        <div className="stat"><div className="stat-num">{vocabBank.filter(w => w.mastered).length}</div><div className="stat-label">Mastered ⭐</div></div>
        <div className="stat"><div className="stat-num">{vocabBank.filter(w => !w.mastered).length}</div><div className
        "stat-label">Learning 📖</div></div>
      </div>
      {adding ? (
        <div className="add-form">
          <div className="add-row"><input className="add-input" placeholder="English word or phrase" value={newEn} onChange={e => setNewEn(e.target.value)} /><button className="lookup-btn" onClick={autoFill} disabled={looking || !newEn.trim()}>{looking ? "..." : "✨ Auto-fill"}</button></div>
          <input className="add-input" placeholder="Spanish translation" value={newEs} onChange={e => setNewEs(e.target.value)} />
          <input className="add-input" placeholder="Example sentence" value={newEx} onChange={e => setNewEx(e.target.value)} />
          <div className="add-btns"><button className="cancel-btn" onClick={() => { setAdding(false); setNewEn(""); setNewEs(""); setNewEx(""); }}>Cancel</button><button className="confirm-btn" onClick={addWord} disabled={!newEn.trim()}>Save Word</button></div>
        </div>
      ) : <button className="add-word-btn" onClick={() => setAdding(true)}>+ Add New Word · Agregar palabra</button>}
      <div className="filter-tabs">{["all","learning","mastered"].map(f => <button key={f} className={`filter-tab ${filter===f?"active":""}`} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>)}</div>
      {filtered.length === 0 ? (
        <div className="empty-bank">{vocabBank.length===0?<><div style={{fontSize:40}}>📚</div><p>Your word bank is empty!</p><p style={{fontSize:13,color:"#7a9ab5"}}>Save words from drills</p></>:<><div style={{fontSize:32}}>🔍</div><p>No words here</p></>}</div>
      ) : (
        <div className="word-list">
          {filtered.map((w,i) => (
            <div key={i} className={`word-item ${w.mastered?"mastered":""}`}>
              <div className="word-main"><div className="word-en-row"><span className="word-en">{w.en}</span><SpeakBtn text={w.en} /></div>{w.es&&<div className="word-es">{w.es}</div>}{w.example&&<div className="word-ex">"{w.example}"</div>}</div>
              <div className="word-actions">
                <button className={`master-btn ${w.mastered?"on":""}`} onClick={() => setVocabBank(p=>p.map((x,j)=>j===vocabBank.indexOf(w)?{...x,mastered:!x.mastered}:x))}>{w.mastered?"⭐":"☆"}</button>
                <button className="del-btn" onClick={() => setVocabBank(p=>p.filter((_,j)=>j!==vocabBank.indexOf(w)))}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: "tutor", icon: "🎓", label: "Tutor" },
  { id: "roleplay", icon: "🎭", label: "Roleplay" },
  { id: "vocab", icon: "🃏", label: "Drills" },
  { id: "pronunciation", icon: "🗣️", label: "Sounds" },
  { id: "builder", icon: "📚", label: "My Words" },
];

export default function App() {
  const [tab, setTab] = useState("tutor");
  const [level, setLevel] = useState("basic");
  const [vocabBank, setVocabBank] = useState([]);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#0f1923;color:#e8e0d5;min-height:100vh}
        .app{max-width:680px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column}
        .header{padding:14px 20px 10px;background:linear-gradient(180deg,#0a1219,#0f1923);border-bottom:1px solid #1e2d3d}
        .logo{font-family:'Fraunces',serif;font-size:22px;font-weight:900;color:#f5c842}
        .logo span{color:#e8e0d5}
        .tagline{font-size:11px;color:#7a9ab5;margin-top:1px}
        .level-selector{display:flex;gap:6px;padding:10px 14px;background:#0a1219;border-bottom:1px solid #1e2d3d;overflow-x:auto}
        .level-btn{flex:1;min-width:110px;display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:12px;border:1.5px solid #1e2d3d;background:transparent;color:#7a9ab5;cursor:pointer;transition:all 0.2s;text-align:left;font-family:'DM Sans',sans-serif}
        .level-btn.active{background:#1e2d3d}
        .level-btn:hover:not(.active){background:#151f2a}
        .level-icon{font-size:18px;flex-shrink:0}
        .level-name{font-size:12px;font-weight:600;line-height:1.2;color:#e8e0d5}
        .level-desc{font-size:10px;color:#4a6a85;margin-top:1px}
        .tabs{display:flex;gap:2px;padding:6px 10px;background:#0a1219;border-bottom:1px solid #1e2d3d;overflow-x:auto}
        .tab{flex:1;min-width:52px;padding:7px 4px;border:none;border-radius:9px;background:transparent;color:#7a9ab5;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;cursor:pointer;transition:all 0.2s;display:flex;flex-direction:column;align-items:center;gap:2px}
        .tab .tab-icon{font-size:16px}
        .tab.active{background:#1e2d3d;color:#f5c842}
        .content{flex:1;padding:14px;overflow-y:auto}
        .cat-filter{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
        .cat-btn{padding:5px 14px;background:#151f2a;border:1.5px solid #1e2d3d;border-radius:18px;color:#7a9ab5;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s}
        .cat-btn.active{background:#f5c842;color:#0a1219;border-color:#f5c842;font-weight:600}
        .chat-container{display:flex;flex-direction:column;height:calc(100vh - 255px)}
        .messages{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:11px;padding-bottom:10px}
        .bubble{display:flex;gap:9px;align-items:flex-start}
        .bubble.user{flex-direction:row-reverse}
        .avatar{font-size:19px;flex-shrink:0;margin-top:2px}
        .bubble .text{max-width:78%;padding:10px 13px;border-radius:17px;font-size:14px;line-height:1.55}
        .bubble.assistant .text{background:#1e2d3d;color:#e8e0d5;border-bottom-left-radius:4px}
        .bubble.user .text{background:#f5c842;color:#0a1219;border-bottom-right-radius:4px;font-weight:500}
        .typing{display:flex;gap:4px;align-items:center;min-width:36px}
        .typing span{width:6px;height:6px;background:#7a9ab5;border-radius:50%;animation:bounce 1.2s infinite}
        .typing span:nth-child(2){animation-delay:.2s}.typing span:nth-child(3){animation-delay:.4s}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
        .input-row{display:flex;gap:7px;margin-top:9px;align-items:center}
        .input-row input{flex:1;padding:11px 14px;border-radius:13px;border:1.5px solid #1e2d3d;background:#151f2a;color:#e8e0d5;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color .2s}
        .input-row input:focus{border-color:#f5c842}
        .input-row input::placeholder{color:#4a6a85}
        .send-btn{padding:11px 16px;background:#f5c842;color:#0a1219;border:none;border-radius:13px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;cursor:pointer}
        .send-btn:disabled{opacity:.4;cursor:not-allowed}
        .mic-btn{padding:11px;background:#1e2d3d;border:none;border-radius:11px;cursor:pointer;font-size:15px;flex-shrink:0}
        .mic-btn.rec{background:#c0392b;animation:pulse 1s infinite}
        .speak-btn{background:none;border:none;cursor:pointer;font-size:13px;opacity:.55;margin-left:5px;vertical-align:middle;padding:0}
        .speak-btn:hover,.speak-btn.playing{opacity:1}
        .scenario-header{display:flex;align-items:center;gap:9px;padding-bottom:11px;border-bottom:1px solid #1e2d3d;margin-bottom:11px;font-size:14px;color:#b8cfe0;flex-wrap:wrap}
        .back-btn{background:#1e2d3d;border:none;color:#f5c842;padding:5px 11px;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600}
        .section-hint{color:#7a9ab5;font-size:13px;margin-bottom:12px;line-height:1.5}
        .scenario-grid{display:flex;flex-direction:column;gap:8px}
        .scenario-card{display:flex;align-items:center;gap:13px;padding:13px 15px;background:#151f2a;border:1.5px solid #1e2d3d;border-radius:13px;cursor:pointer;transition:all .2s}
        .scenario-card:hover{border-color:#f5c842;background:#1a2635;transform:translateX(3px)}
        .s-emoji{font-size:27px;flex-shrink:0}
        .s-title{font-weight:600;font-size:14px;color:#e8e0d5}
        .s-es{font-size:11px;color:#7a9ab5}
        .s-desc{font-size:11px;color:#b8cfe0;margin-top:1px}
        .vocab-container{display:flex;flex-direction:column;align-items:center;gap:14px}
        .set-tabs{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;width:100%}
        .set-tab{padding:6px 13px;background:#151f2a;border:1.5px solid #1e2d3d;border-radius:18px;color:#7a9ab5;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;transition:all .2s}
        .set-tab.active{background:#f5c842;color:#0a1219;border-color:#f5c842;font-weight:600}
        .progress-bar{width:100%;height:4px;background:#1e2d3d;border-radius:2px}
        .progress-fill{height:100%;background:#f5c842;border-radius:2px;transition:width .4s}
        .card-count{font-size:12px;color:#7a9ab5;align-self:flex-end}
        .flashcard{width:100%;height:195px;perspective:1000px;cursor:pointer;position:relative;transform-style:preserve-3d;transition:transform .5s}
        .flashcard.flipped{transform:rotateY(180deg)}
        .card-front,.card-back{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:17px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:22px;text-align:center}
        .card-front{background:linear-gradient(135deg,#1e2d3d,#1a2533);border:2px solid #2a3d52}
        .card-back{background:linear-gradient(135deg,#2a1f08,#1e1608);border:2px solid #f5c84240;transform:rotateY(180deg)}
        .card-es{font-family:'Fraunces',serif;font-size:22px;font-weight:700;color:#e8e0d5}
        .card-hint{font-size:11px;color:#4a6a85;margin-top:9px}
        .card-en-row{display:flex;align-items:center;gap:7px}
        .card-en{font-family:'Fraunces',serif;font-size:22px;font-weight:700;color:#f5c842}
        .card-phonetic{font-size:11px;color:#7a9ab5;margin-top:3px;font-style:italic}
        .card-example{font-size:11px;color:#b8cfe0;margin-top:8px;font-style:italic}
        .save-btn{margin-top:9px;padding:4px 12px;border-radius:18px;border:1.5px solid #f5c84260;background:transparent;color:#f5c842;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif}
        .save-btn.saved{background:#f5c84220}
        .card-actions{display:flex;gap:9px;width:100%}
        .btn-wrong,.btn-right{flex:1;padding:11px;border:none;border-radius:13px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;cursor:pointer}
        .btn-wrong{background:#2a1f1f;color:#e87070;border:1.5px solid #3d2020}
        .btn-right{background:#1a2e1a;color:#70c870;border:1.5px solid #203d20}
        .flip-hint{font-size:12px;color:#4a6a85}
        .done-card{display:flex;flex-direction:column;align-items:center;gap:13px;padding:34px;background:#151f2a;border-radius:19px;border:2px solid #f5c84240;width:100%;text-align:center}
        .done-emoji{font-size:46px}
        .done-score{font-family:'Fraunces',serif;font-size:44px;font-weight:900;color:#f5c842}
        .done-msg{font-size:14px;color:#b8cfe0}
        .restart-btn{padding:10px 24px;background:#f5c842;color:#0a1219;border:none;border-radius:11px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;cursor:pointer}
        .pronun-grid{display:flex;flex-direction:column;gap:9px}
        .pronun-card{padding:15px;background:#151f2a;border:1.5px solid #1e2d3d;border-radius:13px;cursor:pointer;transition:all .2s}
        .pronun-card:hover{border-color:#f5c842;background:#1a2635}
        .pronun-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:7px}
        .pronun-title{font-weight:600;font-size:14px;color:#e8e0d5}
        .pronun-es{font-size:11px;color:#7a9ab5;margin-top:1px}
        .pronun-preview{font-size:12px;color:#7a9ab5}
        .diff-badge{padding:3px 9px;border-radius:18px;font-size:10px;font-weight:600}
        .tip-box{background:#1a2a1a;border:1.5px solid #2a4a2a;border-radius:11px;padding:11px 14px;font-size:13px;color:#90d890;line-height:1.5}
        .word-nav{display:flex;flex-wrap:wrap;gap:5px}
        .word-pill{padding:5px 12px;background:#1e2d3d;border:1.5px solid #2a3d52;border-radius:18px;color:#b8cfe0;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
        .word-pill.active{background:#f5c842;color:#0a1219;border-color:#f5c842;font-weight:600}
        .practice-card{background:#151f2a;border:2px solid #1e2d3d;border-radius:17px;padding:22px;text-align:center}
        .practice-word{font-family:'Fraunces',serif;font-size:34px;font-weight:900;color:#f5c842;margin-bottom:14px}
        .practice-actions{display:flex;gap:9px;justify-content:center;margin-bottom:18px}
        .listen-btn{padding:8px 16px;background:#1e2d3d;border:1.5px solid #2a3d52;border-radius:9px;color:#e8e0d5;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
        .listen-btn:hover{border-color:#f5c842;color:#f5c842}
        .record-area{display:flex;flex-direction:column;align-items:center;gap:11px}
        .record-btn{padding:13px 28px;background:#c0392b;border:none;border-radius:13px;color:white;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;align-items:center;gap:7px}
        .record-btn.rec-active{background:#922b21;animation:pulse 1s infinite}
        .record-btn:disabled{opacity:.5;cursor:not-allowed}
        .rec-dot{width:9px;height:9px;background:white;border-radius:50%;animation:pulse .8s infinite}
        .transcript-box{background:#1e2d3d;border-radius:9px;padding:9px 13px;font-size:13px;color:#b8cfe0;width:100%}
        .transcript-label{color:#7a9ab5;font-size:11px}
        .feedback-loading{color:#7a9ab5;font-size:13px}
        .feedback-box{background:#1a2a3a;border:1.5px solid #2a4a6a;border-radius:11px;padding:13px;font-size:13px;color:#b8cfe0;line-height:1.6;width:100%;text-align:left}
        .feedback-label{font-weight:600;color:#f5c842;margin-bottom:5px;font-size:11px}
        .word-footer{display:flex;justify-content:space-between;align-items:center}
        .word-counter{font-size:13px;color:#7a9ab5}
        .nav-btn{padding:7px 14px;background:#1e2d3d;border:1.5px solid #2a3d52;border-radius:9px;color:#e8e0d5;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif}
        .nav-btn:disabled{opacity:.3;cursor:not-allowed}
        .pronun-practice{display:flex;flex-direction:column;gap:13px}
        .builder-container{display:flex;flex-direction:column;gap:13px}
        .builder-stats{display:flex;gap:9px}
        .stat{flex:1;background:#151f2a;border:1.5px solid #1e2d3d;border-radius:13px;padding:13px;text-align:center}
        .stat-num{font-family:'Fraunces',serif;font-size:26px;font-weight:900;color:#f5c842}
        .stat-label{font-size:11px;color:#7a9ab5;margin-top:1px}
        .add-word-btn{width:100%;padding:12px;background:#1e2d3d;border:2px dashed #2a3d52;border-radius:13px;color:#f5c842;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer}
        .add-form{background:#151f2a;border:1.5px solid #1e2d3d;border-radius:13px;padding:14px;display:flex;flex-direction:column;gap:9px}
        .add-row{display:flex;gap:7px}
        .add-input{flex:1;padding:9px 13px;border-radius:9px;border:1.5px solid #1e2d3d;background:#0f1923;color:#e8e0d5;font-family:'DM Sans',sans-serif;font-size:13px;outline:none}
        .add-input:focus{border-color:#f5c842}
        .add-input::placeholder{color:#4a6a85}
        .lookup-btn{padding:9px 13px;background:#1e3a5a;border:1.5px solid #2a5a8a;border-radius:9px;color:#7ac8f5;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap}
        .lookup-btn:disabled{opacity:.4}
        .add-btns{display:flex;gap:7px}
        .cancel-btn{flex:1;padding:9px;background:transparent;border:1.5px solid #2a3d52;border-radius:9px;color:#7a9ab5;font-family:'DM Sans',sans-serif;cursor:pointer}
        .confirm-btn{flex:1;padding:9px;background:#f5c842;border:none;border-radius:9px;color:#0a1219;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer}
        .confirm-btn:disabled{opacity:.4}
        .filter-tabs{display:flex;gap:6px}
        .filter-tab{flex:1;padding:7px;background:#151f2a;border:1.5px solid #1e2d3d;border-radius:9px;color:#7a9ab5;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
        .filter-tab.active{background:#1e2d3d;color:#f5c842;border-color:#f5c842;font-weight:600}
        .word-list{display:flex;flex-direction:column;gap:7px}
        .word-item{display:flex;justify-content:space-between;align-items:center;padding:13px;background:#151f2a;border:1.5px solid #1e2d3d;border-radius:13px}
        .word-item.mastered{border-color:#f5c84240;background:#1e1e0a}
        .word-main{flex:1}
        .word-en-row{display:flex;align-items:center;gap:5px}
        .word-en{font-weight:600;font-size:14px;color:#e8e0d5}
        .word-es{font-size:12px;color:#7a9ab5;margin-top:2px}
        .word-ex{font-size:11px;color:#4a6a85;font-style:italic;margin-top:2px}
        .word-actions{display:flex;gap:5px;flex-shrink:0}
        .master-btn{background:none;border:none;font-size:17px;cursor:pointer;opacity:.45}
        .master-btn.on{opacity:1}
        .del-btn{background:none;border:none;font-size:13px;cursor:pointer;color:#4a6a85;padding:3px}
        .del-btn:hover{color:#e87070}
        .empty-bank{display:flex;flex-direction:column;align-items:center;gap:7px;padding:44px 20px;color:#b8cfe0;font-size:14px;text-align:center}
        .exam-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .exam-card{display:flex;flex-direction:column;align-items:center;text-align:center;padding:18px 14px;background:#151f2a;border:1.5px solid #1e2d3d;border-radius:16px;cursor:pointer;transition:all .2s;gap:5px}
        .exam-card:hover{background:#1a2635;transform:translateY(-3px)}
        .exam-emoji{font-size:32px}
        .exam-title{font-size:14px;font-weight:800}
        .exam-es{font-size:11px;color:#7a9ab5}
        .exam-desc{font-size:12px;color:#b8cfe0;line-height:1.4}
        .exam-start{padding:7px 18px;border-radius:20px;color:#0a1219;font-size:12px;font-weight:700;margin-top:4px;font-family:'DM Sans',sans-serif}
        .exam-hub{display:flex;flex-direction:column;gap:12px}
        .exam-header{display:flex;align-items:center;gap:10px;padding-bottom:10px;border-bottom:1px solid #1e2d3d;font-size:15px;font-weight:700}
        .exam-tabs{display:flex;gap:6px;flex-wrap:wrap}
        .exam-tab{flex:1;min-width:70px;padding:8px 6px;background:#151f2a;border:1.5px solid #1e2d3d;border-radius:10px;color:#7a9ab5;font-size:11px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;text-align:center;display:flex;align-items:center;justify-content:center;gap:4px}
        .exam-tab.active{background:#1e2d3d}
        .sim-banner{border-radius:10px;padding:10px 14px;font-size:12px;color:#b8cfe0;border:1px solid;margin-bottom:10px;text-align:center}
        .quiz-container{display:flex;flex-direction:column;gap:14px}
        .quiz-score-bar{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#151f2a;border-radius:12px;border:1px solid #1e2d3d}
        .quiz-score-text{font-size:13px;color:#7a9ab5}
        .quiz-score-pct{font-family:'Fraunces',serif;font-size:22px;font-weight:900}
        .quiz-exam-name{font-size:11px;color:#7a9ab5;margin-left:auto}
        .quiz-loading{text-align:center;padding:40px;color:#7a9ab5;font-size:14px}
        .quiz-card{background:#151f2a;border:1.5px solid #1e2d3d;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:14px}
        .quiz-question{font-size:15px;color:#e8e0d5;line-height:1.6;font-weight:600}
        .quiz-hint{font-size:12px;color:#7a9ab5;font-style:italic;padding:8px 12px;background:#1e2d3d;border-radius:8px}
        .quiz-options{display:flex;flex-direction:column;gap:8px}
        .quiz-option{padding:12px 16px;background:#1e2d3d;border:1.5px solid #2a3d52;border-radius:11px;color:#e8e0d5;font-size:14px;cursor:pointer;font-family:'DM Sans',sans-serif;text-align:left;transition:all .2s}
        .quiz-option:hover:not(.correct):not(.wrong):not(.dimmed){border-color:#f5c842;background:#1a2635}
        .quiz-option.correct{background:#1a2e1a;border-color:#70c870;color:#70c870}
        .quiz-option.wrong{background:#2a1f1f;border-color:#e87070;color:#e87070}
        .quiz-option.dimmed{opacity:.4}
        .quiz-result{padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:8px}
        .quiz-result.pass{background:#1a2e1a;border:1px solid #70c87040}
        .quiz-result.fail{background:#2a1f1f;border:1px solid #e8707040}
        .quiz-result-icon{font-size:14px;font-weight:700}
        .quiz-explanation{font-size:13px;color:#b8cfe0;line-height:1.5}
        .quiz-next{padding:10px 20px;background:#f5c842;color:#0a1219;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:13px;cursor:pointer;align-self:flex-start}
      `}</style>
      <div className="app">
        <div className="header">
          <div className="logo">Habla<span>Hoy</span> 🇺🇸</div>
          <div className="tagline">English for Spanish speakers · Inglés para hispanohablantes</div>
        </div>
        <LevelSelector level={level} setLevel={setLevel} />
        {level !== "examprep" && (
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.id} className={`tab ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>
                <span className="tab-icon">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        )}
        <div className="content">
          {level === "examprep" ? <ExamPrepHub /> : (
            <>
              {tab === "tutor" && <TutorChat level={level} />}
              {tab === "roleplay" && <Roleplay level={level} />}
              {tab === "vocab" && <VocabDrills level={level} vocabBank={vocabBank} setVocabBank={setVocabBank} />}
              {tab === "pronunciation" && <PronunciationLab />}
              {tab === "builder" && <VocabBuilder vocabBank={vocabBank} setVocabBank={setVocabBank} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}
