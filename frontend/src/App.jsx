import { useState, useEffect, useCallback } from 'react';
import './index.css';

const API_URL = 'http://localhost:5000/scrape';

// ─── Social platform icons (emoji fallback) ───────────────────────
const SOCIAL_ICONS = {
  Facebook: '📘', Instagram: '📸', Twitter: '🐦',
  YouTube: '▶️', TripAdvisor: '🦉', WhatsApp: '💬', LinkedIn: '💼', other: '🔗'
};

// ─── Sidebar ──────────────────────────────────────────────────────
function Sidebar({ active }) {
  const links = [
    { id: 'agency',    label: 'Agency',     icon: '🏢' },
    { id: 'team',      label: 'Team',        icon: '👥' },
    { id: 'packages',  label: 'Packages',    icon: '🗺️' },
    { id: 'media',     label: 'Rich Media',  icon: '🖼️' },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-label">Navigation</div>
      <ul className="sidebar-nav">
        {links.map(l => (
          <li key={l.id}>
            <a
              href={`#${l.id}`}
              className={active === l.id ? 'active' : ''}
            >
              <span className="sidebar-icon">{l.icon}</span>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// ─── Agency Section ───────────────────────────────────────────────
function AgencySection({ agency }) {
  if (!agency || !agency.name) return <div className="empty-state"><span className="empty-icon">🏢</span>No agency data found.</div>;
  return (
    <div className="agency-card">
      <div>
        <div className="agency-name">{agency.name}</div>
        <div className="agency-tagline">{agency.tagline}</div>
        <p className="agency-desc">{agency.description}</p>
        {agency.social_links?.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Follow Us</div>
            <div className="social-links">
              {agency.social_links.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" className="social-chip">
                  {SOCIAL_ICONS[s.platform] || '🔗'} {s.platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="agency-meta">
        {agency.address && (
          <div className="meta-row">
            <span className="meta-icon">📍</span>
            <div><div className="meta-label">Address</div><div className="meta-value">{agency.address}</div></div>
          </div>
        )}
        {agency.contact && (
          <div className="meta-row">
            <span className="meta-icon">📞</span>
            <div><div className="meta-label">Phone</div><div className="meta-value"><a href={`tel:${agency.contact}`}>{agency.contact}</a></div></div>
          </div>
        )}
        {agency.email && (
          <div className="meta-row">
            <span className="meta-icon">✉️</span>
            <div><div className="meta-label">Email</div><div className="meta-value"><a href={`mailto:${agency.email}`}>{agency.email}</a></div></div>
          </div>
        )}
        {agency.website && (
          <div className="meta-row">
            <span className="meta-icon">🌐</span>
            <div><div className="meta-label">Website</div><div className="meta-value"><a href={agency.website} target="_blank" rel="noreferrer">{agency.website}</a></div></div>
          </div>
        )}
        {agency.city && (
          <div className="meta-row">
            <span className="meta-icon">🏙️</span>
            <div><div className="meta-label">Location</div><div className="meta-value">{[agency.city, agency.state, agency.country].filter(Boolean).join(', ')}</div></div>
          </div>
        )}
        {agency.business_hours && (
          <div className="meta-row">
            <span className="meta-icon">🕐</span>
            <div><div className="meta-label">Hours</div><div className="meta-value">{agency.business_hours}</div></div>
          </div>
        )}
        {/* {agency.pid && (
          <div className="meta-row" style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <span className="meta-icon">🔑</span>
            <div><div className="meta-label">PID</div><div className="meta-value" style={{ fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all', color: 'var(--text-muted)' }}>{agency.pid}</div></div>
          </div>
        )} */}
      </div>
    </div>
  );
}

// ─── Team Section ─────────────────────────────────────────────────
function TeamSection({ team }) {
  if (!team?.length) return <div className="empty-state"><span className="empty-icon">👥</span>No team members found.</div>;
  return (
    <div className="team-grid">
      {team.map((member, i) => (
        <div className="team-card" key={member.pid || i}>
          {member.image
            ? <img src={member.image} alt={member.name} className="team-avatar" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            : null}
          <div className="team-avatar-placeholder" style={{ display: member.image ? 'none' : 'flex' }}>
            {member.name?.charAt(0) || '?'}
          </div>
          <div className="team-name">{member.name}</div>
          <div className="team-role">{member.role}</div>
          {member.bio && <p className="team-bio">{member.bio}</p>}
          {member.social_links?.length > 0 && (
            <div className="social-links" style={{ justifyContent: 'center', marginTop: '0.75rem' }}>
              {member.social_links.map((s, j) => (
                <a key={j} href={s.url} target="_blank" rel="noreferrer" className="social-chip">{SOCIAL_ICONS[s.platform] || '🔗'}</a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Packages Section ─────────────────────────────────────────────
function PackagesSection({ packages }) {
  const [filter, setFilter] = useState('All');

  const types = ['All', ...new Set(packages.map(p => p.tour_type || 'Other').filter(Boolean))];
  const filtered = filter === 'All' ? packages : packages.filter(p => p.tour_type === filter);

  if (!packages?.length) return <div className="empty-state"><span className="empty-icon">🗺️</span>No packages found.</div>;

  return (
    <>
      <div className="pkg-filters">
        {types.map(t => (
          <button key={t} className={`filter-btn${filter === t ? ' active' : ''}`} onClick={() => setFilter(t)}>
            {t} {t === 'All' ? `(${packages.length})` : `(${packages.filter(p => p.tour_type === t).length})`}
          </button>
        ))}
      </div>
      <div className="packages-grid">
        {filtered.map((pkg, i) => (
          <div className="pkg-card" key={pkg.pid || i}>
            {pkg.thumbnail
              ? <img src={pkg.thumbnail} alt={pkg.title} className="pkg-thumb" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
              : null}
            <div className="pkg-thumb-placeholder" style={{ display: pkg.thumbnail ? 'none' : 'flex' }}>🗺️</div>
            <div className="pkg-body">
              <div className="pkg-badges">
                {pkg.tour_type === 'Group Tour' && <span className="pkg-badge badge-group">Group</span>}
                {pkg.tour_type === 'Private Tour' && <span className="pkg-badge badge-private">Private</span>}
                {pkg.category && <span className="pkg-badge badge-cat">{pkg.category}</span>}
              </div>
              <div className="pkg-title">{pkg.title}</div>
              <p className="pkg-desc">{pkg.full_description || pkg.description}</p>
              <div className="pkg-meta-row">
                <span className="pkg-price">{pkg.price || 'Contact for price'}</span>
                {pkg.duration && <span className="pkg-duration">⏱ {pkg.duration}</span>}
              </div>
            </div>
            {pkg.booking_link && (
              <a href={pkg.booking_link} target="_blank" rel="noreferrer" className="pkg-link">
                Book Now →
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Rich Media Section ───────────────────────────────────────────
function RichMediaSection({ richMedia }) {
  const [tab, setTab] = useState('hero');

  const tabs = [
    { id: 'hero',    label: `Hero (${richMedia?.hero_images?.length || 0})` },
    { id: 'gallery', label: `Gallery (${richMedia?.gallery_images?.length || 0})` },
    { id: 'videos',  label: `Videos (${richMedia?.embedded_videos?.length || 0})` },
  ];

  const currentImages = tab === 'hero' ? richMedia?.hero_images : richMedia?.gallery_images;

  return (
    <>
      <div className="media-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`media-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab !== 'videos' ? (
        currentImages?.length > 0
          ? <div className="images-grid">
              {currentImages.map((src, i) => (
                <img key={i} src={src} alt={`${tab}-${i}`} className="gallery-img"
                  onError={e => { e.target.style.display = 'none'; }}
                  onClick={() => window.open(src, '_blank')}
                />
              ))}
            </div>
          : <div className="empty-state"><span className="empty-icon">🖼️</span>No images found in this category.</div>
      ) : (
        richMedia?.embedded_videos?.length > 0
          ? <div className="videos-grid">
              {richMedia.embedded_videos.map((src, i) => (
                <iframe key={i} src={src} className="video-frame" title={`video-${i}`} allowFullScreen frameBorder="0" />
              ))}
            </div>
          : <div className="empty-state"><span className="empty-icon">🎬</span>No embedded videos found.</div>
      )}
    </>
  );
}

// ─── App Root ─────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('agency');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      if (json.error) throw new Error(json.message || 'Scraper returned an error');
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Track scroll position for active sidebar link
  useEffect(() => {
    const handler = () => {
      const sections = ['agency', 'team', 'packages', 'media'];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(id);
          return;
        }
      }
      setActiveSection('agency');
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const meta = data?.metadata;

  return (
    <div className="app-wrapper">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-logo">🗺 Khaki Tours</span>
          <span className="navbar-badge">Scraper Dashboard</span>
        </div>
        <div className="navbar-status">
          <span className={`status-dot${loading ? ' loading' : error ? ' error' : ''}`} />
          {loading ? 'Scraping…' : error ? 'Error' : `Scraped ${meta?.scraped_at ? new Date(meta.scraped_at).toLocaleTimeString() : ''}`}
        </div>
      </nav>

      <div className="layout">
        <Sidebar active={activeSection} />

        <main className="main-content">
          {/* Loading */}
          {loading && (
            <div className="loading-screen">
              <div className="spinner" />
              <div className="loading-text">Scraping khakitours.com…</div>
              <div className="loading-sub">This may take up to 10 seconds</div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <div>
                <div className="error-title">Failed to fetch data</div>
                <div className="error-msg">{error}</div>
                <div className="error-msg" style={{ marginTop: '4px' }}>Make sure the backend server is running on <code>http://localhost:5000</code></div>
                <button className="retry-btn" onClick={fetchData}>↻ Retry</button>
              </div>
            </div>
          )}

          {/* Data */}
          {!loading && data && (
            <>
              {/* Metadata strip */}
              {meta && (
                <div className="meta-strip">
                  <div className="meta-stat">
                    <span className="meta-stat-val">{meta.total_packages ?? 0}</span>
                    <span className="meta-stat-lbl">Packages</span>
                  </div>
                  <div className="meta-stat-sep" />
                  <div className="meta-stat">
                    <span className="meta-stat-val">{meta.total_team_members ?? 0}</span>
                    <span className="meta-stat-lbl">Team</span>
                  </div>
                  <div className="meta-stat-sep" />
                  <div className="meta-stat">
                    <span className="meta-stat-val">{meta.total_images ?? 0}</span>
                    <span className="meta-stat-lbl">Images</span>
                  </div>
                  <div className="meta-stat-sep" />
                  <div className="meta-stat">
                    <span className="meta-stat-val">{meta.scrape_duration_seconds ?? '–'}s</span>
                    <span className="meta-stat-lbl">Scrape time</span>
                  </div>
                  <div className="meta-stat-sep" />
                  <div className="meta-stat">
                    <span className="meta-stat-val" style={{ fontSize: '0.9rem', marginTop: '2px' }}>
                      {meta.scraped_at ? new Date(meta.scraped_at).toLocaleString() : '–'}
                    </span>
                    <span className="meta-stat-lbl">Scraped at</span>
                  </div>
                </div>
              )}

              {/* Agency */}
              <div id="agency" className="section-block">
                <div className="section-header">
                  <span className="section-icon">🏢</span>
                  <h2 className="section-title">Agency Information</h2>
                </div>
                <div className="section-divider" />
                <AgencySection agency={data.agency} />
              </div>

              {/* Team */}
              <div id="team" className="section-block">
                <div className="section-header">
                  <span className="section-icon">👥</span>
                  <h2 className="section-title">Team Members</h2>
                  <span className="section-count">{data.team?.length || 0}</span>
                </div>
                <div className="section-divider" />
                <TeamSection team={data.team} />
              </div>

              {/* Packages */}
              <div id="packages" className="section-block">
                <div className="section-header">
                  <span className="section-icon">🗺️</span>
                  <h2 className="section-title">Tour Packages</h2>
                  <span className="section-count">{data.packages?.length || 0}</span>
                </div>
                <div className="section-divider" />
                <PackagesSection packages={data.packages || []} />
              </div>

              {/* Rich Media */}
              <div id="media" className="section-block">
                <div className="section-header">
                  <span className="section-icon">🖼️</span>
                  <h2 className="section-title">Rich Media</h2>
                </div>
                <div className="section-divider" />
                <RichMediaSection richMedia={data.richMedia} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
