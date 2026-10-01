/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { AboutRecognitionView } from './components/AboutRecognitionView';
import { AcademicCalendarView } from './components/AcademicCalendarView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AiAssistantView } from './components/AiAssistantView';
import { BunkPlannerView } from './components/BunkPlannerView';
import { ConfirmModal } from './components/ConfirmModal';
import { Header } from './components/Header';
import { HomeSimpleCalculator } from './components/HomeSimpleCalculator';
import { NavigationTabs } from './components/NavigationTabs';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { SubjectModal } from './components/SubjectModal';
import { ToastContainer } from './components/ToastContainer';
import { useAttendance } from './hooks/useAttendance';
import { apiService } from './services/apiService';
import { AcademicCalendar, CollegeNotification, Subject } from './types/attendance';

export default function App() {
  const {
    subjects,
    settings,
    activeTab,
    setActiveTab,
    editingSubject,
    isSubjectModalOpen,
    openCreateSubjectModal,
    openEditSubjectModal,
    closeSubjectModal,
    toasts,
    showToast,
    removeToast,
    addSubject,
    updateSubject,
    deleteSubject,
    stepComponent,
    setComponentValues,
    toggleComponent,
    updateSettings,
    updateWeight,
    resetToSampleData,
    clearAllData,
    loadImportedData,
    semesterMetric,
  } = useAttendance();

  // Central state for Academic Calendars & College Notifications
  const [calendars, setCalendars] = useState<AcademicCalendar[]>([]);
  const [notifications, setNotifications] = useState<CollegeNotification[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => apiService.isAdminAuthenticated());

  // State for planner selection
  const [plannerSubjectId, setPlannerSubjectId] = useState<string>('overall');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Fetch central shared documents and notifications
  const loadCentralData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [fetchedCalendars, fetchedNotifs] = await Promise.all([
        apiService.getCalendars(),
        apiService.getNotifications(),
      ]);
      setCalendars(fetchedCalendars);
      setNotifications(fetchedNotifs);
    } catch (err) {
      console.warn('Failed to load central college data:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // Initial fetch and auto-polling every 12 seconds for real-time student updates
  useEffect(() => {
    loadCentralData();
    const interval = setInterval(loadCentralData, 12000);
    return () => clearInterval(interval);
  }, [loadCentralData]);

  // Admin Login & Logout handlers
  const handleAdminLogin = (token: string) => {
    apiService.setAdminToken(token);
    setIsAdmin(true);
  };

  const handleAdminLogout = () => {
    apiService.clearAdminToken();
    setIsAdmin(false);
    showToast('Logged out of Admin Console.', 'info');
  };

  // Handle theme toggle from header
  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  // Handle delete subject with confirmation
  const handleDeletePrompt = (id: string) => {
    const sub = subjects.find((s) => s.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Course',
      message: `Are you sure you want to delete "${sub?.name || 'this course'}"? All recorded attendance data for this course will be removed.`,
      confirmLabel: 'Delete Course',
      isDestructive: true,
      onConfirm: () => {
        deleteSubject(id);
        setConfirmModal(null);
      },
    });
  };

  // Handle duplicate subject
  const handleDuplicateSubject = (sub: Subject) => {
    addSubject({
      code: sub.code ? `${sub.code}-COPY` : '',
      name: `${sub.name} (Copy)`,
      credits: sub.credits,
      targetPercentage: sub.targetPercentage,
      components: JSON.parse(JSON.stringify(sub.components)),
    });
  };

  // Handle reset to sample data with confirmation
  const handleResetToSamplePrompt = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reload Sample Subjects',
      message:
        'This will replace your current courses with realistic sample KLU courses (DSA, OS, DBMS, Networks, Soft Skills) and default weights. Any unsaved custom entries will be lost.',
      confirmLabel: 'Reload Sample Data',
      isDestructive: false,
      onConfirm: () => {
        resetToSampleData();
        setConfirmModal(null);
      },
    });
  };

  // Handle clear all data with confirmation
  const handleClearAllPrompt = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear All Course Data',
      message:
        'Are you sure you want to delete all courses and recorded attendance? This action cannot be undone unless you have an exported JSON backup.',
      confirmLabel: 'Clear All Data',
      isDestructive: true,
      onConfirm: () => {
        clearAllData();
        setConfirmModal(null);
      },
    });
  };

  // Navigate to planner with a specific subject pre-selected
  const handleNavigateToPlannerWithSubject = (subjectId: string) => {
    setPlannerSubjectId(subjectId);
    setActiveTab('absent');
  };

  return (
    <div className="min-h-screen bg-stone-100/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Maroon Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        {/* TAB 1: HOME (Simple Attendance Calculator & SIS Quick Access - 100% UNCHANGED) */}
        {activeTab === 'home' && (
          <HomeSimpleCalculator
            metric={semesterMetric}
            subjects={subjects}
            targetPercentage={settings.targetPercentage}
            onUpdateTarget={(t) => updateSettings({ targetPercentage: t })}
            setActiveTab={setActiveTab}
            onOpenAddSubject={openCreateSubjectModal}
          />
        )}

        {/* TAB 2: ATTENDANCE WHEN ABSENT (Bunk & Recovery Planner) */}
        {activeTab === 'absent' && (
          <BunkPlannerView
            subjects={subjects}
            metric={semesterMetric}
            targetPercentage={settings.targetPercentage}
            onUpdateTarget={(t) => updateSettings({ targetPercentage: t })}
            initialSubjectId={plannerSubjectId}
          />
        )}

        {/* TAB 3: ACADEMIC CALENDAR (Student & Admin View) */}
        {activeTab === 'calendar' && (
          <AcademicCalendarView
            calendars={calendars}
            isLoading={isDataLoading}
            onRefresh={loadCentralData}
            isAdmin={isAdmin}
            setActiveTab={setActiveTab}
          />
        )}

        {/* TAB 6: NOTIFICATIONS & CIRCULARS (Student & Admin View) */}
        {activeTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            isLoading={isDataLoading}
            onRefresh={loadCentralData}
            isAdmin={isAdmin}
            setActiveTab={setActiveTab}
          />
        )}

        {/* TAB 4: ABOUT & RECOGNITION (Tribute to Anchal Singh) */}
        {activeTab === 'about' && (
          <AboutRecognitionView setActiveTab={setActiveTab} />
        )}

        {/* TAB: AI ATTENDANCE ADVISOR */}
        {activeTab === 'ai' && (
          <AiAssistantView
            metric={semesterMetric}
            subjects={subjects}
            targetPercentage={settings.targetPercentage}
            setActiveTab={setActiveTab}
          />
        )}

        {/* TAB 5: ADMIN DASHBOARD (Secure Admin Console) */}
        {activeTab === 'admin' && (
          <AdminDashboardView
            isAdmin={isAdmin}
            onAdminLogin={handleAdminLogin}
            onAdminLogout={handleAdminLogout}
            calendars={calendars}
            notifications={notifications}
            onRefreshData={loadCentralData}
            setActiveTab={setActiveTab}
            showToast={showToast}
          />
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            subjects={subjects}
            onUpdateSettings={updateSettings}
            onUpdateWeight={updateWeight}
            onResetToSample={handleResetToSamplePrompt}
            onClearAll={handleClearAllPrompt}
            onImportData={loadImportedData}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Course Add/Edit Modal */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={closeSubjectModal}
        onSave={addSubject}
        onUpdate={updateSubject}
        editingSubject={editingSubject}
        defaultTarget={settings.targetPercentage}
      />

      {/* Generic Confirmation Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          isDestructive={confirmModal.isDestructive}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Academic Footer */}
      <footer className="border-t border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 py-6 text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#800020] dark:text-rose-400">
              KLU Attendance Portal
            </span>
            <span>·</span>
            <span>Kalasalingam Academy of Research and Education</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className="hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
            >
              Academic Calendar
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
            >
              Announcements
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="hover:text-stone-800 dark:hover:text-stone-200 font-semibold transition-colors cursor-pointer"
            >
              Admin Console
            </button>
            <span>·</span>
            <a
              href="https://sis.kalasalingam.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#800020] dark:hover:text-rose-400 font-semibold transition-colors cursor-pointer"
            >
              Kalasalingam SIS
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
