import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createComment } from '../../redux/actions/commentAction'
import Icons from '../Icons'

const InputComment = ({children, post, onReply, setOnReply}) => {
    const [content, setContent] = useState('')

    const { auth, socket, theme } = useSelector(state => state)
    const dispatch = useDispatch()

    const handleSubmit = (e) => {
        e.preventDefault()
        if(!content.trim()){
            if(setOnReply) return setOnReply(false);
            return;
        }

        setContent('')
        
        const newComment = {
            content,
            likes: [],
            user: auth.user,
            createdAt: new Date().toISOString(),
            reply: onReply && onReply.commentId,
            tag: onReply && onReply.user
        }
        
        dispatch(createComment({post, newComment, auth, socket}))

        if(setOnReply) return setOnReply(false);
    }

    return (
        <form className="comment_input d-flex align-items-center p-2 px-3" onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', gap: '10px' }} >
            {children}
            <div className="flex-fill position-relative d-flex align-items-center px-3 py-1" 
                 style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '24px' }}>
                <input type="text" placeholder="Write a comment..."
                value={content} onChange={e => setContent(e.target.value)}
                style={{
                    filter: theme ? 'invert(1)' : 'invert(0)',
                    color: 'var(--text-main)',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.85rem',
                    paddingRight: '30px'
                }} />
                
                <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                    <Icons setContent={setContent} content={content} theme={theme} />
                </div>
            </div>

            <button type="submit" className="btn btn-link p-0 d-flex align-items-center justify-content-center" title="Post Comment" 
                    style={{ color: 'var(--primary-color)', width: '32px', height: '32px', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <span className="material-icons" style={{ fontSize: '18px' }}>send</span>
            </button>
        </form>
    )
}

export default InputComment
