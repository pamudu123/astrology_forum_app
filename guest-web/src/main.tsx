import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import flatpickr from 'flatpickr';
// @ts-ignore
import { Sinhala } from 'flatpickr/dist/l10n/si.js';
import 'flatpickr/dist/flatpickr.min.css';
import './styles.css';

type Language = 'en' | 'si';
type FormType = 'hadahan' | 'porondam';
type Mode = 'welcome' | 'guest' | 'admin';
type Role = 'ADMIN' | 'USER';
type AccountStatus = 'PENDING' | 'ACTIVE';
type RequestStatus = 'NEW' | 'ON_HOLD' | 'DONE' | 'CANCELLED';
type ApiFormType = 'HADAHAN' | 'PORONDAM';
type Source = 'GUEST' | 'USER';

type User = {
  user_id: string;
  full_name: string;
  username: string;
  role: Role;
  account_status: AccountStatus;
};

type AuthState = {
  token: string;
  user: User;
};

type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

type RequestSummary = {
  request_number: string;
  form_type: ApiFormType;
  submitted_by: string;
  source: Source;
  submitted_date: string;
  submitted_time: string;
  status: RequestStatus;
};

type RequestDetail = RequestSummary & {
  data: Record<string, any>;
  admin_note: string | null;
  last_updated: string | null;
};

type DashboardCounts = {
  total_requests: number;
  new_requests: number;
  on_hold_requests: number;
  completed_requests: number;
  cancelled_requests: number;
  hadahan_requests: number;
  porondam_requests: number;
  guest_submissions: number;
  registered_user_submissions: number;
  recent_requests: RequestSummary[];
};

const DEPLOYED_API_URL = 'https://swasthi-life-backend.vercel.app';
const API_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL || DEPLOYED_API_URL;
const STORAGE_AUTH_KEY = 'guest_web_auth';

const empty = {
  full_name: '',
  address: '',
  contact_number: '',
  additional_contact_number: '',
  date_of_birth: '',
  time_of_birth: '',
  place_of_birth: '',
  additional_notes: '',
  contact_person_name: '',
  girl_full_name: '',
  girl_date_of_birth: '',
  girl_time_of_birth: '',
  girl_place_of_birth: '',
  boy_full_name: '',
  boy_date_of_birth: '',
  boy_time_of_birth: '',
  boy_place_of_birth: '',
};

const copy = {
  en: {
    title: 'Swasthi Life',
    guestForms: 'Guest Forms',
    admin: 'Admin',
    login: 'Log In',
    continue: 'Continue',
    createPassword: 'Create Password',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    welcome: 'Welcome',
    hadahan: 'Hadahan Form',
    porondam: 'Porondam Form',
    fullName: 'Full Name',
    contactPerson: 'Contact Person Name',
    address: 'Address',
    contact: 'Contact Number',
    extraContact: 'Additional Contact Number',
    dob: 'Date of Birth',
    tob: 'Time of Birth',
    pob: 'Place of Birth',
    notes: 'Additional Notes',
    girlName: 'Girl Full Name',
    girlDob: 'Girl Date of Birth',
    girlTob: 'Girl Time of Birth',
    girlPob: 'Girl Place of Birth',
    boyName: 'Boy Full Name',
    boyDob: 'Boy Date of Birth',
    boyTob: 'Boy Time of Birth',
    boyPob: 'Boy Place of Birth',
    submit: 'Submit Form',
    success: 'Your form has been submitted successfully.',
    requestNumber: 'Request Number',
    another: 'Submit Another Form',
    contactSection: 'Contact & Additional Info',
    girlSection: 'Girl Details',
    boySection: 'Boy Details',
    selectPrompt: '-- Select --',
    clear: 'Clear',
    back: 'Back',
    logout: 'Log Out',
    appInfo: 'App Info',
    requests: 'Requests',
    dashboard: 'Dashboard',
    version: 'Version',
    lastUpdate: 'Last Update',
    history: 'History',
    filter24h: 'Last 24H',
    filterWeek: 'Last Week',
    filterMonth: 'Last Month',
    filterAll: 'All',
    noRequests: 'No requests yet.',
    adminNote: 'Admin Note',
    deleteRequest: 'Delete',
    deleteConfirm: 'Delete this request permanently?',
    deleteSuccess: 'Request deleted successfully.',
    done: 'Done',
    hold: 'On Hold',
    cancel: 'Cancel',
    close: 'Close',
    accessDenied: 'This account cannot access this web area.',
    signedInAs: 'Signed in as',
    total: 'Total',
    newLabel: 'New',
    completed: 'Completed',
    cancelled: 'Cancelled',
    guest: 'Guest',
    registeredUsers: 'Registered Users',
    infoText: 'Swasthi Life form app for Hadahan and Porondam requests.',
    loading: 'Loading...',
    review: 'Review',
    edit: 'Edit',
    next: 'Next',
    welcomeTitle: 'Welcome to Swasthi Life',
    welcomeSubtitle: 'Select how you want to proceed',
    adminLogin: 'Admin Login',
    personalSection: 'Personal & Birth Details',
  },
  si: {
    title: 'ස්වස්ති ලයිෆ්',
    guestForms: 'අමුත්තන්ගේ පෝරම',
    admin: 'පරිපාලක',
    login: 'ප්‍රවිෂ්ට වන්න',
    continue: 'ඉදිරියට',
    createPassword: 'මුරපදයක් සාදන්න',
    username: 'පරිශීලක නාමය',
    password: 'මුරපදය',
    confirmPassword: 'මුරපදය තහවුරු කරන්න',
    welcome: 'ආයුබෝවන්',
    hadahan: 'හඳහන් පෝරමය',
    porondam: 'පොරොන්දම් පෝරමය',
    fullName: 'සම්පූර්ණ නම',
    contactPerson: 'සම්බන්ධ කරගත යුතු පුද්ගලයාගේ නම',
    address: 'ලිපිනය',
    contact: 'දුරකථන අංකය',
    extraContact: 'අමතර දුරකථන අංකය',
    dob: 'උපන් දිනය',
    tob: 'උපන් වේලාව',
    pob: 'උපන් ස්ථානය',
    notes: 'අමතර සටහන්',
    girlName: 'ගැහැණු ළමයාගේ සම්පූර්ණ නම',
    girlDob: 'ගැහැණු ළමයාගේ උපන් දිනය',
    girlTob: 'ගැහැණු ළමයාගේ උපන් වේලාව',
    girlPob: 'ගැහැණු ළමයාගේ උපන් ස්ථානය',
    boyName: 'පිරිමි ළමයාගේ සම්පූර්ණ නම',
    boyDob: 'පිරිමි ළමයාගේ උපන් දිනය',
    boyTob: 'පිරිමි ළමයාගේ උපන් වේලාව',
    boyPob: 'පිරිමි ළමයාගේ උපන් ස්ථානය',
    submit: 'පෝරමය යොමු කරන්න',
    success: 'ඔබගේ පෝරමය සාර්ථව යොමු කර ඇත.',
    requestNumber: 'ඉල්ලීම් අංකය',
    another: 'තවත් පෝරමයක් යොමු කරන්න',
    contactSection: 'සම්බන්ධතා සහ අමතර තොරතුරු',
    girlSection: 'ගැහැණු ළමයාගේ විස්තර',
    boySection: 'පිරිමි ළමයාගේ විස්තර',
    selectPrompt: '-- තෝරන්න --',
    clear: 'හිස් කරන්න',
    back: 'ආපසු',
    logout: 'පිටවන්න',
    appInfo: 'යෙදුම් තොරතුරු',
    requests: 'ඉල්ලීම්',
    dashboard: 'පාලක පුවරුව',
    version: 'අනුවාදය',
    lastUpdate: 'අවසන් යාවත්කාලීන කිරීම',
    history: 'ඉතිහාසය',
    filter24h: 'පසුගිය පැය 24',
    filterWeek: 'පසුගිය සතිය',
    filterMonth: 'පසුගිය මාසය',
    filterAll: 'සියල්ල',
    noRequests: 'තවමත් ඉල්ලීම් නොමැත.',
    adminNote: 'පරිපාලක සටහන',
    deleteRequest: 'මකන්න',
    deleteConfirm: 'මෙම ඉල්ලීම ස්ථිරව මකන්නද?',
    deleteSuccess: 'ඉල්ලීම සාර්ථකව මකා ඇත.',
    done: 'නිමයි',
    hold: 'රඳවා ඇත',
    cancel: 'අවලංගු කරන්න',
    close: 'වසා දමන්න',
    accessDenied: 'මෙම ගිණුමට මෙම ප්‍රවේශය අනුමත නොවේ.',
    signedInAs: 'ප්‍රවිෂ්ට වී ඇත්තේ',
    total: 'මුළු එකතුව',
    newLabel: 'නව',
    completed: 'සම්පූර්ණ කරන ලද',
    cancelled: 'අවලංගු කරන ලද',
    guest: 'අමුත්තා',
    registeredUsers: 'ලියාපදිංචි පරිශීලකයින්',
    infoText: 'හඳහන් සහ පොරොන්දම් ඉල්ලීම් සඳහා වන ස්වස්ති ලයිෆ් පෝරම යෙදුම.',
    loading: 'පූරණය වෙමින් පවතී...',
    review: 'සමාලෝචනය',
    edit: 'සංස්කරණය',
    next: 'මීළඟ',
    welcomeTitle: 'ස්වස්ති ලයිෆ් වෙත සාදරයෙන් පිළිගනිමු',
    welcomeSubtitle: 'ඉදිරියට යාමට ක්‍රමයක් තෝරන්න',
    adminLogin: 'පරිපාලක ප්‍රවිෂ්ටය',
    personalSection: 'පෞද්ගලික සහ උපත් විස්තර',
  },
};

