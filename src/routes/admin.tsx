import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  login,
  logout,
  getUser,
  handleAuthCallback,
  acceptInvite,
  updateUser,
  requestPasswordRecovery,
} from '@netlify/identity'
import { defaults, money, type PublicData } from '@/lib/campaign'

export const Route = createFileRoute('/admin')({
  component: Admin,
  head: () => ({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] }),
})
type Pledge = {
  id: number
  createdAt: string
  firstName: string
  lastName: string
  email: string
  phone: string
  project: string
  windowNumber: number | null
  amount: number
  method: string
  status: string
  message: string
  notes: string
}
type AdminData = PublicData & { pledges: Pledge[] }
function Admin() {
  const [data, setData] = useState<AdminData | null>(null),
    [authorized, setAuthorized] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [editor, setEditor] = useState(''),
    [invite, setInvite] = useState<string | null>(null),
    [recovery, setRecovery] = useState(false)
  async function load() {
    const r = await fetch('/api/admin/campaign')
    const body = await r.json()
    if (!r.ok) throw new Error(body.error)
    setData(body)
    setEditor(JSON.stringify(body.content, null, 2))
    setAuthorized(true)
  }
  useEffect(() => {
    async function init() {
      try {
        const callback = await handleAuthCallback()
        if (callback?.type === 'invite') {
          setInvite(callback.token || null)
          return
        }
        if (callback?.type === 'recovery') {
          setRecovery(true)
          return
        }
        const user = await getUser()
        if (user?.roles?.includes('admin')) await load()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to sign in.')
      }
    }
    void init()
  }, [])
  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const fields = new FormData(e.currentTarget)
      if (invite) {
        await acceptInvite(invite, String(fields.get('password')))
        setInvite(null)
      } else if (recovery) {
        await updateUser({ password: String(fields.get('password')) })
        setRecovery(false)
      } else {
        await login(String(fields.get('email')), String(fields.get('password')))
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed.')
    } finally {
      setBusy(false)
    }
  }
  async function savePledge(e: React.FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const f = new FormData(e.currentTarget)
    try {
      const r = await fetch('/api/admin/campaign', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: f.get('status'),
          notes: f.get('notes'),
        }),
      })
      const b = await r.json()
      if (!r.ok) throw new Error(b.error)
      await load()
      setNotice(
        'Pledge updated. Public progress and window availability are up to date.',
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed.')
    } finally {
      setBusy(false)
    }
  }
  async function saveContent() {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const r = await fetch('/api/admin/campaign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(JSON.parse(editor)),
      })
      const b = await r.json()
      if (!r.ok) throw new Error(b.error)
      await load()
      setNotice('Campaign content saved.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Content could not be saved.')
    } finally {
      setBusy(false)
    }
  }
  if (!authorized)
    return (
      <main className="admin-page">
        <div className="container">
          <a href="/">← Return to Holy Nativity</a>
          <div className="admin-login">
            <img src={defaults.logo} alt="Holy Nativity official logo" />
            <h1>
              {invite
                ? 'Accept Your Invitation'
                : recovery
                  ? 'Set a New Password'
                  : 'Church Administration'}
            </h1>
            <form onSubmit={signIn}>
              {!invite && !recovery && (
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="username"
                  />
                </label>
              )}
              <label>
                {invite || recovery ? 'New Password' : 'Password'}
                <input
                  name="password"
                  type="password"
                  minLength={invite || recovery ? 10 : 1}
                  required
                  autoComplete={
                    invite || recovery ? 'new-password' : 'current-password'
                  }
                />
              </label>
              <button className="button full" disabled={busy}>
                {busy
                  ? 'Signing in…'
                  : invite || recovery
                    ? 'Set Password & Continue'
                    : 'Sign In'}
              </button>
            </form>
            {error && (
              <p className="notice" role="alert">
                {error}
              </p>
            )}
            {notice && <p className="notice">{notice}</p>}
            {!invite && !recovery && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setBusy(true)
                  try {
                    const f = new FormData(e.currentTarget)
                    await requestPasswordRecovery(String(f.get('email')))
                    setNotice('Check your email for a password recovery link.')
                  } catch {
                    setError('Password recovery could not be requested.')
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                <label>
                  Password recovery email
                  <input type="email" name="email" required />
                </label>
                <button className="button outline full" disabled={busy}>
                  Send Password Reset
                </button>
              </form>
            )}
            <p className="fine-print">
              Access is limited to authorized Holy Nativity administrators.
            </p>
          </div>
        </div>
      </main>
    )
  const goal = data?.content.projects.reduce((s, p) => s + p.goal, 0) || 0,
    pledged =
      Object.values(data?.totals || {}).reduce((s, p) => s + p.pledged, 0) /
      100,
    confirmed =
      Object.values(data?.totals || {}).reduce((s, p) => s + p.confirmed, 0) /
      100
  const reserved = data?.windows.filter((w) => w.status !== 'paid').length || 0,
    sponsored = data?.windows.filter((w) => w.status === 'paid').length || 0
  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div className="admin-heading">
            <img
              src={data?.content.logo || defaults.logo}
              alt="Holy Nativity official logo"
            />
            <div>
              <span className="eyebrow">PRIVATE CHURCH ADMINISTRATION</span>
              <h1>Campaign Dashboard</h1>
            </div>
          </div>
          <div className="admin-actions">
            <a className="button outline" href="/">
              View Website
            </a>
            <button
              className="button"
              onClick={async () => {
                await logout()
                setAuthorized(false)
                setData(null)
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
        <div className="admin-metrics">
          {[
            ['Campaign Goal', goal],
            ['Total Pledged', pledged],
            ['Confirmed Received', confirmed],
            ['Total Pending', pledged - confirmed],
            ['Total Remaining', Math.max(0, goal - confirmed)],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{money(Number(value))}</strong>
            </div>
          ))}
        </div>
        <h2>Windows & Projects</h2>
        <div className="admin-window-stats">
          <span>
            <strong>{36 - reserved - sponsored}</strong> Available
          </span>
          <span>
            <strong>{reserved}</strong> Reserved
          </span>
          <span>
            <strong>{sponsored}</strong> Sponsored
          </span>
        </div>
        <div className="admin-projects">
          {data?.content.projects.map((p) => {
            const totals = data.totals[p.id] || { pledged: 0, confirmed: 0 }
            return (
              <div key={p.id}>
                <h3>{p.name}</h3>
                <p>
                  Goal {money(p.goal)} · Pledged {money(totals.pledged / 100)}
                  <br />
                  Confirmed {money(totals.confirmed / 100)} · Remaining{' '}
                  {money(Math.max(0, p.goal - totals.confirmed / 100))}
                </p>
                <div className="progress-track">
                  <span
                    style={{
                      width: `${Math.min(100, (totals.confirmed / 100 / p.goal) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <h2>Private Pledges</h2>
        <p className="intro">
          Mark a gift Paid / Confirmed only after the church verifies receipt.
          Cancelling a window pledge releases its reservation.
        </p>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                {[
                  'Date',
                  'First Name',
                  'Last Name',
                  'Email',
                  'Phone',
                  'Project',
                  'Window',
                  'Pledged Amount',
                  'Giving Method',
                  'Message',
                  'Status & Notes',
                ].map((t) => (
                  <th key={t}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.pledges.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.createdAt).toLocaleDateString('en-US')}</td>
                  <td>{p.firstName}</td>
                  <td>{p.lastName}</td>
                  <td>{p.email}</td>
                  <td>{p.phone}</td>
                  <td>
                    {
                      data.content.projects.find((a) => a.id === p.project)
                        ?.name
                    }
                  </td>
                  <td>{p.windowNumber || '—'}</td>
                  <td>{money(p.amount / 100)}</td>
                  <td>{p.method === 'online' ? 'Online' : 'In Person'}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: 150 }}>
                    {p.message || '—'}
                  </td>
                  <td>
                    <form onSubmit={(e) => void savePledge(e, p.id)}>
                      <label>
                        Status
                        <select
                          name="status"
                          defaultValue={p.status}
                          key={p.status}
                        >
                          <option value="pending">Pending</option>
                          <option value="reserved">
                            Reserved / Awaiting Donation
                          </option>
                          <option value="paid">Paid / Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </label>
                      <label>
                        Private Notes
                        <textarea
                          name="notes"
                          defaultValue={p.notes}
                          key={p.notes}
                          maxLength={5000}
                        />
                      </label>
                      <button className="button" disabled={busy}>
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.pledges.length && (
            <p className="notice">
              No pledges yet. New sponsorships appear here after they are
              submitted.
            </p>
          )}
        </div>
        <section className="admin-editor">
          <h2>Edit Campaign Content</h2>
          <p className="intro">
            Update project names, descriptions, goals, window sponsorship
            amount, hero text, and image paths below. Amounts here are in
            dollars. Place original church images in public/img and reference
            them with /img/ filenames. The official donation destination remains
            fixed for secure church giving.
          </p>
          <label htmlFor="campaign-content">Campaign configuration</label>
          <textarea
            id="campaign-content"
            value={editor}
            onChange={(e) => setEditor(e.target.value)}
            spellCheck={false}
          />
          <button
            className="button"
            disabled={busy}
            onClick={() => void saveContent()}
          >
            {busy ? 'Saving…' : 'Save Campaign Content'}
          </button>
        </section>
      </div>
    </main>
  )
}
