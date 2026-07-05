import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = login(email.trim(), password);
      if (result.success && result.user?.role === 'admin') {
        navigate('/admin');
      } else if (result.success) {
        setError('Access denied — you are not an admin.');
      } else {
        setError(result.message || 'Invalid credentials.');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div style={styles.page}>
      {/* Blurred background shapes */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.iconWrap}>
          <span style={{ fontSize: '2rem' }}>🛡️</span>
        </div>

        <h2 style={styles.title}>Admin Portal</h2>
        <p style={styles.subtitle}>Sign in to access the admin panel</p>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              id="adminEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@shopease.com"
              required
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              id="adminPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
            />
          </div>

          <button
            id="adminLoginBtn"
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? '⏳ Signing in…' : '🔐 Sign In to Admin'}
          </button>
        </form>

        <p style={styles.hint}>
          Not an admin? <Link to="/login" style={styles.link}>User Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', top: '-100px', left: '-100px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
    filter: 'blur(40px)', pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: '-100px', right: '-100px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
    filter: 'blur(40px)', pointerEvents: 'none',
  },
  card: {
    background: 'rgba(15,23,42,0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    position: 'relative',
    zIndex: 1,
  },
  iconWrap: {
    width: '64px', height: '64px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.2rem',
    boxShadow: '0 0 30px rgba(99,102,241,0.5)',
  },
  title: {
    color: '#f1f5f9', fontFamily: "'Inter', sans-serif",
    textAlign: 'center', marginBottom: '0.3rem', fontSize: '1.6rem', fontWeight: 700,
  },
  subtitle: {
    color: '#94a3b8', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
    color: '#fca5a5', borderRadius: '10px', padding: '0.75rem 1rem',
    marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center',
  },
  field: { marginBottom: '1.2rem' },
  label: {
    display: 'block', color: '#94a3b8', fontSize: '0.825rem',
    fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(30,41,59,0.8)', border: '1px solid #334155',
    borderRadius: '10px', padding: '0.75rem 1rem', color: '#f1f5f9',
    fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s',
    fontFamily: "'Inter', sans-serif",
  },
  btn: {
    width: '100%', padding: '0.85rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', border: 'none', borderRadius: '10px',
    fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
    fontFamily: "'Inter', sans-serif",
    marginTop: '0.5rem',
  },
  hint: { color: '#64748b', textAlign: 'center', marginTop: '1.2rem', fontSize: '0.875rem' },
  link: { color: '#818cf8', textDecoration: 'none', fontWeight: 600 },
};

export default AdminLogin;
