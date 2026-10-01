import { AppSettings, Subject } from '../types/attendance';

export const STORAGE_KEYS = {
  SUBJECTS: 'klu_attendance_subjects_v2',
  SETTINGS: 'klu_attendance_settings_v2',
};

export const DEFAULT_SETTINGS: AppSettings = {
  targetPercentage: 75,
  weights: {
    lecture: 1.0,
    practical: 1.5,
    tutorial: 1.0,
    skill: 1.0,
    tcbr: 1.0,
  },
  calculationMode: 'weighted_hours',
  theme: 'system',
};

export const SAMPLE_SUBJECTS: Subject[] = [
  {
    id: 'klu-sample-1',
    code: '211CS201',
    name: 'Data Structures & Algorithms',
    credits: 4,
    components: {
      lecture: { conducted: 28, attended: 25, enabled: true },
      practical: { conducted: 14, attended: 13, enabled: true },
      tutorial: { conducted: 8, attended: 7, enabled: true },
      skill: { conducted: 10, attended: 9, enabled: true },
      tcbr: { conducted: 6, attended: 5, enabled: true },
    },
    createdAt: Date.now() - 3600000 * 24 * 30,
    updatedAt: Date.now(),
  },
  {
    id: 'klu-sample-2',
    code: '211CS202',
    name: 'Operating Systems',
    credits: 4,
    components: {
      lecture: { conducted: 30, attended: 23, enabled: true },
      practical: { conducted: 12, attended: 9, enabled: true },
      tutorial: { conducted: 6, attended: 4, enabled: true },
      skill: { conducted: 8, attended: 6, enabled: true },
      tcbr: { conducted: 4, attended: 3, enabled: true },
    },
    createdAt: Date.now() - 3600000 * 24 * 28,
    updatedAt: Date.now(),
  },
  {
    id: 'klu-sample-3',
    code: '211CS203',
    name: 'Database Management Systems',
    credits: 4,
    components: {
      lecture: { conducted: 32, attended: 29, enabled: true },
      practical: { conducted: 14, attended: 13, enabled: true },
      tutorial: { conducted: 8, attended: 7, enabled: true },
      skill: { conducted: 10, attended: 9, enabled: true },
      tcbr: { conducted: 6, attended: 5, enabled: true },
    },
    createdAt: Date.now() - 3600000 * 24 * 26,
    updatedAt: Date.now(),
  },
  {
    id: 'klu-sample-4',
    code: '211CS204',
    name: 'Computer Networks',
    credits: 3,
    components: {
      lecture: { conducted: 26, attended: 19, enabled: true },
      practical: { conducted: 10, attended: 7, enabled: true },
      tutorial: { conducted: 6, attended: 4, enabled: true },
      skill: { conducted: 8, attended: 5, enabled: true },
      tcbr: { conducted: 4, attended: 3, enabled: true },
    },
    createdAt: Date.now() - 3600000 * 24 * 24,
    updatedAt: Date.now(),
  },
  {
    id: 'klu-sample-5',
    code: '211EN101',
    name: 'Professional Communication & Soft Skills',
    credits: 2,
    components: {
      lecture: { conducted: 20, attended: 19, enabled: true },
      practical: { conducted: 0, attended: 0, enabled: false },
      tutorial: { conducted: 0, attended: 0, enabled: false },
      skill: { conducted: 16, attended: 15, enabled: true },
      tcbr: { conducted: 4, attended: 4, enabled: true },
    },
    createdAt: Date.now() - 3600000 * 24 * 22,
    updatedAt: Date.now(),
  },
];

export function loadStoredSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!raw) {
      // First visit: save and return sample subjects
      saveStoredSubjects(SAMPLE_SUBJECTS);
      return SAMPLE_SUBJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SAMPLE_SUBJECTS;
  } catch (err) {
    console.error('Failed to load subjects from localStorage:', err);
    return SAMPLE_SUBJECTS;
  }
}

export function saveStoredSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (err) {
    console.error('Failed to save subjects to localStorage:', err);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      weights: {
        ...DEFAULT_SETTINGS.weights,
        ...(parsed.weights || {}),
      },
    };
  } catch (err) {
    console.error('Failed to load settings from localStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
}

export function exportDataAsJSON(subjects: Subject[], settings: AppSettings): void {
  const payload = {
    app: 'KLU Attendance Calculator',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    settings,
    subjects,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute(
    'download',
    `klu-attendance-backup-${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importDataFromJSON(
  jsonString: string
): { subjects: Subject[]; settings: AppSettings } {
  const parsed = JSON.parse(jsonString);

  if (!parsed || !Array.isArray(parsed.subjects)) {
    throw new Error('Invalid JSON format: missing "subjects" array.');
  }

  const subjects: Subject[] = parsed.subjects.map((sub: any) => ({
    id: sub.id || 'sub-' + Math.random().toString(36).slice(2, 9),
    code: String(sub.code || '').trim(),
    name: String(sub.name || 'Untitled Subject').trim(),
    credits: typeof sub.credits === 'number' ? sub.credits : undefined,
    targetPercentage: typeof sub.targetPercentage === 'number' ? sub.targetPercentage : undefined,
    components: {
      lecture: {
        conducted: Math.max(0, Number(sub.components?.lecture?.conducted || 0)),
        attended: Math.max(0, Number(sub.components?.lecture?.attended || 0)),
        enabled: sub.components?.lecture?.enabled !== false,
      },
      practical: {
        conducted: Math.max(0, Number(sub.components?.practical?.conducted || 0)),
        attended: Math.max(0, Number(sub.components?.practical?.attended || 0)),
        enabled: sub.components?.practical?.enabled !== false,
      },
      tutorial: {
        conducted: Math.max(0, Number(sub.components?.tutorial?.conducted || 0)),
        attended: Math.max(0, Number(sub.components?.tutorial?.attended || 0)),
        enabled: sub.components?.tutorial?.enabled !== false,
      },
      skill: {
        conducted: Math.max(0, Number(sub.components?.skill?.conducted || 0)),
        attended: Math.max(0, Number(sub.components?.skill?.attended || 0)),
        enabled: sub.components?.skill?.enabled !== false,
      },
      tcbr: {
        conducted: Math.max(0, Number(sub.components?.tcbr?.conducted || 0)),
        attended: Math.max(0, Number(sub.components?.tcbr?.attended || 0)),
        enabled: sub.components?.tcbr?.enabled !== false,
      },
    },
    createdAt: sub.createdAt || Date.now(),
    updatedAt: Date.now(),
  }));

  const settings: AppSettings = {
    ...DEFAULT_SETTINGS,
    ...(parsed.settings || {}),
    weights: {
      ...DEFAULT_SETTINGS.weights,
      ...(parsed.settings?.weights || {}),
    },
  };

  return { subjects, settings };
}
