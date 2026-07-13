import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Avatar from '../Avatar'
import EditProfile from './Info/EditProfile'
import FollowBtn from '../FollowBtn'
import Followers from './Info/Followers'
import Following from './Info/Following'
import CreateMomentModal from '../home/CreateMomentModal'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import Fleets from './Fleets'

const Info = ({id, auth, profile, dispatch}) => {
    const { online } = useSelector(state => state)
    const [userData, setUserData] = useState([])
    const [onEdit, setOnEdit] = useState(false)
    const [onAddMoment, setOnAddMoment] = useState(false)

    const [showFollowers, setShowFollowers] = useState(false)
    const [showFollowing, setShowFollowing] = useState(false)
    const [postsCount, setPostsCount] = useState(0)

    useEffect(() => {
        profile.posts.forEach(data => {
            if (data._id === id) {
                setPostsCount(data.posts.length)
            }
        })
    }, [profile.posts, id])

    useEffect(() => {
        if(id === auth.user._id){
            setUserData([auth.user])
        }else{
            const newData = profile.users.filter(user => user._id === id)
            setUserData(newData)
        }
    }, [id, auth, dispatch, profile.users])


    useEffect(() => {
        if(showFollowers || showFollowing || onEdit){
            dispatch({ type: GLOBALTYPES.MODAL, payload: true})
        }else{
            dispatch({ type: GLOBALTYPES.MODAL, payload: false})
        }
    },[showFollowers, showFollowing, onEdit, dispatch])
    

    return (
        <div className="info">
            {
                userData.map(user => (
                    <div className="info_container" key={user._id}>
                        <div className="position-relative" style={{ width: 'fit-content' }}>
                            <Avatar src={user.avatar} size="supper-avatar" />
                            {
                                (online.includes(user._id) || user._id === auth.user._id) && (
                                    <span className="position-absolute" style={{
                                        width: '16px',
                                        height: '16px',
                                        background: '#2b8a3e',
                                        border: '3px solid var(--bg-card)',
                                        borderRadius: '50%',
                                        bottom: '8px',
                                        right: '8px',
                                        boxShadow: '0 0 0 2px rgba(43,138,62,0.2)'
                                    }} />
                                )
                            }
                        </div>

                        <div className="info_content">
                            <div className="info_content_title">
                                <h2>{user.fullname}</h2>
                                {
                                    user._id === auth.user._id ? (
                                        <div className="d-flex align-items-center">
                                            <button className="btn btn-outline-secondary d-flex align-items-center mr-2"
                                            onClick={() => setOnEdit(true)} title="Edit Profile" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                                <span className="material-icons mr-1" style={{ fontSize: '1.1rem' }}>edit</span>
                                                Edit Profile
                                            </button>
                                            <button className="btn btn-success d-flex align-items-center"
                                             onClick={() => setOnAddMoment(true)} title="Add Story" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                                 <span className="material-icons mr-1" style={{ fontSize: '1.1rem' }}>add_circle</span>
                                                 Add Story
                                             </button>
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center">
                                            <div className="mr-2">
                                                <FollowBtn user={user} />
                                            </div>
                                            <Link to={`/message/${user._id}`} className="btn btn-outline-success d-flex align-items-center" title="Send Message" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                                <span className="material-icons mr-1" style={{ fontSize: '1.1rem' }}>near_me</span>
                                                Message
                                            </Link>
                                        </div>
                                    )
                                }
                            </div>

                            <div className="follow_btn">
                                <span className="mr-4" style={{ cursor: 'default' }}>
                                    <strong>{postsCount}</strong> Posts
                                </span>
                                <span className="mr-4" onClick={() => setShowFollowers(true)} style={{ cursor: 'pointer' }}>
                                    <strong>{user.followers.length}</strong> Followers
                                </span>
                                <span className="ml-4" onClick={() => setShowFollowing(true)} style={{ cursor: 'pointer' }}>
                                    <strong>{user.following.length}</strong> Following
                                </span>
                            </div>

                            <h6>
                                @{user.username} 
                                {user.pronouns && <span className="ml-2 text-muted" style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>{user.pronouns}</span>}
                            </h6>
                            <h6 className="m-0" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user.email}</h6>
                            {user.website && (
                                <a href={user.website} target="_blank" rel="noreferrer" className="d-block mb-1" style={{ color: '#00376b', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                                    {user.website}
                                </a>
                            )}
                            <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{user.bio}</p>
                        </div>

                        <Fleets userId={user._id} />

                        {
                            onEdit && <EditProfile setOnEdit={setOnEdit} />
                        }

                        {
                            onAddMoment && 
                            <CreateMomentModal 
                                isOpen={onAddMoment} 
                                onClose={() => setOnAddMoment(false)} 
                            />
                        }

                        {
                            showFollowers &&
                            <Followers 
                            users={user.followers} 
                            setShowFollowers={setShowFollowers} 
                            />
                        }
                        {
                            showFollowing &&
                            <Following 
                            users={user.following} 
                            setShowFollowing={setShowFollowing} 
                            />
                        }
                    </div>
                ))
            }
        </div>
    )
}

export default Info
