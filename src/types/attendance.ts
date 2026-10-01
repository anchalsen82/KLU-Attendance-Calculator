export type ComponentType = 'lecture' | 'practical' | 'tutorial' | 'skill' | 'tcbr';

export interface ComponentConfig {
  key: ComponentType;
  label: string;
  shortLabel: string;
  description: string;
  defaultWeight: number;
}

export const COMPONENT_CONFIGS: Record<ComponentType, ComponentConfig> = {
  lecture: {
    key: 'lecture',
    label: 'Lecture',
    shortLabel: 'L',
    description: 'Classroom theory lectures',
    defaultWeight: 1.0,
  },
  practical: {
    key: 'practical',
    label: 'Practical / Lab',
    shortLabel: 'P',
    description: 'Laboratory experiments & hands-on practicals',
    defaultWeight: 1.5,
  },
  tutorial: {
    key: 'tutorial',
    label: 'Tutorial',
    shortLabel: 'T',
    description: 'Problem-solving & guided tutorial sessions',
    defaultWeight: 1.0,
  },
  skill: {
    key: 'skill',
    label: 'Skill',
    shortLabel: 'S',
    description: 'Skill development & practical training',
    defaultWeight: 1.0,
  },
  tcbr: {
    key: 'tcbr',
    label: 'TCBR',
    shortLabel: 'TCBR',
    description: 'Textbook Course Book Review / Term project work',
    defaultWeight: 1.0,
  },
};

export interface ComponentData {
  conducted: number;
  attended: number;
  enabled: boolean;
  weight?: number; // Optional subject-specific override
}

export type SubjectComponents = Record<ComponentType, ComponentData>;

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits?: number;
  targetPercentage?: number; // Optional subject-specific target override
  components: SubjectComponents;
  createdAt: number;
  updatedAt: number;
}

export type CalculationMode = 'weighted_hours' | 'component_average' | 'unweighted_simple';

export interface ComponentWeights {
  lecture: number;
  practical: number;
  tutorial: number;
  skill: number;
  tcbr: number;
}

export interface AppSettings {
  targetPercentage: number;
  weights: ComponentWeights;
  calculationMode: CalculationMode;
  theme: 'light' | 'dark' | 'system';
}

export type AttendanceStatus = 'safe' | 'warning' | 'critical' | 'unrecorded';

export interface ComponentMetric {
  type: ComponentType;
  label: string;
  shortLabel: string;
  conducted: number;
  attended: number;
  weight: number;
  percentage: number;
  safeBunks: number;
  recoveryNeeded: number;
  status: AttendanceStatus;
}

export interface SubjectMetric {
  subject: Subject;
  conductedTotal: number;
  attendedTotal: number;
  percentage: number;
  status: AttendanceStatus;
  targetPercentage: number;
  differenceFromTarget: number;
  safeBunks: number;
  recoveryNeeded: number;
  components: Record<ComponentType, ComponentMetric>;
  hasClasses: boolean;
}

export interface SemesterMetric {
  totalSubjects: number;
  activeSubjectsCount: number;
  totalConducted: number;
  totalAttended: number;
  overallPercentage: number;
  targetPercentage: number;
  differenceFromTarget: number;
  status: AttendanceStatus;
  overallSafeBunks: number;
  overallRecoveryNeeded: number;
  safeCount: number;
  warningCount: number;
  criticalCount: number;
  subjectMetrics: SubjectMetric[];
}

export interface AcademicCalendar {
  id: string;
  title: string;
  academicYear: string;
  semester: string;
  description?: string;
  fileName: string;
  fileSize?: string;
  fileData: string; // Base64 PDF data URL
  uploadedBy: string;
  uploadedAt: number;
  isLatest: boolean;
}

export type NotificationCategory = 'urgent' | 'academic' | 'examination' | 'holiday' | 'circular';

export interface CollegeNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  isPinned: boolean;
  uploadedAt: number;
  uploadedBy: string;
  attachment?: {
    fileName: string;
    fileSize?: string;
    fileData: string;
    fileType: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  suggestions?: string[];
  metricsContext?: {
    overallPercentage?: number;
    safeBunks?: number;
    recoveryNeeded?: number;
  };
}

export type NavigationTab =
  | 'home'
  | 'absent'
  | 'calendar'
  | 'notifications'
  | 'ai'
  | 'about'
  | 'admin'
  | 'settings';

