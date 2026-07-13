import React, { useState, useEffect } from 'react'
import Avatar from '../../Avatar'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

import LikeButton from '../../LikeButton'
import { useSelector, useDispatch } from 'react-redux'
import CommentMenu from './CommentMenu'
import { updateComment, likeComment, unLikeComment } from '../../../redux/actions/commentAction'
import InputComment from '../InputComment'

const CommentCard = ({children, comment, post, commentId}) => {
    const { auth, theme } = useSelector(state => state)
    const dispatch = useDispatch()

    const [content, setContent] = useState('')
    const [readMore, setReadMore] = useState(false)

    const [onEdit, setOnEdit] = useState(false)
    const [isLike, setIsLike] = useState(false)
    const [loadLike, setLoadLike] = useState(false)

    const [onReply, setOnReply] = useState(false)


    useEffect(() => {
        setContent(comment.content)
        setIsLike(false)
        setOnReply(false)
        if(comment.likes.find(like => like._id === auth.user._id)){
            setIsLike(true)
        }
    },[comment, auth.user._id])

    const handleUpdate = () => {
        if(comment.content !== content){
            dispatch(updateComment({comment, post, content, auth}))
            setOnEdit(false)
        }else{
            setOnEdit(false)
        }
    }


    const handleLike = async () => {
        if(loadLike) return;
        setIsLike(true)

        setLoadLike(true)
        await dispatch(likeComment({comment, post, auth}))
        setLoadLike(false)
    }

    const handleUnLike = async () => {
        if(loadLike) return;
        setIsLike(false)

        setLoadLike(true)
        await dispatch(unLikeComment({comment, post, auth}))
        setLoadLike(false)
    }


    const handleReply = () => {
        if(onReply) return setOnReply(false)
        setOnReply({...comment, commentId})
    }

    const styleCard = {
        opacity: comment._id ? 1 : 0.5,
        pointerEvents: comment._id ? 'inherit' : 'none'
    }

    return (
        <div className="comment_card mt-2" style={{ ...styleCard, padding: '0 15px' }}>
            <div className="d-flex align-items-start">
                <Link to={`/profile/${comment.user._id}`} className="mr-2 mt-1">
                    <Avatar src={comment.user.avatar} size="small-avatar" />
                </Link>

                <div className="flex-fill">
                    <div style={{
                        background: 'var(--bg-input)',
                        borderRadius: '16px',
                        padding: '8px 12px',
                        display: 'inline-block',
                        maxWidth: '90%',
                        color: 'var(--text-main)'
                    }}>
                        <Link to={`/profile/${comment.user._id}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem', display: 'block' }}>
                            {comment.user.username}
                        </Link>
                        
                        <div style={{ fontSize: '0.88rem', marginTop: '2px' }}>
                            {
                                onEdit ? (
                                    <textarea className="form-control form-control-sm mt-1" rows="3" value={content}
                                    onChange={e => setContent(e.target.value)} style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', resize: 'none' }} />
                                ) : (
                                    <>
                                        {
                                            comment.tag && comment.tag._id !== comment.user._id &&
                                            <Link to={`/profile/${comment.tag._id}`} className="mr-1 text-primary font-weight-bold" style={{ textDecoration: 'none' }}>
                                                @{comment.tag.username}
                                            </Link>
                                        }
                                        <span>
                                            {
                                                content.length < 100 ? content :
                                                readMore ? content + ' ' : content.slice(0, 100) + '....'
                                            }
                                        </span>
                                        {
                                            content.length > 100 &&
                                            <span className="readMore ml-1" onClick={() => setReadMore(!readMore)} style={{ cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                                {readMore ? 'Hide' : 'Read more'}
                                            </span>
                                        }
                                    </>
                                )
                            }
                        </div>
                    </div>

                    <div className="d-flex align-items-center mt-1 pl-1" style={{ fontSize: '0.75rem' }}>
                        <span className="text-muted mr-3">
                            {dayjs(comment.createdAt).fromNow()}
                        </span>

                        <span className="font-weight-bold text-muted mr-3">
                            {comment.likes.length} likes
                        </span>

                        {
                            onEdit ? (
                                <>
                                    <span className="font-weight-bold text-primary mr-3" onClick={handleUpdate} style={{ cursor: 'pointer' }}>
                                        Save
                                    </span>
                                    <span className="font-weight-bold text-danger" onClick={() => setOnEdit(false)} style={{ cursor: 'pointer' }}>
                                        Cancel
                                    </span>
                                </>
                            ) : (
                                <span className="font-weight-bold text-secondary" onClick={handleReply} style={{ cursor: 'pointer' }}>
                                    {onReply ? 'Cancel' : 'Reply'}
                                </span>
                            )
                        }
                    </div>
                </div>

                <div className="d-flex align-items-center ml-2" style={{ opacity: 0.8 }}>
                    <CommentMenu post={post} comment={comment} setOnEdit={setOnEdit} />
                    <LikeButton isLike={isLike} handleLike={handleLike} handleUnLike={handleUnLike} />
                </div>
            </div>

            {
                onReply &&
                <div className="ml-4 mt-2">
                    <InputComment post={post} onReply={onReply} setOnReply={setOnReply} >
                        <Link to={`/profile/${onReply.user._id}`} className="mr-1 text-primary font-weight-bold" style={{ fontSize: '0.85rem' }}>
                            @{onReply.user.username}:
                        </Link>
                    </InputComment>
                </div>
            }

            {children}
        </div>
    )
}

export default CommentCard
