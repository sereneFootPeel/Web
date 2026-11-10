import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchWithCredentials } from '../api/client'
import { buildVersionedImageUrl } from '../api/philosophy'
import { useLanguage, type Language } from '../contexts/LanguageContext'
import { comparePinyinText, removeById, sortList, upsertById } from '../utils/pinyinSort'

const SERVER_MESSAGES: Record<string, string> = {
  '登录状态已失效，请重新登录后重试': 'Your session has expired. Please sign in again.',
  '服务器返回了非 JSON 响应，请稍后重试': 'The server returned a non-JSON response. Please try again later.',
  '请求失败': 'Request failed',
  '哲学家姓名不能为空': 'Philosopher name is required',
  '哲学家不存在': 'Philosopher not found',
  '日期格式错误，请使用例如：1999/1/1~2000/1/1': 'Invalid date format. Use a range such as 1999/1/1~2000/1/1',
  '用户名、邮箱、密码不能为空': 'Username, email, and password are required',
  '密码长度至少6位': 'Password must be at least 6 characters',
  '用户名已存在': 'Username already exists',
  '邮箱已存在': 'Email already exists',
  '用户不存在': 'User not found',
  '流派名称不能为空': 'School name is required',
  '流派不存在': 'School not found',
  '内容不能为空': 'Content is required',
  '内容不存在': 'Content not found',
  '请选择CSV文件': 'Please choose a CSV file',
  '只支持CSV文件': 'Only CSV files are supported',
  '数据库数据已清空': 'All database data has been cleared',
  '管理员账号未绑定邮箱，无法发送': 'This admin account has no email address, so the file cannot be sent',
  '未登录': 'Not signed in',
  '需要管理员权限': 'Administrator permission is required',
  '导出失败': 'Export failed',
  '发送失败': 'Failed to send',
  '上传失败': 'Upload failed',
}

const SECTION_LABELS: Record<string, string> = {
  '用户': 'Users',
  '学派': 'Schools',
  '哲学家': 'Philosophers',
  '内容': 'Contents',
  '内容关联': 'Content links',
  '评论': 'Comments',
}

function localizeServerMessage(message: string, language: Language) {
  if (language !== 'en') return message
  const exact = SERVER_MESSAGES[message]
  if (exact) return exact
  if (message.startsWith('CSV 文件已发送至 ')) return `CSV file sent to ${message.slice('CSV 文件已发送至 '.length)}`
  if (message.startsWith('发送邮件失败: ')) return `Failed to send email: ${message.slice('发送邮件失败: '.length)}`
  if (message.startsWith('清空现有数据失败: ')) return `Failed to clear existing data: ${message.slice('清空现有数据失败: '.length)}`
  const imported = message.match(/^数据导入完成！总共导入:\s*(\d+)\s*条记录，失败:\s*(\d+)\s*条$/)
  if (imported) return `Import complete. Imported ${imported[1]} records, ${imported[2]} failed.`
  if (message.startsWith('导入失败: ')) return `Import failed: ${message.slice('导入失败: '.length)}`
  return message
}

function sectionLabel(name: string, language: Language) {
  if (language !== 'en') return name
  return SECTION_LABELS[name] || name
}

type Dashboard = {
  philosophersCount: number
  schoolsCount: number
  contentsCount: number
  usersCount: number
}

type AdminUser = {
  id: number
  username: string
  email: string
  role: string
  enabled: boolean
}

type AdminPhilosopher = {
  id: number
  name: string
  nameEn?: string | null
  bio?: string | null
  bioEn?: string | null
  birthYear?: number | null
  deathYear?: number | null
  birthDeathDate?: string | null
  imageUrl?: string | null
  imageVersion?: string | null
  hasImage?: boolean
}

type AdminSchool = {
  id: number
  name: string
  nameEn?: string | null
  description?: string | null
  descriptionEn?: string | null
  parentId?: number | null
}

type AdminContent = {
  id: number
  content: string
  contentEn?: string | null
  orderIndex?: number | null
  philosopherId?: number | null
  philosopherName?: string | null
  schoolId?: number | null
  schoolName?: string | null
}

type ImportStats = {
  success: number
  failed: number
}

type CsvImportResult = {
  success: boolean
  message?: string
  totalImported?: number
  totalFailed?: number
  results?: Record<string, ImportStats>
  failureDetails?: Record<string, string[]>
}

type Section = 'dashboard' | 'users' | 'philosophers' | 'schools' | 'contents' | 'import'

const sections: Section[] = ['dashboard', 'users', 'philosophers', 'schools', 'contents', 'import']

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetchWithCredentials(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })
  const contentType = res.headers.get('content-type') || ''
  const finalUrl = res.url || ''
  if (res.redirected || !contentType.includes('application/json')) {
    const redirectedToLoginLikePage = finalUrl.includes('/login') || finalUrl.includes('error=401') || finalUrl.includes('error=403')
    if (res.status === 401 || res.status === 403 || redirectedToLoginLikePage) {
      throw new Error('登录状态已失效，请重新登录后重试')
    }
    throw new Error('服务器返回了非 JSON 响应，请稍后重试')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok || (typeof data === 'object' && data !== null && 'success' in (data as Record<string, unknown>) && (data as { success?: boolean }).success === false)) {
    throw new Error((data as { message?: string }).message || '请求失败')
  }
  return data as T
}

