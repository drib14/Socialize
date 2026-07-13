import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LikeButton from '../../LikeButton'
import { useSelector, useDispatch } from 'react-redux'
import { likePost, unLikePost, savePost, unSavePost, repostPost, recordPostView } from '../../../redux/actions/postAction'
import { addMessage } from '../../../redux/actions/messageAction'
import { GLOBALTYPES } from '../../../redux/actions/globalTypes'
import { createMoment } from '../../../redux/actions/momentAction'
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
    const [showForwardModal, setShowForwardModal] = useState(false)
    const [showViewsModal, setShowViewsModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Record views impression on mount
    useEffect(() => {
        if (auth.token && post._id && post.user._id !== auth.user._id) {
            dispatch(recordPostView({post, auth}))
        }
    }, [dispatch, post._id, auth.token, post.user._id, auth.user._id])

    const handleForwardPost = (targetUser) => {
        const msg = {
            sender: auth.user._id,
            recipient: targetUser._id,
            text: `${auth.user.username} shared a post: ${BASE_URL}/post/${post._id}`,
            media: [],
            createdAt: new Date().toISOString()
        }
        dispatch(addMessage({msg, auth, socket}))
        dispatch({ type: GLOBALTYPES.ALERT, payload: {success: `Forwarded to @${targetUser.username}!`} })
        setShowForwardModal(false)
    }

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

    const handleInstantRepost = async () => {
        const confirmed = await customConfirm("Do you want to repost this post to your profile?")
        if (confirmed) {
            dispatch(repostPost({post, auth, socket}))
        }
    }

    const handleQuoteRepost = () => {
        dispatch({ type: GLOBALTYPES.STATUS, payload: { repostOf: post } })
    }

    const handleShareToStory = () => {
        dispatch(createMoment({
            caption: `Check out this post!`,
            visibility: 'followers',
            post: post._id,
            auth
        }))
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
                    title="Share to Direct Message"
                    style={{ cursor: 'pointer', fontSize: '22px', transition: 'color 0.2s' }} 
                    onClick={() => setShowForwardModal(true)} />

                    <div className="dropdown d-inline-block">
                        <FaRetweet className="text-secondary dropdown-toggle" 
                        id="repostDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                        title="Repost Options"
                        style={{ cursor: 'pointer', fontSize: '24px', transition: 'color 0.2s' }} />
                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="repostDropdown" style={{ borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                            <div className="dropdown-item d-flex align-items-center py-2" onClick={handleInstantRepost} style={{ cursor: 'pointer' }}>
                                <i className="fas fa-retweet mr-2 text-success" /> Repost
                            </div>
                            <div className="dropdown-item d-flex align-items-center py-2" onClick={handleQuoteRepost} style={{ cursor: 'pointer' }}>
                                <i className="fas fa-edit mr-2 text-info" /> Quote Post
                            </div>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-item d-flex align-items-center py-2" onClick={handleShareToStory} style={{ cursor: 'pointer' }}>
                                <i className="fas fa-bolt mr-2 text-warning" /> Share to Story
                            </div>
                        </div>
                    </div>
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

                <span className="font-weight-bold" 
                      style={{ cursor: post.user._id === auth.user._id ? 'pointer' : 'default', color: 'var(--text-main)' }} 
                      onClick={() => post.user._id === auth.user._id && setShowViewsModal(true)}>
                    {post.views ? post.views.length : 0} {post.views && post.views.length === 1 ? 'view' : 'views'}
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

            {/* Views list modal */}
            {showViewsModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setShowViewsModal(false)}>
                    <div className="card p-3" style={{
                        width: '320px',
                        maxHeight: '400px',
                        borderRadius: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-lg)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="font-weight-bold mb-0" style={{ color: 'var(--text-main)' }}>Viewed By ({post.views ? post.views.length : 0})</h6>
                            <button className="btn btn-sm btn-light d-flex align-items-center justify-content-center" style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }} onClick={() => setShowViewsModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <hr className="my-1" style={{ borderColor: 'var(--border-color)' }} />
                        <div style={{ overflowY: 'auto', maxHeight: '280px', paddingRight: '4px' }} className="notify-list-container">
                            {!post.views || post.views.length === 0 ? (
                                <div className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>No impressions yet</div>
                            ) : (
                                post.views.map(viewer => (
                                    <div key={viewer._id || viewer} className="d-flex align-items-center mb-2 justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <Avatar src={viewer.avatar} size="medium-avatar" />
                                            <div className="ml-2">
                                                <strong className="d-block" style={{ fontSize: '0.85rem', color: 'var(--text-main)', textAlign: 'left' }}>@{viewer.username || 'user'}</strong>
                                                <span className="small text-muted" style={{ display: 'block', fontSize: '0.75rem', textAlign: 'left' }}>{viewer.fullname || ''}</span>
                                            </div>
                                        </div>
                                        <Link to={`/profile/${viewer._id || viewer}`} className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.75rem', borderRadius: '8px' }} onClick={() => setShowViewsModal(false)}>
                                            View
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Send to Direct Message Modal */}
            {showForwardModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setShowForwardModal(false)}>
                    <div className="card p-3" style={{
                        width: '350px',
                        maxHeight: '450px',
                        borderRadius: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-lg)',
                        display: 'flex',
                        flexDirection: 'column'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="font-weight-bold mb-0" style={{ color: 'var(--text-main)' }}>Send to Direct Message</h6>
                            <button className="btn btn-sm btn-light d-flex align-items-center justify-content-center" style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }} onClick={() => setShowForwardModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <input type="text" className="form-control form-control-sm mb-3" placeholder="Search contacts..." 
                               value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                               style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '20px' }} />
                        <hr className="my-1" style={{ borderColor: 'var(--border-color)' }} />
                        
                        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }} className="notify-list-container">
                            {auth.user.following.length === 0 ? (
                                <div className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>No contacts found</div>
                            ) : (
                                auth.user.following
                                .filter(contact => 
                                    contact.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    contact.fullname.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map(contact => (
                                    <div key={contact._id} className="d-flex align-items-center mb-2 justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <Avatar src={contact.avatar} size="medium-avatar" />
                                            <div className="ml-2">
                                                <strong className="d-block" style={{ fontSize: '0.85rem', color: 'var(--text-main)', textAlign: 'left' }}>@{contact.username}</strong>
                                                <span className="small text-muted" style={{ display: 'block', fontSize: '0.75rem', textAlign: 'left' }}>{contact.fullname}</span>
                                            </div>
                                        </div>
                                        <button className="btn btn-sm btn-primary" style={{ fontSize: '0.75rem', borderRadius: '20px', padding: '4px 12px' }} onClick={() => handleForwardPost(contact)}>
                                            Send
                                        </button>
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
