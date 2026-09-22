import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import PostForm from '../components/PostForm'
import { apiFetch } from '../api'

export default function MyPostsPage({ currentUser }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingPost, setEditingPost] = useState(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/posts/my/')
      setPosts(data)
      setError(null)
    } catch (err) {
      setError(err.error || 'Unable to load your posts')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (post) => {
    setEditingPost(post)
  }

  const handleDelete = async (postId) => {
    try {
      await apiFetch(`/posts/${postId}/`, { method: 'DELETE' })
      loadPosts()
    } catch (err) {
      setError(err.error || 'Unable to delete post')
    }
  }

  const handleUpdate = async (content) => {
    try {
      await apiFetch(`/posts/${editingPost.id}/`, { method: 'PUT', body: { content } })
      setEditingPost(null)
      loadPosts()
    } catch (err) {
      setError(err.error || 'Unable to update post')
    }
  }

  return (
    <div className="page-container">
      <h2>Postările mele</h2>
      {!currentUser ? (
        <p>Te rugăm să te autentifici pentru a vedea postările tale.</p>
      ) : (
        <>
          {editingPost ? (
            <div className="edit-box">
              <h3>Editează postarea</h3>
              <PostForm
                initialContent={editingPost.content}
                onSubmit={handleUpdate}
                submitText="Salvează"
              />
              <button className="secondary-button" onClick={() => setEditingPost(null)}>
                Anulează
              </button>
            </div>
          ) : null}
          {error ? <div className="error-box">{error}</div> : null}
          {loading ? (
            <p>Se încarcă postările...</p>
          ) : posts.length === 0 ? (
            <p>Nu ai creat încă nicio postare.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={true}
                allowReply={false}
                showComments={false}
              />
            ))
          )}
        </>
      )}
    </div>
  )
}
