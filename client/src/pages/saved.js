import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import LeftSideBar from '../components/home/LeftSideBar'
import RightSideBar from '../components/home/RightSideBar'
import PostThumb from '../components/PostThumb'
import { getDataAPI, postDataAPI, deleteDataAPI } from '../utils/fetchData'
import { GLOBALTYPES } from '../redux/actions/globalTypes'
import { getCollections } from '../redux/actions/savedCollectionAction'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const Saved = () => {
    const { auth, savedCollections } = useSelector(state => state)
    const dispatch = useDispatch()

    const [allPosts, setAllPosts] = useState([])
    const [activeCol, setActiveCol] = useState(null) // null = collections grid view, 'all' = All Posts, or collection object
    const [colPosts, setColPosts] = useState([])

    const [firstLoad, setFirstLoad] = useState(false)
    const [showNewColForm, setShowNewColForm] = useState(false)
    const [newColName, setNewColName] = useState('')

    // Fetch all saved posts
    useEffect(() => {
        setFirstLoad(true)
        getDataAPI('getSavePosts', auth.token)
        .then(res => {
            setAllPosts(res.data.savePosts)
            setFirstLoad(false)
        })
        .catch(err => {
            dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}})
            setFirstLoad(false)
        })

        // Fetch collections
        dispatch(getCollections(auth.token))
    }, [auth.token, dispatch])

    const handleCreateCol = async (e) => {
        e.preventDefault()
        if (!newColName.trim()) return;

        try {
            await postDataAPI('saved_collections', { name: newColName.trim() }, auth.token)
            setNewColName('')
            setShowNewColForm(false)
            dispatch(getCollections(auth.token))
        } catch (err) {
            dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}})
        }
    }

    const handleSelectCollection = async (col) => {
        if (col === 'all') {
            setActiveCol('all')
            setColPosts(allPosts)
        } else {
            try {
                setActiveCol(col)
                const res = await getDataAPI(`saved_collections/${col._id}`, auth.token)
                if (res.data && res.data.collection) {
                    setColPosts(res.data.collection.posts || [])
                }
            } catch (err) {
                dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}})
            }
        }
    }

    const handleDeleteCollection = async (colId) => {
        const confirmed = window.confirm("Are you sure you want to delete this collection?")
        if (!confirmed) return;

        try {
            await deleteDataAPI(`saved_collections/${colId}`, auth.token)
            setActiveCol(null)
            dispatch(getCollections(auth.token))
        } catch (err) {
            dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}})
        }
    }

    return (
        <div className="home row mx-0" style={{ width: '100%' }}>
            <div className="col-md-3 col-lg-3 d-none d-md-block">
                <LeftSideBar />
            </div>

            <div className="col-12 col-md-6 col-lg-6">
                {activeCol ? (
                    // Sub-view: Collection items
                    <div className="mt-3">
                        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
                            <div className="d-flex align-items-center">
                                <button className="btn btn-sm btn-light mr-3" onClick={() => setActiveCol(null)} style={{ borderRadius: '50%' }}>
                                    <i className="fas fa-arrow-left"></i>
                                </button>
                                <h4 className="m-0 font-weight-bold" style={{ color: 'var(--text-main)' }}>
                                    {activeCol === 'all' ? 'All Posts' : activeCol.name}
                                </h4>
                            </div>
                            {activeCol !== 'all' && (
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCollection(activeCol._id)} style={{ borderRadius: '12px' }}>
                                    Delete Collection
                                </button>
                            )}
                        </div>

                        {colPosts.length === 0 ? (
                            <div className="text-center text-muted my-5">
                                <i className="far fa-bookmark mb-2" style={{ fontSize: '3.5rem', opacity: 0.4, display: 'block' }}></i>
                                <h5>No Saved Posts in this collection</h5>
                            </div>
                        ) : (
                            <PostThumb posts={colPosts} result={colPosts.length} />
                        )}
                    </div>
                ) : (
                    // Grid-view: List of collections
                    <div className="mt-3">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h3 className="m-0 font-weight-bold" style={{ color: 'var(--text-main)', fontSize: '1.4rem' }}>Saved</h3>
                            
                            {showNewColForm ? (
                                <form onSubmit={handleCreateCol} className="d-flex align-items-center gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Name..." 
                                        value={newColName} 
                                        onChange={e => setNewColName(e.target.value)}
                                        className="form-control form-control-sm mr-2"
                                        style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                                    />
                                    <button type="submit" className="btn btn-sm btn-primary mr-2" style={{ borderRadius: '12px', background: '#0095f6', border: 'none' }}>
                                        Create
                                    </button>
                                    <button type="button" className="btn btn-sm btn-light" onClick={() => setShowNewColForm(false)} style={{ borderRadius: '12px' }}>
                                        Cancel
                                    </button>
                                </form>
                            ) : (
                                <button className="btn btn-sm btn-primary" onClick={() => setShowNewColForm(true)} style={{ borderRadius: '12px', background: '#0095f6', border: 'none' }}>
                                    + New Collection
                                </button>
                            )}
                        </div>

                        {firstLoad ? (
                            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', display: 'grid' }}>
                                <Skeleton height={160} borderRadius={12} />
                                <Skeleton height={160} borderRadius={12} />
                            </div>
                        ) : (
                            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', display: 'grid' }}>
                                {/* "All Posts" card */}
                                <div 
                                    className="card p-0" 
                                    style={{ borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                                    onClick={() => handleSelectCollection('all')}
                                >
                                    <div style={{ height: '120px', background: 'var(--border-color)' }}>
                                        {allPosts.length > 0 && allPosts[0].images && allPosts[0].images.length > 0 && (
                                            <img src={allPosts[0].images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                    <div className="p-2">
                                        <strong className="d-block" style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>All Posts</strong>
                                        <span className="small text-muted">{allPosts.length} posts</span>
                                    </div>
                                </div>

                                {/* Custom Collections */}
                                {savedCollections.collections && savedCollections.collections.map(col => (
                                    <div 
                                        key={col._id}
                                        className="card p-0" 
                                        style={{ borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                                        onClick={() => handleSelectCollection(col)}
                                    >
                                        <div style={{ height: '120px', background: 'var(--border-color)' }}>
                                            {col.cover ? (
                                                <img src={col.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                                    <i className="far fa-folder" style={{ fontSize: '2rem' }}></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2">
                                            <strong className="d-block" style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{col.name}</strong>
                                            <span className="small text-muted">{(col.posts && col.posts.length) || 0} posts</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="col-md-3 col-lg-3 d-none d-md-block">
                <RightSideBar />
            </div>
        </div>
    )
}

export default Saved
