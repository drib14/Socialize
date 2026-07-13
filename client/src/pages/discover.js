import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getDiscoverPosts, DISCOVER_TYPES } from '../redux/actions/discoverAction'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import PostThumb from '../components/PostThumb'
import LoadMoreBtn from '../components/LoadMoreBtn'
import { getDataAPI } from '../utils/fetchData'
import UserCard from '../components/UserCard'
import Avatar from '../components/Avatar'

const Discover = () => {
    const { auth, discover } = useSelector(state => state)
    const dispatch = useDispatch()

    const [tab, setTab] = useState('foryou')
    const [search, setSearch] = useState('')
    const [load, setLoad] = useState(false)
    
    const [trendingTags, setTrendingTags] = useState([])
    const [suggestedUsers, setSuggestedUsers] = useState([])
    const [loadingExtra, setLoadingExtra] = useState(false)

    useEffect(() => {
        if(!discover.firstLoad){
            dispatch(getDiscoverPosts(auth.token))
        }
    },[dispatch, auth.token, discover.firstLoad])

    useEffect(() => {
        if (tab === 'trending') {
            setLoadingExtra(true)
            getDataAPI('trending_tags', auth.token)
            .then(res => {
                setTrendingTags(res.data.tags || [])
                setLoadingExtra(false)
            })
            .catch(() => setLoadingExtra(false))
        } else if (tab === 'people') {
            setLoadingExtra(true)
            getDataAPI('suggestionsUser', auth.token)
            .then(res => {
                setSuggestedUsers(res.data.users || [])
                setLoadingExtra(false)
            })
            .catch(() => setLoadingExtra(false))
        }
    }, [tab, auth.token])

    const handleLoadMore = async () => {
        setLoad(true)
        const res = await getDataAPI(`post_discover?num=${discover.page * 9}`, auth.token)
        dispatch({type: DISCOVER_TYPES.UPDATE_POST, payload: res.data})
        setLoad(false)
    }

    const filteredPosts = discover.posts.filter(post => 
        (post.content || '').toLowerCase().includes(search.toLowerCase()) ||
        (post.user?.username || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="discover_container mt-3 px-2">
            {/* Explore Search Header */}
            <div className="mb-4 d-flex justify-content-center">
                <div className="position-relative w-100" style={{ maxWidth: '500px' }}>
                    <input 
                        type="text" 
                        placeholder="Search posts or creators..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                        className="form-control"
                        style={{ borderRadius: '24px', background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', paddingLeft: '40px', paddingRight: '16px', height: '42px' }}
                    />
                    <span className="material-icons text-muted position-absolute" style={{ left: '14px', top: '10px', fontSize: '1.25rem' }}>search</span>
                </div>
            </div>

            {/* Explore Category Tab Chips */}
            <div className="d-flex justify-content-center mb-4" style={{ gap: '12px' }}>
                <button className={`btn rounded-pill px-3 py-1 font-weight-bold ${tab === 'foryou' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTab('foryou')} style={{ fontSize: '0.85rem' }}>
                    <i className="fas fa-compass mr-1" /> For You
                </button>
                <button className={`btn rounded-pill px-3 py-1 font-weight-bold ${tab === 'trending' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTab('trending')} style={{ fontSize: '0.85rem' }}>
                    <i className="fas fa-fire mr-1" /> Trending Tags
                </button>
                <button className={`btn rounded-pill px-3 py-1 font-weight-bold ${tab === 'people' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTab('people')} style={{ fontSize: '0.85rem' }}>
                    <i className="fas fa-user-plus mr-1" /> Suggested People
                </button>
            </div>

            {/* Explore Content Panels */}
            {
                tab === 'foryou' && (
                    <div>
                        {
                            discover.loading 
                            ? <div className="d-grid my-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', display: 'grid' }}>
                                <Skeleton height={250} borderRadius={8} count={6} />
                              </div>
                            : <PostThumb posts={filteredPosts} result={filteredPosts.length} />
                        }

                        {
                            load && <div className="text-center my-3"><Skeleton circle width={40} height={40} /></div>
                        }

                        {
                            !discover.loading && filteredPosts.length > 0 &&
                            <LoadMoreBtn result={discover.result} page={discover.page}
                            load={load} handleLoadMore={handleLoadMore} />
                        }
                    </div>
                )
            }

            {
                tab === 'trending' && (
                    <div className="card p-3 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', maxWidth: '600px', margin: 'auto' }}>
                        <h5 className="font-weight-bold mb-3" style={{ color: 'var(--text-main)' }}>Popular Tags</h5>
                        {
                            loadingExtra ? (
                                <Skeleton height={40} count={5} borderRadius={8} className="mb-2" />
                            ) : trendingTags.length === 0 ? (
                                <div className="text-center text-muted py-3">No trending tags found</div>
                            ) : (
                                <div className="d-flex flex-column" style={{ gap: '10px' }}>
                                    {trendingTags.map((t, i) => (
                                        <Link key={i} to={`/posts/tag/${t.tag}`} className="d-flex align-items-center justify-content-between p-3 rounded text-decoration-none" style={{ background: 'var(--bg-input)', transition: '0.2s', border: '1px solid var(--border-color)' }}>
                                            <div className="d-flex align-items-center">
                                                <div className="d-flex align-items-center justify-content-center text-white" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
                                                    <i className="fas fa-hashtag" />
                                                </div>
                                                <div className="ml-3 text-left">
                                                    <strong style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>#{t.tag}</strong>
                                                </div>
                                            </div>
                                            <span className="badge badge-primary py-2 px-3 rounded-pill" style={{ fontSize: '0.78rem' }}>{t.count} posts</span>
                                        </Link>
                                    ))}
                                </div>
                            )
                        }
                    </div>
                )
            }

            {
                tab === 'people' && (
                    <div className="card p-3 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', maxWidth: '600px', margin: 'auto' }}>
                        <h5 className="font-weight-bold mb-3" style={{ color: 'var(--text-main)' }}>Suggested for You</h5>
                        {
                            loadingExtra ? (
                                <Skeleton height={60} count={5} borderRadius={8} className="mb-2" />
                            ) : suggestedUsers.length === 0 ? (
                                <div className="text-center text-muted py-3">No suggestions available</div>
                            ) : (
                                <div className="d-flex flex-column" style={{ gap: '12px' }}>
                                    {suggestedUsers.map(user => (
                                        <div key={user._id} className="p-2 border rounded" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)' }}>
                                            <UserCard user={user}>
                                                <Link to={`/profile/${user._id}`} className="btn btn-sm btn-primary" style={{ borderRadius: '8px', fontSize: '0.8rem' }}>View Profile</Link>
                                            </UserCard>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </div>
                )
            }
        </div>
    )
}

export default Discover
