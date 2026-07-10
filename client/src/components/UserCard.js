import React from 'react'
import Avatar from './Avatar'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const UserCard = ({children, user, border, handleClose, setShowFollowers, setShowFollowing, msg}) => {

    const { theme, auth, online } = useSelector(state => state)

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

    const handleCloseAll = () => {
        if(handleClose) handleClose()
        if(setShowFollowers) setShowFollowers(false)
        if(setShowFollowing) setShowFollowing(false)
    }

    const showMsg = (user) => {
        return(
            <>
                <div style={{filter: theme ? 'invert(1)' : 'invert(0)'}}>
                    {user.text}
                </div>
                {
                    user.media.length > 0 && 
                    <div>
                        {user.media.length} <i className="fas fa-image" />
                    </div>
                }

                {
                    user.call &&
                    <span className="material-icons">
                        {
                            user.call.times === 0
                            ? user.call.video ? 'videocam_off' : 'phone_disabled'
                            : user.call.video ? 'video_camera_front' : 'call'
                        }
                    </span>
                }
            </>
        )
    }


    return (
        <div className={`d-flex p-2 align-items-center justify-content-between w-100 ${border}`}>
            <div>
                <Link to={`/profile/${user._id}`} onClick={handleCloseAll}
                className="d-flex align-items-center">
                    
                    <div className="position-relative">
                        <Avatar src={user.avatar} size="big-avatar" />
                        {
                            ((online.includes(user._id) && isMutualFollower(user._id)) || user._id === auth.user._id) ? (
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
                                user._id !== auth.user._id && !online.includes(user._id) && isMutualFollower(user._id) && user.lastActive && (
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
                                        {getOfflineTime(user.lastActive)}
                                    </span>
                                )
                            )
                        }
                    </div>

                    <div className="ml-1" style={{transform: 'translateY(-2px)'}}>
                        <span className="d-block">{user.fullname}</span>
                        
                        <small style={{opacity: 0.7}}>
                            {
                                msg 
                                ? showMsg(user)
                                : '@' + user.username
                            }
                        </small>
                    </div>
                </Link>
            </div>
            
            {children}
        </div>
    )
}

export default UserCard
