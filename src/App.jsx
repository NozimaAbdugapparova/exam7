import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import Layout from "./pages/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import Control from "./pages/Control";
import Teachers from "./pages/Teachers";
import Groups from "./pages/Groups";
import Students from "./pages/Students";
import GroupDetail from "./pages/GroupDetail";
import LessonDetail from "./pages/LessonDetail";
import AddHomeworkPage from "./pages/AddHomework";
import HomeworkDetailPage from "./pages/HomeworkDetail";
import ArchivedStudents from "./pages/ArchivedStudents";
import ArchivedTeachers from "./pages/ArchivedTeachers";
import Videos from "./pages/Videos";
import EditHomeworkPage from "./pages/EditHomework";

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  // Agar auth yuklanayotgan bo'lsa (null bo'lsa), loading yoki bo'sh joy qaytaring
  if (isAuthenticated === null) return null; 
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function AdminRoute({ children }) {
  const { role } = useAuth();
  if (role === null) return null;
  if (role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function TeacherOrAdminRoute({ children }) {
  const { role } = useAuth();
  if (role === null) return null;
  if (role !== "admin" && role !== "teacher") return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App(){
    return(
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route 
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <SidebarProvider>
                                    <Layout>
                                        <Routes>
                                            <Route path="/"element={<RootRedirect/>}/>
                                            <Route path="dashboard" element={<Dashboard/>}/>
                                            <Route path="control" element={<AdminRoute><Control/></AdminRoute>}/>
                                            <Route path="teachers" element={<AdminRoute><Teachers/></AdminRoute>}/>
                                            <Route path="groups" element={<Groups />}/>
                                            <Route path="groups/planned" element={<Groups planned={true} />}/>
                                            <Route path="students" element={<AdminRoute><Students/></AdminRoute>}/>
                                            <Route path="videos" element={<Videos />}/>
                                            <Route path="/groups/:id" element={<GroupDetail />} />
                                            <Route path="/groups/:groupId/lessons" element={<LessonDetail />} />
                                            <Route path="/homework/add/:groupId" element={<TeacherOrAdminRoute><AddHomeworkPage /></TeacherOrAdminRoute>} />
                                            <Route path="/homework/edit/:homeworkId" element={<TeacherOrAdminRoute><EditHomeworkPage /></TeacherOrAdminRoute>} />
                                            <Route path="/groups/:groupId/homework/:homeworkId" element={<HomeworkDetailPage />} />
                                            <Route path="/students/archived" element={<AdminRoute><ArchivedStudents /></AdminRoute>} />
                                            <Route path="/teachers/archived" element={<AdminRoute><ArchivedTeachers /></AdminRoute>} />
                                        </Routes>
                                    </Layout>
                                </SidebarProvider>
                            </ProtectedRoute>
                        }
                    />
                </Routes>

            </BrowserRouter>
        </AuthProvider>
    )
}