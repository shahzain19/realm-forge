import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LoginPage } from "./pages/login"
import { SignupPage } from "./pages/signup"
import { Dashboard } from "./pages/dashboard"
import { ProjectLayout } from "./components/project/project-layout"
import { ProjectOverview } from "./pages/project/overview"
import { TasksPage } from "./pages/project/tasks"
import { DocumentManager } from "./components/project/document-manager"
import { GDDEditorRedirect } from "./components/project/gdd-editor-redirect"
import { WorldBuilder } from "./components/project/world-builder"
import { SystemsDesigner } from "./components/project/systems-designer"
import ProjectSettings from "./pages/project/settings"
import { AcceptInvitation } from "./pages/accept-invitation"
import { ProtectedRoute } from "./components/layout/protected-route"
import { LandingPage } from "./pages/landing"
import ProjectShowcasePage from "./pages/public/project-showcase"
import MilestonesPage from "./pages/project/milestones"
import TemplatePage from "./pages/templates/template-page"
import { AdminRoute } from "./components/layout/admin-route"
import { AdminDashboard } from "./pages/admin/dashboard"
import { AdminEditor } from "./pages/admin/editor"
import { BlogIndex } from "./pages/blog/blog-index"
import { BlogPostPage } from "./pages/blog/blog-post"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/p/:projectId" element={<ProjectShowcasePage />} />
        <Route path="/templates/:slug" element={<TemplatePage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <ProjectLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProjectOverview />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="gdd" element={<GDDEditorRedirect />} />
          <Route path="docs" element={<DocumentManager />} />
          <Route path="world" element={<WorldBuilder />} />
          <Route path="systems" element={<SystemsDesigner />} />
          <Route path="milestones" element={<MilestonesPage />} />
          <Route path="settings" element={<ProjectSettings />} />
        </Route>
        <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/editor/:id" element={<AdminRoute><AdminEditor /></AdminRoute>} />
        {/* Blog Routes */}
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

