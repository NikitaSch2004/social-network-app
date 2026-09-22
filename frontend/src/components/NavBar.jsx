import { Link } from 'react-router-dom'

export default function NavBar({ user, onLogout }) {
  return (
    <nav className="nav-bar">
      <div className="nav-brand">
        <Link to="/">Social Media</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Acasă</Link>
        {user ? <Link to="/following">Urmăriri</Link> : null}
        {user ? <Link to="/my-posts">Postările mele</Link> : null}
        {user ? <Link to={`/profile/${user.username}`}>Profil</Link> : null}
        {!user ? <Link className="nav-action" to="/login">Autentificare</Link> : null}
        {user ? (
          <button className="nav-logout" onClick={onLogout}>
            Deconectare
          </button>
        ) : null}
      </div>
    </nav>
  )
}
