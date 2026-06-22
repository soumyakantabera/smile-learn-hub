import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";

import LoginPage from "@/pages/Login";
import ResetPasswordPage from "@/pages/ResetPassword";
import DashboardPage from "@/pages/Dashboard";
import CoursesPage from "@/pages/Courses";
import CourseDetailPage from "@/pages/CourseDetail";
import ModuleDetailPage from "@/pages/ModuleDetail";
import ViewerPage from "@/pages/Viewer";
import HelpPage from "@/pages/Help";
import NotFoundPage from "@/pages/NotFoundPage";
import EditorPage from "@/pages/Editor";
import AdminDashboardPage from "@/pages/admin/AdminDashboard";
import AdminUsersPage from "@/pages/admin/Users";
import AdminEnrollmentsPage from "@/pages/admin/Enrollments";
import AdminProgressPage from "@/pages/admin/ProgressOverview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ContentProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
                <Route path="/courses/:courseId" element={<ProtectedRoute><CourseDetailPage /></ProtectedRoute>} />
                <Route path="/modules/:moduleId" element={<ProtectedRoute><ModuleDetailPage /></ProtectedRoute>} />
                <Route path="/view/:itemId" element={<ProtectedRoute><ViewerPage /></ProtectedRoute>} />
                <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />

                <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                <Route path="/admin/enrollments" element={<AdminRoute><AdminEnrollmentsPage /></AdminRoute>} />
                <Route path="/admin/progress" element={<AdminRoute><AdminProgressPage /></AdminRoute>} />
                <Route path="/editor" element={<AdminRoute><EditorPage /></AdminRoute>} />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ContentProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
