import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  Eye,
  FileText,
  Key,
  Lock,
  LogOut,
  Mail,
  Pin,
  Plus,
  RefreshCw,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { apiService } from '../services/apiService';
import { AcademicCalendar, CollegeNotification, NavigationTab, NotificationCategory } from '../types/attendance';
import { fileToDataUri, formatFileSize } from '../utils/samplePdf';
import { PdfViewerModal } from './PdfViewerModal';

interface AdminDashboardViewProps {
  isAdmin: boolean;
  onAdminLogin: (token: string) => void;
  onAdminLogout: () => void;
  calendars: AcademicCalendar[];
  notifications: CollegeNotification[];
  onRefreshData: () => Promise<void>;
  setActiveTab: (tab: NavigationTab) => void;
  showToast: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  isAdmin,
  onAdminLogin,
  onAdminLogout,
  calendars,
  notifications,
  onRefreshData,
  setActiveTab,
  showToast,
}) => {
  // Login form state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active admin section
  const [adminTab, setAdminTab] = useState<'upload_calendar' | 'add_notification' | 'manage_calendars' | 'manage_notifications'>('upload_calendar');

  // Calendar form state
  const [calTitle, setCalTitle] = useState('');
  const [calYear, setCalYear] = useState('2024–2025');
  const [calSemester, setCalSemester] = useState('Even Semester');
  const [calDescription, setCalDescription] = useState('');
  const [calIsLatest, setCalIsLatest] = useState(true);
  const [calPdfFile, setCalPdfFile] = useState<{ name: string; size: string; dataUri: string } | null>(null);
  const [isSubmittingCalendar, setIsSubmittingCalendar] = useState(false);
  const calendarFileInputRef = useRef<HTMLInputElement>(null);

  // Notification form state
  const [editingNotificationId, setEditingNotificationId] = useState<string | null>(null);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifCategory, setNotifCategory] = useState<NotificationCategory>('academic');
  const [notifIsPinned, setNotifIsPinned] = useState(false);
  const [notifPdfFile, setNotifPdfFile] = useState<{ name: string; size: string; dataUri: string } | null>(null);
  const [isSubmittingNotification, setIsSubmittingNotification] = useState(false);
  const notifFileInputRef = useRef<HTMLInputElement>(null);

  // Confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'calendar' | 'notification';
    id: string;
    title: string;
  } | null>(null);

  // PDF Preview modal state
  const [previewPdf, setPreviewPdf] = useState<{ title: string; fileName: string; pdfData: string } | null>(null);

  // Google Sign-In Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Handle Admin Google Sign-In Execution
  const executeGoogleLogin = async (emailToAuth: string) => {
    setLoginError(null);
    setIsLoggingIn(true);
    setIsGoogleModalOpen(false);

    try {
      const res = await apiService.loginAdminWithGoogle(emailToAuth);
      if (res.success && res.token) {
        onAdminLogin(res.token);
        setPasswordInput('');
        showToast('Welcome, Administrator. Signed in securely with Google.', 'success');
      } else {
        setLoginError(res.error || 'Google authentication failed. Unauthorized account.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Google sign-in error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Open Google Sign-In Dialog
  const handleGoogleLogin = () => {
    setLoginError(null);
    setIsGoogleModalOpen(true);
  };

  // Handle Admin Login with Email & Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await apiService.loginAdmin(emailInput, passwordInput);
      if (res.success && res.token) {
        onAdminLogin(res.token);
        setPasswordInput('');
        showToast('Welcome, Administrator. Logged in successfully.', 'success');
      } else {
        setLoginError(res.error || 'Invalid administrator email or password.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Calendar file select
  const handleCalendarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a valid PDF file.', 'error');
      return;
    }

    try {
      const dataUri = await fileToDataUri(file);
      setCalPdfFile({
        name: file.name,
        size: formatFileSize(file.size),
        dataUri,
      });
      if (!calTitle) {
        setCalTitle(file.name.replace(/\.pdf$/i, '').replace(/_/g, ' '));
      }
      showToast(`Selected PDF: ${file.name} (${formatFileSize(file.size)})`, 'info');
    } catch (err) {
      showToast('Could not process PDF file.', 'error');
    }
  };

  // Notification file select
  const handleNotificationFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUri = await fileToDataUri(file);
      setNotifPdfFile({
        name: file.name,
        size: formatFileSize(file.size),
        dataUri,
      });
      showToast(`Attached file: ${file.name}`, 'info');
    } catch (err) {
      showToast('Could not process attached file.', 'error');
    }
  };

  // Submit Calendar (Upload Academic Calendar)
  const handleSubmitCalendar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!calTitle.trim()) {
      showToast('Please enter a title for the academic calendar.', 'error');
      return;
    }

    if (!calPdfFile) {
      showToast('Please select a PDF file for the academic calendar.', 'error');
      return;
    }

    setIsSubmittingCalendar(true);
    try {
      const res = await apiService.createCalendar({
        title: calTitle.trim(),
        academicYear: calYear,
        semester: calSemester,
        description: calDescription.trim(),
        fileName: calPdfFile.name,
        fileSize: calPdfFile.size,
        fileData: calPdfFile.dataUri,
        uploadedBy: 'Office of Dean Academic / COE',
        isLatest: calIsLatest,
      });

      if (res.success) {
        showToast('Academic Calendar uploaded successfully and published to all students!', 'success');
        setCalTitle('');
        setCalDescription('');
        setCalPdfFile(null);
        if (calendarFileInputRef.current) calendarFileInputRef.current.value = '';
        await onRefreshData();
        setAdminTab('manage_calendars');
      } else {
        showToast(res.error || 'Failed to upload calendar.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error uploading calendar.', 'error');
    } finally {
      setIsSubmittingCalendar(false);
    }
  };

  // Submit Notification (Add or Edit)
  const handleSubmitNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notifTitle.trim()) {
      showToast('Please enter a notification title.', 'error');
      return;
    }

    if (!notifMessage.trim()) {
      showToast('Please enter the notification message body.', 'error');
      return;
    }

    setIsSubmittingNotification(true);
    try {
      if (editingNotificationId) {
        // Update existing notification
        const res = await apiService.updateNotification(editingNotificationId, {
          title: notifTitle.trim(),
          message: notifMessage.trim(),
          category: notifCategory,
          isPinned: notifIsPinned,
          attachment: notifPdfFile
            ? {
                fileName: notifPdfFile.name,
                fileSize: notifPdfFile.size,
                fileData: notifPdfFile.dataUri,
                fileType: 'application/pdf',
              }
            : undefined,
        });

        if (res.success) {
          showToast('Notification updated successfully!', 'success');
          resetNotificationForm();
          await onRefreshData();
          setAdminTab('manage_notifications');
        } else {
          showToast(res.error || 'Failed to update notification.', 'error');
        }
      } else {
        // Create new notification
        const res = await apiService.createNotification({
          title: notifTitle.trim(),
          message: notifMessage.trim(),
          category: notifCategory,
          isPinned: notifIsPinned,
          uploadedBy: 'Office of Dean Academic / Administration',
          attachment: notifPdfFile
            ? {
                fileName: notifPdfFile.name,
                fileSize: notifPdfFile.size,
                fileData: notifPdfFile.dataUri,
                fileType: 'application/pdf',
              }
            : undefined,
        });

        if (res.success) {
          showToast('Notification published successfully to all students!', 'success');
          resetNotificationForm();
          await onRefreshData();
          setAdminTab('manage_notifications');
        } else {
          showToast(res.error || 'Failed to publish notification.', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving notification.', 'error');
    } finally {
      setIsSubmittingNotification(false);
    }
  };

  const resetNotificationForm = () => {
    setEditingNotificationId(null);
    setNotifTitle('');
    setNotifMessage('');
    setNotifCategory('academic');
    setNotifIsPinned(false);
    setNotifPdfFile(null);
    if (notifFileInputRef.current) notifFileInputRef.current.value = '';
  };

  // Start editing a notification
  const handleStartEditNotification = (notif: CollegeNotification) => {
    setEditingNotificationId(notif.id);
    setNotifTitle(notif.title);
    setNotifMessage(notif.message);
    setNotifCategory(notif.category);
    setNotifIsPinned(notif.isPinned);
    if (notif.attachment) {
      setNotifPdfFile({
        name: notif.attachment.fileName,
        size: notif.attachment.fileSize || 'PDF',
        dataUri: notif.attachment.fileData,
      });
    } else {
      setNotifPdfFile(null);
    }
    setAdminTab('add_notification');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Confirm delete handler
  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.type === 'calendar') {
        const res = await apiService.deleteCalendar(deleteConfirm.id);
        if (res.success) {
          showToast('Academic Calendar deleted successfully.', 'success');
          await onRefreshData();
        } else {
          showToast(res.error || 'Failed to delete calendar.', 'error');
        }
      } else {
        const res = await apiService.deleteNotification(deleteConfirm.id);
        if (res.success) {
          showToast('Notification deleted successfully.', 'success');
          await onRefreshData();
        } else {
          showToast(res.error || 'Failed to delete notification.', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error during deletion.', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // -------------------------------------------------------------
  // If not logged in as Admin, show login screen
  // -------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#800020]/10 text-[#800020] dark:text-rose-400 flex items-center justify-center mx-auto border border-[#800020]/20">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-white">
              Administrator Access
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Enter your administrative credentials to upload academic calendars, publish circulars, and manage student notifications
            </p>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Primary Action: Sign in with Google */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 border border-stone-300 dark:border-stone-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                or use credentials
              </span>
              <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter administrator email"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 text-sm font-bold text-white bg-[#800020] hover:bg-[#6b001b] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Unlock Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-center">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors"
            >
              &larr; Return to Attendance Calculator
            </button>
          </div>
        </div>

        {/* Google Authentication Account Chooser Modal */}
        {isGoogleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-7 space-y-6">
              {/* Google Brand Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                      Sign in with Google
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      to Kalasalingam University Management Portal
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Close Google sign in"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Account List */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  Select an account to sign in:
                </p>

                {/* Primary Admin Google Account */}
                <button
                  type="button"
                  onClick={() => executeGoogleLogin('anchalsen82@gmail.com')}
                  disabled={isLoggingIn}
                  className="w-full text-left p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700/80 hover:border-blue-500 dark:hover:border-blue-500 bg-stone-50/70 dark:bg-stone-800/70 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                      AS
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Anchal Singh
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Admin
                        </span>
                      </div>
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        Authorized Administrator Account
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Continue &rarr;
                  </div>
                </button>

                {/* Custom Google Account Entry */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
                  <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                    Or sign in with another Google Account:
                  </span>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (customGoogleEmail.trim()) {
                        executeGoogleLogin(customGoogleEmail.trim());
                      }
                    }}
                    className="space-y-2"
                  >
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="e.g. admin@klu.ac.in or personal@gmail.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-blue-500 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!customGoogleEmail.trim() || isLoggingIn}
                      className="w-full py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Authenticate Account
                    </button>
                  </form>
                </div>
              </div>

              {/* Security notice */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-center">
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  Google verifies your account credentials securely. Passwords are never shared or stored in plaintext.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Admin Logged In: Full Admin Dashboard
  // -------------------------------------------------------------
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Admin Top Banner */}
      <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </span>
            <span className="text-xs text-stone-700 dark:text-stone-300 font-semibold flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-md border border-stone-200 dark:border-stone-700">
              <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Administrator Console</span>
            </span>
            <span className="text-xs text-stone-500 font-mono hidden sm:inline">
              · Central Server Sync Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight mt-1.5">
            College Academic Management Console
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Upload PDF calendars, add official notifications, attach circulars, and manage student-facing documents
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onAdminLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors cursor-pointer"
            title="Log out of admin mode"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Admin</span>
          </button>
        </div>
      </div>

      {/* Admin Section Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-stone-200 dark:border-stone-800">
        <button
          type="button"
          onClick={() => setAdminTab('upload_calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            adminTab === 'upload_calendar'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Academic Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('add_notification')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            adminTab === 'add_notification'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{editingNotificationId ? 'Edit Notification' : 'Add Notification'}</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('manage_calendars')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            adminTab === 'manage_calendars'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Uploaded Calendars ({calendars.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('manage_notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            adminTab === 'manage_notifications'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Uploaded Notifications ({notifications.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: UPLOAD ACADEMIC CALENDAR (PDF) */}
      {/* ------------------------------------------------------------- */}
      {adminTab === 'upload_calendar' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Upload Academic Calendar in PDF Format</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              The uploaded calendar will immediately become visible to all students in the Academic Calendar section with live preview and download support.
            </p>
          </div>

          <form onSubmit={handleSubmitCalendar} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  Calendar Title *
                </label>
                <input
                  type="text"
                  value={calTitle}
                  onChange={(e) => setCalTitle(e.target.value)}
                  placeholder="e.g., KARE Academic Calendar 2024–2025 (Even Semester)"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={calYear}
                    onChange={(e) => setCalYear(e.target.value)}
                    placeholder="2024–2025"
                    className="w-full px-3 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    Semester
                  </label>
                  <select
                    value={calSemester}
                    onChange={(e) => setCalSemester(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Odd Semester">Odd Semester</option>
                    <option value="Even Semester">Even Semester</option>
                    <option value="Annual">Annual / Trimester</option>
                    <option value="Summer Term">Summer Term</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                Description / Highlights (Optional)
              </label>
              <textarea
                rows={2}
                value={calDescription}
                onChange={(e) => setCalDescription(e.target.value)}
                placeholder="Key examination dates, reopening dates, and instructional periods..."
                className="w-full px-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-blue-500 resize-none"
              />
            </div>

            {/* PDF File Picker Zone */}
            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                Select Calendar PDF Document *
              </label>
              <input
                ref={calendarFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleCalendarFileChange}
                className="hidden"
                id="cal-file-upload"
              />

              <label
                htmlFor="cal-file-upload"
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl cursor-pointer bg-stone-50/50 dark:bg-stone-800/30 transition-colors text-center group"
              >
                <FileText className="w-10 h-10 text-stone-400 group-hover:text-blue-600 transition-colors mb-2" />
                <span className="text-sm font-bold text-stone-700 dark:text-stone-200">
                  {calPdfFile ? 'Change Selected PDF File' : 'Click to Upload Academic Calendar PDF'}
                </span>
                <span className="text-xs text-stone-500 mt-1">
                  Accepts standard PDF documents. Converted and stored centrally on the server.
                </span>
              </label>

              {/* Selected File Feedback */}
              {calPdfFile && (
                <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Selected: <strong>{calPdfFile.name}</strong> ({calPdfFile.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewPdf({
                        title: calTitle || 'Calendar Preview',
                        fileName: calPdfFile.name,
                        pdfData: calPdfFile.dataUri,
                      })
                    }
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 underline hover:no-underline shrink-0 ml-2"
                  >
                    Quick Preview
                  </button>
                </div>
              )}
            </div>

            {/* Set as Latest toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="cal-is-latest"
                checked={calIsLatest}
                onChange={(e) => setCalIsLatest(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
              />
              <label htmlFor="cal-is-latest" className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
                Set as Current Active Calendar (Featured prominently for all students)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmittingCalendar}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingCalendar ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading Calendar...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Academic Calendar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCalTitle('');
                  setCalDescription('');
                  setCalPdfFile(null);
                }}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: ADD OR EDIT NOTIFICATION / CIRCULAR */}
      {/* ------------------------------------------------------------- */}
      {adminTab === 'add_notification' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <span>{editingNotificationId ? 'Edit College Notification' : 'Add Notification or Circular'}</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Publish college announcements, examination notices, holiday alerts, or attach circular PDFs for all students.
              </p>
            </div>

            {editingNotificationId && (
              <button
                type="button"
                onClick={resetNotificationForm}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Cancel Edit Mode
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitNotification} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g., Mandatory Attendance Freeze Date for End Semester Examinations"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  Category Tag
                </label>
                <select
                  value={notifCategory}
                  onChange={(e) => setNotifCategory(e.target.value as NotificationCategory)}
                  className="w-full px-3 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="urgent">Urgent Notice</option>
                  <option value="examination">Examination</option>
                  <option value="academic">Academic Schedule</option>
                  <option value="circular">Official Circular</option>
                  <option value="holiday">Holiday Announcement</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                Notification Message Body *
              </label>
              <textarea
                rows={4}
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="Enter full details of the notice, circular reference number, and instructions for students..."
                required
                className="w-full px-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Optional PDF Attachment */}
            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                Attach Official PDF Document / Circular (Optional)
              </label>
              <input
                ref={notifFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleNotificationFileChange}
                className="hidden"
                id="notif-file-upload"
              />

              <div className="flex items-center gap-3">
                <label
                  htmlFor="notif-file-upload"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-xl cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{notifPdfFile ? 'Change Attached PDF' : 'Upload PDF Attachment'}</span>
                </label>

                {notifPdfFile && (
                  <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
                    <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate max-w-xs">{notifPdfFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setNotifPdfFile(null)}
                      className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pin to Top Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="notif-pin"
                checked={notifIsPinned}
                onChange={(e) => setNotifIsPinned(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
              />
              <label htmlFor="notif-pin" className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer flex items-center gap-1">
                <Pin className="w-3.5 h-3.5 rotate-45 text-indigo-600" />
                <span>Pin this notification to the top of the feed</span>
              </label>
            </div>

            {/* Submit & Reset buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmittingNotification}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingNotification ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Notification...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{editingNotificationId ? 'Update Notification' : 'Add Notification'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetNotificationForm}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: MANAGE UPLOADED CALENDARS TABLE */}
      {/* ------------------------------------------------------------- */}
      {adminTab === 'manage_calendars' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Uploaded Academic Calendars ({calendars.length})</span>
              </h2>
              <p className="text-xs text-stone-500">
                View all uploaded calendar PDF files, preview documents, or remove outdated schedules.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAdminTab('upload_calendar')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New</span>
            </button>
          </div>

          {calendars.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Title & Semester</th>
                    <th className="py-3 px-3">Academic Year</th>
                    <th className="py-3 px-3">File / Size</th>
                    <th className="py-3 px-3">Upload Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {calendars.map((cal) => (
                    <tr key={cal.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-stone-900 dark:text-white max-w-xs truncate">
                        {cal.title}
                        <div className="text-[11px] font-normal text-stone-500">{cal.semester}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono">{cal.academicYear}</td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1 text-stone-700 dark:text-stone-300 font-mono">
                          <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate max-w-[120px]">{cal.fileName}</span>
                        </div>
                        <div className="text-[10px] text-stone-400">{cal.fileSize || 'PDF'}</div>
                      </td>
                      <td className="py-3.5 px-3 text-stone-500">
                        {new Date(cal.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3">
                        {cal.isLatest ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            Active Latest
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-stone-500 bg-stone-100 dark:bg-stone-800">
                            Archived
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPdf({
                                title: cal.title,
                                fileName: cal.fileName,
                                pdfData: cal.fileData,
                              })
                            }
                            className="p-1.5 text-stone-500 hover:text-blue-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                            title="Preview PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'calendar',
                                id: cal.id,
                                title: cal.title,
                              })
                            }
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Calendar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-stone-500 text-xs">
              No academic calendars uploaded yet.
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: MANAGE UPLOADED NOTIFICATIONS TABLE */}
      {/* ------------------------------------------------------------- */}
      {adminTab === 'manage_notifications' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <span>Uploaded Notifications & Circulars ({notifications.length})</span>
              </h2>
              <p className="text-xs text-stone-500">
                View, edit, or delete college announcements and attached circular documents.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetNotificationForm();
                setAdminTab('add_notification');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Notification</span>
            </button>
          </div>

          {notifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Title</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Attachment</th>
                    <th className="py-3 px-3">Upload Date</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {notifications.map((notif) => (
                    <tr key={notif.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-3 max-w-sm">
                        <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5 truncate">
                          {notif.isPinned && <Pin className="w-3 h-3 text-indigo-600 rotate-45 shrink-0" />}
                          <span className="truncate">{notif.title}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{notif.message}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {notif.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {notif.attachment ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPdf({
                                title: notif.title,
                                fileName: notif.attachment!.fileName,
                                pdfData: notif.attachment!.fileData,
                              })
                            }
                            className="flex items-center gap-1 text-blue-600 hover:underline font-mono"
                          >
                            <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate max-w-[120px]">{notif.attachment.fileName}</span>
                          </button>
                        ) : (
                          <span className="text-stone-400">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-stone-500 font-mono">
                        {new Date(notif.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditNotification(notif)}
                            className="p-1.5 text-stone-500 hover:text-blue-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                            title="Edit Notification"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'notification',
                                id: notif.id,
                                title: notif.title,
                              })
                            }
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-stone-500 text-xs">
              No notifications published yet.
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal before Deletion (Requirement 5) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-100">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 border border-stone-200 dark:border-stone-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300">
              Are you sure you want to delete{' '}
              <strong>"{deleteConfirm.title}"</strong>? This item will be permanently removed from all student dashboards.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen PDF Preview Modal */}
      {previewPdf && (
        <PdfViewerModal
          isOpen={true}
          onClose={() => setPreviewPdf(null)}
          title={previewPdf.title}
          fileName={previewPdf.fileName}
          pdfData={previewPdf.pdfData}
        />
      )}
    </div>
  );
};
