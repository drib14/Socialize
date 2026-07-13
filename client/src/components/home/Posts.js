import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PostCard from '../PostCard'
import { getDataAPI } from '../../utils/fetchData'
import { POST_TYPES } from '../../redux/actions/postAction'
import PostSkeleton from '../skeletons/PostSkeleton'

const Posts = () => {
    const { homePosts, auth, theme } = useSelector(state => state)
    const dispatch = useDispatch()

    const [load, setLoad] = useState(false)
    const loadMoreRef = useRef()

    const handleLoadMore = async () => {
        if (load) return
        if (homePosts.result < (homePosts.page - 1) * 9) return
        
        setLoad(true)
        const res = await getDataAPI(`posts?limit=${homePosts.page * 9}`, auth.token)

        dispatch({
            type: POST_TYPES.GET_POSTS, 
            payload: {...res.data, page: homePosts.page + 1}
        })

        setLoad(false)
    }

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                handleLoadMore()
            }
        }, {
            threshold: 0.1
        })

        const currentRef = loadMoreRef.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) observer.unobserve(currentRef)
        }
    }, [homePosts.page, homePosts.result, load])

    return (
        <div className="posts">
            {
                homePosts.posts.map(post => (
                    <PostCard key={post._id} post={post} theme={theme} />
                ))
            }

            {
                homePosts.result >= (homePosts.page - 1) * 9 && (
                    <div ref={loadMoreRef} className="text-center my-4" style={{ minHeight: '60px' }}>
                        {load && <PostSkeleton />}
                    </div>
                )
            }
        </div>
    )
}

export default Posts
