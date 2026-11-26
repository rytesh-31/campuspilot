import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  Hash,
  Info,
  Pin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Note } from '../../types/academic';
import { formatRelativeTimestamp } from '../../utils/dateUtils';

type AIToolAction = 'summarize' | 'questions' | 'explain' | null;

const AI_TOOL_LABELS: Record<Exclude<AIToolAction, null>, string> = {
  summarize: 'Summarize Notes',
  questions: 'Generate Important Questions',
  explain: 'Explain Concepts',
};

export const NotesView: React.FC = () => {
  const {
    data,
    selectedNoteId,
    setSelectedNoteId,
    quickAction,
    setQuickAction,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [newTagInput, setNewTagInput] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedAITool, setSelectedAITool] = useState<AIToolAction>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  const subjectMap = useMemo(() => {
    const map = new Map<string, (typeof data.subjects)[number]>();
    data.subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [data.subjects]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    data.notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [data.notes]);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.notes
      .filter((note) => {
        if (subjectFilter !== 'all' && note.subjectId !== subjectFilter)
          return false;
        if (tagFilter !== 'all' && !note.tags.includes(tagFilter)) return false;
        if (q) {
          const subj = subjectMap.get(note.subjectId);
          const hay = `${note.title} ${note.content} ${note.tags.join(' ')} ${subj?.name || ''} ${subj?.code || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [data.notes, subjectFilter, tagFilter, searchQuery, subjectMap]);

  const activeNote: Note | null = useMemo(() => {
    if (selectedNoteId) {
      const found = data.notes.find((n) => n.id === selectedNoteId);
      if (found) return found;
    }
    return filteredNotes[0] || data.notes[0] || null;
  }, [selectedNoteId, data.notes, filteredNotes]);

  const handleCreateNote = () => {
    const defaultSubjectId =
      subjectFilter !== 'all'
        ? subjectFilter
        : data.subjects[0]?.id || '';
    const created = addNote({
      title: '',
      subjectId: defaultSubjectId,
      content: '',
      tags: [],
      pinned: false,
    });
    setSelectedNoteId(created.id);
    setSelectedAITool(null);
    setConfirmDeleteId(null);
    setTimeout(() => titleInputRef.current?.focus(), 40);
  };

  useEffect(() => {
    if (quickAction === 'create-note') {
      handleCreateNote();
      setQuickAction(null);
    }
  }, [quickAction]);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote) return;
    const clean = newTagInput
      .trim()
      .toLowerCase()
      .replace(/^#+/, '')
      .replace(/\s+/g, '-');
    if (!clean) return;
    if (!activeNote.tags.includes(clean)) {
      updateNote(activeNote.id, { tags: [...activeNote.tags, clean] });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!activeNote) return;
    updateNote(activeNote.id, {
      tags: activeNote.tags.filter((t) => t !== tag),
    });
  };

  const wordCount = useMemo(() => {
    if (!activeNote?.content.trim()) return 0;
    return activeNote.content.trim().split(/\s+/).length;
  }, [activeNote?.content]);

  return (
    <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left Pane: Notes Directory */}
      <aside className="lg:col-span-4 bg-[#1B1D20] border border-[#2A2C30] rounded-lg overflow-hidden flex flex-col lg:h-[calc(100vh-7.5rem)]">
        <div className="p-3.5 border-b border-[#2A2C30] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-[#F2F2F2]">
              Notes ({filteredNotes.length})
            </span>
            <button
              type="button"
              onClick={handleCreateNote}
              className="px-3 py-1.5 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] text-[#101113] text-[12px] font-medium flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              New Note
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#92959D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes or tags..."
              className="w-full h-8 pl-8 pr-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[12px] text-[#F2F2F2] placeholder:text-[#92959D]/70 focus:outline-none focus:border-[#91A5D5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              aria-label="Filter notes by subject"
              className="h-8 px-2 rounded-md bg-[#101113] border border-[#2A2C30] text-[12px] text-[#92959D] focus:outline-none focus:border-[#91A5D5]"
            >
              <option value="all">All Subjects</option>
              {data.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code || s.name}
                </option>
              ))}
            </select>

            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              aria-label="Filter notes by tag"
              className="h-8 px-2 rounded-md bg-[#101113] border border-[#2A2C30] text-[12px] text-[#92959D] focus:outline-none focus:border-[#91A5D5]"
            >
              <option value="all">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#2A2C30] max-h-[340px] lg:max-h-none">
          {filteredNotes.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-[13px] text-[#92959D]">No notes found.</p>
              <button
                type="button"
                onClick={handleCreateNote}
                className="mt-3 px-3 py-1.5 rounded bg-[#222429] hover:bg-[#2A2C30] text-[12px] text-[#F2F2F2] transition-colors"
              >
                Create First Note
              </button>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const subj = subjectMap.get(note.subjectId);
              const isSelected = activeNote?.id === note.id;
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setConfirmDeleteId(null);
                    setSelectedAITool(null);
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-[#222429]'
                      : 'hover:bg-[#222429]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-medium text-[#F2F2F2] truncate">
                      {note.title || 'Untitled Note'}
                    </span>
                    {note.pinned && (
                      <Pin className="w-3.5 h-3.5 text-[#91A5D5] shrink-0 mt-0.5" />
                    )}
                  </div>

                  <p className="text-[12px] text-[#92959D] mt-1 line-clamp-1">
                    {note.content.trim() || 'Empty note'}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#92959D]/80 tabular-nums">
                    <span>{subj?.code || 'General'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatRelativeTimestamp(note.updatedAt)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Right Pane: Distraction-Free Editor & Future AI Tools */}
      <section className="lg:col-span-8 bg-[#1B1D20] border border-[#2A2C30] rounded-lg flex flex-col lg:min-h-[calc(100vh-7.5rem)]">
        {!activeNote ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
            <FileText className="w-8 h-8 text-[#92959D]/60 mb-3" />
            <h3 className="text-[15px] font-medium text-[#F2F2F2]">
              Select or create a note
            </h3>
            <p className="text-[13px] text-[#92959D] mt-1 max-w-sm">
              Keep lecture summaries, derivations, and exam revision sheets organized by subject.
            </p>
            <button
              type="button"
              onClick={handleCreateNote}
              className="mt-4 px-4 py-2 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] text-[#101113] text-[13px] font-medium transition-colors"
            >
              Create Note
            </button>
          </div>
        ) : (
          <>
            {/* Editor Top Controls */}
            <div className="px-5 py-3 border-b border-[#2A2C30] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <select
                  value={activeNote.subjectId}
                  onChange={(e) =>
                    updateNote(activeNote.id, { subjectId: e.target.value })
                  }
                  aria-label="Note subject"
                  className="h-8 px-2.5 rounded-md bg-[#101113] border border-[#2A2C30] text-[12px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
                >
                  {data.subjects.length === 0 ? (
                    <option value="">General</option>
                  ) : (
                    data.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code ? `${s.code} · ${s.name}` : s.name}
                      </option>
                    ))
                  )}
                </select>

                <span className="text-[12px] text-[#92959D] tabular-nums hidden sm:inline">
                  {wordCount} words · Updated{' '}
                  {formatRelativeTimestamp(activeNote.updatedAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePinNote(activeNote.id)}
                  className={`h-8 px-3 rounded-md border text-[12px] font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    activeNote.pinned
                      ? 'bg-[#91A5D5]/15 border-[#91A5D5]/50 text-[#91A5D5]'
                      : 'bg-[#161719] border-[#2A2C30] text-[#92959D] hover:text-[#F2F2F2]'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  {activeNote.pinned ? 'Pinned' : 'Pin'}
                </button>

                {confirmDeleteId === activeNote.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        deleteNote(activeNote.id);
                        setConfirmDeleteId(null);
                      }}
                      className="h-8 px-3 rounded-md bg-[#D06A6A] text-[#101113] text-[12px] font-medium whitespace-nowrap"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="h-8 px-2.5 rounded-md bg-[#222429] text-[12px] text-[#92959D]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(activeNote.id)}
                    aria-label="Delete note"
                    className="h-8 px-2.5 rounded-md bg-[#161719] border border-[#2A2C30] text-[#92959D] hover:text-[#D06A6A] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Writing Surface */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col gap-4">
              <input
                ref={titleInputRef}
                type="text"
                value={activeNote.title}
                onChange={(e) =>
                  updateNote(activeNote.id, { title: e.target.value })
                }
                placeholder="Note title..."
                className="w-full bg-transparent text-[20px] font-semibold text-[#F2F2F2] placeholder:text-[#92959D]/50 focus:outline-none"
              />

              {/* Tags Row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pb-3 border-b border-[#2A2C30]">
                {activeNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[12px] text-[#91A5D5]"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="text-[#92959D] hover:text-[#F2F2F2]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <form
                  onSubmit={handleAddTag}
                  className="inline-flex items-center gap-1"
                >
                  <Hash className="w-3 h-3 text-[#92959D]" />
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Add tag + Enter"
                    className="w-28 bg-transparent text-[12px] text-[#F2F2F2] placeholder:text-[#92959D]/60 focus:outline-none"
                  />
                </form>
              </div>

              <textarea
                value={activeNote.content}
                onChange={(e) =>
                  updateNote(activeNote.id, { content: e.target.value })
                }
                placeholder="Start writing lecture notes, formulas, or key takeaways..."
                className="w-full flex-1 min-h-[280px] bg-transparent text-[14px] leading-[1.7] text-[#F2F2F2] placeholder:text-[#92959D]/50 focus:outline-none resize-none font-sans"
              />
            </div>

            {/* AI Tools Section (Future-Ready Architecture, Honest Local State) */}
            <div className="px-5 py-4 border-t border-[#2A2C30] bg-[#161719]/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#91A5D5]" />
                  <span className="text-[12px] font-semibold text-[#F2F2F2]">
                    AI Study Tools
                  </span>
                  <span className="text-[12px] text-[#92959D]">
                    · Ready for future AI integration
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      ['summarize', 'Summarize Notes'],
                      ['questions', 'Generate Important Questions'],
                      ['explain', 'Explain Concepts'],
                    ] as const
                  ).map(([actionKey, label]) => (
                    <button
                      key={actionKey}
                      type="button"
                      onClick={() =>
                        setSelectedAITool(
                          selectedAITool === actionKey ? null : actionKey,
                        )
                      }
                      className={`px-3 py-1.5 rounded-md border text-[12px] font-medium transition-colors whitespace-nowrap ${
                        selectedAITool === actionKey
                          ? 'bg-[#222429] border-[#91A5D5] text-[#F2F2F2]'
                          : 'bg-[#1B1D20] border-[#2A2C30] text-[#92959D] hover:text-[#F2F2F2]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedAITool && (
                <div className="mt-3 p-3.5 rounded-md bg-[#1B1D20] border border-[#2A2C30] flex items-start gap-2.5 text-[12px]">
                  <Info className="w-4 h-4 text-[#91A5D5] shrink-0 mt-0.5" />
                  <div className="space-y-1 text-[#92959D]">
                    <p className="text-[#F2F2F2] font-medium">
                      {AI_TOOL_LABELS[selectedAITool]} is not active in local-only mode.
                    </p>
                    <p>
                      CampusPilot runs entirely in your browser without external AI API calls. Note context ({wordCount} words in &ldquo;{activeNote.title || 'Untitled Note'}&rdquo;) is structured for a future AI service integration.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
