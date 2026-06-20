import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const API_URL = 'https://swasthi-life-backend.vercel.app';

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
type RequestDetail = RequestSummary & { data: any; admin_note: string | null; last_updated: string | null };

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
    total: 'Total',
    newLabel: 'New',
    done: 'Done',
    hold: 'On Hold',
    cancel: 'Cancel',
    adminNote: 'Admin Note',
    noRequests: 'No requests yet.',
    infoText: 'Swasthi Life form app for Hadahan and Porondam requests.',
    back: 'Back',
    menu: 'Menu',
    contactSection: 'Contact & Additional Info',
    girlSection: 'Girl Details',
    boySection: 'Boy Details',
    selectPrompt: '-- Select --',
    contactPerson: 'Contact Person Name',
    girlName: 'Girl Full Name',
    girlDob: 'Girl Date of Birth',
    girlTob: 'Girl Time of Birth',
    girlPob: 'Girl Place of Birth',
    boyName: 'Boy Full Name',
    boyDob: 'Boy Date of Birth',
    boyTob: 'Boy Time of Birth',
    boyPob: 'Boy Place of Birth',
    notificationPreferences: 'Notification Preferences',
    pushNotifications: 'Push Notifications',
    pushNotificationsDesc: 'Receive notifications about request status updates.',
    adminAlerts: 'Admin Alerts Trigger',
    adminAlertsDesc: 'Choose when you want to receive new submission alerts.',
    everyForm: 'Every New Form',
    dailySummary: 'Daily Summaries Only',
    clear: 'Clear',
    validationError: 'Validation Error',
    errFullName: 'Full Name is required.',
    errDob: 'Date of Birth is required.',
    errTob: 'Time of Birth is required.',
    errPob: 'Place of Birth is required.',
    errContact: 'Contact Number is required.',
    errGirlName: 'Girl Full Name is required.',
    errGirlDob: 'Girl Date of Birth is required.',
    errGirlTob: 'Girl Time of Birth is required.',
    errGirlPob: 'Girl Place of Birth is required.',
    errBoyName: 'Boy Full Name is required.',
    errBoyDob: 'Boy Date of Birth is required.',
    errBoyTob: 'Boy Time of Birth is required.',
    errBoyPob: 'Boy Place of Birth is required.',
    errContactPerson: 'Contact Person Name is required.',
    version: 'Version',
    lastUpdate: 'Last Update',
    history: 'History',
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
    total: 'මුළු එකතුව',
    newLabel: 'නව',
    done: 'අවසන්',
    hold: 'තාවකාලිකව නතර',
    cancel: 'අවලංගු',
    adminNote: 'පරිපාලක සටහන',
    noRequests: 'ඉල්ලීම් නොමැත.',
    infoText: 'හඳහන් සහ පොරොන්දම් ඉල්ලීම් සඳහා Swasthi Life යෙදුම.',
    back: 'ආපසු',
    menu: 'මෙනුව',
    contactSection: 'සම්බන්ධතා සහ අමතර තොරතුරු',
    girlSection: 'ගැහැණු ළමයාගේ විස්තර',
    boySection: 'පිරිමි ළමයාගේ විස්තර',
    selectPrompt: '-- තෝරන්න --',
    contactPerson: 'සම්බන්ධ කරගත යුතු පුද්ගලයාගේ නම',
    girlName: 'ගැහැණු ළමයාගේ සම්පූර්ණ නම',
    girlDob: 'ගැහැණු ළමයාගේ උපන් දිනය',
    girlTob: 'ගැහැණු ළමයාගේ උපන් වේලාව',
    girlPob: 'ගැහැණු ළමයාගේ උපන් ස්ථානය',
    boyName: 'පිරිමි ළමයාගේ සම්පූර්ණ නම',
    boyDob: 'පිරිමි ළමයාගේ උපන් දිනය',
    boyTob: 'පිරිමි ළමයාගේ උපන් වේලාව',
    boyPob: 'පිරිමි ළමයාගේ උපන් ස්ථානය',
    notificationPreferences: 'දැනුම්දීම් සැකසුම්',
    pushNotifications: 'තල්ලු දැනුම්දීම් (Push Notifications)',
    pushNotificationsDesc: 'ඉල්ලීම්වල තත්ත්ව යාවත්කාලීන කිරීම් පිළිබඳ දැනුම්දීම් ලබා ගන්න.',
    adminAlerts: 'පරිපාලක දැනුම්දීම් ක්‍රමය',
    adminAlertsDesc: 'නව පෝරම යොමු කිරීම් පිළිබඳ දැනුම්දීම් ලබාගත යුතු ආකාරය තෝරන්න.',
    everyForm: 'සෑම නව පෝරමයකදීම',
    dailySummary: 'දෛනික සාරාංශ පමණක්',
    clear: 'හිස් කරන්න',
    validationError: 'වලංගුකරණ දෝෂය',
    errFullName: 'සම්පූර්ණ නම ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errDob: 'උපන් දිනය ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errTob: 'උපන් වේලාව ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errPob: 'උපන් ස්ථානය ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errContact: 'දුරකථන අංකය ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errGirlName: 'ගැහැණු ළමයාගේ සම්පූර්ණ නම ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errGirlDob: 'ගැහැණු ළමයාගේ උපන් දිනය ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errGirlTob: 'ගැහැණු ළමයාගේ උපන් වේලාව ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errGirlPob: 'ගැහැණු ළමයාගේ උපන් ස්ථානය ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errBoyName: 'පිරිමි ළමයාගේ සම්පූර්ණ නම ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errBoyDob: 'පිරිමි ළමයාගේ උපන් දිනය ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errBoyTob: 'පිරිමි ළමයාගේ උපන් වේලාව ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errBoyPob: 'පිරිමි ළමයාගේ උපන් ස්ථානය ඇතුළත් කිරීම අවශ්‍ය වේ.',
    errContactPerson: 'සම්බන්ධ කරගත යුතු පුද්ගලයාගේ නම ඇතුළත් කිරීම අවශ්‍ය වේ.',
    version: 'අනුවාදය',
    lastUpdate: 'අවසන් යාවත්කාලීන කිරීම',
    history: 'ඉතිහාසය',
  },
};

function formatApiError(detail: any): string {
  if (!detail) return 'Request failed';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map(err => {
        if (typeof err === 'string') return err;
        const loc = err.loc;
        const fieldName = Array.isArray(loc) && loc.length > 0 ? loc[loc.length - 1] : '';
        const msg = err.msg || 'Invalid value';
        if (fieldName) {
          const cleanField = fieldName
            .replace(/_/g, ' ')
            .replace(/^\w/, (c: string) => c.toUpperCase());
          return `${cleanField}: ${msg}`;
        }
        return msg;
      })
      .join('\n');
  }
  if (typeof detail === 'object') {
    return JSON.stringify(detail);
  }
  return String(detail);
}

async function api(path: string, options: RequestInit = {}, token?: string) {
  const url = `${API_URL}${path}`;
  console.log(`[API Request] ${options.method || 'GET'} ${url}`);
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMsg = formatApiError(body.detail);
      throw new Error(errorMsg);
    }
    return body;
  } catch (error) {
    console.error(`[API Error] Request to ${url} failed:`, error);
    if (error instanceof TypeError && error.message === 'Network request failed') {
      throw new Error(`Network request failed. Please check if the backend is running and accessible at: ${API_URL}`);
    }
    throw error;
  }
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
    if (year.length === 4) {
      return `${year}-${month}-${day}`;
    }
  }
  return dateStr;
}

function SectionDivider({ label }: { label: string }) {
  return (
    <View style={styles.sectionDivider}>
      <View style={styles.dividerLine} />
      <View style={styles.sectionDividerBadge}>
        <Text style={styles.sectionDividerText}>{label}</Text>
      </View>
      <View style={styles.dividerLine} />
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline = false,
  secureTextEntry = false,
  options = [],
  selectPrompt = '',
  placeholder = ''
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  secureTextEntry?: boolean;
  options?: { label: string; value: string }[];
  selectPrompt?: string;
  placeholder?: string;
}) {
  const [modalVisible, setModalVisible] = useState(false);

  if (options && options.length > 0) {
    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : (selectPrompt || placeholder || 'Select option');
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
          <Text style={[styles.pickerButtonText, !selectedOption && styles.placeholderText]}>{displayValue}</Text>
          <Ionicons name="chevron-down" size={18} color="#7A1E2C" />
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{label}</Text>
                  <FlatList
                    data={options}
                    keyExtractor={item => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.modalItem, item.value === value && styles.modalItemActive]}
                        onPress={() => {
                          onChangeText(item.value);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={[styles.modalItemText, item.value === value && styles.modalItemTextActive]}>
                          {item.label}
                        </Text>
                        {item.value === value && <Ionicons name="checkmark" size={18} color="#7A1E2C" />}
                      </TouchableOpacity>
                    )}
                    style={{ maxHeight: 300 }}
                  />
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor="#999"
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_SI = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];

