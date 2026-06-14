import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type Language = 'en' | 'si';
type Role = 'ADMIN' | 'USER';
type User = { user_id: string; full_name: string; username: string; role: Role; account_status: 'PENDING' | 'ACTIVE' };
type RequestSummary = { request_number: string; form_type: 'HADAHAN' | 'PORONDAM'; submitted_by: string; source: string; submitted_date: string; submitted_time: string; status: string };

const copy = {
  en: {
    welcome: 'Welcome',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    continue: 'Continue',
    login: 'Log In',
    createPassword: 'Create Password',
    hadahan: 'Fill Hadahan Form',
    porondam: 'Fill Porondam Form',
    settings: 'Settings',
    appInfo: 'App Info',
    logout: 'Log Out',
    fullName: 'Full Name',
    address: 'Address',
    contact: 'Contact Number',
    extraContact: 'Additional Contact Number',
    dob: 'Date of Birth',
    tob: 'Time of Birth',
    pob: 'Place of Birth',
    notes: 'Additional Notes',
    submit: 'Submit',
    requests: 'Requests',
    dashboard: 'Dashboard',
    done: 'Done',
    hold: 'On Hold',
    cancel: 'Cancel',
    adminNote: 'Admin Note',
    noRequests: 'No requests yet.',
    infoText: 'Swasthi Life form app for Hadahan and Porondam requests.',
    back: 'Back',
  },
  si: {
    welcome: 'ආයුබෝවන්',
    username: 'පරිශීලක නාමය',
    password: 'මුරපදය',
    confirmPassword: 'මුරපදය තහවුරු කරන්න',
    continue: 'ඉදිරියට',
    login: 'ඇතුල් වන්න',
    createPassword: 'මුරපදය සාදන්න',
    hadahan: 'හඳහන් පෝරමය පුරවන්න',
    porondam: 'පොරොන්දම් පෝරමය පුරවන්න',
    settings: 'සැකසුම්',
    appInfo: 'යෙදුම පිළිබඳ විස්තර',
    logout: 'ඉවත් වන්න',
    fullName: 'සම්පූර්ණ නම',
    address: 'ලිපිනය',
    contact: 'දුරකථන අංකය',
    extraContact: 'අමතර දුරකථන අංකය',
    dob: 'උපන් දිනය',
    tob: 'උපන් වේලාව',
    pob: 'උපන් ස්ථානය',
    notes: 'අමතර සටහන්',
    submit: 'යොමු කරන්න',
    requests: 'ඉල්ලීම්',
    dashboard: 'සාරාංශය',
    done: 'අවසන්',
    hold: 'තාවකාලිකව නතර',
    cancel: 'අවලංගු',
    adminNote: 'පරිපාලක සටහන',
    noRequests: 'ඉල්ලීම් නොමැත.',
    infoText: 'හඳහන් සහ පොරොන්දම් ඉල්ලීම් සඳහා Swasthi Life යෙදුම.',
    back: 'ආපසු',
  },
};

async function api(path: string, options: RequestInit = {}, token?: string) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || 'Request failed');
  return body;
}

async function getAdminPushToken() {
  if (Platform.OS === 'web') return null;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Admin notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const permission = await Notifications.getPermissionsAsync();
  const finalPermission = permission.granted ? permission : await Notifications.requestPermissionsAsync();
  if (!finalPermission.granted) return null;
  const projectId = Constants.easConfig?.projectId || Constants.expoConfig?.extra?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return token.data;
}

function Field({ label, value, onChangeText, multiline = false, secureTextEntry = false }: { label: string; value: string; onChangeText: (v: string) => void; multiline?: boolean; secureTextEntry?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} multiline={multiline} secureTextEntry={secureTextEntry} style={[styles.input, multiline && styles.multiline]} />
    </View>
  );
}

function LanguageToggle({ language, setLanguage }: { language: Language; setLanguage: (language: Language) => void }) {
  return (
    <View style={styles.language}>
      <TouchableOpacity onPress={() => setLanguage('en')}><Text style={language === 'en' ? styles.langActive : styles.lang}>English</Text></TouchableOpacity>
      <Text style={styles.lang}> | </Text>
      <TouchableOpacity onPress={() => setLanguage('si')}><Text style={language === 'si' ? styles.langActive : styles.lang}>සිංහල</Text></TouchableOpacity>
    </View>
  );
}

