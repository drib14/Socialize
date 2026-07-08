import React, { useState, useEffect } from 'react'
import PostThumb from '../PostThumb'

import LoadMoreBtn from '../LoadMoreBtn'
import { getDataAPI } from '../../utils/fetchData'
import { PROFILE_TYPES } from '../../redux/actions/profileAction'

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const Posts = ({auth, id, dispatch, profile, isRepostTab}) => {
    const [posts, setPosts] = useState([])
    const [result, setResult] = useState(9)
    const [page, setPage] = useState(0)
    const [load, setLoad] = useState(false)

    useEffect(() => {
        profile.posts.forEach(data => {
            if(data._id === id){
                const filteredPosts = isRepostTab 
                    ? data.posts.filter(post => !!post.repostOf)
                    : data.posts.filter(post => !post.repostOf)
                setPosts(filteredPosts)
                setResult(filteredPosts.length)
                setPage(data.page)
            }
        })
    },[profile.posts, id, isRepostTab])

    const handleLoadMore = async () => {
        setLoad(true)
        const res = await getDataAPI(`user_posts/${id}?limit=${page * 9}`, auth.token)
        const newData = {...res.data, page: page + 1, _id: id}
        dispatch({type: PROFILE_TYPES.UPDATE_POST, payload: newData})
        setLoad(false)
    }

    return (
        <div>
            <PostThumb posts={posts} result={result} />

            {
                load && 
                <div className="d-grid my-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', display: 'grid' }}>
                    <Skeleton height={250} borderRadius={8} />
                    <Skeleton height={250} borderRadius={8} />
                    <Skeleton height={250} borderRadius={8} />
                </div>
            }

            
            <LoadMoreBtn result={result} page={page}
            load={load} handleLoadMore={handleLoadMore} />
            
        </div>
    )
}

export default Posts
