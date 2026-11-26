import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AssignmentsView } from './components/views/AssignmentsView';
import { NotesView } from './components/views/NotesView';
import { OverviewView } from './components/views/OverviewView';
import { ProfileView } from './components/views/ProfileView';
import { QuizView } from './components/views/QuizView';
import { SettingsView } from './components/views/SettingsView';
import { StudyPlannerView } from './components/views/StudyPlannerView';
import { useWorkspace, WorkspaceProvider } from './context/WorkspaceContext';

const WorkspaceShell: React.FC = () => {
  const { activePage } = useWorkspace();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewView />;
      case 'planner':
        return <StudyPlannerView />;
      case 'notes':
        return <NotesView />;
      case 'assignments':
        return <AssignmentsView />;
      case 'quiz':
        return <QuizView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#101113] text-[#F2F2F2] flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">{renderActiveView()}</main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceShell />
    </WorkspaceProvider>
  );
}
