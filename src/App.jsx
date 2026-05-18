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

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  // Agar auth yuklanayotgan bo'lsa (null bo'lsa), loading yoki bo'sh joy qaytaring
  if (isAuthenticated === null) return null; 
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
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
                                            <Route path="control" element={<Control/>}/>
                                            <Route path="teachers" element={<Teachers/>}/>
                                            <Route path="groups" element={<Groups />}/>
                                            <Route path="students" element={<Students />}/>
                                            <Route path="/groups/:id" element={<GroupDetail />} />
                                            <Route path="/groups/:groupId/lessons" element={<LessonDetail />} />
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