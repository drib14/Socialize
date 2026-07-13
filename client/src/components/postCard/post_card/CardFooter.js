import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LikeButton from '../../LikeButton'
import { useSelector, useDispatch } from 'react-redux'
import { likePost, unLikePost, savePost, unSavePost, repostPost } from '../../../redux/actions/postAction'
import ShareModal from '../../ShareModal'
import { BASE_URL } from '../../../utils/config'
import { FaRegComment, FaRegPaperPlane, FaRetweet, FaRegBookmark, FaBookmark } from 'react-icons/fa'
import { customConfirm } from '../../../utils/customAlert'
import Avatar from '../../Avatar'

const CardFooter = ({post, showComments, setShowComments}) => {
    const [isLike, setIsLike] = useState(false)
    const [loadLike, setLoadLike] = useState(false)

    const [isShare, setIsShare] = useState(false)

    const { auth, theme, socket } = useSelector(state => state)
    const dispatch = useDispatch()

    const [saved, setSaved] = useState(false)
    const [saveLoad, setSaveLoad] = useState(false)
    const [showLikesModal, setShowLikesModal] = useState(false)

    // Likes
    useEffect(() => {
        if(post.likes.find(like => like._id === auth.user._id)){
            setIsLike(true)
        }else{
            setIsLike(false)
        }
    }, [post.likes, auth.user._id])

    const handleLike = async () => {
        if(loadLike) return;
        
        setLoadLike(true)
        await dispatch(likePost({post, auth, socket}))
        setLoadLike(false)
    }

    const handleUnLike = async () => {
        if(loadLike) return;

        setLoadLike(true)
        await dispatch(unLikePost({post, auth, socket}))
        setLoadLike(false)
    }


    // Saved
    useEffect(() => {
        if(auth.user.saved.find(id => id === post._id)){
            setSaved(true)
        }else{
            setSaved(false)
        }
    },[auth.user.saved, post._id])

    const handleSavePost = async () => {
        if(saveLoad) return;
        
        setSaveLoad(true)
        await dispatch(savePost({post, auth}))
        setSaveLoad(false)
    }

    const handleUnSavePost = async () => {
        if(saveLoad) return;

        setSaveLoad(true)
        await dispatch(unSavePost({post, auth}))
        setSaveLoad(false)
    }

    const handleRepost = async () => {
        const confirmed = await customConfirm("Do you want to repost this post to your profile?")
        if (confirmed) {
            dispatch(repostPost({post, auth, socket}))
        }
    }

    return (
        <div className="card_footer p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="card_icon_menu d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                    <div className="mr-3">
                        <LikeButton 
                        isLike={isLike}
                        handleLike={handleLike}
                        handleUnLike={handleUnLike}
                        />
                    </div>

                    <Link to={`/post/${post._id}`} className="text-secondary d-flex align-items-center mr-3" title="Comment"
                    onClick={(e) => {
                        if (setShowComments) {
                            e.preventDefault();
                            setShowComments(!showComments);
                        }
                    }}>
                        <FaRegComment style={{ fontSize: '22px', cursor: 'pointer', transition: 'color 0.2s', color: showComments ? 'var(--primary-color)' : '' }} className="icon-hover" />
                    </Link>

                    <FaRegPaperPlane className="text-secondary mr-3" 
                    title="Share"
                    style={{ cursor: 'pointer', fontSize: '22px', transition: 'color 0.2s' }} 
                    onClick={() => setIsShare(!isShare)} />

                    <FaRetweet className="text-secondary" 
                    title="Repost"
                    style={{ cursor: 'pointer', fontSize: '24px', transition: 'color 0.2s' }}
                    onClick={handleRepost} />
                </div>

                {
                    saved 
                    ?  <FaBookmark className="text-primary" style={{ cursor: 'pointer', fontSize: '22px' }}
                    onClick={handleUnSavePost} />

                    :  <FaRegBookmark className="text-secondary" style={{ cursor: 'pointer', fontSize: '22px' }}
                    onClick={handleSavePost} />
                }
            </div>

            <div className="d-flex justify-content-between pt-2 px-1" style={{ fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', opacity: 0.85 }}>
                <span className="font-weight-bold" style={{ cursor: 'pointer', color: 'var(--text-main)' }} onClick={() => setShowLikesModal(true)}>
                    {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                </span>
                
                <span className="font-weight-bold" style={{ cursor: 'pointer', color: 'var(--text-main)' }} onClick={() => setShowComments(!showComments)}>
                    {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                </span>
            </div>

            {
                isShare && <ShareModal url={`${BASE_URL}/post/${post._id}`} theme={theme} />
            }

            {/* Likes list modal */}
            {showLikesModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setShowLikesModal(false)}>
                    <div className="card p-3" style={{
                        width: '320px',
                        maxHeight: '400px',
                        borderRadius: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-lg)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="font-weight-bold mb-0" style={{ color: 'var(--text-main)' }}>Liked By ({post.likes.length})</h6>
                            <button className="btn btn-sm btn-light d-flex align-items-center justify-content-center" style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }} onClick={() => setShowLikesModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <hr className="my-1" style={{ borderColor: 'var(--border-color)' }} />
                        <div style={{ overflowY: 'auto', maxHeight: '280px', paddingRight: '4px' }} className="notify-list-container">
                            {post.likes.length === 0 ? (
                                <div className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>No likes yet</div>
                            ) : (
                                post.likes.map(liker => (
                                    <div key={liker._id || liker} className="d-flex align-items-center mb-2 justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <Avatar src={liker.avatar} size="medium-avatar" />
                                            <div className="ml-2">
                                                <strong className="d-block" style={{ fontSize: '0.85rem', color: 'var(--text-main)', textAlign: 'left' }}>@{liker.username || 'user'}</strong>
                                                <span className="small text-muted" style={{ display: 'block', fontSize: '0.75rem', textAlign: 'left' }}>{liker.fullname || ''}</span>
                                            </div>
                                        </div>
                                        <Link to={`/profile/${liker._id || liker}`} className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.75rem', borderRadius: '8px' }} onClick={() => setShowLikesModal(false)}>
                                            View
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CardFooter
