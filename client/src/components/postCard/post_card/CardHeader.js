import React from 'react'
import Avatar from '../../Avatar'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment'
import { GLOBALTYPES } from '../../../redux/actions/globalTypes'
import { deletePost } from '../../../redux/actions/postAction'
import { BASE_URL } from '../../../utils/config'
import { customConfirm } from '../../../utils/customAlert'

const CardHeader = ({post}) => {
    const { auth, socket, online } = useSelector(state => state)
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const isMutualFollower = (userId) => {
        if (!auth.user || !auth.user.following || !auth.user.followers) return false;
        const isFollowing = auth.user.following.some(item => (item._id ? item._id === userId : item === userId));
        const isFollower = auth.user.followers.some(item => (item._id ? item._id === userId : item === userId));
        return isFollowing && isFollower;
    }

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
                        online.includes(post.user._id) && isMutualFollower(post.user._id) &&
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

                <div className="card_name">
                    <h6 className="m-0">
                        <Link to={`/profile/${post.user._id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                            {post.user.fullname}
                        </Link>
                    </h6>
                    <span className="text-muted d-block" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                        @{post.user.username}
                    </span>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                        {moment(post.createdAt).fromNow()}
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
