import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import './styles.css';

type Language = 'en' | 'si';
type FormType = 'hadahan' | 'porondam';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function formatDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split(/[\/\-]/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    if (year.length === 4) {
      return `${year}-${month}-${day}`;
    }
  }
  return dateStr;
}



const copy = {
  en: {
    title: 'Swasthi Life',
    selectLanguage: 'Select Language',
    guestForms: 'Guest Forms',
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
  },
  si: {
    title: 'ස්වස්ති ලයිෆ්',
    selectLanguage: 'භාෂාව තෝරන්න',
    guestForms: 'අමුත්තන්ගේ පෝරම',
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
    success: 'ඔබගේ පෝරමය සාර්ථකව යොමු කර ඇත.',
    requestNumber: 'ඉල්ලීම් අංකය',
    another: 'තවත් පෝරමයක් යොමු කරන්න',
    contactSection: 'සම්බන්ධතා සහ අමතර තොරතුරු',
    girlSection: 'ගැහැණු ළමයාගේ විස්තර',
    boySection: 'පිරිමි ළමයාගේ විස්තර',
    selectPrompt: '-- තෝරන්න --',
  },
};

const CITIES = [
  { en: 'Anuradhapura', si: 'අනුරාධපුරය' },
  { en: 'Badulla', si: 'බදුල්ල' },
  { en: 'Batticaloa', si: 'මඩකලපුව' },
  { en: 'Chilaw', si: 'හලාවත' },
  { en: 'Colombo', si: 'කොළඹ' },
  { en: 'Dambulla', si: 'දඹුල්ල' },
  { en: 'Dehiwala-Mount Lavinia', si: 'දෙහිවල-ගල්කිස්ස' },
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

function Field({ label, value, onChange, type = 'text', required = false, textarea = false, options = [], className = '', selectPrompt = '-- Select --', placeholder = '' }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; textarea?: boolean; options?: { label: string; value: string }[]; className?: string; selectPrompt?: string; placeholder?: string }) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const ref = useRef<HTMLInputElement>(null);
  const fpRef = useRef<any>(null);

  useEffect(() => {
    if (type !== 'date' || !ref.current) return;
    fpRef.current = flatpickr(ref.current, {
      dateFormat: 'd/m/Y',
      allowInput: true,
      onChange: (selectedDates, dateStr) => {
        onChangeRef.current(dateStr);
      },
      onReady: (selectedDates, dateStr, instance) => {
        const yearInput = instance.currentYearElement;
        if (!yearInput) return;
        const parent = yearInput.parentNode;
        if (!parent) return;

        const existingSelect = parent.querySelector('.flatpickr-monthDropdown-years');
        if (existingSelect) {
          existingSelect.remove();
        }

        const select = document.createElement("select");
        select.className = "flatpickr-monthDropdown-years";
        
        const currentYear = new Date().getFullYear();
        const minYear = 1920;
        const maxYear = currentYear + 10;
        
        for (let y = maxYear; y >= minYear; y--) {
          const opt = document.createElement("option");
          opt.value = y.toString();
          opt.textContent = y.toString();
          if (y === instance.currentYear) {
            opt.selected = true;
          }
          select.appendChild(opt);
        }

        yearInput.style.display = "none";
        parent.appendChild(select);

        select.addEventListener("change", (e) => {
          instance.changeYear(parseInt((e.target as HTMLSelectElement).value));
        });

        instance.config.onYearChange.push(() => {
          select.value = instance.currentYear.toString();
        });
        
        instance.config.onMonthChange.push(() => {
          select.value = instance.currentYear.toString();
        });
      }
    });
    return () => {
      if (fpRef.current) {
        fpRef.current.destroy();
      }
    };
  }, [type]);

  useEffect(() => {
    if (type === 'date' && fpRef.current) {
      if (document.activeElement !== ref.current) {
        if (value) {
          fpRef.current.setDate(value, false);
        } else {
          fpRef.current.clear(false);
        }
      }
    }
  }, [value, type]);

  return (
    <label className={`field ${className}`}>
      <span>{label}{required ? ' *' : ''}</span>
      {options && options.length > 0 ? (
        <select value={value} onChange={event => onChange(event.target.value)} required={required}>
          <option value="">{selectPrompt}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : textarea ? (
        <textarea value={value} onChange={event => onChange(event.target.value)} required={required} placeholder={placeholder} />
      ) : type === 'date' ? (
        <input ref={ref} type="text" placeholder={placeholder || 'DD/MM/YYYY'} required={required} onChange={event => onChange(event.target.value)} />
      ) : (
        <input type={type} value={value} onChange={event => onChange(event.target.value)} required={required} placeholder={placeholder} />
      )}
    </label>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'si');
  const [formType, setFormType] = useState<FormType | null>(null);
  const [form, setForm] = useState(empty);
  const [requestNumber, setRequestNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const t = copy[language];
  const preferred_language = language === 'si' ? 'SINHALA' : 'ENGLISH';

  const cityOptions = useMemo(() => {
    return CITIES.map(c => ({
      label: language === 'si' ? c.si : c.en,
      value: language === 'si' ? c.si : c.en,
    }));
  }, [language]);

  useEffect(() => localStorage.setItem('language', language), [language]);

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
      contact_person_name: form.contact_person_name,
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
      const response = await fetch(`${API_URL}/api/guest/forms/${formType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) {
        if (Array.isArray(result.detail)) {
          const msgs = result.detail.map((err: any) => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(', ');
          throw new Error(msgs);
        }
        throw new Error(result.detail || 'Submission failed');
      }
      setRequestNumber(result.request_number);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function chooseLanguage(next: Language) {
    setLanguage(next);
  }

  function reset() {
    setForm(empty);
    setFormType(null);
    setRequestNumber('');
    setError('');
  }

  return (
    <main>
      <header>
        <h1>{t.title}</h1>
        <div className="language"><button className={language === 'en' ? 'active' : ''} onClick={() => chooseLanguage('en')}>English</button><button className={language === 'si' ? 'active' : ''} onClick={() => chooseLanguage('si')}>සිංහල</button></div>
      </header>

      {!formType && !requestNumber && (
        <section className="selector">
          <h2>{t.guestForms}</h2>
          <button onClick={() => setFormType('hadahan')}>{t.hadahan}</button>
          <button onClick={() => setFormType('porondam')}>{t.porondam}</button>
        </section>
      )}

      {requestNumber && (
        <section className="success">
          <h2>{t.success}</h2>
          <p>{t.requestNumber}</p>
          <strong>{requestNumber}</strong>
          <button onClick={reset}>{t.another}</button>
        </section>
      )}

      {formType && !requestNumber && (
        <form onSubmit={submit}>
          <h2>{formType === 'hadahan' ? t.hadahan : t.porondam}</h2>
          {formType === 'hadahan' ? (
            <>
              <Field className="full-width" label={t.fullName} value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} required />
              <Field className="full-width" label={t.address} value={form.address} onChange={v => setForm({ ...form, address: v })} textarea />
              <Field label={t.dob} value={form.date_of_birth} onChange={v => setForm({ ...form, date_of_birth: v })} type="date" required />
              <Field label={t.tob} value={form.time_of_birth} onChange={v => setForm({ ...form, time_of_birth: v })} type="time" required />
              <Field className="full-width" label={t.pob} value={form.place_of_birth} onChange={v => setForm({ ...form, place_of_birth: v })} options={cityOptions} selectPrompt={t.selectPrompt} required />
              
              <div className="section-divider">
                <span>{t.contactSection}</span>
              </div>
              
              <Field label={t.contact} value={form.contact_number} onChange={v => setForm({ ...form, contact_number: v })} required />
              <Field label={t.extraContact} value={form.additional_contact_number} onChange={v => setForm({ ...form, additional_contact_number: v })} />
              <Field className="full-width" label={t.notes} value={form.additional_notes} onChange={v => setForm({ ...form, additional_notes: v })} textarea />
            </>
          ) : (
            <>
              <div className="section-divider">
                <span>{t.boySection}</span>
              </div>
              <Field className="full-width" label={t.boyName} value={form.boy_full_name} onChange={v => setForm({ ...form, boy_full_name: v })} required />
              <Field label={t.boyDob} value={form.boy_date_of_birth} onChange={v => setForm({ ...form, boy_date_of_birth: v })} type="date" required />
              <Field label={t.boyTob} value={form.boy_time_of_birth} onChange={v => setForm({ ...form, boy_time_of_birth: v })} type="time" required />
              <Field className="full-width" label={t.boyPob} value={form.boy_place_of_birth} onChange={v => setForm({ ...form, boy_place_of_birth: v })} options={cityOptions} selectPrompt={t.selectPrompt} required />

              <div className="section-divider">
                <span>{t.girlSection}</span>
              </div>
              <Field className="full-width" label={t.girlName} value={form.girl_full_name} onChange={v => setForm({ ...form, girl_full_name: v })} required />
              <Field label={t.girlDob} value={form.girl_date_of_birth} onChange={v => setForm({ ...form, girl_date_of_birth: v })} type="date" required />
              <Field label={t.girlTob} value={form.girl_time_of_birth} onChange={v => setForm({ ...form, girl_time_of_birth: v })} type="time" required />
              <Field className="full-width" label={t.girlPob} value={form.girl_place_of_birth} onChange={v => setForm({ ...form, girl_place_of_birth: v })} options={cityOptions} selectPrompt={t.selectPrompt} required />

              <div className="section-divider">
                <span>{t.contactSection}</span>
              </div>
              <Field className="full-width" label={t.contactPerson} value={form.contact_person_name} onChange={v => setForm({ ...form, contact_person_name: v })} required />
              <Field label={t.contact} value={form.contact_number} onChange={v => setForm({ ...form, contact_number: v })} required />
              <Field label={t.extraContact} value={form.additional_contact_number} onChange={v => setForm({ ...form, additional_contact_number: v })} />
              <Field className="full-width" label={t.address} value={form.address} onChange={v => setForm({ ...form, address: v })} textarea />
            </>
          )}
          {error && <p className="error">{error}</p>}
          <div className="actions">
            <button type="button" className="secondary" onClick={reset}>Back</button>
            <button type="submit" disabled={loading}>{loading ? '...' : t.submit}</button>
          </div>
        </form>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