function translateFormType(type: ApiFormType, language: Language): string {
  if (language === 'si') {
    return type === 'HADAHAN' ? 'හඳහන්' : 'පොරොන්දම්';
  }
  return type === 'HADAHAN' ? 'Hadahan' : 'Porondam';
}

function translateSource(source: Source, language: Language): string {
  if (language === 'si') {
    return source === 'GUEST' ? 'අමුත්තා' : 'ලියාපදිංචි පරිශීලක';
  }
  return source === 'GUEST' ? 'Guest' : 'Registered User';
}

function translateStatus(status: RequestStatus, language: Language): string {
  const t = copy[language];
  switch (status) {
    case 'NEW': return t.newLabel;
    case 'ON_HOLD': return t.hold;
    case 'DONE': return t.done;
    case 'CANCELLED': return t.cancelled;
    default: return status;
  }
}

const CITIES = [
  { en: 'Anuradhapura', si: 'අනුරාධපුරය' },
  { en: 'Badulla', si: 'බදුල්ල' },
  { en: 'Batticaloa', si: 'මඩකලපුව' },
  { en: 'Chilaw', si: 'හලාවත' },
  { en: 'Colombo', si: 'කොළඹ' },
  { en: 'Dambulla', si: 'දඹුල්ල' },
  { en: 'Dehiwala', si: 'දෙහිවල' },
  { en: 'Galkissa', si: 'ගල්කිස්ස' },
  { en: 'Galle', si: 'ගාල්ල' },
  { en: 'Gampaha', si: 'ගම්පහ' },
  { en: 'Hambantota', si: 'හම්බන්තොට' },
  { en: 'Jaffna', si: 'යාපනය' },
  { en: 'Kalutara', si: 'කළුතර' },
  { en: 'Kandy', si: 'මහනුවර' },
  { en: 'Kataragama', si: 'කතරගම' },
  { en: 'Kegalle', si: 'කෑගල්ල' },
  { en: 'Kilinochchi', si: 'කිලිනොච්චිය' },
  { en: 'Kurunegala', si: 'කුරුණෑගල' },
  { en: 'Mannar', si: 'මන්නාරම' },
  { en: 'Matale', si: 'මාතලේ' },
  { en: 'Matara', si: 'මාතර' },
  { en: 'Monaragala', si: 'මොනරාගල' },
  { en: 'Moratuwa', si: 'මොරටුව' },
  { en: 'Mullaitivu', si: 'මුලතීවු' },
  { en: 'Negombo', si: 'මීගමුව' },
  { en: 'Nuwara Eliya', si: 'නුවරඑළිය' },
  { en: 'Polonnaruwa', si: 'පොලොන්නරුව' },
  { en: 'Puttalam', si: 'පුත්තලම' },
  { en: 'Ratnapura', si: 'රත්නපුරය' },
  { en: 'Sri Jayawardenepura Kotte', si: 'ශ්‍රී ජයවර්ධනපුර කෝට්ටේ' },
  { en: 'Trincomalee', si: 'ත්‍රිකුණාමලය' },
  { en: 'Vavuniya', si: 'වවුනියාව' },
];

function formatDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split(/[\/\-]/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    if (year.length === 4) return `${year}-${month}-${day}`;
  }
  return dateStr;
}

function formatApiError(detail: any): string {
  if (!detail) return 'Request failed';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(err => {
      const loc = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : '';
      return `${loc ? `${String(loc).replace(/_/g, ' ')}: ` : ''}${err.msg || 'Invalid value'}`;
    }).join(', ');
  }
  return JSON.stringify(detail);
}

async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(formatApiError(body.detail));
    return body as T;
  } catch (caught) {
    if (caught instanceof TypeError) {
      throw new Error(`Cannot reach backend at ${API_URL}.`);
    }
    throw caught;
  }
}

function stripTrailingSlash(value: string) {
  return value.length > 1 ? value.replace(/\/$/, '') : value;
}

function currentMode(): Mode {
  const base = stripTrailingSlash(import.meta.env.BASE_URL || '/');
  const hashPath = window.location.hash.replace(/^#\/?/, '');
  if (hashPath === 'admin' || hashPath === 'guest') return hashPath;

  let path = window.location.pathname;
  if (base !== '/' && path.startsWith(base)) path = path.slice(base.length) || '/';
  const firstSegment = path.split('/').filter(Boolean)[0] as string | undefined;
  return firstSegment === 'admin' || firstSegment === 'guest' ? (firstSegment as Mode) : 'welcome';
}

function urlForMode(mode: Mode): string {
  const base = stripTrailingSlash(import.meta.env.BASE_URL || '/');
  if (mode === 'welcome') return base;
  return `${base}#/${mode}`;
}

function readAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    if (!parsed.token || !parsed.user) {
      localStorage.removeItem(STORAGE_AUTH_KEY);
      return null;
    }
    return parsed as AuthState;
  } catch {
    localStorage.removeItem(STORAGE_AUTH_KEY);
    return null;
  }
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  textarea = false,
  options = [],
  className = '',
  selectPrompt = '-- Select --',
  placeholder = '',
  language,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  options?: { label: string; value: string }[];
  className?: string;
  selectPrompt?: string;
  placeholder?: string;
  language?: Language;
}) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const ref = useRef<HTMLInputElement>(null);
  const fpRef = useRef<any>(null);

  useEffect(() => {
    if (type !== 'date' || !ref.current) return;
    fpRef.current = flatpickr(ref.current, {
      locale: language === 'si' ? Sinhala : 'default',
      dateFormat: 'd/m/Y',
      allowInput: true,
      onChange: (_selectedDates, dateStr) => onChangeRef.current(dateStr),
      onReady: (_selectedDates, _dateStr, instance) => {
        const yearInput = instance.currentYearElement;
        const parent = yearInput?.parentNode;
        if (!yearInput || !parent) return;
        parent.querySelector('.flatpickr-monthDropdown-years')?.remove();
        const select = document.createElement('select');
        select.className = 'flatpickr-monthDropdown-years';
        const currentYear = new Date().getFullYear();
        for (let y = currentYear + 10; y >= 1920; y -= 1) {
          const opt = document.createElement('option');
          opt.value = y.toString();
          opt.textContent = y.toString();
          opt.selected = y === instance.currentYear;
          select.appendChild(opt);
        }
        yearInput.style.display = 'none';
        parent.appendChild(select);
        select.addEventListener('change', event => {
          instance.changeYear(parseInt((event.target as HTMLSelectElement).value, 10));
        });
        instance.config.onYearChange.push(() => { select.value = instance.currentYear.toString(); });
        instance.config.onMonthChange.push(() => { select.value = instance.currentYear.toString(); });
      },
    });
    return () => fpRef.current?.destroy();
  }, [type, language]);

  useEffect(() => {
    if (type === 'date' && fpRef.current && document.activeElement !== ref.current) {
      value ? fpRef.current.setDate(value, false) : fpRef.current.clear(false);
    }
  }, [value, type]);

  useEffect(() => {
    if (type !== 'time' || !ref.current) return;
    const input = ref.current;
    const handleTrigger = () => {
      if (typeof input.showPicker === 'function') {
        try { input.showPicker(); } catch { undefined; }
      }
    };
    input.addEventListener('click', handleTrigger);
    return () => input.removeEventListener('click', handleTrigger);
  }, [type]);

  return (
    <label className={`field ${className}`}>
      <span>{label}{required ? ' *' : ''}</span>
      {options.length > 0 ? (
        <select value={value} onChange={event => onChange(event.target.value)} required={required}>
          <option value="">{selectPrompt}</option>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : textarea ? (
        <textarea value={value} onChange={event => onChange(event.target.value)} required={required} placeholder={placeholder} rows={3} />
      ) : type === 'date' ? (
        <input ref={ref} type="text" value={value} placeholder={placeholder || 'DD/MM/YYYY'} required={required} onChange={event => onChange(event.target.value)} />
      ) : (
        <input ref={type === 'time' ? ref : undefined} type={type} value={value} onChange={event => onChange(event.target.value)} required={required} placeholder={placeholder} />
      )}
    </label>
  );
}

function Header({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
}) {
  const t = copy[language];
  return (
    <header>
      <div>
        <h1>{t.title}</h1>
      </div>
      <div className="language">
        <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button>
        <button className={language === 'si' ? 'active' : ''} onClick={() => setLanguage('si')}>Sinhala</button>
      </div>
    </header>
  );
}

function WelcomeScreen({ language, navigate }: { language: Language; navigate: (mode: Mode) => void }) {
  const t = copy[language];
  return (
    <section className="selector">
      <h2>{t.welcomeTitle}</h2>
      <p className="muted welcome-sub">{t.welcomeSubtitle}</p>
      <button className="btn-accent-gradient" onClick={() => navigate('guest')}>{t.guestForms}</button>
      <button className="btn-primary-gradient" onClick={() => navigate('admin')}>{t.adminLogin}</button>
    </section>
  );
}

