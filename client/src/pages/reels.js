import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { getDataAPI } from '../utils/fetchData'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'

const Reels = () => {
    const { auth } = useSelector(state => state)
    const [reels, setReels] = useState([])
    const [loading, setLoading] = useState(true)
    const [muted, setMuted] = useState(true)
    const containerRef = useRef(null)

    useEffect(() => {
        const fetchReels = async () => {
            try {
                const res = await getDataAPI('reels_posts', auth.token)
                setReels(res.data.posts || [])
                setLoading(false)
            } catch (err) {
                console.error(err)
                setLoading(false)
            }
        }
        fetchReels()
    }, [auth.token])

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh', color: 'var(--text-main)' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        )
    }

    if (reels.length === 0) {
        return (
            <div className="text-center" style={{ marginTop: '100px', color: 'var(--text-secondary)' }}>
                <i className="fas fa-video mb-3" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                <h3>No Reels Available</h3>
                <p>Upload a video to see it here.</p>
            </div>
        )
    }

    return (
        <div ref={containerRef} className="reels-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: 'calc(100vh - 100px)',
            overflowY: 'scroll',
            scrollSnapType: 'y mandatory',
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        }}>
            {
                reels.map(post => (
                    <ReelItem key={post._id} post={post} muted={muted} setMuted={setMuted} auth={auth} />
                ))
            }
        </div>
    )
}

const ReelItem = ({ post, muted, setMuted, auth }) => {
    const videoRef = useRef(null)
    const [playing, setPlaying] = useState(false)
    const [liked, setLiked] = useState(post.likes.some(like => like._id === auth.user._id))
    const [likesCount, setLikesCount] = useState(post.likes.length)

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.75
        }

        const callback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().catch(() => {})
                    setPlaying(true)
                } else {
                    videoRef.current?.pause()
                    setPlaying(false)
                }
            })
        }

        const observer = new IntersectionObserver(callback, options)
        if (videoRef.current) {
            observer.observe(videoRef.current)
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current)
            }
        }
    }, [])

    const togglePlay = () => {
        if (playing) {
            videoRef.current.pause()
            setPlaying(false)
        } else {
            videoRef.current.play().catch(() => {})
            setPlaying(true)
        }
    }

    const toggleMute = (e) => {
        e.stopPropagation()
        setMuted(!muted)
    }

    const handleLike = () => {
        setLiked(!liked)
        setLikesCount(liked ? likesCount - 1 : likesCount + 1)
    }

    // Video URL fallback checks
    const videoUrl = post.images && post.images.length > 0
        ? (typeof post.images[0] === 'string' ? post.images[0] : post.images[0].url)
        : ''

    return (
        <div className="reel-item" style={{
            scrollSnapAlign: 'start',
            width: '100%',
            height: 'calc(100vh - 120px)',
            minHeight: '560px',
            position: 'relative',
            background: '#000',
            borderRadius: '12px',
            marginBottom: '20px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
        }}>
            <video
                ref={videoRef}
                src={videoUrl}
                loop
                muted={muted}
                onClick={togglePlay}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer'
                }}
            />

            {/* Muted overlay icon badge */}
            <button 
                onClick={toggleMute}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    color: '#fff',
                    padding: '8px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 20
                }}
            >
                <i className={muted ? "fas fa-volume-mute" : "fas fa-volume-up"} />
            </button>

            {/* Bottom Overlay containing username, bio description, tag references */}
            <div className="reel-details" style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                padding: '24px',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                zIndex: 10
            }}>
                <div style={{ flex: 1, paddingRight: '20px' }}>
                    <div className="d-flex align-items-center mb-3">
                        <Link to={`/profile/${post.user._id}`} className="d-flex align-items-center text-white text-decoration-none">
                            <Avatar src={post.user.avatar} size="medium-avatar" />
                            <strong className="ml-2" style={{ fontSize: '0.92rem' }}>{post.user.username}</strong>
                        </Link>
                    </div>
                    <p style={{ fontSize: '0.88rem', margin: 0, wordBreak: 'break-word', opacity: 0.9 }}>
                        {post.content}
                    </p>
                </div>

                {/* Right side floating action cards overlay */}
                <div className="d-flex flex-column align-items-center" style={{ gap: '18px', zIndex: 15 }}>
                    <div className="text-center" style={{ cursor: 'pointer' }} onClick={handleLike}>
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            padding: '10px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '42px',
                            height: '42px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <i className={liked ? "fas fa-heart text-danger" : "far fa-heart"} style={{ fontSize: '1.25rem' }} />
                        </div>
                        <small style={{ fontSize: '0.78rem', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                            {likesCount}
                        </small>
                    </div>

                    <Link to={`/post/${post._id}`} className="text-center text-white text-decoration-none">
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            padding: '10px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '42px',
                            height: '42px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <i className="far fa-comment" style={{ fontSize: '1.25rem' }} />
                        </div>
                        <small style={{ fontSize: '0.78rem', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                            {post.comments.length}
                        </small>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Reels
