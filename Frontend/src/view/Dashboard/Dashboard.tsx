import React from "react";
import { MainLayout } from "../../components/Layout/MainLayout";
import { useNavigationStore } from "../../stores/navigation.store";
import HomeView from "./HomeView";
import TasksView from "../Tasks/TasksView";
import KanbanView from "../Kanban/KanbanView";
import CalendarView from "../Calendar/CalendarView";
import { WorkspaceManagement } from "../../components/WorkspaceManagement/WorkspaceManagement";
import ProfileView from "../Profile/ProfileView";
import SettingsView from "../Settings/SettingsView";

export const Dashboard: React.FC = () => {
  const { currentView } = useNavigationStore();

  const renderCurrentView = () => {
    switch (currentView) {
      case "home":
        return <HomeView />;
      case "tasks":
        return <TasksView />;
      case "kanban":
        return <KanbanView />;
      case "calendar":
        return <CalendarView />;
      case "workspaces":
        return <WorkspaceManagement />;
      case "profile":
        return <ProfileView />;
      case "settings":
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return <MainLayout>{renderCurrentView()}</MainLayout>;
};
