import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PostForm from '../components/PostForm'
import PostCard from '../components/PostCard'
import { apiFetch } from '../api'

export default function HomePage({ currentUser }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/posts/')
      setPosts(data)
      setError(null)
    } catch (err) {
      setError(err.error || 'Unable to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (content) => {
    try {
      await apiFetch('/posts/create/', { method: 'POST', body: { content } })
      loadPosts()
    } catch (err) {
      setError(err.error || 'Unable to create post')
    }
  }

  const handleLike = async (postId) => {
    try {
      await apiFetch(`/posts/${postId}/like/`, { method: 'POST' })
      loadPosts()
    } catch (err) {
      setError(err.error || 'Unable to like post')
    }
  }

  const handleReply = async (postId, content) => {
    try {
      await apiFetch(`/posts/${postId}/reply/`, { method: 'POST', body: { content } })
      loadPosts()
    } catch (err) {
      setError(err.error || 'Unable to send reply')
    }
  }

  return (
    <div className="page-container">
      <section className="hero-card">
        <div>
          <span className="eyebrow">MiniTweet</span>
          <h1>Vezi ultimele postări într-un feed clar.</h1>
          <p>
            Citește postările comunității și comentariile lor. Autentifică-te pentru a posta, a răspunde și a interacționa.
          </p>
        </div>
        {!currentUser ? (
          <div className="hero-actions">
            <Link className="hero-button" to="/login">
              Autentificare
            </Link>
            <Link className="hero-secondary" to="/register">
              Înscriere
            </Link>
          </div>
        ) : (
          <div className="hero-note">Bine ai revenit, {currentUser.username}!</div>
        )}
      </section>
      {currentUser ? <PostForm onSubmit={handleCreate} /> : null}
      {error ? <div className="error-box">{error}</div> : null}
      {loading ? (
        <p>Se încarcă postările...</p>
      ) : posts.length === 0 ? (
        <p className="no-posts">Nu există postări disponibile.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onLike={handleLike}
            onReply={handleReply}
          />
        ))
      )}
    </div>
  )
}
