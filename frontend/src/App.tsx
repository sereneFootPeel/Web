import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Quotes } from './pages/Quotes'
import { Philosophers } from './pages/Philosophers'
import { Schools } from './pages/Schools'
import { Search } from './pages/Search'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { UserProfile } from './pages/UserProfile'
import { AdminManage } from './pages/AdminManage'
import { Tests } from './pages/Tests'
import { ContentComment } from './pages/ContentComment'
import { TestHost } from './pages/TestHost'
import { TestResultDetail } from './pages/TestResultDetail'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="philosophers" element={<Philosophers />} />
          <Route path="schools" element={<Schools />} />
          <Route path="search" element={<Search />} />
          <Route path="content/:id" element={<ContentComment />} />
          <Route path="tests" element={<Tests />} />
          <Route path="tests/:testId" element={<TestHost />} />
          <Route path="user/test-results/:id" element={<TestResultDetail />} />
          <Route path="mmpi" element={<Navigate to="/tests/mmpi" replace />} />
          <Route path="mbti" element={<Navigate to="/tests/mbti" replace />} />
          <Route path="enneagram" element={<Navigate to="/tests/enneagram" replace />} />
          <Route path="bigfive" element={<Navigate to="/tests/bigfive" replace />} />
          <Route path="big-five" element={<Navigate to="/tests/bigfive" replace />} />
          <Route path="values8" element={<Navigate to="/tests/values8" replace />} />
          <Route path="values-8" element={<Navigate to="/tests/values8" replace />} />
          <Route path="8values" element={<Navigate to="/tests/values8" replace />} />
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