async function requestFormData<T>(url: string, method: 'POST' | 'PUT', body: FormData): Promise<T> {
  const res = await fetchWithCredentials(url, {
    method,
    body,
  })
  const contentType = res.headers.get('content-type') || ''
  const finalUrl = res.url || ''
  if (res.redirected || !contentType.includes('application/json')) {
    const redirectedToLoginLikePage = finalUrl.includes('/login') || finalUrl.includes('error=401') || finalUrl.includes('error=403')
    if (res.status === 401 || res.status === 403 || redirectedToLoginLikePage) {
      throw new Error('登录状态已失效，请重新登录后重试')
    }
    throw new Error('服务器返回了非 JSON 响应，请稍后重试')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok || (typeof data === 'object' && data !== null && 'success' in (data as Record<string, unknown>) && (data as { success?: boolean }).success === false)) {
    throw new Error((data as { message?: string }).message || '请求失败')
  }
  return data as T
}

function compareAdminPhilosophers(left: AdminPhilosopher, right: AdminPhilosopher) {
  const byName = comparePinyinText(left.name, right.name)
  if (byName !== 0) return byName
  return left.id - right.id
}

function compareAdminSchools(left: AdminSchool, right: AdminSchool) {
  const byName = comparePinyinText(left.name, right.name)
  if (byName !== 0) return byName
  return left.id - right.id
}

function compareAdminContents(left: AdminContent, right: AdminContent) {
  const byPhilosopher = comparePinyinText(left.philosopherName, right.philosopherName)
  if (byPhilosopher !== 0) return byPhilosopher

  const bySchool = comparePinyinText(left.schoolName, right.schoolName)
  if (bySchool !== 0) return bySchool

  const byContent = comparePinyinText(left.content, right.content)
  if (byContent !== 0) return byContent

  return left.id - right.id
}

