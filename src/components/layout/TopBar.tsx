import React, { useMemo, useRef, useState, useEffect } from 'react';
import { CalendarDays, CheckSquare, FileText, Menu, Search, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { NavPage } from '../../types/academic';
import { formatHeaderDate } from '../../utils/dateUtils';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

const PAGE_TITLES: Record<NavPage, string> = {
  overview: 'Overview',
  planner: 'Study Planner',
  notes: 'My Notes',
  assignments: 'Assignments',
  quiz: 'Quiz Generator',
  analytics: 'Progress & Analytics',
  settings: 'Settings',
  profile: 'Profile',
};

interface SearchHit {
  id: string;
  title: string;
  subtitle: string;
  page: NavPage;
  kind: 'note' | 'assignment' | 'session';
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const { data, activePage, setActivePage, setSelectedNoteId } = useWorkspace();
  const [query, setQuery] = useState('');
  const [openResults, setOpenResults] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const todayFormatted = useMemo(() => formatHeaderDate(new Date()), []);

  const subjectById = useMemo(() => {
    const map = new Map<string, string>();
    data.subjects.forEach((s) => map.set(s.id, s.code || s.name));
    return map;
  }, [data.subjects]);

  const searchResults = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hits: SearchHit[] = [];

    data.assignments.forEach((a) => {
      const subj = subjectById.get(a.subjectId) || '';
      if (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        subj.toLowerCase().includes(q)
      ) {
        hits.push({
          id: a.id,
          title: a.title,
          subtitle: `Assignment · ${subj || 'General'}`,
          page: 'assignments',
          kind: 'assignment',
        });
      }
    });

    data.notes.forEach((n) => {
      const subj = subjectById.get(n.subjectId) || '';
      if (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)) ||
        subj.toLowerCase().includes(q)
      ) {
        hits.push({
          id: n.id,
          title: n.title || 'Untitled Note',
          subtitle: `Note · ${subj || 'General'}`,
          page: 'notes',
          kind: 'note',
        });
      }
    });

    data.studySessions.forEach((s) => {
      const subj = subjectById.get(s.subjectId) || '';
      if (
        s.title.toLowerCase().includes(q) ||
        subj.toLowerCase().includes(q)
      ) {
        hits.push({
          id: s.id,
          title: s.title,
          subtitle: `Session · ${subj} · ${s.date}`,
          page: 'planner',
          kind: 'session',
        });
      }
    });

    return hits.slice(0, 8);
  }, [query, data.assignments, data.notes, data.studySessions, subjectById]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target as Node)
      ) {
        setOpenResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectHit = (hit: SearchHit) => {
    if (hit.kind === 'note') {
      setSelectedNoteId(hit.id);
    }
    setActivePage(hit.page);
    setOpenResults(false);
    setQuery('');
  };

  const initials = data.profile.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-14 bg-[#101113]/95 backdrop-blur-sm border-b border-[#2A2C30] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu + Page Title + Date */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden p-2 -ml-2 rounded-md text-[#92959D] hover:text-[#F2F2F2] hover:bg-[#1B1D20] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-baseline gap-2.5 min-w-0">
          <h1 className="text-[15px] font-semibold text-[#F2F2F2] truncate">
            {PAGE_TITLES[activePage]}
          </h1>
          <span className="hidden sm:inline text-[#92959D]/50" aria-hidden="true">
            ·
          </span>
          <span className="hidden sm:inline text-[13px] text-[#92959D] whitespace-nowrap tabular-nums">
            {todayFormatted}
          </span>
        </div>
      </div>

      {/* Right: Search + Profile Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        <div ref={searchWrapRef} className="relative">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#92959D] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={query}
              onFocus={() => setOpenResults(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenResults(true);
              }}
              placeholder="Search notes, tasks, sessions..."
              aria-label="Search workspace"
              className="w-40 sm:w-64 lg:w-72 h-8 pl-8 pr-7 rounded-md bg-[#161719] border border-[#2A2C30] text-[13px] text-[#F2F2F2] placeholder:text-[#92959D]/70 focus:outline-none focus:border-[#91A5D5] transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 text-[#92959D] hover:text-[#F2F2F2]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {openResults && query.trim().length > 0 && (
            <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-[#1B1D20] border border-[#2A2C30] rounded-lg shadow-xl overflow-hidden z-50">
              {searchResults.length === 0 ? (
                <div className="px-4 py-5 text-center text-[13px] text-[#92959D]">
                  No matches for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-[#2A2C30]">
                  {searchResults.map((hit) => (
                    <button
                      key={`${hit.kind}_${hit.id}`}
                      type="button"
                      onClick={() => handleSelectHit(hit)}
                      className="w-full px-3.5 py-2.5 flex items-start gap-2.5 text-left hover:bg-[#222429] transition-colors"
                    >
                      <span className="mt-0.5 text-[#91A5D5] shrink-0">
                        {hit.kind === 'note' && <FileText className="w-3.5 h-3.5" />}
                        {hit.kind === 'assignment' && <CheckSquare className="w-3.5 h-3.5" />}
                        {hit.kind === 'session' && <CalendarDays className="w-3.5 h-3.5" />}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-[#F2F2F2] truncate">
                          {hit.title}
                        </div>
                        <div className="text-[11px] text-[#92959D] truncate">
                          {hit.subtitle}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setActivePage('profile')}
          title={data.profile.name}
          aria-label="Open profile"
          className="w-8 h-8 rounded-full overflow-hidden border border-[#2A2C30] hover:border-[#91A5D5] transition-colors shrink-0 bg-[#1B1D20] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#91A5D5]"
        >
          {data.profile.avatarUrl && !imgFailed ? (
            <img
              src={data.profile.avatarUrl}
              alt={data.profile.name}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-semibold text-[#F2F2F2]">
              {initials || 'CP'}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
