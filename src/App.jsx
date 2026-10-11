import { useEffect, useMemo, useState } from 'react';

const demoPatient = {
  name: 'Asha Nair',
  age: 63,
  dob: '1962-07-14',
  phone: '+91 98765 43210',
  email: 'asha@carebridge.demo',
  govId: 'ADHAR-XXXX-1234',
  allergies: ['Peanut allergy'],
  chronic: ['Hypertension', 'Asthma'],
  conditions: ['Type 2 Diabetes'],
  medications: [
    { name: 'Metformin', dose: '500mg', lastTaken: '2026-10-11 08:00', source: 'Digital prescription' },
    { name: 'Amlodipine', dose: '5mg', lastTaken: '2026-10-11 20:00', source: 'Clinic follow-up' },
  ],
  pastRecords: [
    { title: 'Preventive check-up', date: '2026-09-09', summary: 'Blood pressure stable; hydration review.' },
    { title: 'Vaccination update', date: '2026-08-20', summary: 'Annual influenza vaccine completed.' },
  ],
  emergencyContact: 'Rohan Nair - +91 99999 11111',
  location: 'Bengaluru, India',
  trustedSources: ['Rohan Nair', 'Dr. Maya Rao', 'St. Jude Clinic'],
  emergencySummary: 'Asthma trigger: cold weather; blood pressure monitor needed; diabetes medication schedule; no peanuts',
  cards: ['Primary Card', 'Caregiver Card'],
  preferredDisplay: 'Age + allergens + current meds + consent state',
};

const demoProvider = {
  name: 'Dr. Maya Rao',
  clinic: 'Aster Wellness Clinic',
  email: 'provider@carebridge.demo',
  phone: '+91 99800 11223',
  license: 'KMC-AL-8891',
  staff: [
    { id: 'STA-102', name: 'Nina', role: 'Nurse', email: 'nina@carebridge.demo' },
    { id: 'STA-205', name: 'Karan', role: 'Front Desk', email: 'karan@carebridge.demo' },
  ],
};

const initialProviderRequests = [
  { id: 'REQ-101', patient: 'Asha Nair', doctor: 'Dr. Maya Rao', date: '2026-10-12', slot: '10:30 AM', status: 'Pending' },
  { id: 'REQ-103', patient: 'Kabir Sen', doctor: 'Dr. Maya Rao', date: '2026-10-13', slot: '4:15 PM', status: 'Pending' },
];

const defaultAppointments = [
  { id: 'APT-100', doctor: 'Dr. Maya Rao', hospital: 'Aster Wellness Clinic', time: '2026-10-12 10:30', status: 'Approved' },
];

const defaultChat = [
  { sender: 'bot', text: 'Welcome to CareBridge. I can help with symptom triage, pharmacy lookups, and appointment planning.' },
];

const languageLabels = {
  en: {
    appName: 'CareBridge',
    patient: 'Patient',
    provider: 'Hospital/Clinic',
    login: 'Login',
    signUp: 'Create account',
    search: 'Search patient by phone',
    emergencyCard: 'Emergency Care Card',
    readAloud: 'Read aloud',
    sOSError: 'Offline SOS is ready',
    symptomChat: 'Symptom assistant',
    appointmentBooking: 'Book an appointment',
    records: 'Medical records',
    consent: 'Consent',
    updateRecords: 'Update records',
    profile: 'Profile',
    trustedSources: 'Trusted sources',
  },
  hi: {
    appName: 'केयरब्रिज',
    patient: 'रोगी',
    provider: 'अस्पताल/क्लिनिक',
    login: 'लॉगिन',
    signUp: 'खाता बनाएं',
    search: 'फोन नंबर से रोगी खोजें',
    emergencyCard: 'आपातकालीन कार्ड',
    readAloud: 'पढ़कर सुनाएं',
    sOSError: 'ऑफलाइन SOS तैयार है',
    symptomChat: 'लक्षण सहायक',
    appointmentBooking: 'अपॉइंटमेंट बुक करें',
    records: 'चिकित्सा रिकॉर्ड',
    consent: 'सहमति',
    updateRecords: 'रिकॉर्ड अपडेट करें',
    profile: 'प्रोफाइल',
    trustedSources: 'विश्वसनीय संपर्क',
  },
  bn: {
    appName: 'কেয়ারব্রিজ',
    patient: 'রোগী',
    provider: 'হাসপাতাল/ক্লিনিক',
    login: 'লগইন',
    signUp: 'অ্যাকাউন্ট তৈরি',
    search: 'ফোন নম্বর দিয়ে রোগী খুঁজুন',
    emergencyCard: 'জরুরী কার্ড',
    readAloud: 'পড়ে শুনান',
    sOSError: 'অফলাইনে SOS প্রস্তুত',
    symptomChat: 'লক্ষণ সহকারী',
    appointmentBooking: 'অ্যাপয়েন্টমেন্ট বুক করুন',
    records: 'চিকিৎসা রেকর্ড',
    consent: 'সম্মতি',
    updateRecords: 'রেকর্ড আপডেট',
    profile: 'প্রোফাইল',
    trustedSources: 'বিশ্বস্ত উৎস',
  },
};

