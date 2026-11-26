import React, { useState } from 'react';
import { Check, Download, RotateCcw, Trash2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const SettingsView: React.FC = () => {
  const {
    data,
    updatePreferences,
    resetToSampleData,
    clearWorkspaceData,
  } = useWorkspace();

  const [dailyGoal, setDailyGoal] = useState(data.preferences.dailyStudyGoalHours);
  const [startHour, setStartHour] = useState(data.preferences.preferredStartHour);
  const [endHour, setEndHour] = useState(data.preferences.preferredEndHour);
  const [focusBlock, setFocusBlock] = useState(data.preferences.focusBlockMinutes);
  const [weekStartsOn, setWeekStartsOn] = useState(data.preferences.weekStartsOn);
  const [savedNotice, setSavedNotice] = useState(false);

  const [confirmAction, setConfirmAction] = useState<'reset' | 'clear' | null>(
    null,
  );
  const [dataNotice, setDataNotice] = useState('');

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      dailyStudyGoalHours: Math.max(1, Math.min(14, Number(dailyGoal) || 4)),
      preferredStartHour: Math.max(0, Math.min(22, Number(startHour))),
      preferredEndHour: Math.max(1, Math.min(23, Number(endHour))),
      focusBlockMinutes: Number(focusBlock) || 60,
      weekStartsOn,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campuspilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatHour = (h: number) => `${String(h).padStart(2, '0')}:00`;

  return (
    <div className="max-w-[780px] mx-auto space-y-6">
      {/* Study Preferences */}
      <section className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5 sm:p-6">
        <div className="pb-4 border-b border-[#2A2C30]">
          <h2 className="text-[16px] font-semibold text-[#F2F2F2]">
            Study Preferences
          </h2>
          <p className="text-[13px] text-[#92959D] mt-0.5">
            Configure daily targets and scheduling windows used by the Study Planner.
          </p>
        </div>

        <form onSubmit={handleSavePreferences} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Daily Study Goal (hours)
              </label>
              <input
                type="number"
                min={1}
                max={14}
                step={0.5}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] tabular-nums focus:outline-none focus:border-[#91A5D5]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Default Focus Block Duration
              </label>
              <select
                value={focusBlock}
                onChange={(e) => setFocusBlock(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              >
                <option value={25}>25 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Preferred Start Hour
              </label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] tabular-nums focus:outline-none focus:border-[#91A5D5]"
              >
                {Array.from({ length: 17 }, (_, i) => i + 6).map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Preferred End Hour
              </label>
              <select
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] tabular-nums focus:outline-none focus:border-[#91A5D5]"
              >
                {Array.from({ length: 16 }, (_, i) => i + 8).map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Week Starts On
              </label>
              <select
                value={weekStartsOn}
                onChange={(e) =>
                  setWeekStartsOn(e.target.value as 'monday' | 'sunday')
                }
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              >
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <span className="text-[12px] text-[#5FA876]">
              {savedNotice ? 'Preferences saved.' : ''}
            </span>
            <button
              type="submit"
              className="h-9 px-4 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] text-[#101113] text-[13px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              Save Preferences
            </button>
          </div>
        </form>
      </section>

      {/* Data Management */}
      <section className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5 sm:p-6 space-y-4">
        <div className="pb-4 border-b border-[#2A2C30]">
          <h2 className="text-[16px] font-semibold text-[#F2F2F2]">
            Workspace Data & Reset
          </h2>
          <p className="text-[13px] text-[#92959D] mt-0.5">
            All notes, assignments, sessions, and quiz attempts are stored locally in your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="h-9 px-3.5 rounded-md bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[13px] font-medium text-[#F2F2F2] flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#91A5D5]" />
            Export Backup (JSON)
          </button>

          <button
            type="button"
            onClick={() => setConfirmAction('reset')}
            className="h-9 px-3.5 rounded-md bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[13px] font-medium text-[#F2F2F2] flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D49A45]" />
            Restore Sample Data
          </button>

          <button
            type="button"
            onClick={() => setConfirmAction('clear')}
            className="h-9 px-3.5 rounded-md bg-[#222429] hover:bg-[#D06A6A]/15 border border-[#2A2C30] hover:border-[#D06A6A]/50 text-[13px] font-medium text-[#D06A6A] flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset All Data
          </button>
        </div>

        {confirmAction && (
          <div className="p-4 rounded-md bg-[#161719] border border-[#2A2C30] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[13px] text-[#F2F2F2]">
              {confirmAction === 'reset'
                ? 'Replace current workspace data with default sample courses, notes, and tasks?'
                : 'Clear all subjects, assignments, notes, sessions, and quiz history?'}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-3 py-1.5 rounded bg-[#222429] text-[12px] text-[#92959D] hover:text-[#F2F2F2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmAction === 'reset') {
                    resetToSampleData();
                    setDataNotice('Sample data restored.');
                  } else {
                    clearWorkspaceData();
                    setDataNotice('Workspace cleared.');
                  }
                  setConfirmAction(null);
                  setTimeout(() => setDataNotice(''), 2500);
                }}
                className="px-3 py-1.5 rounded bg-[#D06A6A] text-[#101113] text-[12px] font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {dataNotice && (
          <p className="text-[12px] text-[#5FA876]">{dataNotice}</p>
        )}
      </section>
    </div>
  );
};
