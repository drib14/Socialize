import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getDiscoverPosts, DISCOVER_TYPES } from '../redux/actions/discoverAction'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import PostThumb from '../components/PostThumb'
import LoadMoreBtn from '../components/LoadMoreBtn'
import { getDataAPI} from '../utils/fetchData'

const Discover = () => {
    const { auth, discover } = useSelector(state => state)
    const dispatch = useDispatch()

    const [load, setLoad] = useState(false)

    useEffect(() => {
        if(!discover.firstLoad){
            dispatch(getDiscoverPosts(auth.token))
        }
    },[dispatch, auth.token, discover.firstLoad])

    const handleLoadMore = async () => {
        setLoad(true)
        const res = await getDataAPI(`post_discover?num=${discover.page * 9}`, auth.token)
        dispatch({type: DISCOVER_TYPES.UPDATE_POST, payload: res.data})
        setLoad(false)
    }

    return (
        <div>
            {
                discover.loading 
                ? <div className="d-grid my-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', display: 'grid' }}>
                    <Skeleton height={250} borderRadius={8} />
                    <Skeleton height={250} borderRadius={8} />
                    <Skeleton height={250} borderRadius={8} />
                    <Skeleton height={250} borderRadius={8} />
                    <Skeleton height={250} borderRadius={8} />
                    <Skeleton height={250} borderRadius={8} />
                  </div>
                : <PostThumb posts={discover.posts} result={discover.result} />
            }

            {
                load && <div className="text-center my-3"><Skeleton circle width={40} height={40} /></div>
            }

            {
                !discover.loading &&
                <LoadMoreBtn result={discover.result} page={discover.page}
                load={load} handleLoadMore={handleLoadMore} />
            }
            
        </div>
    )
}

export default Discover