function MenuTile({ title, icon, color, onPress }: { title: string; icon: keyof typeof Ionicons.glyphMap; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tile, { backgroundColor: color }]} onPress={onPress}>
      <Ionicons name={icon} size={36} color="white" />
      <Text style={styles.tileText}>{title}</Text>
    </TouchableOpacity>
  );
}

const emptyHadahan = { full_name: '', address: '', contact_number: '', additional_contact_number: '', date_of_birth: '', time_of_birth: '', place_of_birth: '', additional_notes: '' };

function LoginShell({ children, language, setLanguage }: { children: React.ReactNode; language: Language; setLanguage: (language: Language) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LanguageToggle language={language} setLanguage={setLanguage} />
      <Text style={styles.title}>Swasthi Life</Text>
      {children}
    </ScrollView>
  );
}

export default function App() {
  const [language, setLanguageState] = useState<Language>('si');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [form, setForm] = useState(emptyHadahan);
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [adminTab, setAdminTab] = useState<'requests' | 'dashboard'>('requests');
  const [adminNote, setAdminNote] = useState('');
  const t = copy[language];

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    AsyncStorage.setItem('language', next);
  };

  useEffect(() => {
    AsyncStorage.getItem('language').then(value => {
      if (value === 'en' || value === 'si') setLanguageState(value);
    });
  }, []);

  const preferred_language = language === 'si' ? 'SINHALA' : 'ENGLISH';

  async function registerAdminNotifications(authToken: string, signedInUser: User) {
    if (signedInUser.role !== 'ADMIN') return;
    try {
      const expoPushToken = await getAdminPushToken();
      if (!expoPushToken) return;
      await api('/api/admin/notifications/register-token', {
        method: 'POST',
        body: JSON.stringify({
          expo_push_token: expoPushToken,
          device_name: Constants.deviceName || null,
          platform: Platform.OS,
        }),
      }, authToken);
    } catch {
      // Push notification setup should never block admin login.
    }
  }

  async function checkUsername() {
    try {
      const result = await api('/api/auth/check-username', { method: 'POST', body: JSON.stringify({ username }) });
      setScreen(result.account_status === 'PENDING' ? 'activate' : 'password');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  }

  async function activate() {
    try {
      const result = await api('/api/auth/activate', { method: 'POST', body: JSON.stringify({ username, password, confirm_password: confirmPassword }) });
      setToken(result.access_token);
      setUser(result.user);
      await registerAdminNotifications(result.access_token, result.user);
      setScreen(result.user.role === 'ADMIN' ? 'admin' : 'home');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  }

  async function login() {
    try {
      const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      setToken(result.access_token);
      setUser(result.user);
      await registerAdminNotifications(result.access_token, result.user);
      setScreen(result.user.role === 'ADMIN' ? 'admin' : 'home');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  }

  async function submitForm(type: 'hadahan' | 'porondam') {
    try {
      const body = type === 'hadahan'
        ? { ...form, preferred_language }
        : {
            preferred_language,
            contact_person_name: form.full_name,
            address: form.address || null,
            contact_number: form.contact_number,
            additional_contact_number: form.additional_contact_number || null,
            girl: { full_name: form.full_name, date_of_birth: form.date_of_birth, time_of_birth: form.time_of_birth, place_of_birth: form.place_of_birth },
            boy: { full_name: form.additional_notes || form.full_name, date_of_birth: form.date_of_birth, time_of_birth: form.time_of_birth, place_of_birth: form.place_of_birth },
          };
      const result = await api(`/api/forms/${type}`, { method: 'POST', body: JSON.stringify(body) }, token || undefined);
      Alert.alert('Success', result.request_number);
      setForm(emptyHadahan);
      setScreen('home');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  }

  async function loadRequests(authToken = token) {
    if (!authToken) return;
    const result = await api('/api/admin/requests', {}, authToken);
    setRequests(result);
  }

  async function updateRequestStatus(requestNumber: string, status: 'DONE' | 'ON_HOLD' | 'CANCELLED') {
    if (!token) return;
    if ((status === 'ON_HOLD' || status === 'CANCELLED') && !adminNote.trim()) {
      Alert.alert('Error', 'Admin note is required for On Hold or Cancelled.');
      return;
    }
    try {
      await api(`/api/admin/requests/${requestNumber}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, admin_note: adminNote.trim() || null }),
      }, token);
      setAdminNote('');
      await loadRequests();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  }

  useEffect(() => {
    if (screen === 'admin') loadRequests().catch(error => Alert.alert('Error', error.message));
  }, [screen, adminTab]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      setAdminTab('requests');
      setScreen('admin');
      loadRequests().catch(() => undefined);
    });
    return () => subscription.remove();
  }, [token]);

  const dashboard = useMemo(() => ({
    total: requests.length,
    newCount: requests.filter(r => r.status === 'NEW').length,
    holdCount: requests.filter(r => r.status === 'ON_HOLD').length,
    doneCount: requests.filter(r => r.status === 'DONE').length,
  }), [requests]);

  if (screen === 'login') {
    return <LoginShell language={language} setLanguage={setLanguage}><Field label={t.username} value={username} onChangeText={setUsername} /><TouchableOpacity style={styles.button} onPress={checkUsername}><Text style={styles.buttonText}>{t.continue}</Text></TouchableOpacity><StatusBar style="dark" /></LoginShell>;
  }

  if (screen === 'activate') {
    return (
      <LoginShell language={language} setLanguage={setLanguage}>
        <Field label={t.password} value={password} onChangeText={setPassword} secureTextEntry />
        <Field label={t.confirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={activate}>
          <Text style={styles.buttonText}>{t.createPassword}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen('login')}>
          <Text style={styles.link}>{t.back}</Text>
        </TouchableOpacity>
      </LoginShell>
    );
  }

  if (screen === 'password') {
    return (
      <LoginShell language={language} setLanguage={setLanguage}>
        <Field label={t.password} value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>{t.login}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen('login')}>
          <Text style={styles.link}>{t.back}</Text>
        </TouchableOpacity>
      </LoginShell>
    );
  }

  if (screen === 'home') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <LanguageToggle language={language} setLanguage={setLanguage} />
        <Text style={styles.title}>{t.welcome}, {user?.full_name}</Text>
        <View style={styles.grid}>
          <MenuTile title={t.hadahan} icon="document-text-outline" color="#7A1E2C" onPress={() => setScreen('hadahan')} />
          <MenuTile title={t.porondam} icon="heart-half-outline" color="#B58A2A" onPress={() => setScreen('porondam')} />
          <MenuTile title={t.settings} icon="settings-outline" color="#3F5965" onPress={() => setScreen('settings')} />
          <MenuTile title={t.appInfo} icon="information-circle-outline" color="#466B48" onPress={() => setScreen('info')} />
        </View>
        <TouchableOpacity onPress={() => { setToken(null); setUser(null); setScreen('login'); }}><Text style={styles.logout}>{t.logout}</Text></TouchableOpacity>
      </ScrollView>
    );
  }

  if (screen === 'hadahan' || screen === 'porondam') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <LanguageToggle language={language} setLanguage={setLanguage} />
        <Text style={styles.title}>{screen === 'hadahan' ? t.hadahan : t.porondam}</Text>
        <Field label={screen === 'hadahan' ? t.fullName : 'Contact Person / Girl Name'} value={form.full_name} onChangeText={v => setForm({ ...form, full_name: v })} />
        <Field label={t.address} value={form.address} onChangeText={v => setForm({ ...form, address: v })} multiline />
        <Field label={t.contact} value={form.contact_number} onChangeText={v => setForm({ ...form, contact_number: v })} />
        <Field label={t.extraContact} value={form.additional_contact_number} onChangeText={v => setForm({ ...form, additional_contact_number: v })} />
        <Field label={t.dob} value={form.date_of_birth} onChangeText={v => setForm({ ...form, date_of_birth: v })} />
        <Field label={t.tob} value={form.time_of_birth} onChangeText={v => setForm({ ...form, time_of_birth: v })} />
        <Field label={t.pob} value={form.place_of_birth} onChangeText={v => setForm({ ...form, place_of_birth: v })} />
        <Field label={screen === 'hadahan' ? t.notes : 'Boy Name'} value={form.additional_notes} onChangeText={v => setForm({ ...form, additional_notes: v })} multiline />
        <TouchableOpacity style={styles.button} onPress={() => submitForm(screen as 'hadahan' | 'porondam')}><Text style={styles.buttonText}>{t.submit}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen('home')}><Text style={styles.link}>{t.back}</Text></TouchableOpacity>
      </ScrollView>
    );
  }

  if (screen === 'admin') {
    return (
      <View style={styles.full}>
        <ScrollView contentContainerStyle={styles.container}>
          <LanguageToggle language={language} setLanguage={setLanguage} />
          <Text style={styles.title}>{adminTab === 'requests' ? t.requests : t.dashboard}</Text>
          {adminTab === 'requests' ? (
            requests.length ? requests.map(item => (
              <View key={item.request_number} style={styles.card}>
                <Text style={styles.cardTitle}>{item.request_number}</Text>
                <Text>{item.form_type} - {item.source}</Text>
                <Text>{item.submitted_date} {item.submitted_time}</Text>
                <Text>Status: {item.status}</Text>
                <Field label={t.adminNote} value={adminNote} onChangeText={setAdminNote} multiline />
                <View style={styles.statusRow}>
                  <TouchableOpacity style={styles.smallButton} onPress={() => updateRequestStatus(item.request_number, 'DONE')}><Text style={styles.smallButtonText}>{t.done}</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.smallButton} onPress={() => updateRequestStatus(item.request_number, 'ON_HOLD')}><Text style={styles.smallButtonText}>{t.hold}</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.smallButtonDanger} onPress={() => updateRequestStatus(item.request_number, 'CANCELLED')}><Text style={styles.smallButtonText}>{t.cancel}</Text></TouchableOpacity>
                </View>
              </View>
            )) : <Text>{t.noRequests}</Text>
          ) : (
            <View style={styles.grid}>
              <View style={styles.stat}><Text style={styles.statNumber}>{dashboard.total}</Text><Text>Total</Text></View>
              <View style={styles.stat}><Text style={styles.statNumber}>{dashboard.newCount}</Text><Text>New</Text></View>
              <View style={styles.stat}><Text style={styles.statNumber}>{dashboard.holdCount}</Text><Text>On Hold</Text></View>
              <View style={styles.stat}><Text style={styles.statNumber}>{dashboard.doneCount}</Text><Text>Done</Text></View>
            </View>
          )}
        </ScrollView>
        <View style={styles.bottomTabs}>
          <TouchableOpacity onPress={() => setAdminTab('requests')}><Text style={adminTab === 'requests' ? styles.tabActive : styles.tab}>{t.requests}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setAdminTab('dashboard')}><Text style={adminTab === 'dashboard' ? styles.tabActive : styles.tab}>{t.dashboard}</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LanguageToggle language={language} setLanguage={setLanguage} />
      <Text style={styles.title}>{screen === 'settings' ? t.settings : t.appInfo}</Text>
      <Text style={styles.paragraph}>{screen === 'settings' ? `${t.logout}` : t.infoText}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setScreen('home')}><Text style={styles.buttonText}>{t.back}</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, backgroundColor: '#FFFDF8' },
  container: { flexGrow: 1, backgroundColor: '#FFFDF8', padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '800', color: '#2F2F2F', marginBottom: 24 },
  language: { flexDirection: 'row', alignSelf: 'flex-end', marginBottom: 18 },
  lang: { color: '#666', fontSize: 15 },
  langActive: { color: '#7A1E2C', fontWeight: '800', fontSize: 15 },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 6 },
  input: { backgroundColor: 'white', borderColor: '#DDD2BF', borderWidth: 1, borderRadius: 8, minHeight: 48, paddingHorizontal: 12, color: '#222' },
  multiline: { minHeight: 86, textAlignVertical: 'top', paddingTop: 12 },
  button: { minHeight: 50, borderRadius: 8, backgroundColor: '#7A1E2C', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { width: '48%', aspectRatio: 1, borderRadius: 8, padding: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  tileText: { color: 'white', fontWeight: '800', textAlign: 'center', marginTop: 10, fontSize: 15 },
  logout: { color: '#7A1E2C', fontWeight: '800', textAlign: 'center', marginTop: 12 },
  link: { color: '#7A1E2C', fontWeight: '700', textAlign: 'center', padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#E5DAC8', padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#7A1E2C' },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  smallButton: { flex: 1, minHeight: 42, borderRadius: 8, backgroundColor: '#7A1E2C', alignItems: 'center', justifyContent: 'center' },
  smallButtonDanger: { flex: 1, minHeight: 42, borderRadius: 8, backgroundColor: '#8A342E', alignItems: 'center', justifyContent: 'center' },
  smallButtonText: { color: 'white', fontWeight: '800', fontSize: 12, textAlign: 'center' },
  stat: { width: '48%', backgroundColor: 'white', borderRadius: 8, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5DAC8', marginBottom: 12 },
  statNumber: { fontSize: 28, fontWeight: '900', color: '#7A1E2C' },
  bottomTabs: { minHeight: 64, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E5DAC8', backgroundColor: 'white' },
  tab: { color: '#666', fontWeight: '700' },
  tabActive: { color: '#7A1E2C', fontWeight: '900' },
  paragraph: { fontSize: 16, lineHeight: 24, color: '#444' },
});
