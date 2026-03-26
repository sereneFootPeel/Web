import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'

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
  philosopherId?: number | null
  philosopherName?: string | null
  schoolId?: number | null
  schoolName?: string | null
}

type Section = 'dashboard' | 'users' | 'philosophers' | 'schools' | 'contents' | 'import'

const sections: Section[] = ['dashboard', 'users', 'philosophers', 'schools', 'contents', 'import']

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { message?: string }).message || '请求失败')
  return data as T
}

export function AdminManage() {
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
    id: 0, name: '', nameEn: '', birthDeathDate: '', bio: '', bioEn: '', imageUrl: '',
  })
  const [schoolForm, setSchoolForm] = useState({ id: 0, name: '', nameEn: '', description: '', descriptionEn: '', parentId: '' })
  const [contentForm, setContentForm] = useState({
    id: 0, content: '', contentEn: '', philosopherId: '', schoolId: '',
  })
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [clearExistingData, setClearExistingData] = useState(false)

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
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCurrent()
  }, [section])

  function resetForms() {
    setUserForm({ id: 0, username: '', email: '', role: 'USER', enabled: true, password: '' })
    setPhilosopherForm({ id: 0, name: '', nameEn: '', birthDeathDate: '', bio: '', bioEn: '', imageUrl: '' })
    setSchoolForm({ id: 0, name: '', nameEn: '', description: '', descriptionEn: '', parentId: '' })
    setContentForm({ id: 0, content: '', contentEn: '', philosopherId: '', schoolId: '' })
  }

  function showSuccess(msg: string) {
    setMessage(msg)
    setError('')
  }

  function showError(msg: string) {
    setError(msg)
    setMessage('')
  }

  async function submitUser(e: FormEvent) {
    e.preventDefault()
    try {
      if (userForm.id) {
        await requestJson('/api/admin/users/' + userForm.id, {
          method: 'PUT',
          body: JSON.stringify({
            username: userForm.username,
            email: userForm.email,
            role: userForm.role,
            enabled: userForm.enabled,
          }),
        })
        if (userForm.password.trim()) {
          await requestJson('/api/admin/users/' + userForm.id + '/password', {
            method: 'PUT',
            body: JSON.stringify({ password: userForm.password }),
          })
        }
        showSuccess('用户已更新')
      } else {
        await requestJson('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            username: userForm.username,
            email: userForm.email,
            password: userForm.password,
            role: userForm.role,
            enabled: userForm.enabled,
          }),
        })
        showSuccess('用户已创建')
      }
      resetForms()
      await loadCurrent()
    } catch (e1) {
      showError(e1 instanceof Error ? e1.message : '保存用户失败')
    }
  }

  async function removeUser(id: number) {
    if (!confirm('确定删除该用户？')) return
    try {
      await requestJson('/api/admin/users/' + id, { method: 'DELETE' })
      showSuccess('用户已删除')
      await loadCurrent()
    } catch (e) {
      showError(e instanceof Error ? e.message : '删除失败')
    }
  }

  async function submitPhilosopher(e: FormEvent) {
    e.preventDefault()
    const payload = {
      name: philosopherForm.name,
      nameEn: philosopherForm.nameEn || null,
      birthDeathDate: philosopherForm.birthDeathDate || null,
      bio: philosopherForm.bio || null,
      bioEn: philosopherForm.bioEn || null,
      imageUrl: philosopherForm.imageUrl || null,
    }
    try {
      if (philosopherForm.id) {
        await requestJson('/api/admin/philosophers/' + philosopherForm.id, { method: 'PUT', body: JSON.stringify(payload) })
        showSuccess('哲学家已更新')
      } else {
        await requestJson('/api/admin/philosophers', { method: 'POST', body: JSON.stringify(payload) })
        showSuccess('哲学家已创建')
      }
      resetForms()
      await loadCurrent()
    } catch (e2) {
      showError(e2 instanceof Error ? e2.message : '保存哲学家失败')
    }
  }

  async function removePhilosopher(id: number) {
    if (!confirm('确定删除该哲学家？')) return
    try {
      await requestJson('/api/admin/philosophers/' + id, { method: 'DELETE' })
      showSuccess('哲学家已删除')
      await loadCurrent()
    } catch (e) {
      showError(e instanceof Error ? e.message : '删除失败')
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
      if (schoolForm.id) {
        await requestJson('/api/admin/schools/' + schoolForm.id, { method: 'PUT', body: JSON.stringify(payload) })
        showSuccess('流派已更新')
      } else {
        await requestJson('/api/admin/schools', { method: 'POST', body: JSON.stringify(payload) })
        showSuccess('流派已创建')
      }
      resetForms()
      await loadCurrent()
    } catch (e3) {
      showError(e3 instanceof Error ? e3.message : '保存流派失败')
    }
  }

  async function removeSchool(id: number) {
    if (!confirm('确定删除该流派？')) return
    try {
      await requestJson('/api/admin/schools/' + id, { method: 'DELETE' })
      showSuccess('流派已删除')
      await loadCurrent()
    } catch (e) {
      showError(e instanceof Error ? e.message : '删除失败')
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
      if (contentForm.id) {
        await requestJson('/api/admin/contents/' + contentForm.id, { method: 'PUT', body: JSON.stringify(payload) })
        showSuccess('内容已更新')
      } else {
        await requestJson('/api/admin/contents', { method: 'POST', body: JSON.stringify(payload) })
        showSuccess('内容已创建')
      }
      resetForms()
      await loadCurrent()
    } catch (e4) {
      showError(e4 instanceof Error ? e4.message : '保存内容失败')
    }
  }

  async function removeContent(id: number) {
    if (!confirm('确定删除该内容？')) return
    try {
      await requestJson('/api/admin/contents/' + id, { method: 'DELETE' })
      showSuccess('内容已删除')
      await loadCurrent()
    } catch (e) {
      showError(e instanceof Error ? e.message : '删除失败')
    }
  }

  async function uploadCsv(e: FormEvent) {
    e.preventDefault()
    if (!csvFile) {
      showError('请选择CSV文件')
      return
    }
    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      formData.append('clearExistingData', String(clearExistingData))
      const res = await fetch('/api/admin/data-import/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { message?: string }).message || '上传失败')
      const totalImported = (data as { totalImported?: number }).totalImported ?? 0
      const totalFailed = (data as { totalFailed?: number }).totalFailed ?? 0
      showSuccess(`导入完成：成功 ${totalImported}，失败 ${totalFailed}`)
      setCsvFile(null)
    } catch (e5) {
      showError(e5 instanceof Error ? e5.message : '上传失败')
    }
  }

  async function exportCsv() {
    try {
      const res = await fetch('/api/admin/data-export/download', {
        method: 'GET',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { message?: string }).message || '导出失败')
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
      showSuccess('CSV导出成功')
    } catch (e) {
      showError(e instanceof Error ? e.message : '导出失败')
    }
  }

  async function sendCsvToEmail() {
    try {
      const res = await fetch('/api/admin/data-export/send-email', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { message?: string }).message || '发送失败')
      showSuccess((data as { message?: string }).message || 'CSV 已发送到您的邮箱')
    } catch (e) {
      showError(e instanceof Error ? e.message : '发送失败')
    }
  }

  async function clearAllDatabaseData() {
    if (!confirm('危险操作：确认删除数据库中的全部数据吗？此操作不可恢复。')) return
    if (!confirm('请再次确认：真的要清空全部数据库数据吗？')) return
    try {
      await requestJson<{ success: boolean; message?: string }>('/api/admin/data-import/clear-all', { method: 'POST' })
      showSuccess('数据库数据已全部删除')
      await loadCurrent()
    } catch (e) {
      showError(e instanceof Error ? e.message : '清空失败')
    }
  }

  const navItems: Array<{ key: Section; label: string }> = [
    { key: 'dashboard', label: '仪表盘' },
    { key: 'users', label: '用户管理' },
    { key: 'philosophers', label: '哲学家管理' },
    { key: 'schools', label: '流派管理' },
    { key: 'contents', label: '内容管理' },
    { key: 'import', label: 'CSV导入' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>管理后台</h1>

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
      {loading && <div>加载中...</div>}

      {!loading && section === 'dashboard' && dashboard && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: '哲学家', count: dashboard.philosophersCount },
            { label: '流派', count: dashboard.schoolsCount },
            { label: '内容', count: dashboard.contentsCount },
            { label: '用户', count: dashboard.usersCount },
          ].map((c) => (
            <div key={c.label} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.label}</p>
              <p className="text-2xl font-bold mt-1">{c.count}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && section === 'users' && (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <form className="space-y-3 sticky top-4" onSubmit={submitUser}>
            <h2 className="font-semibold">{userForm.id ? '编辑用户' : '新增用户'}</h2>
            <input className="w-full border rounded p-2" placeholder="用户名" value={userForm.username} onChange={(e) => setUserForm((v) => ({ ...v, username: e.target.value }))} required />
            <input className="w-full border rounded p-2" placeholder="邮箱" value={userForm.email} onChange={(e) => setUserForm((v) => ({ ...v, email: e.target.value }))} required />
            <select className="w-full border rounded p-2" value={userForm.role} onChange={(e) => setUserForm((v) => ({ ...v, role: e.target.value }))}>
              <option value="USER">USER</option>
              <option value="MODERATOR">MODERATOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={userForm.enabled} onChange={(e) => setUserForm((v) => ({ ...v, enabled: e.target.checked }))} />
              启用账号
            </label>
            <input className="w-full border rounded p-2" type="password" placeholder={userForm.id ? '新密码（可空）' : '密码'} value={userForm.password} onChange={(e) => setUserForm((v) => ({ ...v, password: e.target.value }))} required={!userForm.id} />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-black text-white" type="submit">保存</button>
              <button className="px-4 py-2 rounded border" type="button" onClick={resetForms}>重置</button>
            </div>
          </form>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="p-3 border rounded flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{u.username} ({u.role})</div>
                  <div className="text-sm text-gray-500">{u.email} · {u.enabled ? '启用' : '停用'}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-black" onClick={() => setUserForm({ id: u.id, username: u.username, email: u.email, role: u.role, enabled: u.enabled, password: '' })}>编辑</button>
                  <button className="text-red-600" onClick={() => void removeUser(u.id)}>删除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && section === 'philosophers' && (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <form className="space-y-3 sticky top-4" onSubmit={submitPhilosopher}>
            <h2 className="font-semibold">{philosopherForm.id ? '编辑哲学家' : '新增哲学家'}</h2>
            <input className="w-full border rounded p-2" placeholder="姓名" value={philosopherForm.name} onChange={(e) => setPhilosopherForm((v) => ({ ...v, name: e.target.value }))} required />
            <input className="w-full border rounded p-2" placeholder="英文名" value={philosopherForm.nameEn} onChange={(e) => setPhilosopherForm((v) => ({ ...v, nameEn: e.target.value }))} />
            <input className="w-full border rounded p-2" placeholder="出生死亡日期（如 1999.1.1 - 2000.1.1）" value={philosopherForm.birthDeathDate} onChange={(e) => setPhilosopherForm((v) => ({ ...v, birthDeathDate: e.target.value }))} />
            <p className="text-xs text-gray-500 -mt-2">格式：1999.1.1 - 2000.1.1（出生日期会自动计算用于前端排序）</p>
            <input className="w-full border rounded p-2" placeholder="图片URL" value={philosopherForm.imageUrl} onChange={(e) => setPhilosopherForm((v) => ({ ...v, imageUrl: e.target.value }))} />
            <textarea className="w-full border rounded p-2 min-h-28" placeholder="传记" value={philosopherForm.bio} onChange={(e) => setPhilosopherForm((v) => ({ ...v, bio: e.target.value }))} />
            <textarea className="w-full border rounded p-2 min-h-24" placeholder="英文传记（可空）" value={philosopherForm.bioEn} onChange={(e) => setPhilosopherForm((v) => ({ ...v, bioEn: e.target.value }))} />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-black text-white" type="submit">保存</button>
              <button className="px-4 py-2 rounded border" type="button" onClick={resetForms}>重置</button>
            </div>
          </form>
          <div className="space-y-2">
            {philosophers.map((p) => (
              <div key={p.id} className="p-3 border rounded flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.birthDeathDate || '无日期信息'}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-black" onClick={() => setPhilosopherForm({
                    id: p.id,
                    name: p.name || '',
                    nameEn: p.nameEn || '',
                    birthDeathDate: p.birthDeathDate || '',
                    bio: p.bio || '',
                    bioEn: p.bioEn || '',
                    imageUrl: p.imageUrl || '',
                  })}>编辑</button>
                  <button className="text-red-600" onClick={() => void removePhilosopher(p.id)}>删除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && section === 'schools' && (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <form className="space-y-3 sticky top-4" onSubmit={submitSchool}>
            <h2 className="font-semibold">{schoolForm.id ? '编辑流派' : '新增流派'}</h2>
            <input className="w-full border rounded p-2" placeholder="名称" value={schoolForm.name} onChange={(e) => setSchoolForm((v) => ({ ...v, name: e.target.value }))} required />
            <input className="w-full border rounded p-2" placeholder="英文名" value={schoolForm.nameEn} onChange={(e) => setSchoolForm((v) => ({ ...v, nameEn: e.target.value }))} />
            <select className="w-full border rounded p-2" value={schoolForm.parentId} onChange={(e) => setSchoolForm((v) => ({ ...v, parentId: e.target.value }))}>
              <option value="">无父流派</option>
              {schools.filter((s) => s.id !== schoolForm.id).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <textarea className="w-full border rounded p-2 min-h-28" placeholder="描述" value={schoolForm.description} onChange={(e) => setSchoolForm((v) => ({ ...v, description: e.target.value }))} />
            <textarea className="w-full border rounded p-2 min-h-24" placeholder="英文描述（可空）" value={schoolForm.descriptionEn} onChange={(e) => setSchoolForm((v) => ({ ...v, descriptionEn: e.target.value }))} />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-black text-white" type="submit">保存</button>
              <button className="px-4 py-2 rounded border" type="button" onClick={resetForms}>重置</button>
            </div>
          </form>
          <div className="space-y-2">
            {schools.map((s) => (
              <div key={s.id} className="p-3 border rounded flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-gray-500">父ID: {s.parentId ?? '无'}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-black" onClick={() => setSchoolForm({
                    id: s.id,
                    name: s.name || '',
                    nameEn: s.nameEn || '',
                    description: s.description || '',
                    descriptionEn: s.descriptionEn || '',
                    parentId: s.parentId ? String(s.parentId) : '',
                  })}>编辑</button>
                  <button className="text-red-600" onClick={() => void removeSchool(s.id)}>删除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && section === 'contents' && (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <form className="space-y-3 sticky top-4" onSubmit={submitContent}>
            <h2 className="font-semibold">{contentForm.id ? '编辑内容' : '新增内容'}</h2>
            <select className="w-full border rounded p-2" value={contentForm.philosopherId} onChange={(e) => setContentForm((v) => ({ ...v, philosopherId: e.target.value }))}>
              <option value="">无哲学家</option>
              {philosophers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className="w-full border rounded p-2" value={contentForm.schoolId} onChange={(e) => setContentForm((v) => ({ ...v, schoolId: e.target.value }))}>
              <option value="">无流派</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <textarea className="w-full border rounded p-2 min-h-32" placeholder="内容" value={contentForm.content} onChange={(e) => setContentForm((v) => ({ ...v, content: e.target.value }))} required />
            <textarea className="w-full border rounded p-2 min-h-24" placeholder="英文内容（可空）" value={contentForm.contentEn} onChange={(e) => setContentForm((v) => ({ ...v, contentEn: e.target.value }))} />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-black text-white" type="submit">保存</button>
              <button className="px-4 py-2 rounded border" type="button" onClick={resetForms}>重置</button>
            </div>
          </form>
          <div className="space-y-2">
            {contents.map((c) => (
              <div key={c.id} className="p-3 border rounded flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{`内容#${c.id}`}</div>
                  <div className="text-sm text-gray-500">{c.philosopherName || '无哲学家'} · {c.schoolName || '无流派'}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-black" onClick={() => setContentForm({
                    id: c.id,
                    content: c.content || '',
                    contentEn: c.contentEn || '',
                    philosopherId: c.philosopherId ? String(c.philosopherId) : '',
                    schoolId: c.schoolId ? String(c.schoolId) : '',
                  })}>编辑</button>
                  <button className="text-red-600" onClick={() => void removeContent(c.id)}>删除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && section === 'import' && (
        <form className="space-y-4 max-w-xl" onSubmit={uploadCsv}>
          <div className="text-sm text-gray-600">上传从旧站导出的 CSV 数据文件，支持按同 ID 覆盖导入。</div>
          <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={clearExistingData} onChange={(e) => setClearExistingData(e.target.checked)} />
            导入前先清空现有数据（危险操作）
          </label>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 rounded bg-black text-white" type="submit">上传并导入</button>
            <button className="px-4 py-2 rounded border" type="button" onClick={() => void exportCsv()}>导出CSV文件</button>
            <button className="px-4 py-2 rounded border" type="button" onClick={() => void sendCsvToEmail()}>发送CSV到邮箱</button>
            <button className="px-4 py-2 rounded bg-red-600 text-white" type="button" onClick={() => void clearAllDatabaseData()}>删除全部数据库数据</button>
          </div>
        </form>
      )}
    </div>
  )
}
