import React from 'react';
import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  LayoutDashboard,
  Settings,
  User,
  X,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { NavPage } from '../../types/academic';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const WORKSPACE_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'planner', label: 'Study Planner', icon: CalendarDays },
  { id: 'notes', label: 'My Notes', icon: FileText },
  { id: 'assignments', label: 'Assignments', icon: CheckSquare },
  { id: 'quiz', label: 'Quiz Generator', icon: BookOpenCheck },
];

const INSIGHTS_ITEMS: NavItem[] = [
  { id: 'analytics', label: 'Progress & Analytics', icon: BarChart3 },
];

const BOTTOM_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: User },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { activePage, setActivePage } = useWorkspace();

  const handleSelect = (page: NavPage) => {
    setActivePage(page);
    onCloseMobile();
  };

  const renderNavItem = (item: NavItem, isCollapsed: boolean) => {
    const Icon = item.icon;
    const isActive = activePage === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelect(item.id)}
        title={isCollapsed ? item.label : undefined}
        className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#91A5D5] ${
          isActive
            ? 'bg-[#222429] text-[#F2F2F2]'
            : 'text-[#92959D] hover:bg-[#1B1D20] hover:text-[#F2F2F2]'
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
      >
        <Icon
          className={`w-4 h-4 shrink-0 transition-colors ${
            isActive
              ? 'text-[#91A5D5]'
              : 'text-[#92959D] group-hover:text-[#F2F2F2]'
          }`}
        />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </button>
    );
  };

  const sidebarContent = (isCollapsed: boolean, isMobile: boolean) => (
    <div className="flex flex-col h-full bg-[#161719] border-r border-[#2A2C30] select-none">
      {/* Brand Header */}
      <div
        className={`h-14 flex items-center border-b border-[#2A2C30] shrink-0 ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        <button
          type="button"
          onClick={() => handleSelect('overview')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#91A5D5] rounded"
        >
          <div className="w-7 h-7 rounded-md bg-[#222429] border border-[#2A2C30] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-[#91A5D5]" />
          </div>
          {!isCollapsed && (
            <span className="text-[13px] font-semibold tracking-[0.08em] text-[#F2F2F2] whitespace-nowrap">
              CAMPUSPILOT
            </span>
          )}
        </button>

        {isMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="p-1.5 rounded-md text-[#92959D] hover:text-[#F2F2F2] hover:bg-[#222429] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          !isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="p-1.5 rounded-md text-[#92959D] hover:text-[#F2F2F2] hover:bg-[#222429] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )
        )}
      </div>

      {/* Expand button when collapsed on desktop */}
      {!isMobile && isCollapsed && (
        <div className="px-2 pt-3 flex justify-center">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="w-full py-1.5 rounded-md flex items-center justify-center text-[#92959D] hover:text-[#F2F2F2] hover:bg-[#222429] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6">
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-[0.06em] text-[#92959D]/70">
              WORKSPACE
            </div>
          )}
          <nav className="space-y-0.5" aria-label="Workspace">
            {WORKSPACE_ITEMS.map((item) => renderNavItem(item, isCollapsed))}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-[0.06em] text-[#92959D]/70">
              INSIGHTS
            </div>
          )}
          <nav className="space-y-0.5" aria-label="Insights">
            {INSIGHTS_ITEMS.map((item) => renderNavItem(item, isCollapsed))}
          </nav>
        </div>
      </div>

      {/* Bottom Pinned Navigation */}
      <div className="px-2.5 py-3 border-t border-[#2A2C30] space-y-0.5 shrink-0">
        {BOTTOM_ITEMS.map((item) => renderNavItem(item, isCollapsed))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-[width] duration-200 ease-out ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent(collapsed, false)}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/65"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-[260px] max-w-[82vw] h-full z-10">
            {sidebarContent(false, true)}
          </div>
        </div>
      )}
    </>
  );
};
