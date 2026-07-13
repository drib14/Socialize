import React, { useState, useEffect, useRef } from 'react'
import UserCard from '../UserCard'
import { useSelector, useDispatch } from 'react-redux'
import { getDataAPI } from '../../utils/fetchData'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { useNavigate, useParams } from 'react-router-dom'
import { MESS_TYPES, getConversations } from '../../redux/actions/messageAction'


const LeftSide = () => {
    const { auth, message, online } = useSelector(state => state)
    const dispatch = useDispatch()

    const [search, setSearch] = useState('')
    const [searchUsers, setSearchUsers] = useState([])

    const navigate = useNavigate()
    const { id } = useParams()

    const pageEnd = useRef()
    const [page, setPage] = useState(0)

    
    const handleSearch = async e => {
        e.preventDefault()
        if(!search) return setSearchUsers([]);

        try {
            const res = await getDataAPI(`search?username=${search}`, auth.token)
            setSearchUsers(res.data.users)
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message}
            })
        }
    }

    const handleAddUser = (user) => {
        setSearch('')
        setSearchUsers([])
        dispatch({type: MESS_TYPES.ADD_USER, payload: {...user, text: '', media: []}})
        dispatch({type: MESS_TYPES.CHECK_ONLINE_OFFLINE, payload: online})
        return navigate(`/message/${user._id}`)
    }

    const isActive = (user) => {
        if(id === user._id) return 'active';
        return ''
    }

    useEffect(() => {
        if(message.firstLoad) return;
        dispatch(getConversations({auth}))
    },[dispatch, auth, message.firstLoad])

    // Load More
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if(entries[0].isIntersecting){
                setPage(p => p + 1)
            }
        },{
            threshold: 0.1
        })

        observer.observe(pageEnd.current)
    },[setPage])

    useEffect(() => {
        if(message.resultUsers >= (page - 1) * 9 && page > 1){
            dispatch(getConversations({auth, page}))
        }
    },[message.resultUsers, page, auth, dispatch])
    

    // Check User Online - Offline
    useEffect(() => {
        if(message.firstLoad) {
            dispatch({type: MESS_TYPES.CHECK_ONLINE_OFFLINE, payload: online})
        }
    },[online, message.firstLoad, dispatch])

    const handleSearchChange = (e) => {
        const val = e.target.value
        setSearch(val)
        if(!val) {
            setSearchUsers([])
        }
    }

    const conversationsToDisplay = searchUsers.length > 0 
        ? searchUsers 
        : (search ? message.users.filter(u => 
            u.username.toLowerCase().includes(search.toLowerCase()) || 
            u.fullname.toLowerCase().includes(search.toLowerCase())
          ) : message.users)

    return (
        <>
            <form className="message_header" onSubmit={handleSearch} style={{ borderBottom: '1px solid var(--border-color)', padding: '12px 16px' }}>
                <input type="text" value={search}
                placeholder="Search chats or search globally..."
                onChange={handleSearchChange} 
                style={{ borderRadius: '24px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '10px 16px', fontSize: '0.85rem' }} />

                <button type="submit" style={{display: 'none'}}>Search</button>
            </form>

            <div className="message_chat_list" style={{ overflowY: 'auto' }}>
                {
                    conversationsToDisplay.map(user => {
                        const isMutual = auth.user.following.some(item => (item._id || item).toString() === user._id.toString()) && 
                                         auth.user.followers.some(item => (item._id || item).toString() === user._id.toString());
                        const isOnline = online.includes(user._id);
                        const hasConversation = message.users.some(u => u._id === user._id);
                        return (
                            <div key={user._id} className={`message_user ${isActive(user)}`}
                            onClick={() => handleAddUser(user)}>
                                <UserCard user={user} msg={hasConversation}>
                                    {
                                        (isOnline && isMutual) &&
                                        <i className="fas fa-circle text-success" />
                                    }
                                </UserCard>
                            </div>
                        )
                    })
                }
               
               <button ref={pageEnd} style={{opacity: 0}} >Load More</button>
            </div>
        </>
    )
}

export default LeftSide
