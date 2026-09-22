import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function PostCard({
  post,
  currentUser,
  onLike,
  onReply,
  onEdit,
  onDelete,
  canEdit,
  allowReply = true,
  showComments = true,
  depth = 0,
  nested = false,
}) {
  const [replyText, setReplyText] = useState('')
  const [showReply, setShowReply] = useState(false)

  const [commentsVisible, setCommentsVisible] = useState(showComments)

  const handleSubmitReply = () => {
    if (!replyText.trim()) {
      return
    }
    if (typeof onReply === 'function') {
      onReply(post.id, replyText)
    }
    setReplyText('')
    setShowReply(false)
  }

  const isOwnPost = currentUser && currentUser.username === post.author
  const containerClass = nested ? 'post-card reply-branch' : 'post-card'

  return (
    <div className={containerClass} style={{ marginLeft: nested ? `${depth * 1.5}rem` : 0 }}>
      <div className="post-header">
        <strong>
          {currentUser && currentUser.username === post.author ? (
            post.author
          ) : (
            <Link className="author-link" to={`/profile/${post.author}`}>
              {post.author}
            </Link>
          )}
        </strong>
        <span>{new Date(post.created_at).toLocaleString()}</span>
      </div>
      {post.reply_to ? (
        <div className="post-reply-note">Răspuns la postarea #{post.reply_to}</div>
      ) : null}
      <p>{post.content}</p>
      <div className="post-actions">
        {currentUser && !isOwnPost && typeof onLike === 'function' ? (
          <button onClick={() => onLike(post.id)}>
            {post.liked_by_user ? 'Anulează like' : 'Like'} ({post.likes})
          </button>
        ) : (
          <span className="likes-count">Like-uri: {post.likes}</span>
        )}
        {allowReply && currentUser && typeof onReply === 'function' ? (
          <button onClick={() => setShowReply((value) => !value)}>
            Răspunde ({post.reply_count})
          </button>
        ) : null}
        {post.replies && post.replies.length > 0 ? (
          <button onClick={() => setCommentsVisible((value) => !value)}>
            {commentsVisible ? 'Ascunde comentariile' : 'Arată comentariile'}
          </button>
        ) : null}
        {canEdit && !nested ? (
          <>
            <button onClick={() => onEdit(post)}>Editează</button>
            <button onClick={() => onDelete(post.id)}>Șterge</button>
          </>
        ) : null}
      </div>
      {showReply && allowReply && currentUser ? (
        <div className="reply-form">
          <textarea
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder="Scrie răspunsul tău..."
          />
          <button onClick={handleSubmitReply}>Trimite răspuns</button>
        </div>
      ) : null}
      {commentsVisible && post.replies && post.replies.length > 0 ? (
        <div className="replies-section">
          <div className="replies-title">Comentarii</div>
          {post.replies.map((reply) => (
            <PostCard
              key={reply.id}
              post={reply}
              currentUser={currentUser}
              onLike={onLike}
              onReply={onReply}
              canEdit={false}
              allowReply={allowReply}
              showComments={showComments}
              depth={depth + 1}
              nested={true}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
