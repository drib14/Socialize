import React from 'react'
import Avatar from './Avatar'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const UserCard = ({children, user, border, handleClose, setShowFollowers, setShowFollowing, msg}) => {

    const { theme, auth, online } = useSelector(state => state)

    const isMutualFollower = (userId) => {
        if (!auth.user || !auth.user.following || !auth.user.followers) return false;
        const isFollowing = auth.user.following.some(item => (item._id ? item._id === userId : item === userId));
        const isFollower = auth.user.followers.some(item => (item._id ? item._id === userId : item === userId));
        return isFollowing && isFollower;
    }

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
                            online.includes(user._id) && isMutualFollower(user._id) &&
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
