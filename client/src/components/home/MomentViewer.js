import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Modal from 'react-modal'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { viewMoment, deleteMoment } from '../../redux/actions/momentAction'
import { addMessage } from '../../redux/actions/messageAction'
import Avatar from '../Avatar'
import { getDataAPI, patchDataAPI } from '../../utils/fetchData'

dayjs.extend(relativeTime)

const MomentViewer = ({ userMoments, onClose, onPrevUser, onNextUser }) => {
    const { auth, socket } = useSelector(state => state)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // Story reply state
    const [replyText, setReplyText] = useState('')
    const [sendingReply, setSendingReply] = useState(false)

    // Share/forward modal state
    const [showShareModal, setShowShareModal] = useState(false)
    const [shareContacts, setShareContacts] = useState([])
    const [shareSearch, setShareSearch] = useState('')

    const { user, moments } = userMoments
    const [activeIndex, setActiveIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [videoDuration, setVideoDuration] = useState(5) // Default to 5s for image fallback
    const [showViewerList, setShowViewerList] = useState(false)
    const [isMuted, setIsMuted] = useState(true)

    const handleVotePoll = async (optionId) => {
        try {
            const res = await patchDataAPI(`moments/${activeMoment._id}/vote`, { optionId }, auth.token)
            if (res.data && res.data.moment) {
                moments[activeIndex] = res.data.moment
                setProgress(0) // reset progress to trigger update
            }
        } catch (err) {
            dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.msg || err.message } })
        }
    }
    
    const activeMoment = moments[activeIndex]
    const timerRef = useRef(null)
    const videoRef = useRef(null)

    // Mark current moment as viewed
    useEffect(() => {
        if (activeMoment && auth.token) {
            // Check if user has already viewed
            const viewerIds = activeMoment.views.map(v => typeof v === 'object' ? v._id : v);
            if (!viewerIds.includes(auth.user._id)) {
                dispatch(viewMoment({ momentId: activeMoment._id, auth }))
            }
        }
    }, [activeIndex, activeMoment, auth, dispatch])

    // Reset progress when index changes
    useEffect(() => {
        setProgress(0)
        setShowViewerList(false)
        if (activeMoment && activeMoment.resource_type === 'video') {
            setVideoDuration(0) // wait for video loadedmetadata to set actual duration
        } else {
            setVideoDuration(5) // 5 seconds default for images
        }
    }, [activeIndex, activeMoment])

    // Handle timer progress bar
    useEffect(() => {
        if (isPaused || !activeMoment) return;

        const durationMs = (activeMoment.resource_type === 'video' && videoDuration > 0) 
            ? videoDuration * 1000 
            : 5000;

        const intervalMs = 50; // Update progress bar every 50ms
        const step = (intervalMs / durationMs) * 100;

        timerRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timerRef.current)
                    handleNext()
                    return 0;
                }
                return prev + step;
            })
        }, intervalMs)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isPaused, activeIndex, videoDuration, activeMoment])

    const handleNext = () => {
        if (activeIndex < moments.length - 1) {
            setActiveIndex(prev => prev + 1)
        } else if (onNextUser) {
            onNextUser()
        } else {
            onClose()
        }
    }

    const handlePrev = () => {
        if (activeIndex > 0) {
            setActiveIndex(prev => prev - 1)
        } else if (onPrevUser) {
            onPrevUser()
        } else {
            onClose()
        }
    }

    const handleMetadata = (e) => {
        if (e.target.duration) {
            setVideoDuration(e.target.duration)
        }
    }

    const handleDelete = (e) => {
        e.stopPropagation()
        if (window.confirm("Are you sure you want to delete this moment?")) {
            dispatch(deleteMoment({ momentId: activeMoment._id, auth }))
            if (moments.length === 1) {
                onClose()
            } else {
                // Advance to next or previous
                if (activeIndex < moments.length - 1) {
                    setProgress(0)
                } else {
                    setActiveIndex(prev => prev - 1)
                }
            }
        }
    }

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext()
            if (e.key === 'ArrowLeft') handlePrev()
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [activeIndex, moments, onNextUser, onPrevUser])

    // Story reply handler
    const handleStoryReply = async () => {
        if (!replyText.trim() || sendingReply) return;
        setSendingReply(true);
        try {
            const msg = {
                sender: auth.user,
                recipient: user._id,
                text: `Replied to your story: "${replyText.trim()}"`,
                media: activeMoment.media ? [{ url: activeMoment.media }] : [],
                createdAt: new Date().toISOString()
            };
            await dispatch(addMessage({ msg, auth, socket }));
            setReplyText('');
            setIsPaused(false);
        } catch (err) {
            console.error(err);
        }
        setSendingReply(false);
    };

    const handleEmojiReaction = async (emoji) => {
        setSendingReply(true);
        try {
            const msg = {
                sender: auth.user,
                recipient: user._id,
                text: `${emoji} reacted to your story`,
                media: activeMoment.media ? [{ url: activeMoment.media }] : [],
                createdAt: new Date().toISOString()
            };
            await dispatch(addMessage({ msg, auth, socket }));
            setIsPaused(false);
        } catch (err) {
            console.error(err);
        }
        setSendingReply(false);
    };

    // Share story to DM handler
    const handleShareStoryToDM = async (contactId) => {
        const msg = {
            sender: auth.user,
            recipient: contactId,
            text: `Shared a story from @${user.username}: ${window.location.origin}/moment/${activeMoment._id}`,
            media: activeMoment.media ? [{ url: activeMoment.media }] : [],
            createdAt: new Date().toISOString()
        };
        await dispatch(addMessage({ msg, auth, socket }));
        setShowShareModal(false);
    };

    // Fetch contacts for share modal
    const openShareModal = async () => {
        setShowShareModal(true);
        setIsPaused(true);
        try {
            const res = await getDataAPI('suggestionsUser', auth.token);
            if (res.data && Array.isArray(res.data.users)) {
                setShareContacts(res.data.users);
            } else {
                // Fallback: use following list
                setShareContacts([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!activeMoment) return null;

    return (
        <div className="moment-viewer-overlay" onClick={onClose}>
            {/* Desktop Left navigation arrow */}
            {
                (onPrevUser || activeIndex > 0) && (
                    <div 
                        className="desktop-nav-arrow left" 
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </div>
                )
            }

            <div className="moment-viewer-content" onClick={(e) => e.stopPropagation()}>
                {/* Top Segmented Progress Bar */}
                <div className="viewer-progress-container">
                    {
                        moments.map((item, idx) => (
                            <div key={item._id} className="viewer-progress-segment">
                                <div 
                                    className={`viewer-progress-fill ${idx < activeIndex ? 'completed' : ''}`}
                                    style={{
                                        width: idx === activeIndex ? `${progress}%` : idx < activeIndex ? '100%' : '0%'
                                    }}
                                ></div>
                            </div>
                        ))
                    }
                </div>

                {/* Header Information overlay */}
                <div className="viewer-header">
                    <div className="viewer-user-info">
                        <Avatar src={user.avatar} size="medium-avatar" />
                        <div>
                            <div className="viewer-username">@{user.username}</div>
                            <div className="viewer-time d-flex align-items-center" style={{ gap: '4px' }}>
                                {dayjs(activeMoment.createdAt).fromNow()}
                                <span style={{ opacity: 0.7 }}>&bull;</span>
                                {activeMoment.visibility === 'followers' && <i className="fas fa-users" title="Followers Only" style={{ fontSize: '0.75rem' }}></i>}
                                {activeMoment.visibility === 'private' && <i className="fas fa-lock" title="Only Me" style={{ fontSize: '0.75rem' }}></i>}
                                {activeMoment.visibility === 'public' && <i className="fas fa-globe" title="Public" style={{ fontSize: '0.75rem' }}></i>}
                            </div>
                        </div>
                    </div>

                    <div className="viewer-actions">
                        {
                            auth.user._id === user._id && (
                                <button className="viewer-btn mr-2" onClick={(e) => { e.stopPropagation(); setIsPaused(true); setShowViewerList(true); }} title="Viewer list" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px 8px', border: 'none', color: '#fff' }}>
                                    <i className="far fa-eye" style={{ fontSize: '0.88rem' }}></i>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{activeMoment.views ? activeMoment.views.length : 0}</span>
                                </button>
                            )
                        }
                        {
                            activeMoment.resource_type === 'video' && (
                                <button className="viewer-btn mr-2" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} title={isMuted ? "Unmute" : "Mute"} style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
                                    <i className={isMuted ? "fas fa-volume-mute" : "fas fa-volume-up"} style={{ fontSize: '1.1rem' }}></i>
                                </button>
                            )
                        }
                        {
                            auth.user._id === user._id && (
                                <button className="viewer-btn text-danger mr-2" onClick={handleDelete} title="Delete Moment">
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            )
                        }
                        {
                            auth.user._id !== user._id && (
                                <button className="viewer-btn mr-2" onClick={(e) => { e.stopPropagation(); openShareModal(); }} title="Share Story" style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
                                    <i className="fas fa-paper-plane" style={{ fontSize: '1rem' }}></i>
                                </button>
                            )
                        }
                        <button className="viewer-btn" onClick={onClose} title="Close">
                            <i className="fas fa-times" style={{ fontSize: '1.4rem' }}></i>
                        </button>
                    </div>
                </div>

                {/* Media Container */}
                <div 
                    className="viewer-media-container"
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    {/* Invisible tap zones for mobile */}
                    <div className="viewer-nav-overlay left" onClick={handlePrev}></div>
                    <div className="viewer-nav-overlay right" onClick={handleNext}></div>

                    {
                        activeMoment.resource_type === 'video' ? (
                            <video 
                                ref={videoRef}
                                src={activeMoment.media} 
                                className="viewer-media"
                                autoPlay 
                                playsInline
                                muted={isMuted}
                                onLoadedMetadata={handleMetadata}
                                onPlay={() => setIsPaused(false)}
                                onPause={() => setIsPaused(true)}
                            />
                        ) : (
                            <img 
                                src={activeMoment.media} 
                                alt="moment" 
                                className="viewer-media" 
                            />
                        )
                    }

                    {/* Story Poll Sticker Overlay */}
                    {
                        activeMoment.poll && activeMoment.poll.question && (
                            <div 
                                style={{
                                    position: 'absolute',
                                    top: '40%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    background: 'rgba(255,255,255,0.92)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    width: '260px',
                                    textAlign: 'center',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                    zIndex: 25,
                                    border: '1px solid rgba(255,255,255,0.4)',
                                    color: '#000'
                                }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '12px' }}>
                                    {activeMoment.poll.question}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {activeMoment.poll.options.map(opt => {
                                        const totalVotes = activeMoment.poll.options.reduce((sum, o) => sum + o.votes.length, 0);
                                        const myVote = opt.votes.includes(auth.user._id);
                                        const hasVoted = activeMoment.poll.options.some(o => o.votes.includes(auth.user._id));
                                        const percent = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;

                                        return (
                                            <button
                                                key={opt._id}
                                                onClick={() => !hasVoted && handleVotePoll(opt._id)}
                                                disabled={hasVoted}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #ddd',
                                                    background: myVote ? 'linear-gradient(45deg, #f09433, #dc2743)' : '#fff',
                                                    color: myVote ? '#fff' : '#000',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold',
                                                    cursor: hasVoted ? 'default' : 'pointer',
                                                    transition: 'all 0.2s',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {hasVoted ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <span>{opt.text}</span>
                                                        <span style={{ fontSize: '0.95rem', color: myVote ? '#fff' : '#0095f6' }}>{percent}%</span>
                                                    </div>
                                                ) : (
                                                    opt.text
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    }

                    {/* Shared Post Card Overlay */}
                    {
                        activeMoment.post && activeMoment.post._id && (
                            <div 
                                className="viewer-shared-post-card"
                                onClick={() => { onClose(); navigate(`/post/${activeMoment.post._id}`); }}
                                style={{
                                    position: 'absolute',
                                    bottom: '80px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '85%',
                                    maxWidth: '340px',
                                    background: 'rgba(255,255,255,0.95)',
                                    backdropFilter: 'blur(12px)',
                                    borderRadius: '16px',
                                    padding: '14px',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                                    zIndex: 20,
                                    border: '1px solid rgba(255,255,255,0.3)'
                                }}
                            >
                                <div className="d-flex align-items-center mb-2">
                                    <Avatar src={activeMoment.post.user?.avatar} size="small-avatar" />
                                    <strong className="ml-2" style={{ fontSize: '0.8rem', color: '#111' }}>
                                        @{activeMoment.post.user?.username}
                                    </strong>
                                </div>
                                <p className="mb-0" style={{ fontSize: '0.78rem', color: '#333', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {activeMoment.post.content || 'View post'}
                                </p>
                                <small style={{ color: '#888', fontSize: '0.7rem' }}>
                                    <i className="fas fa-external-link-alt mr-1" />Tap to view post
                                </small>
                            </div>
                        )
                    }

                    {/* Caption Overlay */}
                    {
                        activeMoment.caption && !activeMoment.post && (
                            <div className="viewer-caption-box">
                                {activeMoment.caption}
                            </div>
                        )
                    }
                </div>

                {/* Story Reply & Quick Emoji Reaction Input Bar */}
                {
                    auth.user._id !== user._id && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(16px)',
                            borderBottomLeftRadius: '20px',
                            borderBottomRightRadius: '20px',
                            borderTop: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {/* Quick Emoji Reactions */}
                            <div className="viewer-emoji-reactions" style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                padding: '12px 16px 6px',
                            }}>
                                {['❤️', '😂', '😮', '😢', '👏', '🔥'].map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleEmojiReaction(emoji)}
                                        disabled={sendingReply}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '1.5rem',
                                            cursor: 'pointer',
                                            transition: 'transform 0.1s',
                                        }}
                                        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(1.3)' }}
                                        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>

                            {/* Text Input */}
                            <div className="viewer-reply-bar" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '6px 16px 14px',
                            }}>
                                <input
                                    type="text"
                                    placeholder={`Reply to @${user.username}...`}
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && replyText.trim()) handleStoryReply();
                                    }}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => { if (!replyText.trim()) setIsPaused(false); }}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(255,255,255,0.15)',
                                        border: '1px solid rgba(255,255,255,0.25)',
                                        borderRadius: '24px',
                                        padding: '10px 16px',
                                        color: '#fff',
                                        fontSize: '0.88rem',
                                        outline: 'none',
                                    }}
                                />
                                <button
                                    disabled={!replyText.trim() || sendingReply}
                                    onClick={handleStoryReply}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: replyText.trim() ? '#0095f6' : 'rgba(255,255,255,0.4)',
                                        cursor: replyText.trim() ? 'pointer' : 'default',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        padding: '6px',
                                        transition: 'color 0.2s',
                                    }}
                                >
                                    <i className="fas fa-paper-plane" />
                                </button>
                            </div>
                        </div>
                    )
                }
            </div>

            {/* Story Viewer list overlay */}
            {showViewerList && (
                <div className="position-absolute" style={{
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(10px)',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    zIndex: 1000,
                    padding: '20px',
                    maxHeight: '60%',
                    overflowY: 'auto',
                    color: '#000',
                    boxShadow: '0 -10px 25px rgba(0,0,0,0.2)'
                }} onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="font-weight-bold mb-0" style={{ fontSize: '1rem', color: '#111' }}>Views ({activeMoment.views ? activeMoment.views.length : 0})</h6>
                        <button className="btn btn-sm btn-light d-flex align-items-center justify-content-center" style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }} 
                                onClick={() => { setShowViewerList(false); setIsPaused(false); }}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <hr className="my-2" style={{ borderColor: '#ddd' }} />
                    
                    {(!activeMoment.views || activeMoment.views.length === 0) ? (
                        <div className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>No views yet</div>
                    ) : (
                        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            {activeMoment.views.map(viewer => (
                                <div key={viewer._id || viewer} className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <Avatar src={viewer.avatar} size="medium-avatar" />
                                        <div className="ml-3">
                                            <strong className="d-block" style={{ fontSize: '0.88rem', color: '#111', textAlign: 'left' }}>@{viewer.username || 'user'}</strong>
                                            <span className="small text-muted" style={{ display: 'block', fontSize: '0.75rem', textAlign: 'left' }}>{viewer.fullname || ''}</span>
                                        </div>
                                    </div>
                                    <Link to={`/profile/${viewer._id || viewer}`} className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.75rem', borderRadius: '8px' }} onClick={() => onClose()}>
                                        View
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Desktop Right navigation arrow */}
            {
                (onNextUser || activeIndex < moments.length - 1) && (
                    <div 
                        className="desktop-nav-arrow right" 
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    >
                        <i className="fas fa-chevron-right"></i>
                    </div>
                )
            }

            {/* Share Story to DM Modal */}
            {showShareModal && (
                <div className="position-absolute" style={{
                    bottom: 0, left: 0, right: 0,
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(10px)',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    zIndex: 1000,
                    padding: '20px',
                    maxHeight: '60%',
                    overflowY: 'auto',
                    color: '#000',
                    boxShadow: '0 -10px 25px rgba(0,0,0,0.2)'
                }} onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="font-weight-bold mb-0" style={{ fontSize: '1rem', color: '#111' }}>Share Story</h6>
                        <button className="btn btn-sm btn-light d-flex align-items-center justify-content-center" style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }}
                                onClick={() => { setShowShareModal(false); setIsPaused(false); }}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <input type="text" placeholder="Search contacts..." className="form-control form-control-sm mb-3"
                           value={shareSearch} onChange={e => setShareSearch(e.target.value)}
                           style={{ borderRadius: '20px', background: '#f0f0f0', border: 'none', padding: '8px 16px' }} />
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {(auth.user.following || [])
                            .filter(f => {
                                if (!shareSearch.trim()) return true;
                                const name = (typeof f === 'object' ? (f.username || f.fullname || '') : '').toLowerCase();
                                return name.includes(shareSearch.toLowerCase());
                            })
                            .map(contact => {
                                const contactId = typeof contact === 'object' ? contact._id : contact;
                                const contactObj = typeof contact === 'object' ? contact : { _id: contact, username: 'User', avatar: '' };
                                return (
                                    <div key={contactId} className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center">
                                            <Avatar src={contactObj.avatar} size="medium-avatar" />
                                            <div className="ml-2">
                                                <strong style={{ fontSize: '0.85rem', color: '#111' }}>@{contactObj.username || 'user'}</strong>
                                            </div>
                                        </div>
                                        <button className="btn btn-sm btn-primary" style={{ borderRadius: '8px', fontSize: '0.75rem' }}
                                                onClick={() => handleShareStoryToDM(contactId)}>
                                            Send
                                        </button>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            )}
        </div>
    )
}

export default MomentViewer
