import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  MapPin,
  Heart,
  ShieldCheck,
  Check,
  Church,
  Sun,
  Wind,
  Zap,
  Paintbrush,
  Layers,
  ChevronDown,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { defaults, givingUrl, money, type PublicData } from '@/lib/campaign'

export const Route = createFileRoute('/')({ component: Home })
const cdn = (path: string, width: number) =>
  `/.netlify/images?url=${encodeURIComponent(path)}&w=${width}&fm=webp`
const icons = [Sun, Layers, Church, Paintbrush, Wind, Zap]
function Home() {
  const [data, setData] = useState<PublicData | null>(null),
    [error, setError] = useState(''),
    [menu, setMenu] = useState(false)
  const [selection, setSelection] = useState<{
    project: string
    window: number | null
  } | null>(null)
  const [amount, setAmount] = useState(100),
    [busy, setBusy] = useState(false),
    [formError, setFormError] = useState('')
  const [confirmation, setConfirmation] = useState<{
    amount: number
    label: string
    method: string
  } | null>(null)
  const content = data?.content || defaults
  const totalGoal = content.projects.reduce((sum, p) => sum + p.goal, 0)
  const confirmed =
    Object.values(data?.totals || {}).reduce((sum, p) => sum + p.confirmed, 0) /
    100
  const pledged =
    Object.values(data?.totals || {}).reduce((sum, p) => sum + p.pledged, 0) /
    100
  async function refresh() {
    try {
      const r = await fetch('/api/campaign')
      const value = await r.json()
      if (!r.ok) throw new Error(value.error)
      setData(value)
      setError('')
    } catch {
      setError(
        'Campaign progress is temporarily unavailable. Please try again to view current availability.',
      )
    }
  }
  useEffect(() => {
    if (
      /^#(invite_token|recovery_token|confirmation_token|email_change_token)=/.test(
        window.location.hash,
      )
    ) {
      window.location.replace('/admin' + window.location.hash)
      return
    }
    void refresh()
  }, [])
  const project = content.projects.find((p) => p.id === selection?.project)
  function select(id: string, window: number | null = null) {
    setSelection({ project: id, window })
    setAmount(window ? content.windowAmount : 100)
    setFormError('')
    setConfirmation(null)
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selection || busy) return
    const fields = new FormData(event.currentTarget),
      method = String(fields.get('method'))
    setBusy(true)
    setFormError('')
    try {
      const r = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fields.get('firstName'),
          lastName: fields.get('lastName'),
          email: fields.get('email'),
          phone: fields.get('phone'),
          project: selection.project,
          windowNumber: selection.window,
          amount: Math.round(amount * 100),
          method,
          message: fields.get('message'),
          acknowledgement: fields.get('acknowledgement') === 'on',
          website: fields.get('website'),
        }),
      })
      const value = await r.json()
      if (!r.ok) throw new Error(value.error)
      setConfirmation({
        amount,
        label: selection.window
          ? `Window ${String(selection.window).padStart(2, '0')}`
          : project!.name,
        method,
      })
      setSelection(null)
      void refresh()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Please try again.')
      void refresh()
    } finally {
      setBusy(false)
    }
  }
  const links = [
    ['Home', '#home'],
    ['Our Projects', '#projects'],
    ['Sponsor a Window', '#windows'],
    ['How It Works', '#how-it-works'],
    ['Give', givingUrl],
    ['Contact', '#contact'],
  ]
  return (
    <>
      <div className="topline">
        <div className="container">
          <span>A faithful community. A lasting home.</span>
          <a href="https://www.hncoc.org/" target="_blank" rel="noreferrer">
            Visit our main church website <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
      <header className="header">
        <div className="container header-inner">
          <a className="brand" href="#home">
            <img
              src={content.logo}
              alt="Holy Nativity Coptic Orthodox Church official logo"
            />
            <span>
              HOLY NATIVITY<small>COPTIC ORTHODOX CHURCH</small>
            </span>
          </a>
          <nav className="desktop-nav">
            {links.map(([name, href]) => (
              <a key={name} href={href}>
                {name}
              </a>
            ))}
          </nav>
          <a className="button small desktop-support" href="#projects">
            Support Our Church <ArrowUpRight size={15} />
          </a>
          <button
            className="menu-button"
            aria-label={menu ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <nav className="mobile-nav">
            {links.map(([name, href]) => (
              <a key={name} href={href} onClick={() => setMenu(false)}>
                {name}
              </a>
            ))}
            <a href="#projects" onClick={() => setMenu(false)}>
              Support Our Church
            </a>
          </nav>
        )}
      </header>
      <main id="home">
        <section className="hero">
          <img
            className="hero-photo"
            src={cdn(content.heroImage, 2000)}
            srcSet={`${cdn(content.heroImage, 800)} 800w, ${cdn(content.heroImage, 1400)} 1400w, ${cdn(content.heroImage, 2000)} 2000w`}
            sizes="100vw"
            alt="Holy Nativity Coptic Orthodox Church in Riverside, with the mountains beyond"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="container hero-inner">
            <div className="eyebrow light">
              <span className="cross">✣</span> HOLY NATIVITY COPTIC ORTHODOX
              CHURCH
            </div>
            <h1>
              {content.heroTitle === defaults.heroTitle ? (
                <>
                  Building for
                  <br />
                  Our <em>Future</em>
                </>
              ) : (
                content.heroTitle
              )}
            </h1>
            <div className="gold-line" />
            <p>{content.heroDescription}</p>
            <div className="hero-actions">
              <a className="button" href="#projects">
                View Our Projects <ArrowRight size={17} />
              </a>
              <a className="button outline light-button" href="#windows">
                Sponsor a Window <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="hero-location">
              <MapPin size={14} /> Our church home in Riverside, California
            </div>
          </div>
          <a
            className="hero-scroll"
            href="#giving-message"
            aria-label="Explore the campaign"
          >
            <ChevronDown size={20} />
          </a>
          <div className="photo-caption">OUR HOME. OUR FAMILY. OUR FUTURE.</div>
        </section>
        <section className="verse-section" id="giving-message">
          <div className="container verse-inner">
            <div className="verse-symbol">✣</div>
            <div>
              <span className="eyebrow">THE JOY OF GIVING</span>
              <blockquote>
                “So let each one give as he purposes in his heart, not
                grudgingly or of necessity, for God loves a cheerful
                giver.”
              </blockquote>
              <cite>2 CORINTHIANS 9:7</cite>
            </div>
          </div>
        </section>
        <section className="section projects-section" id="projects">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">TOGETHER, WE BUILD</div>
                <h2>Our Church Improvement Projects</h2>
              </div>
              <span className="section-number">01 / OUR PROJECTS</span>
            </div>
            <p className="intro">
              As our Holy Nativity family continues to grow, we are working
              together to care for and improve the church God has given us.
              Families and individuals are invited to sponsor specific needs or
              contribute any amount toward these projects.
            </p>
            <div className="campaign-summary">
              <div className="summary-title">
                <span className="summary-icon">
                  <Church size={24} />
                </span>
                <div>
                  <span className="eyebrow">
                    ONE CHURCH. ONE SHARED VISION.
                  </span>
                  <h3>Every gift brings us closer.</h3>
                </div>
              </div>
              <div className="campaign-total">
                <span>Total campaign goal</span>
                <strong>{money(totalGoal)}</strong>
              </div>
              <div className="summary-progress">
                <div>
                  <span>
                    {data
                      ? `${money(confirmed)} confirmed`
                      : 'Loading campaign progress…'}
                  </span>
                  <span>
                    {data
                      ? `${Math.round((confirmed / totalGoal) * 100)}%`
                      : '—'}
                  </span>
                </div>
                <div className="progress-track">
                  <span
                    style={{
                      width: `${Math.min(100, (confirmed / totalGoal) * 100)}%`,
                    }}
                  />
                </div>
                <small>
                  {data
                    ? `${money(pledged)} pledged · ${money(Math.max(0, totalGoal - confirmed))} remaining`
                    : 'All contributions are confirmed by the church.'}
                </small>
              </div>
            </div>
            {error && (
              <div className="notice" role="alert">
                {error} <button onClick={() => void refresh()}>Retry</button>
              </div>
            )}
            <div className="project-grid">
              {content.projects.map((p, i) => {
                const Icon = icons[i],
                  totals = data?.totals[p.id] || { pledged: 0, confirmed: 0 }
                return (
                  <article className="project-card" key={p.id}>
                    <div className="project-photo">
                      <img
                        loading="lazy"
                        src={cdn(p.image, 700)}
                        alt={`${p.name} at Holy Nativity`}
                      />
                      {i === 0 && (
                        <span className="photo-badge">
                          36 WINDOWS · A LASTING GIFT
                        </span>
                      )}
                      <span className="project-icon">
                        <Icon size={20} />
                      </span>
                    </div>
                    <div className="project-body">
                      <div className="project-title">
                        <h3>{p.name}</h3>
                        <span>{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <p>{p.description}</p>
                      <div className="project-goal">
                        <span>Project goal</span>
                        <strong>{money(p.goal)}</strong>
                      </div>
                      <div className="progress-track">
                        <span
                          style={{
                            width: `${Math.min(100, (totals.confirmed / 100 / p.goal) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="project-numbers">
                        <span>
                          Pledged
                          <strong>
                            {data ? money(totals.pledged / 100) : '—'}
                          </strong>
                        </span>
                        <span>
                          Confirmed
                          <strong>
                            {data ? money(totals.confirmed / 100) : '—'}
                          </strong>
                        </span>
                        <span>
                          Remaining
                          <strong>
                            {data
                              ? money(
                                  Math.max(0, p.goal - totals.confirmed / 100),
                                )
                              : '—'}
                          </strong>
                        </span>
                      </div>
                      <button
                        className="project-action"
                        onClick={() =>
                          i === 0
                            ? document
                                .getElementById('windows')
                                ?.scrollIntoView({ behavior: 'smooth' })
                            : select(p.id)
                        }
                      >
                        Support This Project <ArrowUpRight size={17} />
                      </button>
                      {i === 0 && (
                        <small className="window-price">
                          Approximately {money(content.windowAmount)} to sponsor
                          one window
                        </small>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
        <section className="section windows-section" id="windows">
          <div className="container">
            <div className="window-header">
              <div>
                <div className="eyebrow">A GIFT FOR GENERATIONS</div>
                <h2>
                  Leave a Lasting Gift —<br />
                  <em>Sponsor a Window</em>
                </h2>
                <p className="intro">
                  Families and individuals may sponsor one of the 36 replacement
                  windows for approximately {money(content.windowAmount)} each.
                  Select an available window below to make your pledge.
                </p>
              </div>
              <div className="window-callout">
                <Sun size={28} />
                <strong>
                  36 windows.
                  <br />
                  Countless moments of light.
                </strong>
                <span>
                  A meaningful way to care for the place
                  <br />
                  where we pray, gather, and grow.
                </span>
              </div>
            </div>
            <div className="window-toolbar">
              <span>SELECT YOUR WINDOW</span>
              <div className="legend">
                <span>
                  <i className="available-dot" />
                  Available
                </span>
                <span>
                  <i className="reserved-dot" />
                  Reserved
                </span>
                <span>
                  <i className="sponsored-dot" />
                  Sponsored
                </span>
              </div>
            </div>
            {!data ? (
              <div className="notice">
                {error || 'Loading current window availability…'}{' '}
                {error && (
                  <button onClick={() => void refresh()}>Try again</button>
                )}
              </div>
            ) : (
              <div className="window-grid">
                {Array.from({ length: 36 }, (_, i) => {
                  const n = i + 1,
                    status = data.windows.find((w) => w.number === n)?.status,
                    available = !status,
                    paid = status === 'paid'
                  return (
                    <button
                      className={`window-card ${available ? 'available' : paid ? 'sponsored' : 'reserved'}`}
                      key={n}
                      disabled={!available}
                      onClick={() => select('windows', n)}
                    >
                      <span className="window-arch" aria-hidden="true">
                        <span>✣</span>
                        <i />
                        <i />
                      </span>
                      <strong>Window {String(n).padStart(2, '0')}</strong>
                      <span className="status-label">
                        {available
                          ? 'AVAILABLE'
                          : paid
                            ? 'SPONSORED'
                            : 'RESERVED'}
                      </span>
                      <span className="window-cta">
                        {available
                          ? 'Sponsor This Window'
                          : paid
                            ? 'With grateful thanks'
                            : 'Awaiting Donation'}{' '}
                        {available && <ArrowUpRight size={12} />}
                      </span>
                      <small>
                        {available
                          ? money(content.windowAmount)
                          : paid
                            ? 'A lasting gift'
                            : 'Reserved for a giver'}
                      </small>
                    </button>
                  )
                })}
              </div>
            )}
            <div className="privacy-note">
              <ShieldCheck size={16} />
              <span>
                All sponsorships are private. Donor names are never displayed
                publicly.
              </span>
            </div>
            <div className="window-other">
              Prefer to give another amount toward our windows?{' '}
              <button onClick={() => select('windows')}>
                Make a contribution <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
        <section className="section how-section" id="how-it-works">
          <div className="container">
            <div className="eyebrow">A SIMPLE ACT OF LOVE</div>
            <h2>How Your Gift Makes a Difference</h2>
            <div className="steps">
              {[
                [
                  'Choose your gift',
                  'Select a window or a project close to your heart. Every contribution, of any size, is welcome.',
                ],
                [
                  'Make your pledge',
                  'Share your details privately and choose to give online or directly to the church.',
                ],
                [
                  'Complete your contribution',
                  'Use our official church giving page or give in person. The church confirms your gift when received.',
                ],
              ].map(([title, description], i) => (
                <div className="step" key={title}>
                  <span className="step-number">0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
            <div className="giving-note">
              <ShieldCheck size={19} />
              <span>
                Your pledge reserves your sponsorship. Only the church can
                confirm receipt of your contribution.
              </span>
            </div>
          </div>
        </section>
        <section className="support-banner">
          <div className="container">
            <div>
              <span className="eyebrow light">
                BUILT ON FAITH. CARED FOR WITH LOVE.
              </span>
              <h2>A church home for generations to come.</h2>
              <p>Thank you for being part of Holy Nativity’s future.</p>
            </div>
            <a className="button gold-button" href={givingUrl}>
              Support Our Church <Heart size={17} />
            </a>
          </div>
        </section>
      </main>
      <footer id="contact">
        <div className="container footer-main">
          <div className="footer-brand">
            <img src={content.logo} alt="Holy Nativity official logo" />
            <div>
              <h3>Holy Nativity</h3>
              <span>COPTIC ORTHODOX CHURCH</span>
              <p>
                A faithful community.
                <br />A lasting home.
              </p>
            </div>
          </div>
          <div>
            <h4>Our Church</h4>
            <a href="#home">Home</a>
            <a href="#projects">Projects</a>
            <a href="#windows">Sponsor a Window</a>
            <a href={givingUrl}>Giving</a>
            <a href="https://www.hncoc.org/">Main Church Website</a>
            <a href="#contact">Contact</a>
          </div>
          <div>
            <h4>Visit & Connect</h4>
            <p>
              9395 Magnolia Ave
              <br />
              Riverside, CA 92503
            </p>
            <a href="tel:9513329400">(951) 332-9400</a>
            <a href="mailto:HNC@HNCOC.ORG">HNC@HNCOC.ORG</a>
          </div>
          <div className="footer-actions">
            <a className="button outline" href="https://www.hncoc.org/">
              Official Church Website <ArrowUpRight size={15} />
            </a>
            <a className="button" href={givingUrl}>
              Official Giving Page <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Holy Nativity Coptic Orthodox Church
          </span>
          <span>With faith, hope, and love.</span>
        </div>
      </footer>
      <Dialog
        open={!!selection || !!confirmation}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setSelection(null)
            setConfirmation(null)
          }
        }}
      >
        <DialogContent className="pledge-dialog">
          {confirmation ? (
            <div className="confirmation">
              <img src={content.logo} alt="Holy Nativity official logo" />
              <span className="confirmation-check">
                <Check size={22} />
              </span>
              <DialogTitle>Thank You for Supporting Holy Nativity</DialogTitle>
              <DialogDescription>
                You have pledged {money(confirmation.amount)} toward{' '}
                {confirmation.label}.
              </DialogDescription>
              {confirmation.method === 'online' ? (
                <>
                  <p>
                    Complete your gift using Holy Nativity’s official giving
                    page.
                  </p>
                  <a className="button" href={givingUrl}>
                    Continue to Secure Church Giving <ArrowUpRight size={16} />
                  </a>
                  <p className="fine-print">
                    Please use the same contribution amount when completing your
                    donation. If a memo field is available, please include the
                    project name or window number.
                  </p>
                  <div className="notice">
                    Reserved — Awaiting Donation. Your pledge is saved; payment
                    has not yet been confirmed.
                  </div>
                </>
              ) : (
                <p>
                  Your sponsorship has been reserved. Please provide your
                  contribution directly to the church. Once it has been received
                  and confirmed, your sponsorship will be marked complete.
                </p>
              )}
            </div>
          ) : (
            <>
              <span className="eyebrow">YOUR GIFT TO OUR CHURCH</span>
              <DialogTitle>
                {selection?.window
                  ? `Sponsor Window ${String(selection.window).padStart(2, '0')}`
                  : `Support ${project?.name}`}
              </DialogTitle>
              <DialogDescription>
                Make a private pledge to help care for our church home.
              </DialogDescription>
              <form onSubmit={submit}>
                <div className="form-grid">
                  {[
                    ['firstName', 'First Name', 'text'],
                    ['lastName', 'Last Name', 'text'],
                    ['email', 'Email', 'email'],
                    ['phone', 'Phone Number', 'tel'],
                  ].map(([name, label, type]) => (
                    <label key={name}>
                      {label}
                      <input
                        name={name}
                        type={type}
                        required
                        maxLength={name === 'email' ? 254 : 100}
                      />
                    </label>
                  ))}
                </div>
                <label>
                  Project
                  <input value={project?.name || ''} readOnly />
                </label>
                {selection?.window && (
                  <label>
                    Window Number
                    <input
                      readOnly
                      value={String(selection.window).padStart(2, '0')}
                    />
                  </label>
                )}
                <fieldset>
                  <legend>Pledge Amount</legend>
                  {!selection?.window && (
                    <div className="amount-options">
                      {[100, 250, 500, 1000].map((n) => (
                        <button
                          type="button"
                          className={amount === n ? 'selected' : ''}
                          onClick={() => setAmount(n)}
                          key={n}
                        >
                          {money(n)}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          if (project)
                            setAmount(
                              Math.max(
                                1,
                                project.goal -
                                  (data?.totals[project.id]?.confirmed || 0) /
                                    100,
                              ),
                            )
                        }}
                      >
                        Entire remaining amount
                      </button>
                    </div>
                  )}
                  <label>
                    {selection?.window
                      ? 'Window sponsorship amount'
                      : 'Custom Amount ($)'}
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="1000000"
                      required
                      value={amount}
                      readOnly={!!selection?.window}
                      onChange={(e) => setAmount(Number(e.target.value))}
                    />
                  </label>
                </fieldset>
                <label>
                  Optional Message
                  <textarea name="message" maxLength={2000} rows={2} />
                </label>
                <fieldset className="giving-options">
                  <legend>How would you like to give?</legend>
                  <label>
                    <input
                      type="radio"
                      name="method"
                      value="online"
                      defaultChecked
                    />
                    <span>
                      <strong>Donate Online</strong>
                      <small>
                        Complete your contribution securely through Holy
                        Nativity’s official giving page.
                      </small>
                    </span>
                  </label>
                  <label>
                    <input type="radio" name="method" value="in-person" />
                    <span>
                      <strong>Give In Person</strong>
                      <small>
                        I will give my contribution directly to the church.
                      </small>
                    </span>
                  </label>
                </fieldset>
                <label className="acknowledgement">
                  <input type="checkbox" name="acknowledgement" required />
                  <span>
                    I understand that this form records my sponsorship pledge.
                    My sponsorship will be marked complete once Holy Nativity
                    confirms that my contribution has been received.
                  </span>
                </label>
                <input
                  className="honeypot"
                  name="website"
                  tabIndex={-1}
                  aria-hidden="true"
                  autoComplete="off"
                />
                {formError && (
                  <p className="notice" role="alert">
                    {formError}
                  </p>
                )}
                <button
                  className="button full"
                  disabled={busy || !data}
                  type="submit"
                >
                  {busy ? 'Saving Your Pledge…' : 'Reserve My Sponsorship'}{' '}
                  <ArrowRight size={16} />
                </button>
                <p className="fine-print">
                  Your information remains private. No card details are
                  collected here.
                </p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