function FormFlow({
  language,
  mode,
  token,
  onBack,
}: {
  language: Language;
  mode: 'guest' | 'admin';
  token?: string;
  onBack?: () => void;
}) {
  const [formType, setFormType] = useState<FormType | null>(null);
  const [form, setForm] = useState(empty);
  const [porondamStep, setPorondamStep] = useState<1 | 2 | 3 | 4>(1);
  const [hadahanStep, setHadahanStep] = useState<1 | 2 | 3>(1);
  const [requestNumber, setRequestNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const t = copy[language];
  const preferred_language = language === 'si' ? 'SINHALA' : 'ENGLISH';
  const cityOptions = useMemo(() => CITIES.map(city => ({
    label: language === 'si' ? city.si : city.en,
    value: language === 'si' ? city.si : city.en,
  })), [language]);

  const body = useMemo(() => {
    if (formType === 'hadahan') {
      return {
        preferred_language,
        full_name: form.full_name,
        address: form.address || null,
        contact_number: form.contact_number,
        additional_contact_number: form.additional_contact_number || null,
        date_of_birth: formatDateToISO(form.date_of_birth),
        time_of_birth: form.time_of_birth,
        place_of_birth: form.place_of_birth,
        additional_notes: form.additional_notes || null,
      };
    }
    return {
      preferred_language,
      contact_person_name: form.contact_person_name || form.full_name,
      address: form.address || null,
      contact_number: form.contact_number,
      additional_contact_number: form.additional_contact_number || null,
      girl: {
        full_name: form.girl_full_name,
        date_of_birth: formatDateToISO(form.girl_date_of_birth),
        time_of_birth: form.girl_time_of_birth,
        place_of_birth: form.girl_place_of_birth,
      },
      boy: {
        full_name: form.boy_full_name,
        date_of_birth: formatDateToISO(form.boy_date_of_birth),
        time_of_birth: form.boy_time_of_birth,
        place_of_birth: form.boy_place_of_birth,
      },
    };
  }, [form, formType, preferred_language]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!formType) return;
    setError('');
    setLoading(true);
    try {
      const path = mode === 'guest' ? `/api/guest/forms/${formType}` : `/api/forms/${formType}`;
      const result = await api<{ request_number: string }>(path, { method: 'POST', body: JSON.stringify(body) }, token);
      setRequestNumber(result.request_number);
      setForm(empty);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setForm(empty);
    setFormType(null);
    setPorondamStep(1);
    setHadahanStep(1);
    setRequestNumber('');
    setError('');
  }

  function isStepValid(step: number): boolean {
    if (formType === 'porondam') {
      if (step === 1) {
        return !!(form.contact_person_name && form.address && form.contact_number);
      }
      if (step === 2) {
        return !!(form.girl_full_name && form.girl_date_of_birth && form.girl_time_of_birth && form.girl_place_of_birth);
      }
      if (step === 3) {
        return !!(form.boy_full_name && form.boy_date_of_birth && form.boy_time_of_birth && form.boy_place_of_birth);
      }
    } else if (formType === 'hadahan') {
      if (step === 1) {
        return !!form.contact_number;
      }
      if (step === 2) {
        return !!(form.full_name && form.date_of_birth && form.time_of_birth && form.place_of_birth);
      }
    }
    return true;
  }

  function clearStep(step: number) {
    if (formType === 'porondam') {
      if (step === 1) {
        setForm(f => ({ ...f, contact_person_name: '', address: '', contact_number: '', additional_contact_number: '' }));
      } else if (step === 2) {
        setForm(f => ({ ...f, girl_full_name: '', girl_date_of_birth: '', girl_time_of_birth: '', girl_place_of_birth: '' }));
      } else if (step === 3) {
        setForm(f => ({ ...f, boy_full_name: '', boy_date_of_birth: '', boy_time_of_birth: '', boy_place_of_birth: '' }));
      }
    } else if (formType === 'hadahan') {
      if (step === 1) {
        setForm(f => ({ ...f, contact_number: '', additional_contact_number: '', address: '', additional_notes: '' }));
      } else if (step === 2) {
        setForm(f => ({ ...f, full_name: '', date_of_birth: '', time_of_birth: '', place_of_birth: '' }));
      }
    }
  }

  if (!formType && !requestNumber) {
    return (
      <section className="selector">
        <h2>{mode === 'guest' ? t.guestForms : `${t.welcome} ${t.admin}`}</h2>
        <button className="btn-primary-gradient" onClick={() => setFormType('hadahan')}>{t.hadahan}</button>
        <button className="btn-accent-gradient" onClick={() => setFormType('porondam')}>{t.porondam}</button>
        {onBack && <button className="secondary full-span" onClick={onBack}>{t.back}</button>}
      </section>
    );
  }

  if (requestNumber) {
    return (
      <section className="success">
        <h2>{t.success}</h2>
        <p>{t.requestNumber}</p>
        <strong>{requestNumber}</strong>
        <div className="button-row">
          <button onClick={reset}>{t.another}</button>
          {onBack && <button className="secondary" onClick={onBack}>{t.back}</button>}
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={submit}>
      <h2>{formType === 'hadahan' ? t.hadahan : t.porondam}</h2>
      {formType === 'hadahan' ? (
        <>
          <div className="progress-indicator">
            <div className={`step ${hadahanStep === 1 ? 'active' : ''} ${hadahanStep > 1 ? 'completed' : ''}`}>
              <span className="step-num">1</span>
              <span className="step-label">{t.contactSection}</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${hadahanStep === 2 ? 'active' : ''} ${hadahanStep > 2 ? 'completed' : ''}`}>
              <span className="step-num">2</span>
              <span className="step-label">{t.personalSection}</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${hadahanStep === 3 ? 'active' : ''}`}>
              <span className="step-num">3</span>
              <span className="step-label">{t.review}</span>
            </div>
          </div>

          {hadahanStep === 1 && (
            <>
              <Field label={t.contact} value={form.contact_number} onChange={v => setForm({ ...form, contact_number: v })} required language={language} />
              <Field label={t.extraContact} value={form.additional_contact_number} onChange={v => setForm({ ...form, additional_contact_number: v })} language={language} />
              <Field className="full-width" label={t.address} value={form.address} onChange={v => setForm({ ...form, address: v })} textarea language={language} />
              <Field className="full-width" label={t.notes} value={form.additional_notes} onChange={v => setForm({ ...form, additional_notes: v })} textarea language={language} />
            </>
          )}

          {hadahanStep === 2 && (
            <>
              <Field className="full-width" label={t.fullName} value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} required language={language} />
              <Field label={t.dob} value={form.date_of_birth} onChange={v => setForm({ ...form, date_of_birth: v })} type="date" required language={language} />
              <Field label={t.tob} value={form.time_of_birth} onChange={v => setForm({ ...form, time_of_birth: v })} type="time" required language={language} />
              <Field className="full-width" label={t.pob} value={form.place_of_birth} onChange={v => setForm({ ...form, place_of_birth: v })} options={cityOptions} selectPrompt={t.selectPrompt} required language={language} />
            </>
          )}

          {hadahanStep === 3 && (
            <>
              <div className="review-section">
                <div className="review-card-header">
                  <h3>{t.contactSection}</h3>
                  <button type="button" className="edit-step-btn" onClick={() => setHadahanStep(1)}>{t.edit}</button>
                </div>
                <div className="review-grid">
                  <div className="review-item"><span>{t.contact}</span><strong>{form.contact_number}</strong></div>
                  {form.additional_contact_number && <div className="review-item"><span>{t.extraContact}</span><strong>{form.additional_contact_number}</strong></div>}
                  {form.address && <div className="review-item"><span>{t.address}</span><strong>{form.address}</strong></div>}
                  {form.additional_notes && <div className="review-item"><span>{t.notes}</span><strong>{form.additional_notes}</strong></div>}
                </div>
              </div>

              <div className="review-section">
                <div className="review-card-header">
                  <h3>{t.personalSection}</h3>
                  <button type="button" className="edit-step-btn" onClick={() => setHadahanStep(2)}>{t.edit}</button>
                </div>
                <div className="review-grid">
                  <div className="review-item"><span>{t.fullName}</span><strong>{form.full_name}</strong></div>
                  <div className="review-item"><span>{t.dob}</span><strong>{form.date_of_birth}</strong></div>
                  <div className="review-item"><span>{t.tob}</span><strong>{form.time_of_birth}</strong></div>
                  <div className="review-item"><span>{t.pob}</span><strong>{form.place_of_birth}</strong></div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="progress-indicator">
            <div className={`step ${porondamStep === 1 ? 'active' : ''} ${porondamStep > 1 ? 'completed' : ''}`}>
              <span className="step-num">1</span>
              <span className="step-label">{t.contactSection}</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${porondamStep === 2 ? 'active' : ''} ${porondamStep > 2 ? 'completed' : ''}`}>
              <span className="step-num">2</span>
              <span className="step-label">{t.girlSection}</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${porondamStep === 3 ? 'active' : ''} ${porondamStep > 3 ? 'completed' : ''}`}>
              <span className="step-num">3</span>
              <span className="step-label">{t.boySection}</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${porondamStep === 4 ? 'active' : ''}`}>
              <span className="step-num">4</span>
              <span className="step-label">{t.review}</span>
            </div>
          </div>

          {porondamStep === 1 && (
            <>
              <Field className="full-width" label={t.contactPerson} value={form.contact_person_name} onChange={v => setForm({ ...form, contact_person_name: v })} required language={language} />
              <Field label={t.contact} value={form.contact_number} onChange={v => setForm({ ...form, contact_number: v })} required language={language} />
              <Field label={t.extraContact} value={form.additional_contact_number} onChange={v => setForm({ ...form, additional_contact_number: v })} language={language} />
              <Field className="full-width" label={t.address} value={form.address} onChange={v => setForm({ ...form, address: v })} textarea language={language} />
            </>
          )}

          {porondamStep === 2 && (
            <>
              <Field className="full-width" label={t.girlName} value={form.girl_full_name} onChange={v => setForm({ ...form, girl_full_name: v })} required language={language} />
              <Field label={t.girlDob} value={form.girl_date_of_birth} onChange={v => setForm({ ...form, girl_date_of_birth: v })} type="date" required language={language} />
              <Field label={t.girlTob} value={form.girl_time_of_birth} onChange={v => setForm({ ...form, girl_time_of_birth: v })} type="time" required language={language} />
              <Field className="full-width" label={t.girlPob} value={form.girl_place_of_birth} onChange={v => setForm({ ...form, girl_place_of_birth: v })} options={cityOptions} selectPrompt={t.selectPrompt} required language={language} />
            </>
          )}

          {porondamStep === 3 && (
            <>
              <Field className="full-width" label={t.boyName} value={form.boy_full_name} onChange={v => setForm({ ...form, boy_full_name: v })} required language={language} />
              <Field label={t.boyDob} value={form.boy_date_of_birth} onChange={v => setForm({ ...form, boy_date_of_birth: v })} type="date" required language={language} />
              <Field label={t.boyTob} value={form.boy_time_of_birth} onChange={v => setForm({ ...form, boy_time_of_birth: v })} type="time" required language={language} />
              <Field className="full-width" label={t.boyPob} value={form.boy_place_of_birth} onChange={v => setForm({ ...form, boy_place_of_birth: v })} options={cityOptions} selectPrompt={t.selectPrompt} required language={language} />
            </>
          )}

          {porondamStep === 4 && (
            <>
              <div className="review-section">
                <div className="review-card-header">
                  <h3>{t.contactSection}</h3>
                  <button type="button" className="edit-step-btn" onClick={() => setPorondamStep(1)}>{t.edit}</button>
                </div>
                <div className="review-grid">
                  <div className="review-item"><span>{t.contactPerson}</span><strong>{form.contact_person_name}</strong></div>
                  <div className="review-item"><span>{t.contact}</span><strong>{form.contact_number}</strong></div>
                  {form.additional_contact_number && <div className="review-item"><span>{t.extraContact}</span><strong>{form.additional_contact_number}</strong></div>}
                  <div className="review-item"><span>{t.address}</span><strong>{form.address}</strong></div>
                </div>
              </div>

              <div className="review-section">
                <div className="review-card-header">
                  <h3>{t.girlSection}</h3>
                  <button type="button" className="edit-step-btn" onClick={() => setPorondamStep(2)}>{t.edit}</button>
                </div>
                <div className="review-grid">
                  <div className="review-item"><span>{t.girlName}</span><strong>{form.girl_full_name}</strong></div>
                  <div className="review-item"><span>{t.girlDob}</span><strong>{form.girl_date_of_birth}</strong></div>
                  <div className="review-item"><span>{t.girlTob}</span><strong>{form.girl_time_of_birth}</strong></div>
                  <div className="review-item"><span>{t.girlPob}</span><strong>{form.girl_place_of_birth}</strong></div>
                </div>
              </div>

              <div className="review-section">
                <div className="review-card-header">
                  <h3>{t.boySection}</h3>
                  <button type="button" className="edit-step-btn" onClick={() => setPorondamStep(3)}>{t.edit}</button>
                </div>
                <div className="review-grid">
                  <div className="review-item"><span>{t.boyName}</span><strong>{form.boy_full_name}</strong></div>
                  <div className="review-item"><span>{t.boyDob}</span><strong>{form.boy_date_of_birth}</strong></div>
                  <div className="review-item"><span>{t.boyTob}</span><strong>{form.boy_time_of_birth}</strong></div>
                  <div className="review-item"><span>{t.boyPob}</span><strong>{form.boy_place_of_birth}</strong></div>
                </div>
              </div>
            </>
          )}
        </>
      )}
      {error && <p className="error">{error}</p>}
      <div className="actions">
        {formType === 'hadahan' ? (
          <>
            {hadahanStep === 1 ? (
              <button type="button" className="secondary" onClick={reset}>{t.back}</button>
            ) : (
              <button type="button" className="secondary" onClick={() => setHadahanStep(prev => (prev - 1) as any)}>{t.back}</button>
            )}

            {hadahanStep < 3 && (
              <button type="button" className="secondary" onClick={() => clearStep(hadahanStep)} disabled={loading}>{t.clear}</button>
            )}

            {hadahanStep < 3 ? (
              <button type="button" onClick={() => {
                if (isStepValid(hadahanStep)) {
                  setHadahanStep(prev => (prev + 1) as any);
                  setError('');
                } else {
                  setError(language === 'si' ? 'කරුණාකර සියලුම අනිවාර්ය ක්ෂේත්‍ර පුරවන්න.' : 'Please fill all required fields.');
                }
              }}>{t.next}</button>
            ) : (
              <button type="submit" disabled={loading}>{loading ? '...' : t.submit}</button>
            )}
          </>
        ) : (
          <>
            {porondamStep === 1 ? (
              <button type="button" className="secondary" onClick={reset}>{t.back}</button>
            ) : (
              <button type="button" className="secondary" onClick={() => setPorondamStep(prev => (prev - 1) as any)}>{t.back}</button>
            )}

            {porondamStep < 4 && (
              <button type="button" className="secondary" onClick={() => clearStep(porondamStep)} disabled={loading}>{t.clear}</button>
            )}

            {porondamStep < 4 ? (
              <button type="button" onClick={() => {
                if (isStepValid(porondamStep)) {
                  setPorondamStep(prev => (prev + 1) as any);
                  setError('');
                } else {
                  setError(language === 'si' ? 'කරුණාකර සියලුම අනිවාර්ය ක්ෂේත්‍ර පුරවන්න.' : 'Please fill all required fields.');
                }
              }}>{t.next}</button>
            ) : (
              <button type="submit" disabled={loading}>{loading ? '...' : t.submit}</button>
            )}
          </>
        )}
      </div>
    </form>
  );
}

function AuthGate({
  language,
  mode,
  auth,
  setAuth,
  onBack,
  children,
}: {
  language: Language;
  mode: 'admin';
  auth: AuthState | null;
  setAuth: (auth: AuthState | null) => void;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  const [step, setStep] = useState<'username' | 'password' | 'activate'>('username');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = copy[language];
  const requiredRole: Role = 'ADMIN';

  const logout = () => setAuth(null);

  async function checkUsername(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api<{ account_status: AccountStatus }>('/api/auth/check-username', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      setStep(result.account_status === 'PENDING' ? 'activate' : 'password');
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPassword(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const path = step === 'activate' ? '/api/auth/activate' : '/api/auth/login';
      const body = step === 'activate' ? { username, password, confirm_password: confirmPassword } : { username, password };
      const result = await api<AuthResponse>(path, { method: 'POST', body: JSON.stringify(body) });
      setAuth({ token: result.access_token, user: result.user });
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (auth && auth.user.role !== requiredRole) {
    return (
      <section className="panel">
        <h2>{t.accessDenied}</h2>
        <p className="muted">{t.signedInAs} {auth.user.full_name} ({auth.user.role}).</p>
        <div className="button-row">
          <button onClick={logout}>{t.logout}</button>
        </div>
      </section>
    );
  }

  if (auth) return <>{children}</>;

  return (
    <form className="auth-form" onSubmit={step === 'username' ? checkUsername : submitPassword}>
      <h2>{t.admin} {t.login}</h2>
      <Field label={t.username} value={username} onChange={setUsername} required language={language} />
      {step !== 'username' && (
        <>
          <Field label={t.password} value={password} onChange={setPassword} type="password" required language={language} />
          {step === 'activate' && <Field label={t.confirmPassword} value={confirmPassword} onChange={setConfirmPassword} type="password" required language={language} />}
        </>
      )}
      {error && <p className="error">{error}</p>}
      <div className="actions">
        {step !== 'username' ? (
          <button type="button" className="secondary" onClick={() => setStep('username')}>{t.back}</button>
        ) : (
          onBack && <button type="button" className="secondary" onClick={onBack}>{t.back}</button>
        )}
        <button type="submit" disabled={loading}>{loading ? '...' : step === 'username' ? t.continue : step === 'activate' ? t.createPassword : t.login}</button>
      </div>
    </form>
  );
}

function DetailRows({ request, language }: { request: RequestDetail; language: Language }) {
  const t = copy[language];

  function row(label: string, value: any) {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div className="detail-row" key={label}>
        <span>{label}</span>
        <strong>{String(value)}</strong>
      </div>
    );
  }

  function section(title: string, children: React.ReactNode) {
    return (
      <div className="detail-section" key={title}>
        <div className="detail-section-header">{title}</div>
        {children}
      </div>
    );
  }

  return (
    <div className="detail-grid">
      {request.form_type === 'HADAHAN' ? (
        <>
          {section(t.personalSection, <>
            {row(t.fullName, request.data.full_name)}
            {row(t.dob, request.data.date_of_birth)}
            {row(t.tob, request.data.time_of_birth)}
            {row(t.pob, request.data.place_of_birth)}
          </>)}
          {section(t.contactSection, <>
            {row(t.contact, request.data.contact_number)}
            {row(t.extraContact, request.data.additional_contact_number)}
            {row(t.address, request.data.address)}
            {row(t.notes, request.data.additional_notes)}
          </>)}
        </>
      ) : (
        <>
          {section(t.contactSection, <>
            {row(t.contactPerson, request.data.contact_person_name)}
            {row(t.contact, request.data.contact_number)}
            {row(t.extraContact, request.data.additional_contact_number)}
            {row(t.address, request.data.address)}
          </>)}
          {section(t.boySection, <>
            {row(t.boyName, request.data.boy?.full_name)}
            {row(t.boyDob, request.data.boy?.date_of_birth)}
            {row(t.boyTob, request.data.boy?.time_of_birth)}
            {row(t.boyPob, request.data.boy?.place_of_birth)}
          </>)}
          {section(t.girlSection, <>
            {row(t.girlName, request.data.girl?.full_name)}
            {row(t.girlDob, request.data.girl?.date_of_birth)}
            {row(t.girlTob, request.data.girl?.time_of_birth)}
            {row(t.girlPob, request.data.girl?.place_of_birth)}
          </>)}
        </>
      )}
    </div>
  );
}

function AdminHome({ language, auth, logout, navigate }: { language: Language; auth: AuthState; logout: () => void; navigate: (mode: Mode) => void }) {
  const [view, setView] = useState<'requests' | 'dashboard' | 'history' | 'info'>('requests');
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [dashboard, setDashboard] = useState<DashboardCounts | null>(null);
  const [selected, setSelected] = useState<RequestDetail | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'24h' | 'week' | 'month' | 'all'>('all');
  const t = copy[language];

  const activeRequests = requests.filter(item => item.status === 'NEW' || item.status === 'ON_HOLD');
  const historyRequests = requests.filter(item => item.status === 'DONE' || item.status === 'CANCELLED');

  const filteredHistoryRequests = useMemo(() => {
    if (historyFilter === 'all') return historyRequests;
    const now = new Date();
    const cutoff = new Date(now);
    if (historyFilter === '24h') cutoff.setHours(now.getHours() - 24);
    else if (historyFilter === 'week') cutoff.setDate(now.getDate() - 7);
    else if (historyFilter === 'month') cutoff.setMonth(now.getMonth() - 1);
    return historyRequests.filter(item => {
      if (!item.submitted_date) return false;
      // submitted_date is expected as 'YYYY-MM-DD'
      const parts = item.submitted_date.split('/');
      const dateStr = parts.length === 3
        ? `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        : item.submitted_date;
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && d >= cutoff;
    });
  }, [historyRequests, historyFilter]);

  async function loadAdminData() {
    setError('');
    setLoading(true);
    try {
      const [list, counts] = await Promise.all([
        api<RequestSummary[]>('/api/admin/requests', {}, auth.token),
        api<DashboardCounts>('/api/admin/dashboard', {}, auth.token).catch(() => null),
      ]);
      setRequests(list);
      setDashboard(counts);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (view === 'requests' || view === 'history' || view === 'dashboard') loadAdminData();
    if (view !== 'history') setHistoryFilter('all');
    setMessage('');
  }, [view]);

  async function openDetail(requestNumber: string) {
    setError('');
    setLoading(true);
    try {
      const detail = await api<RequestDetail>(`/api/admin/requests/${requestNumber}`, {}, auth.token);
      setSelected(detail);
      setAdminNote(detail.admin_note || '');
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status: RequestStatus) {
    if (!selected) return;
    setError('');
    setLoading(true);
    try {
      await api<RequestDetail>(`/api/admin/requests/${selected.request_number}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, admin_note: adminNote.trim() || null }),
      }, auth.token);
      setSelected(null);
      await loadAdminData();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteSelectedRequest() {
    if (!selected || !window.confirm(t.deleteConfirm)) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api(`/api/admin/requests/${selected.request_number}`, { method: 'DELETE' }, auth.token);
      setSelected(null);
      setAdminNote('');
      setMessage(t.deleteSuccess);
      await loadAdminData();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function renderRequestList(items: RequestSummary[]) {
    if (loading && !items.length) return <p className="muted">{t.loading}</p>;
    if (!items.length) return <p className="muted">{t.noRequests}</p>;
    return (
      <div className="request-list">
        {items.map(item => (
          <button className="request-card" key={item.request_number} onClick={() => openDetail(item.request_number)}>
            <span>
              <strong>{item.request_number}</strong>
              <small>{translateFormType(item.form_type, language)} - {translateSource(item.source, language)} - {item.submitted_date} {item.submitted_time}</small>
            </span>
            <em className={`status ${item.status}`}>{translateStatus(item.status, language)}</em>
          </button>
        ))}
      </div>
    );
  }

  if (view === 'info') {
    return (
      <section className="panel info-panel">
        <div className="info-card">
          <div className="info-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48" aria-hidden="true">
              <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Z" clipRule="evenodd" />
            </svg>
          </div>

          <p className="info-app-name">Swasthi Life</p>

          <div className="info-entity-badge">
            <span className="info-entity-text">
              {language === 'si' ? 'බලපිටිය කතරගම මහා දේවාලය' : 'Balapitiya Kataragama Maha Devalaya'}
            </span>
          </div>

          <div className="info-divider" />

          <div className="info-row">
            <span className="info-row-label">{t.version}</span>
            <span className="info-row-value">1.0.0</span>
          </div>

          <div className="info-row">
            <span className="info-row-label">{t.lastUpdate}</span>
            <span className="info-row-value">15/06/2026</span>
          </div>
        </div>

        <p className="info-footer">
          {language === 'si' ? '© 2026 බලපිටිය කතරගම මහා දේවාලය' : '© 2026 Balapitiya Kataragama Maha Devalaya'}
        </p>

        <div className="button-row" style={{ justifyContent: 'center', marginTop: 8 }}>
          <button className="btn-accent-gradient" onClick={() => navigate('guest')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" /></svg>
            {t.guestForms}
          </button>
          <button className="secondary" onClick={() => setView('requests')}>{t.back}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel admin-panel">
      <div className="panel-heading">
        <div>
          <h2>{view === 'dashboard' ? t.dashboard : view === 'history' ? t.history : t.requests}</h2>
          <p className="muted">{t.signedInAs} {auth.user.full_name}</p>
        </div>
        <button className="secondary" onClick={logout}>{t.logout}</button>
      </div>

      <nav className="admin-nav">
        <button className={view === 'requests' ? 'active' : ''} onClick={() => setView('requests')}>{t.requests}</button>
        <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>{t.dashboard}</button>
        <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>{t.history}</button>
        <button className={(view as string) === 'info' ? 'active' : ''} onClick={() => setView('info')}>{t.appInfo}</button>
      </nav>

      {error && <p className="error">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {view === 'dashboard' && (
        <div className="dashboard-section">
          <div className="stats-grid">
            <div><strong>{dashboard?.total_requests ?? requests.length}</strong><span>{t.total}</span></div>
            <div><strong>{dashboard?.new_requests ?? requests.filter(r => r.status === 'NEW').length}</strong><span>{t.newLabel}</span></div>
            <div><strong>{dashboard?.on_hold_requests ?? requests.filter(r => r.status === 'ON_HOLD').length}</strong><span>{t.hold}</span></div>
            <div><strong>{dashboard?.completed_requests ?? requests.filter(r => r.status === 'DONE').length}</strong><span>{t.completed}</span></div>
            <div><strong>{dashboard?.cancelled_requests ?? requests.filter(r => r.status === 'CANCELLED').length}</strong><span>{t.cancelled}</span></div>
          </div>
        </div>
      )}

      {view === 'requests' && renderRequestList(activeRequests)}
      {view === 'history' && (
        <>
          <div className="history-filter-bar">
            {(['24h', 'week', 'month', 'all'] as const).map(f => (
              <button
                key={f}
                className={`history-filter-btn${historyFilter === f ? ' active' : ''}`}
                onClick={() => setHistoryFilter(f)}
              >
                {f === '24h' ? t.filter24h : f === 'week' ? t.filterWeek : f === 'month' ? t.filterMonth : t.filterAll}
                {f !== 'all' && historyFilter === f && filteredHistoryRequests.length > 0 && (
                  <span className="filter-count">{filteredHistoryRequests.length}</span>
                )}
              </button>
            ))}
          </div>
          {renderRequestList(filteredHistoryRequests)}
        </>
      )}

      {selected && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="detail-modal">
            <button type="button" className="modal-close-x" onClick={() => setSelected(null)} aria-label="Close">&times;</button>
            <div className="modal-header">
              <div>
                <h2>{selected.request_number}</h2>
                <p className="muted">{translateFormType(selected.form_type, language)} - {translateSource(selected.source, language)}</p>
              </div>
              <em className={`status ${selected.status}`}>{translateStatus(selected.status, language)}</em>
            </div>
            <DetailRows request={selected} language={language} />
            <label className="field full-width">
              <span>{t.adminNote}</span>
              <textarea value={adminNote} onChange={event => setAdminNote(event.target.value)} rows={3} />
            </label>
            <div className="button-row detail-actions">
              {view === 'history' && (
                <button className="delete-button" onClick={deleteSelectedRequest} disabled={loading}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path fillRule="evenodd" d="M8.75 1.75A1.75 1.75 0 0 0 7 3.5V4H4.25a.75.75 0 0 0 0 1.5H5l.62 10.56A2.25 2.25 0 0 0 7.87 18h4.26a2.25 2.25 0 0 0 2.25-1.94L15 5.5h.75a.75.75 0 0 0 0-1.5H13v-.5a1.75 1.75 0 0 0-1.75-1.75h-2.5ZM8.5 4h3v-.5a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25V4Zm-.38 3.25a.75.75 0 0 1 .8.7l.25 6a.75.75 0 0 1-1.5.06l-.25-6a.75.75 0 0 1 .7-.76Zm3.76 0a.75.75 0 0 1 .7.76l-.25 6a.75.75 0 0 1-1.5-.06l.25-6a.75.75 0 0 1 .8-.7Z" clipRule="evenodd" /></svg>
                  {t.deleteRequest}
                </button>
              )}
              <button className="btn-done" onClick={() => updateStatus('DONE')} disabled={loading}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
                {t.done}
              </button>
              <button className="btn-hold" onClick={() => updateStatus('ON_HOLD')} disabled={loading}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" /></svg>
                {t.hold}
              </button>
              <button className="danger" onClick={() => updateStatus('CANCELLED')} disabled={loading}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" /></svg>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function App() {
  const [mode, setMode] = useState<Mode>(() => currentMode());
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'si');
  const [auth, setAuthState] = useState<AuthState | null>(() => readAuth());

  useEffect(() => {
    const onPopState = () => setMode(currentMode());
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onPopState);
    };
  }, []);

  function setLanguage(next: Language) {
    setLanguageState(next);
    localStorage.setItem('language', next);
  }

  function setAuth(next: AuthState | null) {
    setAuthState(next);
    if (next) localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_AUTH_KEY);
  }

  function navigate(next: Mode) {
    window.history.pushState({}, '', urlForMode(next));
    setMode(next);
  }

  return (
    <main>
      <Header language={language} setLanguage={setLanguage} />
      {mode === 'welcome' && <WelcomeScreen language={language} navigate={navigate} />}
      {mode === 'guest' && <FormFlow language={language} mode="guest" />}
      {mode === 'admin' && (
        <AuthGate language={language} mode="admin" auth={auth} setAuth={setAuth} onBack={() => navigate('welcome')}>
          {auth && <AdminHome language={language} auth={auth} logout={() => setAuth(null)} navigate={navigate} />}
        </AuthGate>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
