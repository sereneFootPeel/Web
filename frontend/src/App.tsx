import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Philosophers } from './pages/Philosophers'
import { Schools } from './pages/Schools'
import { Search } from './pages/Search'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { UserProfile } from './pages/UserProfile'
import { AdminManage } from './pages/AdminManage'
import { ContentComment } from './pages/ContentComment'
import { Forum } from './pages/Forum'
import { ForumCompose } from './pages/ForumCompose'
import { ForumThread } from './pages/ForumThread'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="philosophers" element={<Philosophers />} />
          <Route path="schools" element={<Schools />} />
          <Route path="search" element={<Search />} />
          <Route path="forum" element={<Forum />} />
          <Route path="forum/new" element={<ProtectedRoute><ForumCompose /></ProtectedRoute>} />
          <Route path="forum/:id" element={<ForumThread />} />
          <Route path="content/:id" element={<ContentComment />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="user/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="user/profile/:id" element={<UserProfile />} />
          <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="admin/:section" element={<ProtectedRoute requireAdmin><AdminManage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
