import React from 'react'
import Avatar from '../../Avatar'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { GLOBALTYPES } from '../../../redux/actions/globalTypes'

dayjs.extend(relativeTime)
import { deletePost, pinPost } from '../../../redux/actions/postAction'
import { BASE_URL } from '../../../utils/config'
import { customConfirm } from '../../../utils/customAlert'
import { getMoodIcon } from '../../../utils/moods'

const CardHeader = ({post}) => {
    const { auth, socket, online } = useSelector(state => state)
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const isMutualFollower = (userId) => {
        if (!auth.user || !auth.user.following || !auth.user.followers) return false;
        const targetId = typeof userId === 'object' ? (userId._id || userId) : userId;
        const isFollowing = auth.user.following.some(item => {
            const id = typeof item === 'object' ? (item._id || item) : item;
            return id.toString() === targetId.toString();
        });
        const isFollower = auth.user.followers.some(item => {
            const id = typeof item === 'object' ? (item._id || item) : item;
            return id.toString() === targetId.toString();
        });
        return isFollowing && isFollower;
    }

    const getOfflineTime = (lastActive) => {
        if (!lastActive) return '';
        const diff = new Date().getTime() - new Date(lastActive).getTime();
        if (diff < 0) return '<1m';
        
        const minutes = Math.floor(diff / 1000 / 60);
        if (minutes < 1) return '<1m';
        if (minutes < 60) return `${minutes}m`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d`;
        
        const months = Math.floor(days / 30);
        if (months < 12) return `${months}mo`;
        
        const years = Math.floor(months / 12);
        return `${years}y`;
    };

    const handleEditPost = () => {
        dispatch({ type: GLOBALTYPES.STATUS, payload: {...post, onEdit: true}})
    }

    const handleDeletePost = async () => {
        const confirmed = await customConfirm("Are you sure you want to delete this post?")
        if(confirmed){
            dispatch(deletePost({post, auth, socket}))
            return navigate("/")
        }
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${BASE_URL}/post/${post._id}`)
    }

    const handlePinPost = () => {
        dispatch(pinPost({post, auth}))
    }

    const getPostTypeIcon = (post) => {
        if (post.repostOf) {
            const hasContent = post.content && post.content.trim().length > 0;
            if (hasContent) {
                return <i className="fas fa-quote-right ml-2" style={{ fontSize: '0.78rem', color: '#ff9f43' }} title="Quote Repost"></i>;
            }
            return <i className="fas fa-retweet ml-2" style={{ fontSize: '0.78rem', color: '#00d2d3' }} title="Repost"></i>;
        }
        if (post.poll && post.poll.question) {
            return <i className="fas fa-poll ml-2" style={{ fontSize: '0.78rem', color: '#9b5de5' }} title="Poll Post"></i>;
        }
        if (post.images && post.images.length > 0) {
            const hasVideo = post.images.some(img => img.resource_type === 'video' || (typeof img.url === 'string' && img.url.match(/video/i)));
            if (hasVideo) {
                return <i className="fas fa-video ml-2" style={{ fontSize: '0.78rem', color: '#54a0ff' }} title="Video Post"></i>;
            }
            return <i className="fas fa-images ml-2" style={{ fontSize: '0.78rem', color: '#10ac84' }} title="Media Post"></i>;
        }
        return <i className="fas fa-file-alt ml-2" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} title="Text Post"></i>;
    }

    const getVisibilityIcon = (visibility) => {
        if (visibility === 'followers') return <i className="fas fa-users text-muted ml-1" style={{ fontSize: '0.78rem' }} title="Followers Only"></i>;
        if (visibility === 'private') return <i className="fas fa-lock text-muted ml-1" style={{ fontSize: '0.78rem' }} title="Only Me"></i>;
        return <i className="fas fa-globe text-muted ml-1" style={{ fontSize: '0.78rem' }} title="Public"></i>;
    }

    return (
        <div className="card_header d-flex justify-content-between align-items-center p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center">
                <div className="position-relative mr-2">
                    <Avatar src={post.user.avatar} size="big-avatar" />
                    {
                        ((online.includes(post.user._id) && isMutualFollower(post.user._id)) || post.user._id === auth.user._id) ? (
                            <span className="position-absolute" style={{
                                width: '12px',
                                height: '12px',
                                background: '#2b8a3e',
                                border: '2px solid var(--bg-card)',
                                borderRadius: '50%',
                                bottom: '2px',
                                right: '2px',
                                boxShadow: '0 0 0 2px rgba(43,138,62,0.2)'
                            }} />
                        ) : (
                            post.user._id !== auth.user._id && !online.includes(post.user._id) && isMutualFollower(post.user._id) && post.user.lastActive && (
                                <span className="position-absolute d-flex align-items-center justify-content-center text-white font-weight-bold" style={{
                                    minWidth: '18px',
                                    height: '18px',
                                    background: '#6b7280',
                                    border: '2px solid var(--bg-card)',
                                    borderRadius: '9px',
                                    bottom: '-2px',
                                    right: '-4px',
                                    padding: '0 4px',
                                    fontSize: '8px',
                                    lineHeight: '1',
                                    pointerEvents: 'none'
                                }}>
                                    {getOfflineTime(post.user.lastActive)}
                                </span>
                            )
                        )
                    }
                </div>

                <div className="card_name">
                    <h6 className="m-0" style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                        <Link to={`/profile/${post.user._id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                            {post.user.fullname}
                        </Link>
                    </h6>
                    <div className="d-flex align-items-center flex-wrap mt-1">
                        <span className="text-muted mr-2" style={{ fontSize: '0.8rem' }}>
                            @{post.user.username}
                        </span>
                        {
                            post.location && (
                                <span className="text-primary d-flex align-items-center mr-2" style={{ fontSize: '0.75rem' }}>
                                    <span className="material-icons mr-1" style={{ fontSize: '0.85rem' }}>place</span>
                                    {post.location}
                                </span>
                            )
                        }
                        {
                            post.mood && (
                                <span className="text-success d-flex align-items-center" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                                    • {getMoodIcon(post.mood) && <i className={`${getMoodIcon(post.mood)} mr-1`}></i>} {post.mood}
                                </span>
                            )
                        }
                    </div>
                    <small className="text-muted d-flex align-items-center mt-1" style={{ fontSize: '0.75rem' }}>
                        <span>{dayjs(post.createdAt).fromNow()}</span>
                        <span className="mx-1">•</span>
                        {getVisibilityIcon(post.visibility)}
                        {getPostTypeIcon(post)}
                        {post.isPinned && (
                            <>
                                <span className="mx-1">•</span>
                                <span className="text-success d-flex align-items-center" style={{ fontWeight: 'bold' }}>
                                    <i className="fas fa-thumbtack mr-1" style={{ fontSize: '0.75rem' }} /> Pinned
                                </span>
                            </>
                        )}
                    </small>
                </div>
            </div>

            <div className="nav-item dropdown">
                <span className="material-icons text-secondary" id="moreLink" data-toggle="dropdown" style={{ cursor: 'pointer' }}>
                    more_horiz
                </span>

                <div className="dropdown-menu dropdown-menu-right" style={{ borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    {
                        auth.user._id === post.user._id &&
                        <>
                            <div className="dropdown-item d-flex align-items-center py-2" onClick={handlePinPost} style={{ cursor: 'pointer' }}>
                                <span className="material-icons mr-2" style={{ fontSize: '1.2rem' }}>push_pin</span> {post.isPinned ? 'Unpin from Profile' : 'Pin to Profile'}
                            </div>
                            <div className="dropdown-item d-flex align-items-center py-2" onClick={handleEditPost} style={{ cursor: 'pointer' }}>
                                <span className="material-icons mr-2" style={{ fontSize: '1.2rem' }}>create</span> Edit Post
                            </div>
                            <div className="dropdown-item d-flex align-items-center py-2 text-danger" onClick={handleDeletePost} style={{ cursor: 'pointer' }}>
                                <span className="material-icons mr-2" style={{ fontSize: '1.2rem' }}>delete_outline</span> Remove Post
                            </div>
                            <div className="dropdown-divider"></div>
                        </>
                    }

                    <div className="dropdown-item d-flex align-items-center py-2" onClick={handleCopyLink} style={{ cursor: 'pointer' }}>
                        <span className="material-icons mr-2" style={{ fontSize: '1.2rem' }}>content_copy</span> Copy Link
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CardHeader
