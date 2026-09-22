import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, setAuth } from '../api'

export default function RegisterPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const data = await apiFetch('/auth/register/', {
        method: 'POST',
        body: { username, password },
      })
      setAuth(data.token, data.username)
      onLogin({ username: data.username })
      navigate('/')
    } catch (err) {
      setError(err.error || 'Registration failed')
    }
  }

  return (
    <div className="page-container auth-shell">
      <h2>Înregistrare</h2>
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
        <label>
          Confirmă parola
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </label>
        <button type="submit">Înregistrare</button>
      </form>
      <div className="auth-alt">
        Ai deja cont? <Link to="/login">Autentifică-te</Link>
      </div>
    </div>
  )
}
