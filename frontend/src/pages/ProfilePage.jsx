import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { apiFetch } from '../api'

export default function ProfilePage({ currentUser }) {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await apiFetch(`/users/${username}/`)
      setProfile(data)
      setError(null)
    } catch (err) {
      setError(err.error || 'Unable to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      await apiFetch(`/follow/${username}/`, { method: 'POST' })
      loadProfile()
    } catch (err) {
      setError(err.error || 'Unable to update follow status')
    }
  }

  const handleLike = async (postId) => {
    try {
      await apiFetch(`/posts/${postId}/like/`, { method: 'POST' })
      loadProfile()
    } catch (err) {
      setError(err.error || 'Unable to like post')
    }
  }

  const handleReply = async (postId, content) => {
    try {
      await apiFetch(`/posts/${postId}/reply/`, { method: 'POST', body: { content } })
      loadProfile()
    } catch (err) {
      setError(err.error || 'Unable to reply')
    }
  }

  return (
    <div className="page-container">
      <h2>Profil utilizator</h2>
      {loading ? (
        <p>Se încarcă profilul...</p>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : profile ? (
        <>
          <div className="profile-header">
            <strong>{profile.username}</strong>
            <div>
              <span>{profile.followers} urmăritori</span>
              <span>{profile.following} urmăriți</span>
            </div>
          </div>
          {currentUser && !profile.is_self ? (
            <button className="action-button" onClick={handleFollow}>
              {profile.is_followed ? 'Încetează urmărirea' : 'Urmărește'}
            </button>
          ) : null}
          <h3>Postări</h3>
          {profile.posts.length === 0 ? (
            <p>Nu există postări.</p>
          ) : (
            profile.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onLike={handleLike}
                canEdit={false}
                allowReply={false}
              />
            ))
          )}
        </>
      ) : (
        <p>Profilul nu a fost găsit.</p>
      )}
    </div>
  )
}
