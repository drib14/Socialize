import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import LeftSideBar from '../components/home/LeftSideBar'
import RightSideBar from '../components/home/RightSideBar'
import PostThumb from '../components/PostThumb'
import LoadMoreBtn from '../components/LoadMoreBtn'
import { getDataAPI } from '../utils/fetchData'
import { GLOBALTYPES } from '../redux/actions/globalTypes'
import PostSkeleton from '../components/skeletons/PostSkeleton'
import { unSavePost } from '../redux/actions/postAction'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const Saved = () => {
    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()

    const [savePosts, setSavePosts] = useState([])
    const [result, setResult] = useState(9)
    const [page, setPage] = useState(2)
    const [load, setLoad] = useState(false)
    const [firstLoad, setFirstLoad] = useState(false)

    useEffect(() => {
        setLoad(true)
        setFirstLoad(true)
        getDataAPI('getSavePosts', auth.token)
        .then(res => {
            setSavePosts(res.data.savePosts)
            setResult(res.data.result)
            setLoad(false)
            setFirstLoad(false)
        })
        .catch(err => {
            dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}})
            setLoad(false)
            setFirstLoad(false)
        })

        return () => setSavePosts([])
    }, [auth.token, dispatch])

    const handleUnSave = (post) => {
        dispatch(unSavePost({post, auth}))
        setSavePosts(savePosts.filter(item => item._id !== post._id))
        setResult(result - 1)
    }

    const handleLoadMore = async () => {
        setLoad(true)
        const res = await getDataAPI(`getSavePosts?limit=${page * 9}`, auth.token)
        setSavePosts(res.data.savePosts)
        setResult(res.data.result)
        setPage(page + 1)
        setLoad(false)
    }

    return (
        <div className="home row mx-0" style={{ width: '100%' }}>
            <div className="col-md-3 col-lg-3 d-none d-md-block">
                <LeftSideBar />
            </div>

            <div className="col-12 col-md-6 col-lg-6">
                <div className="card p-3 mb-3 mt-3" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h3 className="m-0 font-weight-bold text-center" style={{ color: 'var(--primary-color)' }}>
                        <span className="material-icons mr-2" style={{ verticalAlign: 'middle', fontSize: '2rem' }}>bookmark</span>
                        Saved Posts
                    </h3>
                </div>

                {
                    firstLoad 
                    ? <>
                        <PostSkeleton />
                        <PostSkeleton />
                      </>
                    : savePosts.length === 0
                        ? <div className="text-center text-muted my-5">
                            <span className="material-icons" style={{ fontSize: '4rem', opacity: 0.5 }}>bookmark_border</span>
                            <h4>No Saved Posts</h4>
                          </div>
                        : <>
                            <PostThumb posts={savePosts} result={result} handleUnSave={handleUnSave} />
                            
                            {
                                load && 
                                <div className="d-grid my-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', display: 'grid' }}>
                                    <Skeleton height={250} borderRadius={8} />
                                    <Skeleton height={250} borderRadius={8} />
                                    <Skeleton height={250} borderRadius={8} />
                                </div>
                            }

                            <LoadMoreBtn result={result} page={page} load={load} handleLoadMore={handleLoadMore} />
                          </>
                }
            </div>

            <div className="col-md-3 col-lg-3 d-none d-md-block">
                <RightSideBar />
            </div>
        </div>
    )
}

export default Saved
