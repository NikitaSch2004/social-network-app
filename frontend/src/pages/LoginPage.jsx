import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, setAuth } from '../api'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      const data = await apiFetch('/auth/login/', { method: 'POST', body: { username, password } })
      setAuth(data.token, data.username)
      onLogin({ username: data.username })
      navigate('/')
    } catch (err) {
      setError(err.error || 'Login failed')
    }
  }

  return (
    <div className="page-container auth-shell">
      <h2>Autentificare</h2>
      {error ? <div className="error-box">{error}</div> : null}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Nume utilizator
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Parolă
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Autentificare</button>
      </form>
      <div className="auth-alt">
        Nu ai cont? <Link to="/register">Înscrie-te</Link>
      </div>
    </div>
  )
}