function App() {
  const [role, setRole] = useState('patient');
  const [language, setLanguage] = useState('en');
  const [fontScale, setFontScale] = useState(100);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Asha Nair');
  const [loginError, setLoginError] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [consentStatus, setConsentStatus] = useState('Pending approval');
  const [currentTab, setCurrentTab] = useState('overview');
  const [symptomInput, setSymptomInput] = useState('');
  const [chatMessages, setChatMessages] = useState(defaultChat);
  const [appointmentStatus, setAppointmentStatus] = useState('No request yet');
  const [providerRequests, setProviderRequests] = useState(initialProviderRequests);
  const [selectedRecord, setSelectedRecord] = useState(demoPatient.pastRecords[0]);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [bioLock, setBioLock] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [displayField, setDisplayField] = useState('Age + medications + allergies');
  const [medicalHistoryDraft, setMedicalHistoryDraft] = useState('');
  const [providerDraft, setProviderDraft] = useState({
    treatment: 'Medication review',
    doctorId: 'DOC-903',
    staffId: 'STA-102',
    notes: 'Follow-up after blood pressure review',
  });

  const labels = languageLabels[language];

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', `${fontScale}%`);
  }, [fontScale]);

  const readAloud = (text) => {
    if (!('speechSynthesis' in window)) return;
    const message = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(message);
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = (formData.get('email') || '').toString().trim();
    const password = (formData.get('password') || '').toString();
    const isPatient = role === 'patient';

    if (isPatient) {
      if (email === 'patient@carebridge.demo' && password === 'care123') {
        setUserName(demoPatient.name);
        setIsLoggedIn(true);
        setLoginError('');
        return;
      }
    }

    if (!isPatient) {
      if (email === 'provider@carebridge.demo' && password === 'provider123') {
        setUserName(demoProvider.name);
        setIsLoggedIn(true);
        setLoginError('');
        return;
      }
    }

    setLoginError('Demo login failed. Use patient@carebridge.demo / care123 or provider@carebridge.demo / provider123');
  };

  const handleSymptomCheck = () => {
    const text = symptomInput.toLowerCase();
    let response = 'Please describe symptoms in more detail to assess urgency.';

    if (text.includes('chest pain') || text.includes('shortness of breath') || text.includes('severe dizziness')) {
      response = 'This looks critical. Seek urgent emergency care immediately and contact emergency support. Avoid driving yourself.';
    } else if (text.includes('fever') || text.includes('headache') || text.includes('cough')) {
      response = 'This may be manageable at home with rest, hydration, and monitoring. A virtual or in-person review is recommended.';
    } else {
      response = 'Your symptoms look stable but please keep an eye on them. Continue monitoring and contact a clinician if they worsen.';
    }

    setChatMessages((prev) => [...prev, { sender: 'user', text: symptomInput }, { sender: 'bot', text: response }]);
    setSymptomInput('');
  };

  const handleNearestPharmacy = () => {
    const result = ['MedPlus Pharmacy - 900m away', 'CareFirst Chemist - 1.4km away', 'City Health Store - 2.0km away'];
    setChatMessages((prev) => [...prev, { sender: 'bot', text: 'Nearest pharmacies: ' + result.join(' | ') }]);
  };

  const handleBookAppointment = () => {
    const status = 'Requested: Dr. Maya Rao, Aster Wellness Clinic, 2026-10-12 at 10:30 AM';
    setAppointmentStatus(status);
    setChatMessages((prev) => [...prev, { sender: 'bot', text: 'Appointment request has been sent. Provider confirmation is pending.' }]);
  };

  const handleProviderApproval = (id) => {
    setProviderRequests((prev) => prev.map((request) => request.id === id ? { ...request, status: 'Approved' } : request));
  };

  const handleConsentApprove = () => {
    setConsentStatus('Approved - view summary enabled');
  };

  const handleConsentDeny = () => {
    setConsentStatus('Denied - minimal records only');
  };

  const handleTreatmentsSubmit = (event) => {
    event.preventDefault();
    const item = {
      title: providerDraft.treatment,
      date: new Date().toISOString().slice(0, 10),
      summary: `${providerDraft.treatment} by ${providerDraft.doctorId} and ${providerDraft.staffId}. ${providerDraft.notes}`,
    };
    demoPatient.pastRecords.unshift(item);
    setSelectedRecord(item);
    setProviderDraft({
      treatment: '',
      doctorId: 'DOC-903',
      staffId: 'STA-102',
      notes: '',
    });
  };

  const urgentContext = useMemo(() => {
    const condition = demoPatient.chronic.join(', ');
    return `${demoPatient.name} • ${demoPatient.age} years • ${condition}`;
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="app-shell login-shell">
        <div className="login-card">
          <div className="brand-row">
            <div className="brand-icon">✚</div>
            <div>
              <div className="eyebrow">Healthcare access</div>
              <h1>{labels.appName}</h1>
            </div>
          </div>

          <div className="role-selector">
            <button className={role === 'patient' ? 'selected' : ''} onClick={() => setRole('patient')}>
              {labels.patient}
            </button>
            <button className={role === 'provider' ? 'selected' : ''} onClick={() => setRole('provider')}>
              {labels.provider}
            </button>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <label>
              Email / ID
              <input name="email" type="text" placeholder={role === 'patient' ? 'patient@carebridge.demo' : 'provider@carebridge.demo'} />
            </label>
            <label>
              Password
              <input name="password" type="password" placeholder="••••••••" />
            </label>

            <div className="demo-row">
              <span>Demo login:</span>
              <strong>{role === 'patient' ? 'patient@carebridge.demo / care123' : 'provider@carebridge.demo / provider123'}</strong>
            </div>

            {loginError ? <div className="error-box">{loginError}</div> : null}

            <button className="primary-btn" type="submit">{labels.login}</button>
          </form>

          <div className="registration-grid">
            <div className="mini-card">
              <h3>Patient sign-up</h3>
              <p>Phone number, gov ID, medical history, trusted contacts, emergency card.</p>
            </div>
            <div className="mini-card">
              <h3>Provider onboarding</h3>
              <p>Verify license, staff credentials, consented patient access, treatment updates.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell dashboard-shell" style={{ fontSize: `${fontScale}%` }}>
      <header className="topbar">
        <div className="brand-row">
          <div className="brand-icon">✚</div>
          <div>
            <div className="eyebrow">Healthcare access</div>
            <h2>{labels.appName}</h2>
          </div>
        </div>

        <div className="toolbar">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="bn">বাংলা</option>
          </select>
          <button className="soft-btn" onClick={() => setFontScale((value) => Math.min(value + 10, 180))}>A+</button>
          <button className="soft-btn" onClick={() => setFontScale((value) => Math.max(value - 10, 100))}>A-</button>
          <button className="soft-btn" onClick={() => readAloud('CareBridge dashboard is ready.')}>{labels.readAloud}</button>
          <button className="ghost-btn" onClick={() => setIsLoggedIn(false)}>Logout</button>
        </div>
      </header>

      {role === 'patient' ? (
        <main className="dashboard patient-dashboard">
          <aside className="left-panel">
            <div className="profile-pill">
              <div className="avatar">AN</div>
              <div>
                <strong>{userName}</strong>
                <small>Patient account</small>
              </div>
            </div>

            <nav className="side-nav">
              <button className={currentTab === 'overview' ? 'active' : ''} onClick={() => setCurrentTab('overview')}>Overview</button>
              <button className={currentTab === 'records' ? 'active' : ''} onClick={() => setCurrentTab('records')}>Records</button>
              <button className={currentTab === 'assistant' ? 'active' : ''} onClick={() => setCurrentTab('assistant')}>AI Assistant</button>
              <button className={currentTab === 'sos' ? 'active' : ''} onClick={() => setCurrentTab('sos')}>SOS</button>
            </nav>

            <div className="toggle-card">
              <label>
                <input type="checkbox" checked={bioLock} onChange={() => setBioLock((p) => !p)} />
                Biometric lock
              </label>
              <label>
                <input type="checkbox" checked={offlineMode} onChange={() => setOfflineMode((p) => !p)} />
                Offline SOS ready
              </label>
            </div>
          </aside>

          <section className="main-panel">
            <div className="grid-two">
              <div className="card emergency-card">
                <div className="card-head">
                  <h3>{labels.emergencyCard}</h3>
                  <span className="status-badge success">online</span>
                </div>
                <p className="card-details">{demoPatient.name} • {demoPatient.age} years • {demoPatient.emergencySummary}</p>
                <div className="chip-row">
                  {demoPatient.chronic.map((item) => <span key={item} className="chip">{item}</span>)}
                </div>
                <div className="meta-grid">
                  <div><span>DOB</span><strong>{demoPatient.dob}</strong></div>
                  <div><span>Gov ID</span><strong>{demoPatient.govId}</strong></div>
                  <div><span>Location</span><strong>{demoPatient.location}</strong></div>
                  <div><span>Now shown</span><strong>{displayField}</strong></div>
                </div>
                <div className="inline-actions">
                  <button className="primary-btn" onClick={() => setSosTriggered(true)}>SOS</button>
                  <select value={displayField} onChange={(e) => setDisplayField(e.target.value)}>
                    <option>Age + medications + allergies</option>
                    <option>Critical conditions + location</option>
                    <option>Minimal emergency summary</option>
                  </select>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>{labels.profile}</h3>
                  <span className="status-badge info">Synced</span>
                </div>
                <ul className="info-list">
                  <li>Phone: {demoPatient.phone}</li>
                  <li>Email: {demoPatient.email}</li>
                  <li>Trusted sources: {demoPatient.trustedSources.join(', ')}</li>
                  <li>Medical cards: {demoPatient.cards.join(', ')}</li>
                </ul>
              </div>
            </div>

            <div className="grid-two">
              <div className="card">
                <div className="card-head">
                  <h3>Current medications</h3>
                  <button className="soft-btn" onClick={() => readAloud('Medical summary includes Metformin and Amlodipine.')}>Read</button>
                </div>
                <ul className="med-list">
                  {demoPatient.medications.map((med) => (
                    <li key={med.name}>
                      <strong>{med.name}</strong>
                      <span>{med.dose}</span>
                      <small>Last: {med.lastTaken}</small>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>{labels.records}</h3>
                  <button className="soft-btn" onClick={() => setSelectedRecord(demoPatient.pastRecords[0])}>Latest</button>
                </div>
                <ul className="record-list">
                  {demoPatient.pastRecords.map((record) => (
                    <li key={record.title + record.date} className={selectedRecord.title === record.title ? 'selected' : ''} onClick={() => setSelectedRecord(record)}>
                      <strong>{record.title}</strong>
                      <span>{record.date}</span>
                    </li>
                  ))}
                </ul>
                <p className="record-summary">{selectedRecord.summary}</p>
              </div>
            </div>

            <div className="grid-two">
              <div className="card assistant-card">
                <div className="card-head">
                  <h3>{labels.symptomChat}</h3>
                  <button className="soft-btn" onClick={() => readAloud('AI symptom assistant ready.')}>Voice</button>
                </div>
                <div className="chat-box">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`chat-bubble ${msg.sender}`}>
                      {msg.text}
                    </div>
                  ))}
                </div>
                <div className="chat-actions">
                  <input value={symptomInput} onChange={(e) => setSymptomInput(e.target.value)} placeholder="Describe your symptoms..." />
                  <button className="primary-btn" onClick={handleSymptomCheck}>Check</button>
                </div>
                <div className="quick-actions">
                  <button className="soft-btn" onClick={handleNearestPharmacy}>Nearby pharmacy</button>
                  <button className="soft-btn" onClick={handleBookAppointment}>Book visit</button>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>{labels.appointmentBooking}</h3>
                  <span className="status-badge warning">{appointmentStatus}</span>
                </div>
                <ul className="appointments-list">
                  {defaultAppointments.map((apt) => (
                    <li key={apt.id}>
                      <strong>{apt.doctor}</strong>
                      <span>{apt.hospital}</span>
                      <small>{apt.time}</small>
                    </li>
                  ))}
                </ul>
                <div className="history-form">
                  <textarea
                    value={medicalHistoryDraft}
                    onChange={(e) => setMedicalHistoryDraft(e.target.value)}
                    placeholder="Add current or past medical history..."
                  />
                  <button className="soft-btn" onClick={() => setMedicalHistoryDraft('')}>Save history</button>
                </div>
              </div>
            </div>

            {sosTriggered ? (
              <div className="card sos-card">
                <div className="card-head">
                  <h3>{labels.sOSError}</h3>
                  <span className="status-badge alert">Live shared with trusted sources</span>
                </div>
                <p>{urgentContext}</p>
                <div className="chip-row">
                  {demoPatient.trustedSources.map((source) => <span key={source} className="chip">{source}</span>)}
                </div>
                <div className="inline-actions">
                  <button className="primary-btn" onClick={() => setSosTriggered(false)}>Acknowledge</button>
                  <button className="soft-btn" onClick={() => readAloud('Emergency contact broadcast sent to trusted sources and nearest clinic.')}>Notify</button>
                </div>
              </div>
            ) : null}
          </section>
        </main>
      ) : (
        <main className="dashboard provider-dashboard">
          <aside className="left-panel">
            <div className="profile-pill">
              <div className="avatar">MR</div>
              <div>
                <strong>{demoProvider.name}</strong>
                <small>{demoProvider.clinic}</small>
              </div>
            </div>

            <div className="provider-meta">
              <p>License: {demoProvider.license}</p>
              <p>Staff access: {demoProvider.staff.length}</p>
            </div>

            <div className="toggle-card">
              <label>
                <input type="checkbox" checked />
                Verified license
              </label>
              <label>
                <input type="checkbox" checked />
                Staff cards active
              </label>
            </div>
          </aside>

          <section className="main-panel">
            <div className="grid-two">
              <div className="card">
                <div className="card-head">
                  <h3>{labels.search}</h3>
                </div>
                <input
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="Enter patient phone or card ID"
                />
                <div className="mini-summary">
                  <p>Patient found: Asha Nair</p>
                  <p>Consent state: {consentStatus}</p>
                </div>
                <div className="inline-actions">
                  <button className="primary-btn" onClick={handleConsentApprove}>Approve access</button>
                  <button className="ghost-btn" onClick={handleConsentDeny}>Deny access</button>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>Patient summary</h3>
                </div>
                <ul className="info-list">
                  <li>Allergies: {demoPatient.allergies.join(', ')}</li>
                  <li>Chronic: {demoPatient.chronic.join(', ')}</li>
                  <li>Ongoing medication: {demoPatient.medications.map((item) => item.name).join(', ')}</li>
                  <li>Last digital record: {demoPatient.pastRecords[0].title}</li>
                </ul>
              </div>
            </div>

            <div className="grid-two">
              <div className="card">
                <div className="card-head">
                  <h3>{labels.updateRecords}</h3>
                </div>
                <form className="provider-form" onSubmit={handleTreatmentsSubmit}>
                  <label>
                    Treatment name
                    <input value={providerDraft.treatment} onChange={(e) => setProviderDraft({ ...providerDraft, treatment: e.target.value })} />
                  </label>
                  <label>
                    Verified doctor ID
                    <input value={providerDraft.doctorId} onChange={(e) => setProviderDraft({ ...providerDraft, doctorId: e.target.value })} />
                  </label>
                  <label>
                    Authorised staff ID
                    <input value={providerDraft.staffId} onChange={(e) => setProviderDraft({ ...providerDraft, staffId: e.target.value })} />
                  </label>
                  <label>
                    Notes
                    <textarea value={providerDraft.notes} onChange={(e) => setProviderDraft({ ...providerDraft, notes: e.target.value })} />
                  </label>
                  <button className="primary-btn" type="submit">Save record</button>
                </form>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>Appointment requests</h3>
                </div>
                <ul className="request-list">
                  {providerRequests.map((request) => (
                    <li key={request.id}>
                      <div>
                        <strong>{request.patient}</strong>
                        <span>{request.date} • {request.slot}</span>
                        <small>{request.status}</small>
                      </div>
                      <button className="soft-btn" onClick={() => handleProviderApproval(request.id)}>Approve</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
