import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import LeftSideBar from '../../../components/home/LeftSideBar'
import RightSideBar from '../../../components/home/RightSideBar'
import PostCard from '../../../components/PostCard'
import { getDataAPI } from '../../../utils/fetchData'
import { GLOBALTYPES } from '../../../redux/actions/globalTypes'
import PostSkeleton from '../../../components/skeletons/PostSkeleton'

const TagFeed = () => {
    const { id } = useParams()
    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()

    const [posts, setPosts] = useState([])
    const [result, setResult] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id && auth.token) {
            setLoading(true)
            getDataAPI(`posts/tag/${id}`, auth.token)
                .then(res => {
                    setPosts(res.data.posts)
                    setResult(res.data.result)
                    setLoading(false)
                })
                .catch(err => {
                    dispatch({
                        type: GLOBALTYPES.ALERT,
                        payload: { error: err.response?.data?.msg || err.message }
                    })
                    setLoading(false)
                })
        }
    }, [id, auth.token, dispatch])

    return (
        <div className="home row mx-0" style={{ width: '100%' }}>
            <div className="col-md-3 col-lg-3 d-none d-md-block">
                <LeftSideBar />
            </div>

            <div className="col-12 col-md-6 col-lg-6">
                <div className="card p-3 mb-3 mt-3" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h3 className="m-0 font-weight-bold text-center d-flex align-items-center justify-content-center" style={{ color: 'var(--primary-color)', gap: '8px' }}>
                        <i className="fas fa-hashtag" style={{ fontSize: '1.6rem' }}></i>
                        {id}
                    </h3>
                    <p className="text-center text-muted m-0 mt-1 small">{result} {result === 1 ? 'post' : 'posts'} found</p>
                </div>

                {
                    loading 
                    ? <>
                        <PostSkeleton />
                        <PostSkeleton />
                      </>
                    : posts.length === 0
                        ? <div className="text-center text-muted my-5">
                            <i className="fas fa-hashtag mb-2" style={{ fontSize: '3.5rem', opacity: 0.4 }}></i>
                            <h4>No posts with #{id}</h4>
                          </div>
                        : <div className="posts">
                            {
                                posts.map(post => (
                                    <PostCard key={post._id} post={post} />
                                ))
                            }
                          </div>
                }
            </div>

            <div className="col-md-3 col-lg-3 d-none d-md-block">
                <RightSideBar />
            </div>
        </div>
    )
}

export default TagFeed
