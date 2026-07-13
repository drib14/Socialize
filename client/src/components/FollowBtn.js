import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { follow, unfollow, blockUser, unblockUser } from '../redux/actions/profileAction'

const FollowBtn = ({user}) => {
    const [followed, setFollowed] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [isBlocked, setIsBlocked] = useState(false)

    const { auth, profile, socket } = useSelector(state => state)
    const dispatch = useDispatch()
    const [load, setLoad] = useState(false)

    useEffect(() => {
        if(auth.user.following.some(item => item._id === user._id)){
            setFollowed(true)
        } else {
            setFollowed(false)
        }
        
        setIsPending(!!user.isPendingRequest)
        
        const blockedUsersList = auth.user.blockedUsers || []
        setIsBlocked(blockedUsersList.some(id => (id._id || id) === user._id) || !!user.isBlockedByMe)
    }, [auth.user.following, auth.user.blockedUsers, user._id, user.isPendingRequest, user.isBlockedByMe])

    const handleFollow = async () => {
        if(load) return;
        setLoad(true)
        await dispatch(follow({users: profile.users, user, auth, socket}))
        setLoad(false)
    }

    const handleUnFollow = async () => {
        if(load) return;
        setLoad(true)
        await dispatch(unfollow({users: profile.users, user, auth, socket}))
        setLoad(false)
    }

    const handleBlock = async () => {
        if(load) return;
        if(window.confirm(`Are you sure you want to block ${user.username}?`)) {
            setLoad(true)
            await dispatch(blockUser({user, auth, socket}))
            setLoad(false)
        }
    }

    const handleUnblock = async () => {
        if(load) return;
        setLoad(true)
        await dispatch(unblockUser({user, auth}))
        setLoad(false)
    }

    // Determine if follow back is possible
    const followsMe = user.following && user.following.some(item => (item._id || item) === auth.user._id)

    return (
        <div className="d-flex align-items-center gap-2">
            {
                isBlocked ? (
                    <button className="btn btn-outline-success d-flex align-items-center gap-1"
                    onClick={handleUnblock} disabled={load}>
                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>check_circle</span>
                        Unblock
                    </button>
                ) : followed ? (
                    <div className="dropdown">
                        <button className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1"
                        id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" disabled={load}>
                            <span className="material-icons" style={{ fontSize: '1.2rem' }}>check</span>
                            Following
                        </button>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleUnFollow}>
                                <span className="material-icons">person_remove</span> Unfollow
                            </button>
                            <button className="dropdown-item text-dark d-flex align-items-center gap-2" onClick={handleBlock}>
                                <span className="material-icons">block</span> Block User
                            </button>
                        </div>
                    </div>
                ) : isPending ? (
                    <button className="btn btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={handleUnFollow} disabled={load} title="Cancel Follow Request">
                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>hourglass_empty</span>
                        Requested
                    </button>
                ) : (
                    <div className="d-flex gap-2">
                        <button className="btn btn-success d-flex align-items-center gap-1"
                        onClick={handleFollow} disabled={load}>
                            <span className="material-icons" style={{ fontSize: '1.2rem' }}>person_add</span>
                            {followsMe ? 'Follow Back' : 'Follow'}
                        </button>
                        <button className="btn btn-outline-danger d-flex align-items-center gap-1"
                        onClick={handleBlock} disabled={load} title="Block User">
                            <span className="material-icons" style={{ fontSize: '1.2rem' }}>block</span>
                        </button>
                    </div>
                )
            }
        </div>
    )
}

export default FollowBtn
