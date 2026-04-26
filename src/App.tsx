import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import ProfilePage from './pages/ProfilePage'
import FriendsPage from './pages/FriendsPage'
import MessagesPage from './pages/MessagesPage'
import NotificationsPage from './pages/NotificationsPage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/messages/:partnerId" element={<MessagesPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
