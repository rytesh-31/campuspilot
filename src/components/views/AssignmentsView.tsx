import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Edit3,
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Assignment,
  AssignmentPriority,
  AssignmentStatus,
} from '../../types/academic';
import { formatRelativeDue, formatShortDate, getTodayISO } from '../../utils/dateUtils';
import { Modal } from '../common/Modal';

type FilterTab = 'all' | AssignmentStatus;

const STATUS_LABELS: Record<AssignmentStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

const PRIORITY_LABELS: Record<AssignmentPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const AssignmentsView: React.FC = () => {
  const {
    data,
    quickAction,
    setQuickAction,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    setAssignmentStatus,
  } = useWorkspace();

  const [filterStatus, setFilterStatus] = useState<FilterTab>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [priority, setPriority] = useState<AssignmentPriority>('medium');
  const [status, setStatus] = useState<AssignmentStatus>('pending');
  const [formError, setFormError] = useState('');

  const subjectMap = useMemo(() => {
    const map = new Map<string, (typeof data.subjects)[number]>();
    data.subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [data.subjects]);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSubjectId(data.subjects[0]?.id || '');
    setDescription('');
    setDueDate(getTodayISO());
    setPriority('medium');
    setStatus('pending');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (item: Assignment) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSubjectId(item.subjectId);
    setDescription(item.description);
    setDueDate(item.dueDate);
    setPriority(item.priority);
    setStatus(item.status);
    setFormError('');
    setModalOpen(true);
  };

  useEffect(() => {
    if (quickAction === 'add-assignment') {
      openCreateModal();
      setQuickAction(null);
    }
  }, [quickAction]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter an assignment title.');
      return;
    }
    if (!subjectId && data.subjects.length > 0) {
      setFormError('Please select a subject.');
      return;
    }
    if (!dueDate) {
      setFormError('Please select a due date.');
      return;
    }

    if (editingId) {
      updateAssignment(editingId, {
        title: title.trim(),
        subjectId,
        description: description.trim(),
        dueDate,
        priority,
        status,
      });
    } else {
      addAssignment({
        title: title.trim(),
        subjectId,
        description: description.trim(),
        dueDate,
        priority,
        status,
      });
    }
    setModalOpen(false);
  };

  const counts = useMemo(() => {
    return {
      all: data.assignments.length,
      pending: data.assignments.filter((a) => a.status === 'pending').length,
      'in-progress': data.assignments.filter((a) => a.status === 'in-progress')
        .length,
      completed: data.assignments.filter((a) => a.status === 'completed').length,
    };
  }, [data.assignments]);

  const filteredAssignments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.assignments
      .filter((a) => {
        if (filterStatus !== 'all' && a.status !== filterStatus) return false;
        if (filterSubject !== 'all' && a.subjectId !== filterSubject)
          return false;
        if (q) {
          const subj = subjectMap.get(a.subjectId);
          const hay = `${a.title} ${a.description} ${subj?.name || ''} ${subj?.code || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [
    data.assignments,
    filterStatus,
    filterSubject,
    searchQuery,
    subjectMap,
  ]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="inline-flex items-center p-1 bg-[#161719] border border-[#2A2C30] rounded-lg overflow-x-auto max-w-full">
          {(
            [
              { id: 'all', label: `All (${counts.all})` },
              { id: 'pending', label: `Pending (${counts.pending})` },
              { id: 'in-progress', label: `In Progress (${counts['in-progress']})` },
              { id: 'completed', label: `Completed (${counts.completed})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                filterStatus === tab.id
                  ? 'bg-[#222429] text-[#F2F2F2]'
                  : 'text-[#92959D] hover:text-[#F2F2F2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Subject, View Toggle, Add */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#92959D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter assignments..."
              className="h-9 w-44 sm:w-52 pl-8 pr-3 rounded-md bg-[#161719] border border-[#2A2C30] text-[13px] text-[#F2F2F2] placeholder:text-[#92959D]/70 focus:outline-none focus:border-[#91A5D5]"
            />
          </div>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            aria-label="Filter by subject"
            className="h-9 px-3 rounded-md bg-[#161719] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
          >
            <option value="all">All Subjects</option>
            {data.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `${s.code} · ${s.name}` : s.name}
              </option>
            ))}
          </select>

          <div className="inline-flex items-center p-0.5 bg-[#161719] border border-[#2A2C30] rounded-md">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              title="List view"
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#222429] text-[#F2F2F2]'
                  : 'text-[#92959D] hover:text-[#F2F2F2]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('card')}
              aria-label="Card view"
              title="Card view"
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'card'
                  ? 'bg-[#222429] text-[#F2F2F2]'
                  : 'text-[#92959D] hover:text-[#F2F2F2]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="h-9 px-4 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] text-[#101113] text-[13px] font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Assignment
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg px-6 py-12 text-center">
          <p className="text-[14px] font-medium text-[#F2F2F2]">
            No assignments match your current filter
          </p>
          <p className="text-[13px] text-[#92959D] mt-1">
            Add a new assignment or adjust your status and subject filters.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 rounded-md bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[13px] font-medium text-[#F2F2F2] transition-colors"
          >
            Create Assignment
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg overflow-hidden">
          <div className="divide-y divide-[#2A2C30]">
            {filteredAssignments.map((item) => {
              const subj = subjectMap.get(item.subjectId);
              const isCompleted = item.status === 'completed';
              const due = formatRelativeDue(item.dueDate, isCompleted);

              return (
                <div
                  key={item.id}
                  className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#222429]/45 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        setAssignmentStatus(
                          item.id,
                          isCompleted ? 'pending' : 'completed',
                        )
                      }
                      aria-label={
                        isCompleted ? 'Mark as pending' : 'Mark as completed'
                      }
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-[#5FA876]/20 border-[#5FA876] text-[#5FA876]'
                          : 'border-[#2A2C30] hover:border-[#91A5D5] text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </button>

                    <div className="min-w-0">
                      <div
                        className={`text-[14px] font-medium ${
                          isCompleted
                            ? 'line-through text-[#92959D]'
                            : 'text-[#F2F2F2]'
                        }`}
                      >
                        {item.title}
                      </div>

                      {item.description && (
                        <p className="text-[12px] text-[#92959D] mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-[#92959D]">
                        <span>
                          {subj ? `${subj.code} · ${subj.name}` : 'General'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            item.priority === 'high'
                              ? 'text-[#D49A45]'
                              : 'text-[#92959D]'
                          }
                        >
                          {PRIORITY_LABELS[item.priority]} priority
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            item.status === 'completed'
                              ? 'text-[#5FA876]'
                              : item.status === 'in-progress'
                                ? 'text-[#91A5D5]'
                                : 'text-[#92959D]'
                          }
                        >
                          {STATUS_LABELS[item.status]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-7 sm:pl-0 shrink-0">
                    <div className="flex items-center gap-1.5 text-[12px] tabular-nums">
                      {due.isOverdue && (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#D06A6A]" />
                      )}
                      <span
                        className={
                          due.isOverdue
                            ? 'text-[#D06A6A] font-medium'
                            : due.isUrgent && !isCompleted
                              ? 'text-[#D49A45]'
                              : 'text-[#92959D]'
                        }
                      >
                        {due.label}
                      </span>
                      <span className="text-[#92959D]/60">
                        · {formatShortDate(item.dueDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          setAssignmentStatus(
                            item.id,
                            e.target.value as AssignmentStatus,
                          )
                        }
                        aria-label={`Change status for ${item.title}`}
                        className="h-7 px-2 rounded bg-[#161719] border border-[#2A2C30] text-[11px] text-[#92959D] hover:text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        aria-label={`Edit ${item.title}`}
                        className="p-1.5 rounded text-[#92959D] hover:text-[#F2F2F2] hover:bg-[#222429] transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteAssignment(item.id)}
                        aria-label={`Delete ${item.title}`}
                        className="p-1.5 rounded text-[#92959D] hover:text-[#D06A6A] hover:bg-[#222429] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((item) => {
            const subj = subjectMap.get(item.subjectId);
            const isCompleted = item.status === 'completed';
            const due = formatRelativeDue(item.dueDate, isCompleted);

            return (
              <div
                key={item.id}
                className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-4 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[12px] text-[#91A5D5] font-medium">
                      {subj ? `${subj.code} · ${subj.name}` : 'General'}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        aria-label={`Edit ${item.title}`}
                        className="p-1 rounded text-[#92959D] hover:text-[#F2F2F2] hover:bg-[#222429]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAssignment(item.id)}
                        aria-label={`Delete ${item.title}`}
                        className="p-1 rounded text-[#92959D] hover:text-[#D06A6A] hover:bg-[#222429]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3
                    className={`mt-2 text-[14px] font-semibold leading-snug ${
                      isCompleted
                        ? 'line-through text-[#92959D]'
                        : 'text-[#F2F2F2]'
                    }`}
                  >
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="mt-1.5 text-[12px] text-[#92959D] line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#2A2C30] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[12px] tabular-nums">
                    {due.isOverdue && (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#D06A6A]" />
                    )}
                    <span
                      className={
                        due.isOverdue
                          ? 'text-[#D06A6A] font-medium'
                          : due.isUrgent && !isCompleted
                            ? 'text-[#D49A45]'
                            : 'text-[#92959D]'
                      }
                    >
                      {due.label}
                    </span>
                    <span className="text-[#92959D]">· {PRIORITY_LABELS[item.priority]}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setAssignmentStatus(
                        item.id,
                        isCompleted ? 'pending' : 'completed',
                      )
                    }
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                      isCompleted
                        ? 'bg-[#5FA876]/15 text-[#5FA876]'
                        : 'bg-[#222429] text-[#F2F2F2] hover:bg-[#2A2C30]'
                    }`}
                  >
                    {isCompleted ? 'Completed' : 'Mark Done'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Assignment' : 'New Assignment'}
        subtitle="Track coursework, deadlines, and priority levels."
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="px-3 py-2 rounded bg-[#D06A6A]/10 border border-[#D06A6A]/40 text-[12px] text-[#D06A6A]">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
              Assignment Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Problem Set 6: Graph Flows"
              className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
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
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as AssignmentPriority)
                }
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Requirements, submission link, or grading rubric notes..."
              className="w-full p-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5] resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-md bg-[#222429] hover:bg-[#2A2C30] text-[13px] font-medium text-[#F2F2F2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] text-[#101113] text-[13px] font-medium transition-colors"
            >
              {editingId ? 'Save Changes' : 'Add Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
