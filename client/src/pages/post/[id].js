import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getPost } from '../../redux/actions/postAction'
import PostSkeleton from '../../components/skeletons/PostSkeleton'
import PostCard from '../../components/PostCard'
import LeftSideBar from '../../components/home/LeftSideBar'
import RightSideBar from '../../components/home/RightSideBar'

const Post = () => {
    const { id } = useParams()
    const [post, setPost] = useState([])

    const { auth, detailPost } = useSelector(state => state)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getPost({detailPost, id, auth}))

        if(detailPost.length > 0){
            const newArr = detailPost.filter(post => post._id === id)
            setPost(newArr)
        }
    },[detailPost, dispatch, id, auth])

    return (
        <div className="home row mx-0" style={{ width: '100%' }}>
            <div className="col-md-3 col-lg-3 d-none d-md-block">
                <LeftSideBar />
            </div>

            <div className="col-12 col-md-6 col-lg-6">
                <div className="posts">
                    {
                        post.length === 0 &&
                        <PostSkeleton />
                    }

                    {
                        post.map(item => (
                            <PostCard key={item._id} post={item} />
                        ))
                    }
                </div>
            </div>

            <div className="col-md-3 col-lg-3 d-none d-md-block">
                <RightSideBar />
            </div>
        </div>
    )
}

export default Post
