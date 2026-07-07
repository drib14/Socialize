import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LikeButton from '../../LikeButton'
import { useSelector, useDispatch } from 'react-redux'
import { likePost, unLikePost, savePost, unSavePost, repostPost } from '../../../redux/actions/postAction'
import ShareModal from '../../ShareModal'
import { BASE_URL } from '../../../utils/config'
import { FaRegComment, FaRegPaperPlane, FaRetweet, FaRegBookmark, FaBookmark } from 'react-icons/fa'
import { customConfirm } from '../../../utils/customAlert'

const CardFooter = ({post}) => {
    const [isLike, setIsLike] = useState(false)
    const [loadLike, setLoadLike] = useState(false)

    const [isShare, setIsShare] = useState(false)

    const { auth, theme, socket } = useSelector(state => state)
    const dispatch = useDispatch()

    const [saved, setSaved] = useState(false)
    const [saveLoad, setSaveLoad] = useState(false)

    // Likes
    useEffect(() => {
        if(post.likes.find(like => like._id === auth.user._id)){
            setIsLike(true)
        }else{
            setIsLike(false)
        }
    }, [post.likes, auth.user._id])

    const handleLike = async () => {
        if(loadLike) return;
        
        setLoadLike(true)
        await dispatch(likePost({post, auth, socket}))
        setLoadLike(false)
    }

    const handleUnLike = async () => {
        if(loadLike) return;

        setLoadLike(true)
        await dispatch(unLikePost({post, auth, socket}))
        setLoadLike(false)
    }


    // Saved
    useEffect(() => {
        if(auth.user.saved.find(id => id === post._id)){
            setSaved(true)
        }else{
            setSaved(false)
        }
    },[auth.user.saved, post._id])

    const handleSavePost = async () => {
        if(saveLoad) return;
        
        setSaveLoad(true)
        await dispatch(savePost({post, auth}))
        setSaveLoad(false)
    }

    const handleUnSavePost = async () => {
        if(saveLoad) return;

        setSaveLoad(true)
        await dispatch(unSavePost({post, auth}))
        setSaveLoad(false)
    }

    const handleRepost = async () => {
        const confirmed = await customConfirm("Do you want to repost this post to your profile?")
        if (confirmed) {
            dispatch(repostPost({post, auth, socket}))
        }
    }

    return (
        <div className="card_footer">
            <div className="card_icon_menu">
                <div className="d-flex align-items-center" style={{ gap: '20px' }}>
                    <LikeButton 
                    isLike={isLike}
                    handleLike={handleLike}
                    handleUnLike={handleUnLike}
                    />

                    <Link to={`/post/${post._id}`} className="text-secondary d-flex align-items-center">
                        <FaRegComment style={{ fontSize: '24px', cursor: 'pointer' }} />
                    </Link>

                    <FaRegPaperPlane className="text-secondary" 
                    title="Share"
                    style={{ cursor: 'pointer', fontSize: '24px' }} 
                    onClick={() => setIsShare(!isShare)} />

                    <FaRetweet className="text-secondary" 
                    title="Repost"
                    style={{ cursor: 'pointer', fontSize: '26px' }}
                    onClick={handleRepost} />
                </div>

                {
                    saved 
                    ?  <FaBookmark className="text-primary" style={{ cursor: 'pointer', fontSize: '24px' }}
                    onClick={handleUnSavePost} />

                    :  <FaRegBookmark className="text-secondary" style={{ cursor: 'pointer', fontSize: '24px' }}
                    onClick={handleSavePost} />
                }
               
            </div>

            <div className="d-flex justify-content-between">
                <h6 style={{padding: '0 25px', cursor: 'pointer'}}>
                    {post.likes.length} likes
                </h6>
                
                <h6 style={{padding: '0 25px', cursor: 'pointer'}}>
                    {post.comments.length} comments
                </h6>
            </div>

            {
                isShare && <ShareModal url={`${BASE_URL}/post/${post._id}`} theme={theme} />
            }
        </div>
    )
}

export default CardFooter