function format24hTo12h(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10);
    const min = parts[1].slice(0, 2);
    if (isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${String(hour).padStart(2, '0')}:${min} ${ampm}`;
  }
  return timeStr;
}

function DatePickerField({
  label,
  value,
  onChange,
  language,
  placeholder = 'DD/MM/YYYY'
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  language: 'en' | 'si';
  placeholder?: string;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'day' | 'month' | 'year'>('day');
  
  const [tempDay, setTempDay] = useState(15);
  const [tempMonth, setTempMonth] = useState(6);
  const [tempYear, setTempYear] = useState(1995);

  useEffect(() => {
    if (value) {
      const parts = value.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (!isNaN(d)) setTempDay(d);
        if (!isNaN(m)) setTempMonth(m);
        if (!isNaN(y)) setTempYear(y);
      }
    }
    setActiveTab('day');
  }, [value, modalVisible]);

  const months = language === 'si' ? MONTHS_SI : MONTHS_EN;
  
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list = [];
    for (let y = currentYear; y >= 1940; y--) {
      list.push(y);
    }
    return list;
  }, []);

  const daysInMonth = useMemo(() => {
    return new Date(tempYear, tempMonth, 0).getDate();
  }, [tempMonth, tempYear]);

  useEffect(() => {
    if (tempDay > daysInMonth) {
      setTempDay(daysInMonth);
    }
  }, [daysInMonth, tempDay]);

  const handleConfirm = () => {
    const dStr = String(tempDay).padStart(2, '0');
    const mStr = String(tempMonth).padStart(2, '0');
    onChange(`${dStr}/${mStr}/${tempYear}`);
    setModalVisible(false);
  };

  const displayValue = value || placeholder;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
        <Text style={[styles.pickerButtonText, !value && styles.placeholderText]}>{displayValue}</Text>
        <Ionicons name="calendar-outline" size={18} color="#7A1E2C" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerModalContent}>
                <Text style={styles.modalTitle}>{label}</Text>

                <View style={styles.pickerTabs}>
                  <TouchableOpacity 
                    style={[styles.pickerTab, activeTab === 'day' && styles.pickerTabActive]} 
                    onPress={() => setActiveTab('day')}
                  >
                    <Text style={[styles.pickerTabText, activeTab === 'day' && styles.pickerTabTextActive]}>
                      {language === 'si' ? 'දිනය' : 'Day'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.pickerTab, activeTab === 'month' && styles.pickerTabActive]} 
                    onPress={() => setActiveTab('month')}
                  >
                    <Text style={[styles.pickerTabText, activeTab === 'month' && styles.pickerTabTextActive]}>
                      {language === 'si' ? 'මාසය' : 'Month'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.pickerTab, activeTab === 'year' && styles.pickerTabActive]} 
                    onPress={() => setActiveTab('year')}
                  >
                    <Text style={[styles.pickerTabText, activeTab === 'year' && styles.pickerTabTextActive]}>
                      {language === 'si' ? 'වසර' : 'Year'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.pickerTabContent}>
                  {activeTab === 'day' && (
                    <View style={styles.gridContainer}>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <TouchableOpacity
                          key={d}
                          style={[styles.gridCell, styles.gridCell7, tempDay === d && styles.gridCellActive]}
                          onPress={() => {
                            setTempDay(d);
                            setActiveTab('month');
                          }}
                        >
                          <Text style={[styles.gridCellText, tempDay === d && styles.gridCellTextActive]}>{d}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {activeTab === 'month' && (
                    <View style={styles.gridContainer}>
                      {months.map((m, index) => {
                        const mVal = index + 1;
                        return (
                          <TouchableOpacity
                            key={mVal}
                            style={[styles.gridCell, styles.gridCell3, tempMonth === mVal && styles.gridCellActive]}
                            onPress={() => {
                              setTempMonth(mVal);
                              setActiveTab('year');
                            }}
                          >
                            <Text style={[styles.gridCellText, tempMonth === mVal && styles.gridCellTextActive]}>{m}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {activeTab === 'year' && (
                    <FlatList
                      data={years}
                      keyExtractor={item => String(item)}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[styles.yearItem, tempYear === item && styles.yearItemActive]}
                          onPress={() => {
                            setTempYear(item);
                            handleYearConfirm(item);
                          }}
                        >
                          <Text style={[styles.yearItemText, tempYear === item && styles.yearItemTextActive]}>
                            {item}
                          </Text>
                          {tempYear === item && <Ionicons name="checkmark-circle" size={20} color="#7A1E2C" />}
                        </TouchableOpacity>
                      )}
                      style={{ maxHeight: 240 }}
                      initialScrollIndex={years.indexOf(tempYear) >= 0 ? years.indexOf(tempYear) : 0}
                      getItemLayout={(_data, index) => ({ length: 48, offset: 48 * index, index })}
                    />
                  )}
                </View>

                <View style={styles.pickerActions}>
                  <TouchableOpacity style={styles.pickerCancelButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.pickerCancelButtonText}>{language === 'si' ? 'අවලංගු' : 'Cancel'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pickerConfirmButton} onPress={handleConfirm}>
                    <Text style={styles.pickerConfirmButtonText}>{language === 'si' ? 'තහවුරුයි' : 'Confirm'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );

  function handleYearConfirm(y: number) {
    const dStr = String(tempDay).padStart(2, '0');
    const mStr = String(tempMonth).padStart(2, '0');
    onChange(`${dStr}/${mStr}/${y}`);
    setModalVisible(false);
  }
}

const WHEEL_ITEM_H = 48;
const WHEEL_VISIBLE = 5;
const WHEEL_HEIGHT = WHEEL_ITEM_H * WHEEL_VISIBLE;
const WHEEL_PAD = WHEEL_ITEM_H * Math.floor(WHEEL_VISIBLE / 2);

function WheelColumn({
  data,
  selectedIndex,
  onSelect,
  formatItem,
}: {
  data: number[] | string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  formatItem: (item: any) => string;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selectedIndex * WHEEL_ITEM_H, animated: false });
      setIsReady(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / WHEEL_ITEM_H);
    const clamped = Math.max(0, Math.min(idx, data.length - 1));
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => onSelect(clamped), 60);
  }, [data.length, onSelect]);

  return (
    <View style={wheelStyles.columnWrap}>
      <View style={wheelStyles.highlightBar} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_H}
        decelerationRate="fast"
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ paddingVertical: WHEEL_PAD }}
        onMomentumScrollEnd={handleScroll}
        onScrollEndDrag={handleScroll}
        style={{ opacity: isReady ? 1 : 0, zIndex: 2 }}
      >
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPress={() => {
              scrollRef.current?.scrollTo({ y: index * WHEEL_ITEM_H, animated: true });
              onSelect(index);
            }}
            style={wheelStyles.wheelItem}
          >
            <Text style={[
              wheelStyles.wheelItemText,
              index === selectedIndex && wheelStyles.wheelItemTextActive,
            ]}>
              {formatItem(item)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={[wheelStyles.fadeMask, wheelStyles.fadeTop]} pointerEvents="none" />
      <View style={[wheelStyles.fadeMask, wheelStyles.fadeBottom]} pointerEvents="none" />
    </View>
  );
}

const wheelStyles = StyleSheet.create({
  columnWrap: {
    flex: 1,
    height: WHEEL_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  highlightBar: {
    position: 'absolute',
    top: WHEEL_PAD,
    left: 4,
    right: 4,
    height: WHEEL_ITEM_H,
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E8C8CC',
    zIndex: 1,
  },
  fadeMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: WHEEL_PAD,
    zIndex: 3,
  },
  fadeTop: {
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  fadeBottom: {
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  wheelItem: {
    height: WHEEL_ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444444',
  },
  wheelItemTextActive: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7A1E2C',
  },
});

function TimePickerField({
  label,
  value,
  onChange,
  language,
  placeholder = 'HH:MM'
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  language: 'en' | 'si';
  placeholder?: string;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const hours = useMemo(() => Array.from({ length: 13 }, (_, i) => i), []); // 0 to 12
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const ampmOptions = useMemo(() => ['AM', 'PM'] as const, []);

  const [selHour, setSelHour] = useState(12);   // Default to index 12 → hour 12
  const [selMinute, setSelMinute] = useState(0); // index 0-59
  const [selAmPm, setSelAmPm] = useState(0);     // 0=AM, 1=PM

  // key forces remount of WheelColumns when modal opens to re-scroll
  const [wheelKey, setWheelKey] = useState(0);

  useEffect(() => {
    if (modalVisible) {
      if (value) {
        const parts = value.split(':');
        if (parts.length >= 2) {
          let h = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(h) && !isNaN(m)) {
            setSelAmPm(h >= 12 ? 1 : 0);
            let h12 = h % 12;
            const idx = hours.indexOf(h12);
            if (idx >= 0) {
              setSelHour(idx);
            } else {
              setSelHour(12); // Default to 12
            }
            setSelMinute(m);
          }
        }
      }
      setWheelKey(k => k + 1);
    }
  }, [modalVisible]);

  const handleConfirm = () => {
    const hour12 = hours[selHour];
    let h24 = hour12;
    if (selAmPm === 1 && hour12 < 12) h24 += 12;
    else if (selAmPm === 0 && hour12 === 12) h24 = 0;
    const hStr = String(h24).padStart(2, '0');
    const mStr = String(minutes[selMinute]).padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
    setModalVisible(false);
  };

  const displayValue = value ? format24hTo12h(value) : placeholder;

  const previewHour = hours[selHour] !== undefined ? hours[selHour] : 12;
  const previewMin = minutes[selMinute] ?? 0;
  const previewAmPm = ampmOptions[selAmPm] || 'AM';

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
        <Text style={[styles.pickerButtonText, !value && styles.placeholderText]}>{displayValue}</Text>
        <Ionicons name="time-outline" size={18} color="#7A1E2C" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerModalContent}>
                <Text style={styles.modalTitle}>{label}</Text>

                <View style={styles.wheelRow} key={wheelKey}>
                  <View style={styles.wheelLabelCol}>
                    <Text style={styles.wheelLabel}>{language === 'si' ? 'පැය' : 'Hour'}</Text>
                  </View>
                  <View style={styles.wheelLabelCol}>
                    <Text style={styles.wheelLabel}>{language === 'si' ? 'විනාඩි' : 'Min'}</Text>
                  </View>
                  <View style={styles.wheelLabelCol}>
                    <Text style={styles.wheelLabel}> </Text>
                  </View>
                </View>

                <View style={styles.wheelRow}>
                  <WheelColumn
                    data={hours}
                    selectedIndex={selHour}
                    onSelect={setSelHour}
                    formatItem={(h: number) => String(h).padStart(2, '0')}
                  />
                  <View style={styles.wheelColon}>
                    <Text style={styles.wheelColonText}>:</Text>
                  </View>
                  <WheelColumn
                    data={minutes}
                    selectedIndex={selMinute}
                    onSelect={setSelMinute}
                    formatItem={(m: number) => String(m).padStart(2, '0')}
                  />
                  <WheelColumn
                    data={ampmOptions as any}
                    selectedIndex={selAmPm}
                    onSelect={setSelAmPm}
                    formatItem={(v: string) => v}
                  />
                </View>

                <View style={[styles.pickerActions, { marginTop: 20 }]}>
                  <TouchableOpacity style={styles.pickerCancelButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.pickerCancelButtonText}>{language === 'si' ? 'අවලංගු' : 'Cancel'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pickerConfirmButton} onPress={handleConfirm}>
                    <Text style={styles.pickerConfirmButtonText}>{language === 'si' ? 'තහවුරුයි' : 'Confirm'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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

const emptyForm = {
  full_name: '',
  address: '',
  contact_number: '',
  additional_contact_number: '',
  additional_notes: '',
  date_of_birth: '',
  time_of_birth: '',
  place_of_birth: '',
  girl_full_name: '',
  girl_date_of_birth: '',
  girl_time_of_birth: '',
  girl_place_of_birth: '',
  boy_full_name: '',
  boy_date_of_birth: '',
  boy_time_of_birth: '',
  boy_place_of_birth: '',
};

function ScreenHeader({ onBack, language, setLanguage }: { onBack: () => void; language: Language; setLanguage: (language: Language) => void }) {
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#7A1E2C" />
      </TouchableOpacity>
      <LanguageToggle language={language} setLanguage={setLanguage} />
    </View>
  );
}

function LoginShell({ children, language, setLanguage, onBack }: { children: React.ReactNode; language: Language; setLanguage: (language: Language) => void; onBack?: () => void }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.loginContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.loginHeader}>
          {onBack ? (
            <ScreenHeader onBack={onBack} language={language} setLanguage={setLanguage} />
          ) : (
            <LanguageToggle language={language} setLanguage={setLanguage} />
          )}
        </View>
        <View style={styles.loginFormWrap}>
          <Text style={styles.loginTitle}>Swasthi Life</Text>
          {children}
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [language, setLanguageState] = useState<Language>('si');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [adminTab, setAdminTab] = useState<'requests' | 'dashboard' | 'menu'>('requests');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [adminTriggerEvery, setAdminTriggerEvery] = useState(true);
  const [adminTriggerDaily, setAdminTriggerDaily] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestDetail | null>(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [tempAdminNote, setTempAdminNote] = useState('');
  const t = copy[language];

  const [timeFilter, setTimeFilter] = useState<'1YR' | 'TODAY' | 'WEEK' | 'MONTH'>('1YR');
  const [historyTimeFilter, setHistoryTimeFilter] = useState<'1YR' | 'TODAY' | 'WEEK' | 'MONTH'>('1YR');
  const [expandedTiles, setExpandedTiles] = useState<Record<string, boolean>>({});
  const [showHadahanBreakdown, setShowHadahanBreakdown] = useState(false);
  const [showPorondamBreakdown, setShowPorondamBreakdown] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<'DONE' | 'ON_HOLD' | 'CANCELLED' | null>(null);

  const activeRequests = useMemo(() => {
    return requests.filter(r => r.status === 'NEW' || r.status === 'ON_HOLD');
  }, [requests]);

  const historyRequests = useMemo(() => {
    return requests.filter(r => r.status === 'DONE' || r.status === 'CANCELLED');
  }, [requests]);

  const filteredHistoryRequests = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return historyRequests.filter(r => {
      if (!r.submitted_date) return false;
      const [year, month, day] = r.submitted_date.split('-').map(Number);
      const reqDate = new Date(year, month - 1, day);
      
      if (historyTimeFilter === 'TODAY') {
        return reqDate.getFullYear() === today.getFullYear() &&
               reqDate.getMonth() === today.getMonth() &&
               reqDate.getDate() === today.getDate();
      }
      
      const diffTime = today.getTime() - reqDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (historyTimeFilter === 'WEEK') {
        return diffDays >= 0 && diffDays < 7;
      }
      
      if (historyTimeFilter === 'MONTH') {
        return diffDays >= 0 && diffDays < 30;
      }
      
      if (historyTimeFilter === '1YR') {
        return diffDays >= 0 && diffDays < 365;
      }
      
      return true;
    });
  }, [historyRequests, historyTimeFilter]);

  const cityOptions = useMemo(() => {
    return CITIES.map(c => ({
      label: language === 'si' ? c.si : c.en,
      value: language === 'si' ? c.si : c.en,
    }));
  }, [language]);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    AsyncStorage.setItem('language', next);
  };

  useEffect(() => {
    AsyncStorage.getItem('language').then(value => {
      if (value === 'en' || value === 'si') setLanguageState(value);
    });
    AsyncStorage.getItem('pushEnabled').then(val => {
      if (val !== null) setPushEnabled(val === 'true');
    });
    AsyncStorage.getItem('adminTrigger').then(val => {
      if (val === 'EVERY') {
        setAdminTriggerEvery(true);
        setAdminTriggerDaily(false);
      } else if (val === 'DAILY') {
        setAdminTriggerEvery(false);
        setAdminTriggerDaily(true);
      } else {
        AsyncStorage.getItem('adminTriggerEvery').then(everyVal => {
          if (everyVal !== null) setAdminTriggerEvery(everyVal === 'true');
        });
        AsyncStorage.getItem('adminTriggerDaily').then(dailyVal => {
          if (dailyVal !== null) setAdminTriggerDaily(dailyVal === 'true');
        });
      }
    });
  }, []);

  const preferred_language = language === 'si' ? 'SINHALA' : 'ENGLISH';

  async function registerAdminNotifications(authToken: string, signedInUser: User) {
    if (signedInUser.role !== 'ADMIN') return;
    try {
      const isEnabledVal = await AsyncStorage.getItem('pushEnabled');
      if (isEnabledVal === 'false') return;

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

  async function togglePushNotifications(value: boolean) {
    setPushEnabled(value);
    await AsyncStorage.setItem('pushEnabled', value ? 'true' : 'false');
    if (user?.role === 'ADMIN') {
      try {
        setLoading(true);
        const expoPushToken = await getAdminPushToken();
        if (expoPushToken) {
          if (value) {
            await api('/api/admin/notifications/register-token', {
              method: 'POST',
              body: JSON.stringify({
                expo_push_token: expoPushToken,
                device_name: Constants.deviceName || null,
                platform: Platform.OS,
              }),
            }, token || undefined);
          } else {
            await api('/api/admin/notifications/unregister-token', {
              method: 'POST',
              body: JSON.stringify({
                expo_push_token: expoPushToken,
              }),
            }, token || undefined);
          }
        }
      } catch (error) {
        Alert.alert('Error', (error as Error).message);
      } finally {
        setLoading(false);
      }
    }
  }

  async function toggleAdminTriggerEvery() {
    const newVal = !adminTriggerEvery;
    setAdminTriggerEvery(newVal);
    await AsyncStorage.removeItem('adminTrigger');
    await AsyncStorage.setItem('adminTriggerEvery', newVal ? 'true' : 'false');
  }

  async function toggleAdminTriggerDaily() {
    const newVal = !adminTriggerDaily;
    setAdminTriggerDaily(newVal);
    await AsyncStorage.removeItem('adminTrigger');
    await AsyncStorage.setItem('adminTriggerDaily', newVal ? 'true' : 'false');
  }

  async function checkUsername() {
    setLoading(true);
    try {
      const result = await api('/api/auth/check-username', { method: 'POST', body: JSON.stringify({ username }) });
      setScreen(result.account_status === 'PENDING' ? 'activate' : 'password');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function activate() {
    setLoading(true);
    try {
      const result = await api('/api/auth/activate', { method: 'POST', body: JSON.stringify({ username, password, confirm_password: confirmPassword }) });
      setToken(result.access_token);
      setUser(result.user);
      await registerAdminNotifications(result.access_token, result.user);
      setScreen(result.user.role === 'ADMIN' ? 'admin' : 'home');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    setLoading(true);
    try {
      const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      setToken(result.access_token);
      setUser(result.user);
      await registerAdminNotifications(result.access_token, result.user);
      setScreen(result.user.role === 'ADMIN' ? 'admin' : 'home');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function submitForm(type: 'hadahan' | 'porondam') {
    // Client-side validations
    if (type === 'hadahan') {
      if (!form.full_name.trim()) {
        Alert.alert(t.validationError, t.errFullName);
        return;
      }
      if (!form.date_of_birth) {
        Alert.alert(t.validationError, t.errDob);
        return;
      }
      if (!form.time_of_birth) {
        Alert.alert(t.validationError, t.errTob);
        return;
      }
      if (!form.place_of_birth) {
        Alert.alert(t.validationError, t.errPob);
        return;
      }
      if (!form.contact_number.trim()) {
        Alert.alert(t.validationError, t.errContact);
        return;
      }
    } else {
      if (!form.boy_full_name.trim()) {
        Alert.alert(t.validationError, t.errBoyName);
        return;
      }
      if (!form.boy_date_of_birth) {
        Alert.alert(t.validationError, t.errBoyDob);
        return;
      }
      if (!form.boy_time_of_birth) {
        Alert.alert(t.validationError, t.errBoyTob);
        return;
      }
      if (!form.boy_place_of_birth) {
        Alert.alert(t.validationError, t.errBoyPob);
        return;
      }
      if (!form.girl_full_name.trim()) {
        Alert.alert(t.validationError, t.errGirlName);
        return;
      }
      if (!form.girl_date_of_birth) {
        Alert.alert(t.validationError, t.errGirlDob);
        return;
      }
      if (!form.girl_time_of_birth) {
        Alert.alert(t.validationError, t.errGirlTob);
        return;
      }
      if (!form.girl_place_of_birth) {
        Alert.alert(t.validationError, t.errGirlPob);
        return;
      }
      if (!form.full_name.trim()) {
        Alert.alert(t.validationError, t.errContactPerson);
        return;
      }
      if (!form.contact_number.trim()) {
        Alert.alert(t.validationError, t.errContact);
        return;
      }
    }

    setLoading(true);
    try {
      const body = type === 'hadahan'
        ? {
            preferred_language,
            full_name: form.full_name,
            address: form.address || null,
            contact_number: form.contact_number,
            additional_contact_number: form.additional_contact_number || null,
            date_of_birth: formatDateToISO(form.date_of_birth),
            time_of_birth: form.time_of_birth,
            place_of_birth: form.place_of_birth,
            additional_notes: form.additional_notes || null,
          }
        : {
            preferred_language,
            contact_person_name: form.full_name,
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
      const result = await api(`/api/forms/${type}`, { method: 'POST', body: JSON.stringify(body) }, token || undefined);
      Alert.alert('Success', result.request_number);
      setForm(emptyForm);
      setScreen(user?.role === 'ADMIN' ? 'admin' : 'home');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadRequests(authToken = token) {
    if (!authToken) return;
    setLoadingRequests(true);
    try {
      const result = await api('/api/admin/requests', {}, authToken);
      setRequests(result);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoadingRequests(false);
    }
  }

  async function openRequestDetails(requestNumber: string) {
    if (!token) return;
    setFetchingDetail(true);
    try {
      const detail = await api(`/api/admin/requests/${requestNumber}`, {}, token);
      setSelectedRequest(detail);
      setTempAdminNote(detail.admin_note || '');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setFetchingDetail(false);
    }
  }

  function renderDetailRow(label: string, value: any) {
    if (value === undefined || value === null || value === '') return null;
    return (
      <View style={styles.detailRow} key={label}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{String(value)}</Text>
      </View>
    );
  }

  async function updateRequestStatus(requestNumber: string, status: 'DONE' | 'ON_HOLD' | 'CANCELLED', note: string) {
    if (!token) return;
    setStatusUpdating(status);
    try {
      await api(`/api/admin/requests/${requestNumber}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, admin_note: note.trim() || null }),
      }, token);
      setRequests(prev => prev.map(r => r.request_number === requestNumber ? { ...r, status } : r));
      setSelectedRequest(null);
      await loadRequests();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setStatusUpdating(null);
    }
  }

  useEffect(() => {
    if (screen === 'admin' || screen === 'history') loadRequests().catch(error => Alert.alert('Error', error.message));
  }, [screen, adminTab]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      setAdminTab('requests');
      setScreen('admin');
      loadRequests().catch(() => undefined);
    });
    return () => subscription.remove();
  }, [token]);

  const filteredRequests = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return requests.filter(r => {
      if (!r.submitted_date) return false;
      const [year, month, day] = r.submitted_date.split('-').map(Number);
      const reqDate = new Date(year, month - 1, day);
      
      if (timeFilter === 'TODAY') {
        return reqDate.getFullYear() === today.getFullYear() &&
               reqDate.getMonth() === today.getMonth() &&
               reqDate.getDate() === today.getDate();
      }
      
      const diffTime = today.getTime() - reqDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (timeFilter === 'WEEK') {
        return diffDays >= 0 && diffDays < 7;
      }
      
      if (timeFilter === 'MONTH') {
        return diffDays >= 0 && diffDays < 30;
      }
      
      if (timeFilter === '1YR') {
        return diffDays >= 0 && diffDays < 365;
      }
      
      return true;
    });
  }, [requests, timeFilter]);

  const dashboardStats = useMemo(() => {
    const getStats = (list: typeof requests) => {
      const total = list.length;
      const newCount = list.filter(r => r.status === 'NEW').length;
      const holdCount = list.filter(r => r.status === 'ON_HOLD').length;
      const doneCount = list.filter(r => r.status === 'DONE').length;
      const guestCount = list.filter(r => r.source === 'GUEST').length;
      const userCount = list.filter(r => r.source === 'USER').length;
      
      const newGuest = list.filter(r => r.status === 'NEW' && r.source === 'GUEST').length;
      const newUser = list.filter(r => r.status === 'NEW' && r.source === 'USER').length;
      const holdGuest = list.filter(r => r.status === 'ON_HOLD' && r.source === 'GUEST').length;
      const holdUser = list.filter(r => r.status === 'ON_HOLD' && r.source === 'USER').length;
      const doneGuest = list.filter(r => r.status === 'DONE' && r.source === 'GUEST').length;
      const doneUser = list.filter(r => r.status === 'DONE' && r.source === 'USER').length;
      
      return {
        total,
        newCount,
        holdCount,
        doneCount,
        guestCount,
        userCount,
        breakdown: {
          total: { guest: guestCount, user: userCount },
          newLabel: { guest: newGuest, user: newUser },
          hold: { guest: holdGuest, user: holdUser },
          done: { guest: doneGuest, user: doneUser },
        }
      };
    };

    const overall = getStats(filteredRequests);
    const hadahanList = filteredRequests.filter(r => r.form_type === 'HADAHAN');
    const porondamList = filteredRequests.filter(r => r.form_type === 'PORONDAM');
    
    return {
      overall,
      hadahan: getStats(hadahanList),
      porondam: getStats(porondamList),
    };
  }, [filteredRequests]);

  function DashboardTile({
    label,
    count,
    icon,
    color,
    id,
    guestCount,
    userCount,
  }: {
    label: string;
    count: number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    id: string;
    guestCount: number;
    userCount: number;
  }) {
    const isExpanded = !!expandedTiles[id];
    
    return (
      <TouchableOpacity 
        style={[
          styles.dashTile, 
          { borderColor: color },
          isExpanded && styles.dashTileExpanded
        ]} 
        onPress={() => setExpandedTiles(prev => ({ ...prev, [id]: !prev[id] }))}
        activeOpacity={0.7}
      >
        <View style={styles.dashTileHeader}>
          <View style={[styles.dashTileIconBg, { backgroundColor: color + '12' }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <Text style={[styles.dashTileNumber, { color }]}>{count}</Text>
        </View>
        <Text style={styles.dashTileLabel}>{label}</Text>
        
        {isExpanded && (
          <View style={styles.dashTileBreakdown}>
            <View style={styles.dashBreakdownItem}>
              <Ionicons name="person-outline" size={12} color="#666" style={{ marginRight: 4 }} />
              <Text style={styles.dashBreakdownText}>
                {language === 'si' ? `අමුත්තන්: ${guestCount}` : `Guests: ${guestCount}`}
              </Text>
            </View>
            <View style={styles.dashBreakdownDivider} />
            <View style={styles.dashBreakdownItem}>
              <Ionicons name="phone-portrait-outline" size={12} color="#666" style={{ marginRight: 4 }} />
              <Text style={styles.dashBreakdownText}>
                {language === 'si' ? `සාමාජිකයින්: ${userCount}` : `Members: ${userCount}`}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (screen === 'login') {
    return (
      <LoginShell language={language} setLanguage={setLanguage}>
        <Field label={t.username} value={username} onChangeText={setUsername} />
        <TouchableOpacity style={styles.button} onPress={checkUsername} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>{t.continue}</Text>
          )}
        </TouchableOpacity>
        <StatusBar style="dark" />
      </LoginShell>
    );
  }

  if (screen === 'activate') {
    return (
      <LoginShell language={language} setLanguage={setLanguage} onBack={loading ? undefined : () => setScreen('login')}>
        <Field label={t.password} value={password} onChangeText={setPassword} secureTextEntry />
        <Field label={t.confirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={activate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>{t.createPassword}</Text>
          )}
        </TouchableOpacity>
      </LoginShell>
    );
  }

  if (screen === 'password') {
    return (
      <LoginShell language={language} setLanguage={setLanguage} onBack={loading ? undefined : () => setScreen('login')}>
        <Field label={t.password} value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={login} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>{t.login}</Text>
          )}
        </TouchableOpacity>
      </LoginShell>
    );
  }

  if (screen === 'home') {
    return (
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 20 + insets.bottom }]}>
        <LanguageToggle language={language} setLanguage={setLanguage} />
        <Text style={styles.title}>{t.welcome}, {user?.full_name}</Text>
        <View style={styles.grid}>
          <MenuTile title={t.hadahan} icon="document-text-outline" color="#7A1E2C" onPress={() => setScreen('hadahan')} />
          <MenuTile title={t.porondam} icon="heart-half-outline" color="#C4841D" onPress={() => setScreen('porondam')} />
          {user?.role === 'ADMIN' && (
            <MenuTile title={t.settings} icon="settings-outline" color="#B85230" onPress={() => setScreen('settings')} />
          )}
          <MenuTile title={t.appInfo} icon="information-circle-outline" color="#2D724F" onPress={() => setScreen('info')} />
        </View>
        <TouchableOpacity onPress={() => { setToken(null); setUser(null); setScreen('login'); }}><Text style={styles.logout}>{t.logout}</Text></TouchableOpacity>
      </ScrollView>
    );
  }

  if (screen === 'hadahan') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 20 + insets.bottom }]} keyboardShouldPersistTaps="handled">
          <ScreenHeader onBack={loading ? () => {} : () => setScreen(user?.role === 'ADMIN' ? 'admin' : 'home')} language={language} setLanguage={setLanguage} />
          <Text style={styles.title}>{t.hadahan}</Text>
          
          <Field label={t.fullName} value={form.full_name} onChangeText={v => setForm({ ...form, full_name: v })} placeholder="John Doe" />
          <Field label={t.address} value={form.address} onChangeText={v => setForm({ ...form, address: v })} multiline placeholder="123 Main St" />
          <DatePickerField label={t.dob} value={form.date_of_birth} onChange={v => setForm({ ...form, date_of_birth: v })} language={language} />
          <TimePickerField label={t.tob} value={form.time_of_birth} onChange={v => setForm({ ...form, time_of_birth: v })} language={language} />
          <Field label={t.pob} value={form.place_of_birth} onChangeText={v => setForm({ ...form, place_of_birth: v })} options={cityOptions} selectPrompt={t.selectPrompt} />
          
          <SectionDivider label={t.contactSection} />
          
          <Field label={t.contact} value={form.contact_number} onChangeText={v => setForm({ ...form, contact_number: v })} placeholder="0771234567" />
          <Field label={t.extraContact} value={form.additional_contact_number} onChangeText={v => setForm({ ...form, additional_contact_number: v })} placeholder="0777654321" />
          <Field label={t.notes} value={form.additional_notes} onChangeText={v => setForm({ ...form, additional_notes: v })} multiline placeholder="Any special notes..." />
          
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.clearButton} onPress={() => setForm(emptyForm)} disabled={loading}>
              <Text style={styles.clearButtonText}>{t.clear}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={() => submitForm('hadahan')} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>{t.submit}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (screen === 'porondam') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 20 + insets.bottom }]} keyboardShouldPersistTaps="handled">
          <ScreenHeader onBack={loading ? () => {} : () => setScreen(user?.role === 'ADMIN' ? 'admin' : 'home')} language={language} setLanguage={setLanguage} />
          <Text style={styles.title}>{t.porondam}</Text>
          
          <SectionDivider label={t.boySection} />
          <Field label={t.boyName} value={form.boy_full_name} onChangeText={v => setForm({ ...form, boy_full_name: v })} placeholder="Boy's Full Name" />
          <DatePickerField label={t.boyDob} value={form.boy_date_of_birth} onChange={v => setForm({ ...form, boy_date_of_birth: v })} language={language} />
          <TimePickerField label={t.boyTob} value={form.boy_time_of_birth} onChange={v => setForm({ ...form, boy_time_of_birth: v })} language={language} />
          <Field label={t.boyPob} value={form.boy_place_of_birth} onChangeText={v => setForm({ ...form, boy_place_of_birth: v })} options={cityOptions} selectPrompt={t.selectPrompt} />

          <SectionDivider label={t.girlSection} />
          <Field label={t.girlName} value={form.girl_full_name} onChangeText={v => setForm({ ...form, girl_full_name: v })} placeholder="Girl's Full Name" />
          <DatePickerField label={t.girlDob} value={form.girl_date_of_birth} onChange={v => setForm({ ...form, girl_date_of_birth: v })} language={language} />
          <TimePickerField label={t.girlTob} value={form.girl_time_of_birth} onChange={v => setForm({ ...form, girl_time_of_birth: v })} language={language} />
          <Field label={t.girlPob} value={form.girl_place_of_birth} onChangeText={v => setForm({ ...form, girl_place_of_birth: v })} options={cityOptions} selectPrompt={t.selectPrompt} />

          <SectionDivider label={t.contactSection} />
          <Field label={t.contactPerson} value={form.full_name} onChangeText={v => setForm({ ...form, full_name: v })} placeholder="Contact Person Name" />
          <Field label={t.contact} value={form.contact_number} onChangeText={v => setForm({ ...form, contact_number: v })} placeholder="0771234567" />
          <Field label={t.extraContact} value={form.additional_contact_number} onChangeText={v => setForm({ ...form, additional_contact_number: v })} placeholder="0777654321" />
          <Field label={t.address} value={form.address} onChangeText={v => setForm({ ...form, address: v })} multiline placeholder="123 Main St" />
          
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.clearButton} onPress={() => setForm(emptyForm)} disabled={loading}>
              <Text style={styles.clearButtonText}>{t.clear}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={() => submitForm('porondam')} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>{t.submit}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (screen === 'dashboard') {
    const totalRequestsCount = dashboardStats.overall.total;
    const hadahanPct = totalRequestsCount > 0 ? (dashboardStats.hadahan.total / totalRequestsCount) * 100 : 0;
    const porondamPct = totalRequestsCount > 0 ? (dashboardStats.porondam.total / totalRequestsCount) * 100 : 0;

    return (
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 20 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        <ScreenHeader onBack={() => setScreen('admin')} language={language} setLanguage={setLanguage} />
        <Text style={styles.title}>{t.dashboard}</Text>

        {/* Time Filter Pills */}
        <View style={styles.filterPillsContainer}>
          {(['TODAY', 'WEEK', 'MONTH', '1YR'] as const).map(filter => {
            const label = {
              TODAY: language === 'si' ? 'අද' : 'Today',
              WEEK: language === 'si' ? 'මේ සතියේ' : 'This Week',
              MONTH: language === 'si' ? 'මේ මාසයේ' : 'This Month',
              '1YR': language === 'si' ? 'වසර 1' : '1 Yr',
            }[filter];
            
            const isActive = timeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setTimeFilter(filter)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Main Overall Breakdown */}
        <View style={styles.dashGrid}>
          <DashboardTile 
            label={t.total} 
            count={dashboardStats.overall.total} 
            icon="albums-outline" 
            color="#7A1E2C" 
            id="overall-total"
            guestCount={dashboardStats.overall.breakdown.total.guest}
            userCount={dashboardStats.overall.breakdown.total.user}
          />
          <DashboardTile 
            label={t.newLabel} 
            count={dashboardStats.overall.newCount} 
            icon="download-outline" 
            color="#C4841D" 
            id="overall-new"
            guestCount={dashboardStats.overall.breakdown.newLabel.guest}
            userCount={dashboardStats.overall.breakdown.newLabel.user}
          />
          <DashboardTile 
            label={t.hold} 
            count={dashboardStats.overall.holdCount} 
            icon="hourglass-outline" 
            color="#1C6D7D" 
            id="overall-hold"
            guestCount={dashboardStats.overall.breakdown.hold.guest}
            userCount={dashboardStats.overall.breakdown.hold.user}
          />
          <DashboardTile 
            label={t.done} 
            count={dashboardStats.overall.doneCount} 
            icon="checkmark-circle-outline" 
            color="#2D724F" 
            id="overall-done"
            guestCount={dashboardStats.overall.breakdown.done.guest}
            userCount={dashboardStats.overall.breakdown.done.user}
          />
        </View>

        {/* Ratio Bar */}
        <View style={styles.ratioCard}>
          <Text style={styles.ratioTitle}>
            {language === 'si' ? 'ඉල්ලීම් වර්ගය අනුව ප්‍රගතිය' : 'Request Type Distribution'}
          </Text>
          <View style={styles.ratioBarContainer}>
            <View style={[styles.ratioBarSegment, { backgroundColor: '#C4841D', width: `${hadahanPct}%` }]} />
            <View style={[styles.ratioBarSegment, { backgroundColor: '#B85230', width: `${porondamPct}%` }]} />
          </View>
          <View style={styles.ratioLabelsRow}>
            <View style={styles.ratioLabelItem}>
              <View style={[styles.ratioDot, { backgroundColor: '#C4841D' }]} />
              <Text style={styles.ratioLabelText}>
                {t.hadahan}: <Text style={{ fontWeight: '800' }}>{dashboardStats.hadahan.total}</Text> ({hadahanPct.toFixed(0)}%)
              </Text>
            </View>
            <View style={styles.ratioLabelItem}>
              <View style={[styles.ratioDot, { backgroundColor: '#B85230' }]} />
              <Text style={styles.ratioLabelText}>
                {t.porondam}: <Text style={{ fontWeight: '800' }}>{dashboardStats.porondam.total}</Text> ({porondamPct.toFixed(0)}%)
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 12 }} />

        {/* Hadahan Collapse Header */}
        <TouchableOpacity 
          style={styles.accordionHeader} 
          onPress={() => setShowHadahanBreakdown(!showHadahanBreakdown)}
          activeOpacity={0.7}
        >
          <View style={styles.accordionHeaderLeft}>
            <Ionicons name="document-text-outline" size={20} color="#7A1E2C" style={{ marginRight: 8 }} />
            <Text style={styles.accordionTitle}>{t.hadahan}</Text>
          </View>
          <Ionicons 
            name={showHadahanBreakdown ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#7A1E2C" 
          />
        </TouchableOpacity>

        {showHadahanBreakdown && (
          <View style={[styles.dashGrid, { marginTop: 10 }]}>
            <DashboardTile 
              label={t.total} 
              count={dashboardStats.hadahan.total} 
              icon="albums-outline" 
              color="#7A1E2C" 
              id="hadahan-total"
              guestCount={dashboardStats.hadahan.breakdown.total.guest}
              userCount={dashboardStats.hadahan.breakdown.total.user}
            />
            <DashboardTile 
              label={t.newLabel} 
              count={dashboardStats.hadahan.newCount} 
              icon="download-outline" 
              color="#C4841D" 
              id="hadahan-new"
              guestCount={dashboardStats.hadahan.breakdown.newLabel.guest}
              userCount={dashboardStats.hadahan.breakdown.newLabel.user}
            />
            <DashboardTile 
              label={t.hold} 
              count={dashboardStats.hadahan.holdCount} 
              icon="hourglass-outline" 
              color="#1C6D7D" 
              id="hadahan-hold"
              guestCount={dashboardStats.hadahan.breakdown.hold.guest}
              userCount={dashboardStats.hadahan.breakdown.hold.user}
            />
            <DashboardTile 
              label={t.done} 
              count={dashboardStats.hadahan.doneCount} 
              icon="checkmark-circle-outline" 
              color="#2D724F" 
              id="hadahan-done"
              guestCount={dashboardStats.hadahan.breakdown.done.guest}
              userCount={dashboardStats.hadahan.breakdown.done.user}
            />
          </View>
        )}

        <View style={{ height: 12 }} />

        {/* Porondam Collapse Header */}
        <TouchableOpacity 
          style={styles.accordionHeader} 
          onPress={() => setShowPorondamBreakdown(!showPorondamBreakdown)}
          activeOpacity={0.7}
        >
          <View style={styles.accordionHeaderLeft}>
            <Ionicons name="heart-half-outline" size={20} color="#7A1E2C" style={{ marginRight: 8 }} />
            <Text style={styles.accordionTitle}>{t.porondam}</Text>
          </View>
          <Ionicons 
            name={showPorondamBreakdown ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#7A1E2C" 
          />
        </TouchableOpacity>

        {showPorondamBreakdown && (
          <View style={[styles.dashGrid, { marginTop: 10 }]}>
            <DashboardTile 
              label={t.total} 
              count={dashboardStats.porondam.total} 
              icon="albums-outline" 
              color="#7A1E2C" 
              id="porondam-total"
              guestCount={dashboardStats.porondam.breakdown.total.guest}
              userCount={dashboardStats.porondam.breakdown.total.user}
            />
            <DashboardTile 
              label={t.newLabel} 
              count={dashboardStats.porondam.newCount} 
              icon="download-outline" 
              color="#C4841D" 
              id="porondam-new"
              guestCount={dashboardStats.porondam.breakdown.newLabel.guest}
              userCount={dashboardStats.porondam.breakdown.newLabel.user}
            />
            <DashboardTile 
              label={t.hold} 
              count={dashboardStats.porondam.holdCount} 
              icon="hourglass-outline" 
              color="#1C6D7D" 
              id="porondam-hold"
              guestCount={dashboardStats.porondam.breakdown.hold.guest}
              userCount={dashboardStats.porondam.breakdown.hold.user}
            />
            <DashboardTile 
              label={t.done} 
              count={dashboardStats.porondam.doneCount} 
              icon="checkmark-circle-outline" 
              color="#2D724F" 
              id="porondam-done"
              guestCount={dashboardStats.porondam.breakdown.done.guest}
              userCount={dashboardStats.porondam.breakdown.done.user}
            />
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  if (screen === 'admin') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.full}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <LanguageToggle language={language} setLanguage={setLanguage} />
            <View style={styles.titleRow}>
              <Text style={[styles.title, { marginBottom: 0 }]}>
                {adminTab === 'requests' ? t.requests : t.menu}
              </Text>
              {adminTab === 'requests' && (
                <TouchableOpacity 
                  style={styles.historyLinkBtn} 
                  onPress={() => setScreen('history')}
                >
                  <Ionicons name="time-outline" size={16} color="#7A1E2C" style={{ marginRight: 4 }} />
                  <Text style={styles.historyLinkText}>{t.history || 'History'}</Text>
                </TouchableOpacity>
              )}
            </View>
            {adminTab === 'requests' ? (
              loadingRequests ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#7A1E2C" />
                </View>
              ) : activeRequests.length ? (
                activeRequests.map(item => (
                  <TouchableOpacity
                    key={item.request_number}
                    style={styles.card}
                    onPress={() => openRequestDetails(item.request_number)}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{item.request_number}</Text>
                      <View style={[styles.statusBadge, (styles as any)[`statusBadge_${item.status}`]]}>
                        <Text style={[styles.statusBadgeText, (styles as any)[`statusBadgeText_${item.status}`]]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.cardSubtitle}>{item.form_type} - {item.source}</Text>
                    <Text style={styles.cardDate}>{item.submitted_date} {item.submitted_time}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text>{t.noRequests}</Text>
              )
            ) : (
              <View>
                <View style={styles.grid}>
                  <MenuTile title={t.hadahan} icon="document-text-outline" color="#7A1E2C" onPress={() => setScreen('hadahan')} />
                  <MenuTile title={t.porondam} icon="heart-half-outline" color="#C4841D" onPress={() => setScreen('porondam')} />
                  <MenuTile title={t.dashboard} icon="stats-chart-outline" color="#1C6D7D" onPress={() => setScreen('dashboard')} />
                  <MenuTile title={t.history || 'History'} icon="time-outline" color="#513C75" onPress={() => setScreen('history')} />
                  <MenuTile title={t.settings} icon="settings-outline" color="#B85230" onPress={() => setScreen('settings')} />
                  <MenuTile title={t.appInfo} icon="information-circle-outline" color="#2D724F" onPress={() => setScreen('info')} />
                </View>
                <TouchableOpacity onPress={() => { setToken(null); setUser(null); setForm(emptyForm); setScreen('login'); }}><Text style={styles.logout}>{t.logout}</Text></TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={[styles.bottomTabs, { paddingBottom: insets.bottom || 10, height: 64 + (insets.bottom || 10) }]}>
            <TouchableOpacity 
              style={[styles.tabButton, adminTab === 'requests' && styles.tabButtonActive]} 
              onPress={() => setAdminTab('requests')}
            >
              <Ionicons 
                name={adminTab === 'requests' ? "document-text" : "document-text-outline"} 
                size={22} 
                color={adminTab === 'requests' ? "#7A1E2C" : "#666"} 
                style={{ marginBottom: 4 }}
              />
              <Text style={adminTab === 'requests' ? styles.tabActive : styles.tab}>{t.requests}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, adminTab === 'menu' && styles.tabButtonActive]} 
              onPress={() => setAdminTab('menu')}
            >
              <Ionicons 
                name={adminTab === 'menu' ? "grid" : "grid-outline"} 
                size={22} 
                color={adminTab === 'menu' ? "#7A1E2C" : "#666"} 
                style={{ marginBottom: 4 }}
              />
              <Text style={adminTab === 'menu' ? styles.tabActive : styles.tab}>{t.menu}</Text>
            </TouchableOpacity>
          </View>

          {/* Detailed Request Modal */}
          <Modal
            visible={selectedRequest !== null}
            transparent
            animationType="slide"
            onRequestClose={() => setSelectedRequest(null)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1, width: '100%' }}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.detailModalContent}>
                  {selectedRequest && (
                    <View style={{ flex: 1 }}>
                      <View style={styles.detailHeader}>
                        <Text style={styles.detailTitle}>{selectedRequest.request_number}</Text>
                        <View style={[styles.statusBadge, (styles as any)[`statusBadge_${selectedRequest.status}`]]}>
                          <Text style={[styles.statusBadgeText, (styles as any)[`statusBadgeText_${selectedRequest.status}`]]}>
                            {selectedRequest.status}
                          </Text>
                        </View>
                      </View>

                      <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                        <Text style={styles.detailSectionTitle}>
                          {selectedRequest.form_type} Request Details
                        </Text>

                        <View style={styles.detailGrid}>
                          {selectedRequest.form_type === 'HADAHAN' ? (
                            <>
                              {renderDetailRow('Full Name', selectedRequest.data.full_name)}
                              {renderDetailRow('Date of Birth', selectedRequest.data.date_of_birth)}
                              {renderDetailRow('Time of Birth', format24hTo12h(selectedRequest.data.time_of_birth))}
                              {renderDetailRow('Place of Birth', selectedRequest.data.place_of_birth)}
                              {renderDetailRow('Contact Number', selectedRequest.data.contact_number)}
                              {renderDetailRow('Additional Contact', selectedRequest.data.additional_contact_number)}
                              {renderDetailRow('Address', selectedRequest.data.address)}
                              {renderDetailRow('Additional Notes', selectedRequest.data.additional_notes)}
                            </>
                          ) : (
                            <>
                              {renderDetailRow('Contact Person', selectedRequest.data.contact_person_name)}
                              {renderDetailRow('Contact Number', selectedRequest.data.contact_number)}
                              {renderDetailRow('Additional Contact', selectedRequest.data.additional_contact_number)}
                              {renderDetailRow('Address', selectedRequest.data.address)}

                              <View style={styles.detailSubSection}>
                                <Text style={styles.detailSubSectionTitle}>Boy's Details</Text>
                                {renderDetailRow('Full Name', selectedRequest.data.boy?.full_name)}
                                {renderDetailRow('Date of Birth', selectedRequest.data.boy?.date_of_birth)}
                                {renderDetailRow('Time of Birth', format24hTo12h(selectedRequest.data.boy?.time_of_birth))}
                                {renderDetailRow('Place of Birth', selectedRequest.data.boy?.place_of_birth)}
                              </View>

                              <View style={styles.detailSubSection}>
                                <Text style={styles.detailSubSectionTitle}>Girl's Details</Text>
                                {renderDetailRow('Full Name', selectedRequest.data.girl?.full_name)}
                                {renderDetailRow('Date of Birth', selectedRequest.data.girl?.date_of_birth)}
                                {renderDetailRow('Time of Birth', format24hTo12h(selectedRequest.data.girl?.time_of_birth))}
                                {renderDetailRow('Place of Birth', selectedRequest.data.girl?.place_of_birth)}
                              </View>
                            </>
                          )}
                        </View>

                        {/* Admin Note field */}
                        <View style={styles.detailNoteSection}>
                          <Text style={styles.detailNoteLabel}>{t.adminNote}</Text>
                          <TextInput
                            value={tempAdminNote}
                            onChangeText={setTempAdminNote}
                            multiline
                            numberOfLines={2}
                            placeholder={language === 'si' ? 'සටහනක් එක් කරන්න (විකල්ප)' : 'Add a note (optional)...'}
                            placeholderTextColor="#999"
                            style={styles.detailNoteInput}
                          />
                        </View>
                      </ScrollView>

                      {/* Row 1 Actions: Done | Cancel */}
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.actionBtnDone, { flex: 2 }]}
                          onPress={() => updateRequestStatus(selectedRequest.request_number, 'DONE', tempAdminNote)}
                          disabled={statusUpdating !== null}
                        >
                          {statusUpdating === 'DONE' ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <View style={styles.btnContent}>
                              <Ionicons name="checkmark-sharp" size={18} color="white" style={styles.btnIcon} />
                              <Text style={[styles.actionBtnText, { color: 'white' }]}>{t.done}</Text>
                            </View>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.actionBtnCancel, { flex: 1 }]}
                          onPress={() => updateRequestStatus(selectedRequest.request_number, 'CANCELLED', tempAdminNote)}
                          disabled={statusUpdating !== null}
                        >
                          {statusUpdating === 'CANCELLED' ? (
                            <ActivityIndicator size="small" color="#C62828" />
                          ) : (
                            <View style={styles.btnContent}>
                              <Ionicons name="ban-outline" size={16} color="#C62828" style={styles.btnIcon} />
                              <Text style={[styles.actionBtnText, { color: '#C62828' }]}>{t.cancel}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>

                      {/* Row 2 Actions: Close (Dismiss) | On Hold */}
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.actionBtnDismiss, { flex: 2 }]}
                          onPress={() => setSelectedRequest(null)}
                          disabled={statusUpdating !== null}
                        >
                          <View style={styles.btnContent}>
                            <Ionicons name="close-sharp" size={18} color="#444" style={styles.btnIcon} />
                            <Text style={[styles.actionBtnText, { color: '#444' }]}>{language === 'si' ? 'වසන්න' : 'Close'}</Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.actionBtnHold, { flex: 1 }]}
                          onPress={() => updateRequestStatus(selectedRequest.request_number, 'ON_HOLD', tempAdminNote)}
                          disabled={statusUpdating !== null}
                        >
                          {statusUpdating === 'ON_HOLD' ? (
                            <ActivityIndicator size="small" color="#B58A2A" />
                          ) : (
                            <View style={styles.btnContent}>
                              <Ionicons name="hourglass-outline" size={16} color="#B58A2A" style={styles.btnIcon} />
                              <Text style={[styles.actionBtnText, { color: '#B58A2A' }]}>{t.hold}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* Fetching Details Loader Modal */}
          <Modal visible={fetchingDetail} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.detailLoaderCard}>
                <ActivityIndicator size="large" color="#7A1E2C" />
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (screen === 'history') {
    return (
      <View style={styles.full}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 20 + insets.bottom }]} showsVerticalScrollIndicator={false}>
          <ScreenHeader onBack={() => setScreen('admin')} language={language} setLanguage={setLanguage} />
          <Text style={styles.title}>{t.history}</Text>
          
          {/* Time Filter Pills for History */}
          <View style={styles.filterPillsContainer}>
            {(['TODAY', 'WEEK', 'MONTH', '1YR'] as const).map(filter => {
              const label = {
                TODAY: language === 'si' ? 'අද' : 'Today',
                WEEK: language === 'si' ? 'මේ සතියේ' : 'This Week',
                MONTH: language === 'si' ? 'මේ මාසයේ' : 'This Month',
                '1YR': language === 'si' ? 'වසර 1' : '1 Yr',
              }[filter];
              
              const isActive = historyTimeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setHistoryTimeFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {loadingRequests ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#7A1E2C" />
            </View>
          ) : filteredHistoryRequests.length ? (
            filteredHistoryRequests.map(item => (
              <TouchableOpacity
                key={item.request_number}
                style={styles.card}
                onPress={() => openRequestDetails(item.request_number)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.request_number}</Text>
                  <View style={[styles.statusBadge, (styles as any)[`statusBadge_${item.status}`]]}>
                    <Text style={[styles.statusBadgeText, (styles as any)[`statusBadgeText_${item.status}`]]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardSubtitle}>{item.form_type} - {item.source}</Text>
                <Text style={styles.cardDate}>{item.submitted_date} {item.submitted_time}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>{t.noRequests}</Text>
          )}
        </ScrollView>

        {/* Detailed Request Modal */}
        <Modal
          visible={selectedRequest !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedRequest(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, width: '100%' }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.detailModalContent}>
                {selectedRequest && (
                  <View style={{ flex: 1 }}>
                    <View style={styles.detailHeader}>
                      <Text style={styles.detailTitle}>{selectedRequest.request_number}</Text>
                    </View>

                    <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                      <Text style={styles.detailSectionTitle}>
                        {selectedRequest.form_type} Request Details
                      </Text>

                      <View style={styles.detailGrid}>
                        {selectedRequest.form_type === 'HADAHAN' ? (
                          <>
                            {renderDetailRow('Full Name', selectedRequest.data.full_name)}
                            {renderDetailRow('Date of Birth', selectedRequest.data.date_of_birth)}
                            {renderDetailRow('Time of Birth', format24hTo12h(selectedRequest.data.time_of_birth))}
                            {renderDetailRow('Place of Birth', selectedRequest.data.place_of_birth)}
                            {renderDetailRow('Contact Number', selectedRequest.data.contact_number)}
                            {renderDetailRow('Additional Contact', selectedRequest.data.additional_contact_number)}
                            {renderDetailRow('Address', selectedRequest.data.address)}
                            {renderDetailRow('Additional Notes', selectedRequest.data.additional_notes)}
                          </>
                        ) : (
                          <>
                            {renderDetailRow('Contact Person', selectedRequest.data.contact_person_name)}
                            {renderDetailRow('Contact Number', selectedRequest.data.contact_number)}
                            {renderDetailRow('Additional Contact', selectedRequest.data.additional_contact_number)}
                            {renderDetailRow('Address', selectedRequest.data.address)}

                            <View style={styles.detailSubSection}>
                              <Text style={styles.detailSubSectionTitle}>Boy's Details</Text>
                              {renderDetailRow('Full Name', selectedRequest.data.boy?.full_name)}
                              {renderDetailRow('Date of Birth', selectedRequest.data.boy?.date_of_birth)}
                              {renderDetailRow('Time of Birth', format24hTo12h(selectedRequest.data.boy?.time_of_birth))}
                              {renderDetailRow('Place of Birth', selectedRequest.data.boy?.place_of_birth)}
                            </View>

                            <View style={styles.detailSubSection}>
                              <Text style={styles.detailSubSectionTitle}>Girl's Details</Text>
                              {renderDetailRow('Full Name', selectedRequest.data.girl?.full_name)}
                              {renderDetailRow('Date of Birth', selectedRequest.data.girl?.date_of_birth)}
                              {renderDetailRow('Time of Birth', format24hTo12h(selectedRequest.data.girl?.time_of_birth))}
                              {renderDetailRow('Place of Birth', selectedRequest.data.girl?.place_of_birth)}
                            </View>
                          </>
                        )}
                      </View>

                      {/* Admin Note field (Read-only for History) */}
                      <View style={styles.detailNoteSection}>
                        <Text style={styles.detailNoteLabel}>{t.adminNote}</Text>
                        <Text style={styles.detailNoteText}>
                          {selectedRequest.admin_note || (language === 'si' ? 'පරිපාලක සටහන් නොමැත' : 'No note provided')}
                        </Text>
                      </View>
                    </ScrollView>

                    {/* Decision Status Badge at bottom (just before close) */}
                    <View style={styles.decisionStatusRow}>
                      <Text style={styles.decisionStatusLabel}>
                        {language === 'si' ? 'තත්ත්වය:' : 'Status:'}
                      </Text>
                      <View style={[styles.statusBadge, (styles as any)[`statusBadge_${selectedRequest.status}`]]}>
                        <Text style={[styles.statusBadgeText, (styles as any)[`statusBadgeText_${selectedRequest.status}`], { fontSize: 13 }]}>
                          {selectedRequest.status}
                        </Text>
                      </View>
                    </View>

                    {/* Close Button Only */}
                    <View style={[styles.actionRow, { marginTop: 14 }]}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnDismiss]}
                        onPress={() => setSelectedRequest(null)}
                      >
                        <View style={styles.btnContent}>
                          <Ionicons name="close-sharp" size={18} color="#444" style={styles.btnIcon} />
                          <Text style={[styles.actionBtnText, { color: '#444' }]}>{language === 'si' ? 'වසන්න' : 'Close'}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Fetching Details Loader Modal */}
        <Modal visible={fetchingDetail} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.detailLoaderCard}>
              <ActivityIndicator size="large" color="#7A1E2C" />
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (screen === 'settings') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 20 + insets.bottom }]} keyboardShouldPersistTaps="handled">
          <ScreenHeader onBack={loading ? () => {} : () => setScreen(user?.role === 'ADMIN' ? 'admin' : 'home')} language={language} setLanguage={setLanguage} />
          <Text style={styles.title}>{t.settings}</Text>

          {user?.role === 'ADMIN' && (
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>{t.notificationPreferences}</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>{t.pushNotifications}</Text>
                  <Text style={styles.settingDesc}>{t.pushNotificationsDesc}</Text>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={togglePushNotifications}
                  trackColor={{ false: '#DDD2BF', true: '#E5DAC8' }}
                  thumbColor={pushEnabled ? '#7A1E2C' : '#F6F1EA'}
                  disabled={loading}
                />
              </View>

              <View style={styles.settingSubSection}>
                <Text style={styles.settingLabel}>{t.adminAlerts}</Text>
                <Text style={styles.settingDesc}>{t.adminAlertsDesc}</Text>
                
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[styles.radioButton, adminTriggerEvery && styles.radioButtonActive]}
                    onPress={toggleAdminTriggerEvery}
                    disabled={loading}
                  >
                    <Ionicons name={adminTriggerEvery ? 'checkbox' : 'square-outline'} size={20} color="#7A1E2C" />
                    <Text style={styles.radioText}>{t.everyForm}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioButton, adminTriggerDaily && styles.radioButtonActive]}
                    onPress={toggleAdminTriggerDaily}
                    disabled={loading}
                  >
                    <Ionicons name={adminTriggerDaily ? 'checkbox' : 'square-outline'} size={20} color="#7A1E2C" />
                    <Text style={styles.radioText}>{t.dailySummary}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#8A342E', marginTop: 30 }]} 
            onPress={() => { setToken(null); setUser(null); setScreen('login'); }}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{t.logout}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 20 + insets.bottom }]} showsVerticalScrollIndicator={false}>
      <ScreenHeader onBack={loading ? () => {} : () => setScreen(user?.role === 'ADMIN' ? 'admin' : 'home')} language={language} setLanguage={setLanguage} />
      
      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Ionicons name="shield-checkmark" size={48} color="#7A1E2C" />
        </View>
        
        <Text style={styles.infoAppName}>Swasthi Life</Text>
        
        <View style={styles.infoEntityBadge}>
          <Text style={styles.infoEntityText}>
            {language === 'si' ? 'බලපිටිය කතරගම මහා දේවාලය' : 'Balapitiya Kataragama\nMaha Devalaya'}
          </Text>
        </View>
        
        <View style={styles.infoDivider} />
        
        <View style={styles.infoRow}>
          <Text style={styles.infoRowLabel}>{t.version}</Text>
          <Text style={styles.infoRowValue}>{Constants.expoConfig?.version || '1.0.0'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoRowLabel}>{t.lastUpdate}</Text>
          <Text style={styles.infoRowValue}>15/06/2026</Text>
        </View>
      </View>
      
      <Text style={styles.infoFooter}>
        {language === 'si' ? '© 2026 බලපිටිය කතරගම මහා දේවාලය' : '© 2026 Balapitiya Kataragama Maha Devalaya'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, backgroundColor: '#FFFDF8' },
  container: { flexGrow: 1, backgroundColor: '#FFFDF8', padding: 20, paddingTop: 56 },

  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  loginContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loginHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 24,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  loginFormWrap: {
    width: '100%',
    alignSelf: 'center',
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#7A1E2C',
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#2F2F2F', marginBottom: 24 },
  language: { flexDirection: 'row', alignSelf: 'flex-end', marginBottom: 18 },
  lang: { color: '#666', fontSize: 15 },
  langActive: { color: '#7A1E2C', fontWeight: '800', fontSize: 15 },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 6 },
  input: { backgroundColor: 'white', borderColor: '#DDD2BF', borderWidth: 1, borderRadius: 8, minHeight: 48, paddingHorizontal: 12, color: '#222' },
  multiline: { minHeight: 64, textAlignVertical: 'top', paddingTop: 12 },
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
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5DAC8',
    backgroundColor: 'white',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFF8F8',
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabIconActive: {
    fontSize: 26,
    transform: [{ scale: 1.15 }],
  },
  tab: { color: '#666', fontWeight: '700', fontSize: 15 },
  tabActive: { color: '#7A1E2C', fontWeight: '900', fontSize: 16 },
  paragraph: { fontSize: 16, lineHeight: 24, color: '#444' },
  pickerButton: {
    backgroundColor: 'white',
    borderColor: '#DDD2BF',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    color: '#222',
    fontSize: 15,
  },
  placeholderText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#E5DAC8',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7A1E2C',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalItemActive: {
    backgroundColor: '#FFF8F8',
  },
  modalItemText: {
    fontSize: 15,
    color: '#444',
  },
  modalItemTextActive: {
    color: '#7A1E2C',
    fontWeight: '700',
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: '#7A1E2C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 15,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#DDD2BF',
    borderRadius: 1,
  },
  sectionDividerBadge: {
    backgroundColor: '#F6F1EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD2BF',
    marginHorizontal: 10,
  },
  sectionDividerText: {
    color: '#7A1E2C',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F1EA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5DAC8',
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5DAC8',
    padding: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7A1E2C',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF1EE',
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  settingDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
  settingSubSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE1',
    paddingTop: 16,
  },
  radioGroup: {
    marginTop: 12,
    gap: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5DAC8',
    backgroundColor: '#FFFDF8',
  },
  radioButtonActive: {
    borderColor: '#7A1E2C',
    backgroundColor: '#FFF8F8',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  pickerModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '92%',
    maxWidth: 360,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#E5DAC8',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  pickerPreview: {
    backgroundColor: '#FFF8F8',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0EBE1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    flex: 1,
  },
  pickerPreviewText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7A1E2C',
    letterSpacing: 1,
  },
  pickerTabs: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#F0EBE1',
    marginBottom: 14,
  },
  pickerTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickerTabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#7A1E2C',
  },
  pickerTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AAA',
  },
  pickerTabTextActive: {
    color: '#7A1E2C',
  },
  pickerTabContent: {
    minHeight: 200,
    maxHeight: 300,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  gridCell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFAF5',
    borderWidth: 1,
    borderColor: '#E5DAC8',
    borderRadius: 8,
    margin: 3,
  },
  gridCell7: {
    width: '12.5%',
    aspectRatio: 1,
  },
  gridCell4: {
    width: '22%',
    paddingVertical: 14,
  },
  gridCell3: {
    width: '30%',
    paddingVertical: 14,
  },
  gridCellActive: {
    backgroundColor: '#7A1E2C',
    borderColor: '#7A1E2C',
    elevation: 2,
    shadowColor: '#7A1E2C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gridCellText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444',
    textAlign: 'center',
  },
  gridCellTextSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
  },
  gridCellTextActive: {
    color: 'white',
  },
  yearItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0E8',
    height: 48,
  },
  yearItemActive: {
    backgroundColor: '#FFF8F8',
    borderRadius: 8,
  },
  yearItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  yearItemTextActive: {
    color: '#7A1E2C',
    fontWeight: '800',
  },

  pickerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerCancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD2BF',
    alignItems: 'center',
    backgroundColor: '#FDFAF5',
  },
  pickerCancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#888',
  },
  pickerConfirmButton: {
    flex: 1,
    backgroundColor: '#7A1E2C',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#7A1E2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pickerConfirmButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
  },
  wheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  wheelColon: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: WHEEL_HEIGHT,
  },
  wheelColonText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#7A1E2C',
  },
  wheelLabelCol: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 2,
  },
  wheelLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AAA',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  submitButton: {
    flex: 1.5,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: '#7A1E2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD2BF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFAF5',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#888',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5DAC8',
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#7A1E2C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
  },
  infoIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FADADF',
  },
  infoAppName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#7A1E2C',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  infoEntityBadge: {
    backgroundColor: '#FDFAF5',
    borderColor: '#E5DAC8',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  infoEntityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B58A2A',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F0EBE1',
    width: '100%',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
  },
  infoRowLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  infoRowValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '700',
    textAlign: 'right',
  },
  infoFooter: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusBadge_NEW: {
    backgroundColor: '#E6F0FA',
  },
  statusBadge_ON_HOLD: {
    backgroundColor: '#FEF3D6',
  },
  statusBadge_DONE: {
    backgroundColor: '#EBF7EE',
  },
  statusBadge_CANCELLED: {
    backgroundColor: '#FDECEB',
  },
  statusBadgeText_NEW: {
    color: '#0E5A9D',
  },
  statusBadgeText_ON_HOLD: {
    color: '#B58A2A',
  },
  statusBadgeText_DONE: {
    color: '#2E7D32',
  },
  statusBadgeText_CANCELLED: {
    color: '#C62828',
  },
  detailModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '92%',
    maxWidth: 450,
    height: '80%',
    borderWidth: 1,
    borderColor: '#E5DAC8',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE1',
    paddingBottom: 12,
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7A1E2C',
  },
  detailScroll: {
    flex: 1,
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#333',
    marginBottom: 12,
  },
  detailGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FDFBF7',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: '#222',
    fontWeight: '700',
    textAlign: 'right',
    flex: 1.5,
  },
  detailSubSection: {
    marginTop: 12,
    backgroundColor: '#FDFAF5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5DAC8',
  },
  detailSubSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B58A2A',
    marginBottom: 8,
  },
  detailNoteSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE1',
    paddingTop: 12,
  },
  detailNoteLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
  },
  detailNoteInput: {
    backgroundColor: '#FFFDF8',
    borderColor: '#DDD2BF',
    borderWidth: 1,
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 12,
    paddingTop: 8,
    color: '#222',
    textAlignVertical: 'top',
  },
  detailNoteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    backgroundColor: '#FDFAF5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5DAC8',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  historyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F8',
    borderColor: '#E5DAC8',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  historyLinkText: {
    color: '#7A1E2C',
    fontWeight: '800',
    fontSize: 13,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FDFAF5',
    borderWidth: 1,
    borderColor: '#E5DAC8',
  },
  filterPillActive: {
    backgroundColor: '#7A1E2C',
    borderColor: '#7A1E2C',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  filterPillTextActive: {
    color: 'white',
  },
  dashGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  dashTile: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  dashTileExpanded: {
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  dashTileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dashTileIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashTileNumber: {
    fontSize: 24,
    fontWeight: '900',
  },
  dashTileLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  dashTileBreakdown: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE1',
    gap: 4,
  },
  dashBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashBreakdownText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  dashBreakdownDivider: {
    height: 1,
    backgroundColor: '#F0EBE1',
    marginVertical: 2,
  },
  ratioCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DAC8',
    padding: 16,
    marginBottom: 16,
  },
  ratioTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
    marginBottom: 12,
  },
  ratioBarContainer: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F5F0E8',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
  },
  ratioBarSegment: {
    height: '100%',
  },
  ratioLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratioLabelItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  ratioLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FDFAF5',
    borderColor: '#E5DAC8',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7A1E2C',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 6,
  },
  actionBtnText: {
    fontWeight: '800',
    fontSize: 14,
  },
  actionBtnDone: {
    flex: 1,
    backgroundColor: '#7A1E2C',
    borderColor: '#7A1E2C',
  },
  actionBtnDismiss: {
    flex: 1,
    backgroundColor: 'white',
    borderColor: '#DDD2BF',
  },
  actionBtnCancel: {
    backgroundColor: 'white',
    borderColor: '#C62828',
  },
  actionBtnHold: {
    backgroundColor: 'white',
    borderColor: '#B58A2A',
  },
  decisionStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDFAF5',
    borderColor: '#E5DAC8',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 14,
  },
  decisionStatusLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
  },
  detailLoaderCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DAC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}


