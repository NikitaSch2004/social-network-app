import { useState, useEffect } from 'react'

export default function PostForm({ initialContent = '', onSubmit, submitText = 'Publică' }) {
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!content.trim()) {
      return
    }
    onSubmit(content)
    setContent('')
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Scrie o postare nouă..."
      />
      <button type="submit">{submitText}</button>
    </form>
  )
}
