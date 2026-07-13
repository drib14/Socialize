import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createComment } from '../../redux/actions/commentAction'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import Icons from '../Icons'

const InputComment = ({children, post, onReply, setOnReply}) => {
    const [content, setContent] = useState('')
    const [mediaFile, setMediaFile] = useState(null)
    const [mediaPreview, setMediaPreview] = useState('')

    const { auth, socket, theme } = useSelector(state => state)
    const dispatch = useDispatch()

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1024 * 1024 * 10) {
            return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: 'Media size must be less than 10MB.' } });
        }
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
    };

    const handleDiscardMedia = () => {
        setMediaFile(null);
        setMediaPreview('');
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        if(!content.trim() && !mediaFile){
            if(setOnReply) return setOnReply(false);
            return;
        }

        setContent('')
        setMediaFile(null)
        setMediaPreview('')
        
        const newComment = {
            content,
            likes: [],
            user: auth.user,
            createdAt: new Date().toISOString(),
            reply: onReply && onReply.commentId,
            tag: onReply && onReply.user
        }
        
        dispatch(createComment({post, newComment, auth, socket, images: mediaFile ? [mediaFile] : []}))

        if(setOnReply) return setOnReply(false);
    }

    return (
        <div style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
            {
                mediaPreview && (
                    <div className="position-relative px-3 pt-2 d-inline-block" style={{ width: 'fit-content' }}>
                        {
                            mediaFile.type.match(/video/i)
                            ? <video src={mediaPreview} controls style={{ maxHeight: '80px', borderRadius: '8px' }} />
                            : <img src={mediaPreview} alt="preview" style={{ maxHeight: '80px', borderRadius: '8px' }} />
                        }
                        <span className="material-icons text-white position-absolute" 
                              onClick={handleDiscardMedia}
                              style={{
                                  top: '4px',
                                  right: '4px',
                                  cursor: 'pointer',
                                  background: 'rgba(0,0,0,0.6)',
                                  borderRadius: '50%',
                                  fontSize: '16px',
                                  padding: '2px',
                                  lineHeight: '1'
                              }} title="Discard Media">close</span>
                    </div>
                )
            }
            <form className="comment_input d-flex align-items-center p-2 px-3" onSubmit={handleSubmit} style={{ gap: '10px' }} >
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
                        paddingRight: '60px'
                    }} />
                    
                    <div className="d-flex align-items-center" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', gap: '8px' }}>
                        <div className="file_upload position-relative d-flex align-items-center" style={{ cursor: 'pointer' }}>
                            <span className="material-icons text-secondary" style={{ fontSize: '1.25rem' }}>add_photo_alternate</span>
                            <input type="file" accept="image/*,video/*" onChange={handleMediaChange} 
                                   style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                        </div>
                        <Icons setContent={setContent} content={content} theme={theme} />
                    </div>
                </div>

                <button type="submit" className="btn btn-link p-0 d-flex align-items-center justify-content-center" title="Post Comment" 
                        style={{ color: 'var(--primary-color)', width: '32px', height: '32px', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <span className="material-icons" style={{ fontSize: '18px' }}>send</span>
                </button>
            </form>
        </div>
    )
}

export default InputComment
