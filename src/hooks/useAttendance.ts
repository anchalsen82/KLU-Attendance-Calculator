import { useEffect, useMemo, useState } from 'react';
import {
  AppSettings,
  ComponentType,
  NavigationTab,
  SemesterMetric,
  Subject,
} from '../types/attendance';
import { calculateSemesterMetric } from '../utils/calculations';
import {
  DEFAULT_SETTINGS,
  loadStoredSettings,
  loadStoredSubjects,
  SAMPLE_SUBJECTS,
  saveStoredSettings,
  saveStoredSubjects,
} from '../utils/storage';

export interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export function useAttendance() {
  const [subjects, setSubjects] = useState<Subject[]>(() => loadStoredSubjects());
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Synchronize localStorage whenever subjects change
  useEffect(() => {
    saveStoredSubjects(subjects);
  }, [subjects]);

  // Synchronize localStorage whenever settings change
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Handle Theme (light / dark / system)
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (settings.theme === 'dark') {
      applyTheme(true);
    } else if (settings.theme === 'light') {
      applyTheme(false);
    } else {
      // System mode
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };

      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add a new subject
  const addSubject = (newSubjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSubject: Subject = {
      ...newSubjectData,
      id: 'sub-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSubjects((prev) => [newSubject, ...prev]);
    showToast(`Added "${newSubject.name}"`, 'success');
  };

  // Update existing subject
  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== id) return sub;
        return {
          ...sub,
          ...updates,
          updatedAt: Date.now(),
        };
      })
    );
    showToast('Subject updated successfully', 'success');
  };

  // Delete subject
  const deleteSubject = (id: string) => {
    const subjectToDelete = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    showToast(`Deleted "${subjectToDelete?.name || 'Subject'}"`, 'info');
  };

  // Step increment or decrement attended/conducted (+1 / -1)
  const stepComponent = (
    subjectId: string,
    componentType: ComponentType,
    field: 'attended' | 'conducted',
    delta: number
  ) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        const comp = sub.components[componentType];
        if (!comp) return sub;

        let newConducted = comp.conducted;
        let newAttended = comp.attended;

        if (field === 'conducted') {
          newConducted = Math.max(0, comp.conducted + delta);
          // If conducted is reduced below attended, cap attended to conducted
          if (newAttended > newConducted) {
            newAttended = newConducted;
          }
        } else {
          // Field is attended
          newAttended = Math.max(0, comp.attended + delta);
          // Attended cannot exceed conducted
          if (newAttended > newConducted) {
            // Auto-advance conducted as well if student is marking present today!
            newConducted = newAttended;
          }
        }

        return {
          ...sub,
          updatedAt: Date.now(),
          components: {
            ...sub.components,
            [componentType]: {
              ...comp,
              conducted: newConducted,
              attended: newAttended,
            },
          },
        };
      })
    );
  };

  // Directly set component values with strict validation
  const setComponentValues = (
    subjectId: string,
    componentType: ComponentType,
    conducted: number,
    attended: number
  ) => {
    if (attended > conducted) {
      showToast('Attended classes cannot exceed conducted classes', 'warning');
      attended = conducted;
    }

    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        const comp = sub.components[componentType];
        return {
          ...sub,
          updatedAt: Date.now(),
          components: {
            ...sub.components,
            [componentType]: {
              ...comp,
              conducted: Math.max(0, conducted),
              attended: Math.max(0, Math.min(attended, conducted)),
            },
          },
        };
      })
    );
  };

  // Toggle component active state for a subject
  const toggleComponent = (subjectId: string, componentType: ComponentType, enabled: boolean) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        const comp = sub.components[componentType];
        return {
          ...sub,
          updatedAt: Date.now(),
          components: {
            ...sub.components,
            [componentType]: {
              ...comp,
              enabled,
            },
          },
        };
      })
    );
  };

  // Update app settings
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
      weights: {
        ...prev.weights,
        ...(updates.weights || {}),
      },
    }));
    showToast('Settings saved', 'success');
  };

  // Update specific weight
  const updateWeight = (compType: ComponentType, weight: number) => {
    setSettings((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [compType]: Math.max(0.1, weight),
      },
    }));
  };

  // Reset to default sample subjects
  const resetToSampleData = () => {
    setSubjects(SAMPLE_SUBJECTS);
    setSettings(DEFAULT_SETTINGS);
    showToast('Restored sample KLU subjects & default weights', 'info');
  };

  // Clear all data
  const clearAllData = () => {
    setSubjects([]);
    showToast('All subjects cleared', 'info');
  };

  // Load imported data
  const loadImportedData = (data: { subjects: Subject[]; settings: AppSettings }) => {
    setSubjects(data.subjects);
    setSettings(data.settings);
    showToast(`Imported ${data.subjects.length} subjects successfully`, 'success');
  };

  // Open modal to create subject
  const openCreateSubjectModal = () => {
    setEditingSubject(null);
    setIsSubjectModalOpen(true);
  };

  // Open modal to edit subject
  const openEditSubjectModal = (subject: Subject) => {
    setEditingSubject(subject);
    setIsSubjectModalOpen(true);
  };

  const closeSubjectModal = () => {
    setIsSubjectModalOpen(false);
    setEditingSubject(null);
  };

  // Computed semester metric
  const semesterMetric: SemesterMetric = useMemo(() => {
    return calculateSemesterMetric(subjects, settings);
  }, [subjects, settings]);

  return {
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
  };
}
