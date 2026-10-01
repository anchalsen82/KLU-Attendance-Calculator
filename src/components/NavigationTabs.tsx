import {
  Award,
  Bell,
  Bot,
  Calendar,
  CalendarDays,
  Home,
  Settings as SettingsIcon,
  ShieldCheck,
} from 'lucide-react';
import React from 'react';
import { NavigationTab } from '../types/attendance';

interface NavigationTabsProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'absent', label: 'Absent', icon: CalendarDays },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'notifications', label: 'Notices', icon: Bell },
    { id: 'ai', label: 'AI Bot', icon: Bot },
    { id: 'about', label: 'About', icon: Award },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1d]/95 dark:bg-[#070b19]/95 text-white backdrop-blur-xl border-t border-cyan-500/20 px-1 py-1 shadow-2xl">
      <div className="grid grid-cols-8 gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-cyan-300 bg-cyan-500/15 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[8.5px] truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
