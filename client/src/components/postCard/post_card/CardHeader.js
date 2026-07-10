import React from 'react'
import Avatar from '../../Avatar'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { GLOBALTYPES } from '../../../redux/actions/globalTypes'

dayjs.extend(relativeTime)
import { deletePost } from '../../../redux/actions/postAction'
import { BASE_URL } from '../../../utils/config'
import { customConfirm } from '../../../utils/customAlert'

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

    return (
        <div className="card_header">
            <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                <div className="position-relative">
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
                    <h6 className="m-0">
                        <Link to={`/profile/${post.user._id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                            {post.user.fullname}
                        </Link>
                    </h6>
                    <div className="d-flex align-items-center flex-wrap" style={{ gap: '6px' }}>
                        <span className="text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                            @{post.user.username}
                        </span>
                        {
                            post.location && (
                                <span className="text-primary d-flex align-items-center" style={{ fontSize: '0.75rem', gap: '2px' }}>
                                    <span className="material-icons" style={{ fontSize: '0.9rem' }}>place</span>
                                    {post.location}
                                </span>
                            )
                        }
                        {
                            post.mood && (
                                <span className="text-success" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                                    • {post.mood}
                                </span>
                            )
                        }
                    </div>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                        {dayjs(post.createdAt).fromNow()}
                    </small>
                </div>
            </div>

            <div className="nav-item dropdown">
                <span className="material-icons" id="moreLink" data-toggle="dropdown">
                    more_horiz
                </span>

                <div className="dropdown-menu">
                    {
                        auth.user._id === post.user._id &&
                        <>
                            <div className="dropdown-item" onClick={handleEditPost}>
                                <span className="material-icons">create</span> Edit Post
                            </div>
                            <div className="dropdown-item" onClick={handleDeletePost} >
                                <span className="material-icons">delete_outline</span> Remove Post
                            </div>
                        </>
                    }

                    <div className="dropdown-item" onClick={handleCopyLink}>
                        <span className="material-icons">content_copy</span> Copy Link
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CardHeader
