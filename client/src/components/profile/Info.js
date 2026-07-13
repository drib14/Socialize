import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../Avatar'
import EditProfile from './Info/EditProfile'
import FollowBtn from '../FollowBtn'
import Followers from './Info/Followers'
import Following from './Info/Following'
import CreateMomentModal from '../home/CreateMomentModal'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'

const Info = ({id, auth, profile, dispatch}) => {
    const [userData, setUserData] = useState([])
    const [onEdit, setOnEdit] = useState(false)
    const [onAddMoment, setOnAddMoment] = useState(false)

    const [showFollowers, setShowFollowers] = useState(false)
    const [showFollowing, setShowFollowing] = useState(false)

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
                        <Avatar src={user.avatar} size="supper-avatar" />

                        <div className="info_content">
                            <div className="info_content_title">
                                <h2>{user.fullname}</h2>
                                {
                                    user._id === auth.user._id ? (
                                        <div className="d-flex align-items-center gap-2">
                                            <button className="btn btn-outline-info d-flex align-items-center gap-1"
                                            onClick={() => setOnEdit(true)} title="Edit Profile">
                                                <span className="material-icons" style={{ fontSize: '1.2rem' }}>edit</span>
                                                Edit Profile
                                            </button>
                                            <button className="btn btn-success d-flex align-items-center gap-1"
                                            onClick={() => setOnAddMoment(true)} title="Add Moment">
                                                <span className="material-icons" style={{ fontSize: '1.2rem' }}>add_a_photo</span>
                                                Add Moment
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center gap-2">
                                            <FollowBtn user={user} />
                                            <Link to={`/message/${user._id}`} className="btn btn-outline-info d-flex align-items-center gap-1" title="Send Message">
                                                <span className="material-icons" style={{ fontSize: '1.2rem' }}>near_me</span>
                                                Message
                                            </Link>
                                        </div>
                                    )
                                }
                            </div>

                            <div className="follow_btn">
                                <span className="mr-4" onClick={() => setShowFollowers(true)}>
                                    {user.followers.length} Followers
                                </span>
                                <span className="ml-4" onClick={() => setShowFollowing(true)}>
                                    {user.following.length} Following
                                </span>
                            </div>

                            <h6>@{user.username} <span className="text-danger">{user.mobile}</span></h6>
                            <p className="m-0">{user.address}</p>
                            <h6 className="m-0">{user.email}</h6>
                            <a href={user.website} target="_blank" rel="noreferrer">
                                {user.website}
                            </a>
                            <p>{user.story}</p>
                        </div>

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