export function AdminManage() {
  const { language, setLanguage, t } = useLanguage()
  const params = useParams<{ section: string }>()
  const section = useMemo<Section>(() => {
    const s = params.section as Section | undefined
    return s && sections.includes(s) ? s : 'dashboard'
  }, [params.section])

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [philosophers, setPhilosophers] = useState<AdminPhilosopher[]>([])
  const [schools, setSchools] = useState<AdminSchool[]>([])
  const [contents, setContents] = useState<AdminContent[]>([])

  const [userForm, setUserForm] = useState({ id: 0, username: '', email: '', role: 'USER', enabled: true, password: '' })
  const [philosopherForm, setPhilosopherForm] = useState({
    id: 0, name: '', nameEn: '', birthDeathDate: '', bio: '', bioEn: '', imageUrl: '', imageVersion: '', hasImage: false,
  })
  const [schoolForm, setSchoolForm] = useState({
    id: 0, name: '', nameEn: '', description: '', descriptionEn: '', parentId: '',
  })
  const [contentForm, setContentForm] = useState({
    id: 0, content: '', contentEn: '', philosopherId: '', schoolId: '',
  })
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [clearExistingData, setClearExistingData] = useState(false)
  const [lastImportResult, setLastImportResult] = useState<CsvImportResult | null>(null)
  const [philosopherImageFile, setPhilosopherImageFile] = useState<File | null>(null)
  const [removePhilosopherImage, setRemovePhilosopherImage] = useState(false)
  const [philosopherImagePreviewUrl, setPhilosopherImagePreviewUrl] = useState('')
  const philosopherImageInputRef = useRef<HTMLInputElement | null>(null)

  async function loadCurrent() {
    setLoading(true)
    setError('')
    try {
      if (section === 'dashboard') {
        const d = await requestJson<Dashboard>('/api/admin/dashboard')
        setDashboard(d)
      } else if (section === 'users') {
        const d = await requestJson<{ users: AdminUser[] }>('/api/admin/users')
        setUsers(d.users || [])
      } else if (section === 'philosophers') {
        const d = await requestJson<{ philosophers: AdminPhilosopher[] }>('/api/admin/philosophers')
        setPhilosophers(d.philosophers || [])
      } else if (section === 'schools') {
        const d = await requestJson<{ schools: AdminSchool[] }>('/api/admin/schools')
        setSchools(d.schools || [])
      } else if (section === 'contents') {
        const [c, p, s] = await Promise.all([
          requestJson<{ contents: AdminContent[] }>('/api/admin/contents'),
          requestJson<{ philosophers: AdminPhilosopher[] }>('/api/admin/philosophers'),
          requestJson<{ schools: AdminSchool[] }>('/api/admin/schools'),
        ])
        setContents(c.contents || [])
        setPhilosophers(p.philosophers || [])
        setSchools(s.schools || [])
      }
    } catch (e) {
      setError(localizeServerMessage(e instanceof Error ? e.message : t('加载失败', 'Load failed'), language))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCurrent()
  }, [section])

  useEffect(() => {
    if (!philosopherImageFile) {
      setPhilosopherImagePreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(philosopherImageFile)
    setPhilosopherImagePreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [philosopherImageFile])

  function resetPhilosopherImageState() {
    setPhilosopherImageFile(null)
    setRemovePhilosopherImage(false)
    if (philosopherImageInputRef.current) {
      philosopherImageInputRef.current.value = ''
    }
  }

  function resetForms() {
    setUserForm({ id: 0, username: '', email: '', role: 'USER', enabled: true, password: '' })
    setPhilosopherForm({ id: 0, name: '', nameEn: '', birthDeathDate: '', bio: '', bioEn: '', imageUrl: '', imageVersion: '', hasImage: false })
    setSchoolForm({ id: 0, name: '', nameEn: '', description: '', descriptionEn: '', parentId: '' })
    setContentForm({ id: 0, content: '', contentEn: '', philosopherId: '', schoolId: '' })
    resetPhilosopherImageState()
  }

  function showSuccess(msg: string) {
    setMessage(msg)
    setError('')
  }

  function showError(msg: string) {
    setError(localizeServerMessage(msg, language))
    setMessage('')
  }

  function roleLabel(role: string) {
    if (role === 'ADMIN') return t('管理员', 'Admin')
    if (role === 'MODERATOR') return t('版主', 'Moderator')
    return t('用户', 'User')
  }

  function displayName(name?: string | null, nameEn?: string | null) {
    if (language === 'en' && nameEn?.trim()) return nameEn
    return name || ''
  }

  async function submitUser(e: FormEvent) {
    e.preventDefault()
    try {
      let savedUser: AdminUser | null = null
      if (userForm.id) {
        const res = await requestJson<{ success: boolean; user: AdminUser }>('/api/admin/users/' + userForm.id, {
          method: 'PUT',
          body: JSON.stringify({
            username: userForm.username,
            email: userForm.email,
            role: userForm.role,
            enabled: userForm.enabled,
          }),
        })
        savedUser = res.user
        if (userForm.password.trim()) {
          await requestJson('/api/admin/users/' + userForm.id + '/password', {
            method: 'PUT',
            body: JSON.stringify({ password: userForm.password }),
          })
        }
        showSuccess(t('用户已更新', 'User updated'))
      } else {
        const res = await requestJson<{ success: boolean; user: AdminUser }>('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            username: userForm.username,
            email: userForm.email,
            password: userForm.password,
            role: userForm.role,
            enabled: userForm.enabled,
          }),
        })
        savedUser = res.user
        showSuccess(t('用户已创建', 'User created'))
      }
      if (savedUser) {
        setUsers((prev) => upsertById(prev, savedUser))
      }
      resetForms()
    } catch (e1) {
      showError(e1 instanceof Error ? e1.message : t('保存用户失败', 'Failed to save user'))
    }
  }

  async function removeUser(id: number) {
    if (!confirm(t('确定删除该用户？', 'Delete this user?'))) return
    try {
      await requestJson('/api/admin/users/' + id, { method: 'DELETE' })
      setUsers((prev) => removeById(prev, id))
      showSuccess(t('用户已删除', 'User deleted'))
      resetForms()
    } catch (e) {
      showError(e instanceof Error ? e.message : t('删除失败', 'Delete failed'))
    }
  }

  async function submitPhilosopher(e: FormEvent) {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', philosopherForm.name)
      if (philosopherForm.nameEn.trim()) formData.append('nameEn', philosopherForm.nameEn)
      if (philosopherForm.birthDeathDate.trim()) formData.append('birthDeathDate', philosopherForm.birthDeathDate)
      if (philosopherForm.bio.trim()) formData.append('bio', philosopherForm.bio)
      if (philosopherForm.bioEn.trim()) formData.append('bioEn', philosopherForm.bioEn)
      formData.append('clearImage', String(removePhilosopherImage))
      if (philosopherImageFile) {
        formData.append('imageFile', philosopherImageFile)
      }

      let savedPhilosopher: AdminPhilosopher | null = null
      if (philosopherForm.id) {
        const res = await requestFormData<{ success: boolean; philosopher: AdminPhilosopher }>('/api/admin/philosophers/' + philosopherForm.id, 'PUT', formData)
        savedPhilosopher = res.philosopher
        showSuccess(t('哲学家已更新', 'Philosopher updated'))
      } else {
        const res = await requestFormData<{ success: boolean; philosopher: AdminPhilosopher }>('/api/admin/philosophers', 'POST', formData)
        savedPhilosopher = res.philosopher
        showSuccess(t('哲学家已创建', 'Philosopher created'))
      }
      if (savedPhilosopher) {
        setPhilosophers((prev) => upsertById(prev, savedPhilosopher))
      }
      resetForms()
    } catch (e2) {
      showError(e2 instanceof Error ? e2.message : t('保存哲学家失败', 'Failed to save philosopher'))
    }
  }

  async function removePhilosopher(id: number) {
    if (!confirm(t('确定删除该哲学家？', 'Delete this philosopher?'))) return
    try {
      await requestJson('/api/admin/philosophers/' + id, { method: 'DELETE' })
      setPhilosophers((prev) => removeById(prev, id))
      showSuccess(t('哲学家已删除', 'Philosopher deleted'))
      resetForms()
    } catch (e) {
      showError(e instanceof Error ? e.message : t('删除失败', 'Delete failed'))
    }
  }

  async function submitSchool(e: FormEvent) {
    e.preventDefault()
    const payload = {
      name: schoolForm.name,
      nameEn: schoolForm.nameEn || null,
      description: schoolForm.description || null,
      descriptionEn: schoolForm.descriptionEn || null,
      parentId: schoolForm.parentId ? Number(schoolForm.parentId) : null,
    }
    try {
      let savedSchool: AdminSchool | null = null
      if (schoolForm.id) {
        const res = await requestJson<{ success: boolean; school: AdminSchool }>('/api/admin/schools/' + schoolForm.id, { method: 'PUT', body: JSON.stringify(payload) })
        savedSchool = res.school
        showSuccess(t('流派已更新', 'School updated'))
      } else {
        const res = await requestJson<{ success: boolean; school: AdminSchool }>('/api/admin/schools', { method: 'POST', body: JSON.stringify(payload) })
        savedSchool = res.school
        showSuccess(t('流派已创建', 'School created'))
      }
      if (savedSchool) {
        setSchools((prev) => upsertById(prev, savedSchool))
      }
      resetForms()
    } catch (e3) {
      showError(e3 instanceof Error ? e3.message : t('保存流派失败', 'Failed to save school'))
    }
  }

  async function removeSchool(id: number) {
    if (!confirm(t('确定删除该流派？', 'Delete this school?'))) return
    try {
      await requestJson('/api/admin/schools/' + id, { method: 'DELETE' })
      setSchools((prev) => removeById(prev, id))
      showSuccess(t('流派已删除', 'School deleted'))
      resetForms()
    } catch (e) {
      showError(e instanceof Error ? e.message : t('删除失败', 'Delete failed'))
    }
  }

  async function submitContent(e: FormEvent) {
    e.preventDefault()
    const payload = {
      content: contentForm.content,
      contentEn: contentForm.contentEn || null,
      philosopherId: contentForm.philosopherId ? Number(contentForm.philosopherId) : null,
      schoolId: contentForm.schoolId ? Number(contentForm.schoolId) : null,
    }
    try {
      let savedContent: AdminContent | null = null
      if (contentForm.id) {
        const res = await requestJson<{ success: boolean; content: AdminContent }>('/api/admin/contents/' + contentForm.id, { method: 'PUT', body: JSON.stringify(payload) })
        savedContent = res.content
        showSuccess(t('内容已更新', 'Content updated'))
      } else {
        const res = await requestJson<{ success: boolean; content: AdminContent }>('/api/admin/contents', { method: 'POST', body: JSON.stringify(payload) })
        savedContent = res.content
        showSuccess(t('内容已创建', 'Content created'))
      }
      if (savedContent) {
        setContents((prev) => upsertById(prev, savedContent))
      }
      resetForms()
    } catch (e4) {
      showError(e4 instanceof Error ? e4.message : t('保存内容失败', 'Failed to save content'))
    }
  }

  async function removeContent(id: number) {
    if (!confirm(t('确定删除该内容？', 'Delete this content?'))) return
    try {
      await requestJson('/api/admin/contents/' + id, { method: 'DELETE' })
      setContents((prev) => removeById(prev, id))
      showSuccess(t('内容已删除', 'Content deleted'))
      resetForms()
    } catch (e) {
      showError(e instanceof Error ? e.message : t('删除失败', 'Delete failed'))
    }
  }

  async function uploadCsv(e: FormEvent) {
    e.preventDefault()
    if (!csvFile) {
      showError(t('请选择CSV文件', 'Please choose a CSV file'))
      return
    }
    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      formData.append('clearExistingData', String(clearExistingData))
      const res = await fetchWithCredentials('/api/admin/data-import/upload', {
        method: 'POST',
        body: formData,
      })
      const contentType = res.headers.get('content-type') || ''
      const finalUrl = res.url || ''
      if (res.redirected || !contentType.includes('application/json')) {
        const redirectedToLoginLikePage = finalUrl.includes('/login') || finalUrl.includes('error=401') || finalUrl.includes('error=403')
        if (res.status === 401 || res.status === 403 || redirectedToLoginLikePage) {
          throw new Error('登录状态已失效，请重新登录后重试')
        }
        throw new Error('服务器返回了非 JSON 响应，请稍后重试')
      }
      const data = (await res.json().catch(() => ({}))) as CsvImportResult
      setLastImportResult(data)
      const totalImported = data.totalImported ?? 0
      const totalFailed = data.totalFailed ?? 0
      const summaryText = t(
        `导入完成：成功 ${totalImported}，失败 ${totalFailed}`,
        `Import finished: ${totalImported} succeeded, ${totalFailed} failed`,
      )
      const detail = data.message ? localizeServerMessage(data.message, language) : ''
      if (!res.ok || data.success === false) {
        throw new Error(detail || summaryText || t('上传失败', 'Upload failed'))
      }
      showSuccess(detail ? `${summaryText} · ${detail}` : summaryText)
      setCsvFile(null)
    } catch (e5) {
      showError(e5 instanceof Error ? e5.message : t('上传失败', 'Upload failed'))
    }
  }

  async function exportCsv() {
    try {
      const res = await fetchWithCredentials('/api/admin/data-export/download', {
        method: 'GET',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { message?: string }).message || t('导出失败', 'Export failed'))
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') || ''
      const matched = disposition.match(/filename="([^"]+)"/i)
      const filename = matched?.[1] || `philosophy_data_export_${Date.now()}.csv`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showSuccess(t('CSV导出成功', 'CSV exported'))
    } catch (e) {
      showError(e instanceof Error ? e.message : t('导出失败', 'Export failed'))
    }
  }

  async function sendCsvToEmail() {
    try {
      const res = await fetchWithCredentials('/api/admin/data-export/send-email', {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { message?: string }).message || t('发送失败', 'Failed to send'))
      showSuccess(localizeServerMessage((data as { message?: string }).message || t('CSV 已发送到您的邮箱', 'CSV sent to your email'), language))
    } catch (e) {
      showError(e instanceof Error ? e.message : t('发送失败', 'Failed to send'))
    }
  }

  async function clearAllDatabaseData() {
    if (!confirm(t('危险操作：确认删除数据库中的全部数据吗？此操作不可恢复。', 'Danger: delete all database data? This cannot be undone.'))) return
    if (!confirm(t('请再次确认：真的要清空全部数据库数据吗？', 'Please confirm again: really clear all database data?'))) return
    try {
      const res = await requestJson<{ success: boolean; message?: string; before?: Record<string, number>; after?: Record<string, number> }>('/api/admin/data-import/clear-all', { method: 'POST' })
      showSuccess(localizeServerMessage(res.message || t('数据库数据已全部删除', 'All database data has been deleted'), language))
      await loadCurrent()
    } catch (e) {
      showError(e instanceof Error ? e.message : t('清空失败', 'Failed to clear data'))
    }
  }

  const navItems: Array<{ key: Section; label: string }> = [
    { key: 'dashboard', label: t('仪表盘', 'Dashboard') },
    { key: 'users', label: t('用户管理', 'Users') },
    { key: 'philosophers', label: t('哲学家管理', 'Philosophers') },
    { key: 'schools', label: t('流派管理', 'Schools') },
    { key: 'contents', label: t('内容管理', 'Contents') },
    { key: 'import', label: t('CSV导入', 'CSV Import') },
  ]

  const importStatsEntries = Object.entries(lastImportResult?.results || {})
  const importFailureEntries = Object.entries(lastImportResult?.failureDetails || {}).filter(([, details]) => details && details.length > 0)
  const sortedPhilosophers = useMemo(() => sortList(philosophers, compareAdminPhilosophers), [philosophers])
  const sortedSchools = useMemo(() => sortList(schools, compareAdminSchools), [schools])
  const sortedContents = useMemo(() => sortList(contents, compareAdminContents), [contents])
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('管理后台', 'Admin Panel')}</h1>
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
          <button
            type="button"
            onClick={() => void setLanguage('zh')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors outline-none focus:ring-0 ${language === 'zh' ? '' : 'opacity-70 hover:opacity-100'}`}
            style={language === 'zh' ? { color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' } : { color: 'var(--text-secondary)' }}
          >
            中文
          </button>
          <button
            type="button"
            onClick={() => void setLanguage('en')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors outline-none focus:ring-0 ${language === 'en' ? '' : 'opacity-70 hover:opacity-100'}`}
            style={language === 'en' ? { color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' } : { color: 'var(--text-secondary)' }}
          >
            English
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {navItems.map((item) => (
          <Link
            key={item.key}
            to={`/admin/${item.key}`}
            className="px-3 py-1 rounded border text-sm"
            style={{
              borderColor: section === item.key ? '#111827' : 'var(--border-primary)',
              color: section === item.key ? '#111827' : 'var(--text-primary)',
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {message && <div className="p-3 rounded bg-green-50 text-green-700">{message}</div>}
      {error && <div className="p-3 rounded bg-red-50 text-red-700">{error}</div>}
      {loading && <div>{t('加载中...', 'Loading...')}</div>}

      {!loading && section === 'dashboard' && dashboard && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t('哲学家', 'Philosophers'), count: dashboard.philosophersCount },
            { label: t('流派', 'Schools'), count: dashboard.schoolsCount },
            { label: t('内容', 'Contents'), count: dashboard.contentsCount },
            { label: t('用户', 'Users'), count: dashboard.usersCount },
          ].map((c) => (
            <div key={c.label} className="p-4 rounded-lg border border-gray-200">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.label}</p>
              <p className="text-2xl font-bold mt-1">{c.count}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && section === 'users' && (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <form className="space-y-3 sticky top-4" onSubmit={submitUser}>
            <h2 className="font-semibold">{userForm.id ? t('编辑用户', 'Edit user') : t('新增用户', 'New user')}</h2>
            <input className="w-full border rounded p-2" placeholder={t('用户名', 'Username')} value={userForm.username} onChange={(e) => setUserForm((v) => ({ ...v, username: e.target.value }))} required />
            <input className="w-full border rounded p-2" placeholder={t('邮箱', 'Email')} value={userForm.email} onChange={(e) => setUserForm((v) => ({ ...v, email: e.target.value }))} required />
            <select className="w-full border rounded p-2" value={userForm.role} onChange={(e) => setUserForm((v) => ({ ...v, role: e.target.value }))}>
              <option value="USER">{t('用户', 'User')}</option>
              <option value="MODERATOR">{t('版主', 'Moderator')}</option>
              <option value="ADMIN">{t('管理员', 'Admin')}</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={userForm.enabled} onChange={(e) => setUserForm((v) => ({ ...v, enabled: e.target.checked }))} />
              {t('启用账号', 'Account enabled')}
            </label>
            <input className="w-full border rounded p-2" type="password" placeholder={userForm.id ? t('新密码（可空）', 'New password (optional)') : t('密码', 'Password')} value={userForm.password} onChange={(e) => setUserForm((v) => ({ ...v, password: e.target.value }))} required={!userForm.id} />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-black text-white" type="submit">{t('保存', 'Save')}</button>
              <button className="px-4 py-2 rounded border" type="button" onClick={resetForms}>{t('重置', 'Reset')}</button>
            </div>
          </form>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="p-3 rounded border border-gray-200 flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{u.username} ({roleLabel(u.role)})</div>
                  <div className="text-sm text-gray-500">{u.email} · {u.enabled ? t('启用', 'Enabled') : t('停用', 'Disabled')}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-black" onClick={() => setUserForm({ id: u.id, username: u.username, email: u.email, role: u.role, enabled: u.enabled, password: '' })}>{t('编辑', 'Edit')}</button>
                  <button className="text-red-600" onClick={() => void removeUser(u.id)}>{t('删除', 'Delete')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && section === 'philosophers' && (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <form className="space-y-3 sticky top-4" onSubmit={submitPhilosopher}>
            <h2 className="font-semibold">{philosopherForm.id ? t('编辑哲学家', 'Edit philosopher') : t('新增哲学家', 'New philosopher')}</h2>
            <input className="w-full border rounded p-2" placeholder={t('姓名', 'Name')} value={philosopherForm.name} onChange={(e) => setPhilosopherForm((v) => ({ ...v, name: e.target.value }))} required />
            <input className="w-full border rounded p-2" placeholder={t('英文名', 'English name')} value={philosopherForm.nameEn} onChange={(e) => setPhilosopherForm((v) => ({ ...v, nameEn: e.target.value }))} />
            <input className="w-full border rounded p-2" placeholder={t('出生死亡日期（如 1999.1.1 - 2000.1.1）', 'Birth and death dates (e.g. 1999.1.1 - 2000.1.1)')} value={philosopherForm.birthDeathDate} onChange={(e) => setPhilosopherForm((v) => ({ ...v, birthDeathDate: e.target.value }))} />
            <p className="text-xs text-gray-500 -mt-2">{t('格式：1999.1.1 - 2000.1.1（出生日期会自动计算用于前端排序）', 'Format: 1999.1.1 - 2000.1.1 (the birth date is used for sorting)')}</p>
            <input
              ref={philosopherImageInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                setPhilosopherImageFile(file)
                if (file) {
                  setRemovePhilosopherImage(false)
                }
              }}
            />
            <div className="rounded border p-3 space-y-3" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-2 rounded border" type="button" onClick={() => philosopherImageInputRef.current?.click()}>
                  {t('选择图片', 'Choose image')}
                </button>
                <button className="px-3 py-2 rounded border" type="button" onClick={resetPhilosopherImageState}>
                  {t('清空已选文件', 'Clear selected file')}
                </button>
                {philosopherForm.id && philosopherForm.hasImage && !removePhilosopherImage && (
                  <button className="px-3 py-2 rounded border text-red-600" type="button" onClick={() => setRemovePhilosopherImage(true)}>
                    {t('删除当前图片', 'Remove current image')}
                  </button>
                )}
                {removePhilosopherImage && (
                  <button className="px-3 py-2 rounded border" type="button" onClick={() => setRemovePhilosopherImage(false)}>
                    {t('取消删除图片', 'Keep current image')}
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {philosopherImageFile
                  ? philosopherForm.hasImage
                    ? t(
                        `已选择新文件：${philosopherImageFile.name}，保存后会替换当前图片。`,
                        `New file selected: ${philosopherImageFile.name}. Saving will replace the current image.`,
                      )
                    : t(`已选择文件：${philosopherImageFile.name}`, `Selected file: ${philosopherImageFile.name}`)
                  : philosopherForm.hasImage && !removePhilosopherImage
                    ? t('当前已存在图片，不重新选择则会保留；重新上传会自动替换旧图片。', 'An image already exists. Leave it unchanged to keep it, or upload a new file to replace it.')
                    : removePhilosopherImage
                      ? t('保存后会删除当前图片，图片字段允许为空。', 'Saving will remove the current image. Images are optional.')
                      : t('未选择图片，保存时图片可以为空。', 'No image selected. You can save without an image.')}
              </div>
              {(philosopherImagePreviewUrl || (philosopherForm.imageUrl && philosopherForm.hasImage && !removePhilosopherImage)) && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">{philosopherImagePreviewUrl ? t('待保存图片预览', 'Preview of the image to save') : t('当前图片预览', 'Current image')}</div>
                  <img
                    src={philosopherImagePreviewUrl || buildVersionedImageUrl(philosopherForm.imageUrl, philosopherForm.imageVersion)}
                    alt={t(`${philosopherForm.name || '哲学家'} 图片`, `${philosopherForm.name || 'Philosopher'} image`)}
                    className="max-h-48"
                  />
                </div>
              )}
            </div>
            <textarea className="w-full border rounded p-2 min-h-28" placeholder={t('传记', 'Biography')} value={philosopherForm.bio} onChange={(e) => setPhilosopherForm((v) => ({ ...v, bio: e.target.value }))} />
            <textarea className="w-full border rounded p-2 min-h-24" placeholder={t('英文传记（可空）', 'English biography (optional)')} value={philosopherForm.bioEn} onChange={(e) => setPhilosopherForm((v) => ({ ...v, bioEn: e.target.value }))} />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-black text-white" type="submit">{t('保存', 'Save')}</button>
              <button className="px-4 py-2 rounded border" type="button" onClick={resetForms}>{t('重置', 'Reset')}</button>
            </div>
          </form>
          <div className="space-y-2">
            {sortedPhilosophers.map((p) => (
              <div key={p.id} className="p-3 rounded border border-gray-200 flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{displayName(p.name, p.nameEn)}</div>
                  <div className="text-sm text-gray-500">{p.birthDeathDate || t('无日期信息', 'No dates')} · {p.hasImage ? t('有图片', 'Has image') : t('无图片', 'No image')}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-black" onClick={() => {
                    resetPhilosopherImageState()
                    setPhilosopherForm({
                      id: p.id,
                      name: p.name || '',
                      nameEn: p.nameEn || '',
                      birthDeathDate: p.birthDeathDate || '',
                      bio: p.bio || '',
                      bioEn: p.bioEn || '',
                      imageUrl: p.imageUrl || '',
                      imageVersion: p.imageVersion || '',
                      hasImage: Boolean(p.hasImage),
                    })
                  }}>{t('编辑', 'Edit')}</button>
                  <button className="text-red-600" onClick={() => void removePhilosopher(p.id)}>{t('删除', 'Delete')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && section === 'schools' && (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <form className="space-y-3 sticky top-4" onSubmit={submitSchool}>
            <h2 className="font-semibold">{schoolForm.id ? t('编辑流派', 'Edit school') : t('新增流派', 'New school')}</h2>
            <input className="w-full border rounded p-2" placeholder={t('名称', 'Name')} value={schoolForm.name} onChange={(e) => setSchoolForm((v) => ({ ...v, name: e.target.value }))} required />
            <input className="w-full border rounded p-2" placeholder={t('英文名', 'English name')} value={schoolForm.nameEn} onChange={(e) => setSchoolForm((v) => ({ ...v, nameEn: e.target.value }))} />
            <select className="w-full border rounded p-2" value={schoolForm.parentId} onChange={(e) => setSchoolForm((v) => ({ ...v, parentId: e.target.value }))}>
              <option value="">{t('无父流派', 'No parent school')}</option>
              {sortedSchools.filter((s) => s.id !== schoolForm.id).map((s) => (
                <option key={s.id} value={s.id}>{displayName(s.name, s.nameEn)}</option>
              ))}
            </select>
            <textarea className="w-full border rounded p-2 min-h-28" placeholder={t('描述', 'Description')} value={schoolForm.description} onChange={(e) => setSchoolForm((v) => ({ ...v, description: e.target.value }))} />
            <textarea className="w-full border rounded p-2 min-h-24" placeholder={t('英文描述（可空）', 'English description (optional)')} value={schoolForm.descriptionEn} onChange={(e) => setSchoolForm((v) => ({ ...v, descriptionEn: e.target.value }))} />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-black text-white" type="submit">{t('保存', 'Save')}</button>
              <button className="px-4 py-2 rounded border" type="button" onClick={resetForms}>{t('重置', 'Reset')}</button>
            </div>
          </form>
          <div className="space-y-2">
            {sortedSchools.map((s) => (
              <div key={s.id} className="p-3 rounded border border-gray-200 flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{displayName(s.name, s.nameEn)}</div>
                  <div className="text-sm text-gray-500">{t('父ID', 'Parent ID')}: {s.parentId ?? t('无', 'None')}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-black" onClick={() => setSchoolForm({
                    id: s.id,
                    name: s.name || '',
                    nameEn: s.nameEn || '',
                    description: s.description || '',
                    descriptionEn: s.descriptionEn || '',
                    parentId: s.parentId ? String(s.parentId) : '',
                  })}>{t('编辑', 'Edit')}</button>
                  <button className="text-red-600" onClick={() => void removeSchool(s.id)}>{t('删除', 'Delete')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && section === 'contents' && (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <form className="space-y-3 sticky top-4" onSubmit={submitContent}>
            <h2 className="font-semibold">{contentForm.id ? t('编辑内容', 'Edit content') : t('新增内容', 'New content')}</h2>
            <select className="w-full border rounded p-2" value={contentForm.philosopherId} onChange={(e) => setContentForm((v) => ({ ...v, philosopherId: e.target.value }))}>
              <option value="">{t('无哲学家', 'No philosopher')}</option>
              {sortedPhilosophers.map((p) => <option key={p.id} value={p.id}>{displayName(p.name, p.nameEn)}</option>)}
            </select>
            <select className="w-full border rounded p-2" value={contentForm.schoolId} onChange={(e) => setContentForm((v) => ({ ...v, schoolId: e.target.value }))}>
              <option value="">{t('无流派', 'No school')}</option>
              {sortedSchools.map((s) => <option key={s.id} value={s.id}>{displayName(s.name, s.nameEn)}</option>)}
            </select>
            <textarea className="w-full border rounded p-2 min-h-32" placeholder={t('内容', 'Content')} value={contentForm.content} onChange={(e) => setContentForm((v) => ({ ...v, content: e.target.value }))} required />
            <textarea className="w-full border rounded p-2 min-h-24" placeholder={t('英文内容（可空）', 'English content (optional)')} value={contentForm.contentEn} onChange={(e) => setContentForm((v) => ({ ...v, contentEn: e.target.value }))} />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-black text-white" type="submit">{t('保存', 'Save')}</button>
              <button className="px-4 py-2 rounded border" type="button" onClick={resetForms}>{t('重置', 'Reset')}</button>
            </div>
          </form>
          <div className="space-y-2">
            {sortedContents.map((c) => (
              <div key={c.id} className="p-3 rounded border border-gray-200 flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{t(`内容#${c.id}`, `Content #${c.id}`)}</div>
                  <div className="text-sm text-gray-500">
                    {c.philosopherName || t('无哲学家', 'No philosopher')} · {c.schoolName || t('无流派', 'No school')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-black" onClick={() => setContentForm({
                    id: c.id,
                    content: c.content || '',
                    contentEn: c.contentEn || '',
                    philosopherId: c.philosopherId ? String(c.philosopherId) : '',
                    schoolId: c.schoolId ? String(c.schoolId) : '',
                  })}>{t('编辑', 'Edit')}</button>
                  <button className="text-red-600" onClick={() => void removeContent(c.id)}>{t('删除', 'Delete')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && section === 'import' && (
        <div className="space-y-6 max-w-4xl">
          <form className="space-y-4 max-w-xl" onSubmit={uploadCsv}>
            <div className="text-sm text-gray-600">{t('上传从旧站导出的 CSV 数据文件，支持按同 ID 覆盖导入。', 'Upload a CSV exported from the previous site. Rows with the same ID are overwritten.')}</div>
            <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={clearExistingData} onChange={(e) => setClearExistingData(e.target.checked)} />
              {t('导入前先清空现有数据（危险操作）', 'Clear existing data before import (dangerous)')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded bg-black text-white" type="submit">{t('上传并导入', 'Upload and import')}</button>
              <button className="px-4 py-2 rounded border" type="button" onClick={() => void exportCsv()}>{t('导出CSV文件', 'Export CSV')}</button>
              <button className="px-4 py-2 rounded border" type="button" onClick={() => void sendCsvToEmail()}>{t('发送CSV到邮箱', 'Email CSV')}</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white" type="button" onClick={() => void clearAllDatabaseData()}>{t('删除全部数据库数据', 'Delete all database data')}</button>
            </div>
          </form>

          {lastImportResult && (
            <div className="space-y-4 rounded-xl border p-4" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{t('最近一次导入详情', 'Latest import')}</h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {lastImportResult.message ? localizeServerMessage(lastImportResult.message, language) : t('已返回导入结果', 'Import result received')}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="text-xs text-gray-500">{t('成功导入', 'Imported')}</div>
                    <div className="text-xl font-semibold text-green-700">{lastImportResult.totalImported ?? 0}</div>
                  </div>
                  <div className="rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="text-xs text-gray-500">{t('失败条数', 'Failed')}</div>
                    <div className="text-xl font-semibold text-red-700">{lastImportResult.totalFailed ?? 0}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">{t('分项统计', 'Breakdown')}</h3>
                {importStatsEntries.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {importStatsEntries.map(([name, stats]) => (
                      <div key={name} className="rounded-lg border p-3" style={{ borderColor: 'var(--border-primary)' }}>
                        <div className="font-medium">{sectionLabel(name, language)}</div>
                        <div className="mt-2 text-sm text-green-700">{t('成功', 'Succeeded')}: {stats?.success ?? 0}</div>
                        <div className="text-sm text-red-700">{t('失败', 'Failed')}: {stats?.failed ?? 0}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{t('暂无分项统计', 'No breakdown yet')}</div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">{t('失败详情', 'Failure details')}</h3>
                {importFailureEntries.length > 0 ? (
                  <div className="space-y-3">
                    {importFailureEntries.map(([name, details]) => (
                      <details key={name} className="rounded-lg border p-3" style={{ borderColor: 'var(--border-primary)' }}>
                        <summary className="cursor-pointer font-medium">
                          {sectionLabel(name, language)} ({details.length})
                        </summary>
                        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-red-700">
                          {details.map((detail, index) => (
                            <li key={`${name}-${index}`}>{detail}</li>
                          ))}
                        </ul>
                      </details>
                    ))}
                    <p className="text-xs text-gray-500">{t('每个分类最多展示前 50 条失败明细。', 'Each category shows at most the first 50 failures.')}</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{t('没有失败明细，说明本次导入没有记录到可展示的错误行。', 'No failure details were recorded for this import.')}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
