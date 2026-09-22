import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import { apiFetch } from '../api'

export default function FollowingPage({ currentUser }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/posts/following/')
      setPosts(data)
      setError(null)
    } catch (err) {
      setError(err.error || 'Unable to load following feed')
    } finally {
      setLoading(false)
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
      <h2>Postări de la utilizatorii pe care îi urmărești</h2>
      {!currentUser ? <p>Te rugăm să te autentifici pentru a vedea postările din urmăriri.</p> : null}
      {error ? <div className="error-box">{error}</div> : null}
      {loading ? (
        <p>Se încarcă postările...</p>
      ) : posts.length === 0 ? (
        <p>Nu s-au găsit postări. Urmărește utilizatori pentru a vedea postările lor.</p>
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
