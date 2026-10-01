import {
  Calendar,
  Clock,
  Download,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Upload,
} from 'lucide-react';
import React, { useState } from 'react';
import { AcademicCalendar, NavigationTab } from '../types/attendance';
import { PdfViewerModal } from './PdfViewerModal';

interface AcademicCalendarViewProps {
  calendars: AcademicCalendar[];
  isLoading: boolean;
  onRefresh: () => void;
  isAdmin: boolean;
  setActiveTab: (tab: NavigationTab) => void;
}

export const AcademicCalendarView: React.FC<AcademicCalendarViewProps> = ({
  calendars,
  isLoading,
  onRefresh,
  isAdmin,
  setActiveTab,
}) => {
  const [selectedPdf, setSelectedPdf] = useState<{
    title: string;
    fileName: string;
    pdfData: string;
  } | null>(null);

  // Find latest calendar
  const latestCalendar = calendars.find((c) => c.isLatest) || calendars[0];
  const previousCalendars = calendars.filter((c) => c.id !== latestCalendar?.id);

  const handleDownload = (calendar: AcademicCalendar) => {
    const link = document.createElement('a');
    link.href = calendar.fileData;
    link.download = calendar.fileName.endsWith('.pdf') ? calendar.fileName : `${calendar.fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Official University Schedule
            </span>
            {isAdmin && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                Admin Console
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
            Academic Calendar & Important Dates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View and download the officially published semester schedule, examination dates, and working days
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh calendars from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-500' : ''}`} />
            <span>{isLoading ? 'Checking...' : 'Refresh'}</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 rounded-xl shadow-xs transition-opacity cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Calendar</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured: Latest Active Academic Calendar */}
      {latestCalendar ? (
        <div className="glass-card rounded-3xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-sm">
          {/* Header Strip */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Current Active Calendar
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {latestCalendar.academicYear}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                {latestCalendar.title}
              </h2>
              {latestCalendar.description && (
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal">
                  {latestCalendar.description}
                </p>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setSelectedPdf({
                    title: latestCalendar.title,
                    fileName: latestCalendar.fileName,
                    pdfData: latestCalendar.fileData,
                  })
                }
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-sm cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Full PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload(latestCalendar)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
                title="Download PDF to device"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Embedded Interactive PDF Viewport */}
          <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-900">
              <iframe
                src={`${latestCalendar.fileData}#toolbar=0&navpanes=0`}
                title={latestCalendar.title}
                className="w-full h-[450px] sm:h-[550px] border-none"
              />
            </div>

            {/* Document Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{latestCalendar.fileName}</span>
                  {latestCalendar.fileSize && <span>({latestCalendar.fileSize})</span>}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Published {new Date(latestCalendar.uploadedAt).toLocaleDateString()}</span>
                </span>
              </div>

              <span>Verified University Circular</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Academic Calendars Published Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The administrator has not uploaded the academic schedule yet. Please check back later.
          </p>
        </div>
      )}

      {/* Previous Calendars Archive */}
      {previousCalendars.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Academic Schedule Archive ({previousCalendars.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previousCalendars.map((cal) => (
              <div
                key={cal.id}
                className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/90 space-y-3 hover:border-cyan-500/40 transition-colors shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                      {cal.academicYear} · {cal.semester}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {cal.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPdf({
                        title: cal.title,
                        fileName: cal.fileName,
                        pdfData: cal.fileData,
                      })
                    }
                    className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(cal)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {selectedPdf && (
        <PdfViewerModal
          isOpen={!!selectedPdf}
          onClose={() => setSelectedPdf(null)}
          title={selectedPdf.title}
          fileName={selectedPdf.fileName}
          pdfData={selectedPdf.pdfData}
        />
      )}
    </div>
  );
};
