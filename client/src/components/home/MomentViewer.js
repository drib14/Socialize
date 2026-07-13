import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Modal from 'react-modal'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { viewMoment, deleteMoment } from '../../redux/actions/momentAction'
import Avatar from '../Avatar'

dayjs.extend(relativeTime)

const MomentViewer = ({ userMoments, onClose, onPrevUser, onNextUser }) => {
    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()

    const { user, moments } = userMoments
    const [activeIndex, setActiveIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [videoDuration, setVideoDuration] = useState(5) // Default to 5s for image fallback
    const [showViewerList, setShowViewerList] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    
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

                    {/* Caption Overlay */}
                    {
                        activeMoment.caption && (
                            <div className="viewer-caption-box">
                                {activeMoment.caption}
                            </div>
                        )
                    }
                </div>
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
        </div>
    )
}

export default MomentViewer
