import React, { useState } from 'react>,StartLine:1,TargetContent:'
import { useSelector, useDispatch } from 'react-redux'

import { Link } from 'react-router-dom'
import { customConfirm } from '../utils/customAlert'
import Avatar from './Avatar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { isReadNotify, NOTIFY_TYPES, deleteAllNotifies } from '../redux/actions/notifyAction'

dayjs.extend(relativeTime)

const NotifyModal = () => {
    const { auth, notify } = useSelector(state => state)
    const dispatch = useDispatch()
    const [filter, setFilter] = useState('all')

    const handleIsRead = (msg) => {
        dispatch(isReadNotify({msg, auth}))
    }

    const handleSound = () => {
        dispatch({type: NOTIFY_TYPES.UPDATE_SOUND, payload: !notify.sound})
    }

    const handleDeleteAll = async () => {
        const newArr = notify.data.filter(item => item.isRead === false)
        if(newArr.length === 0) return dispatch(deleteAllNotifies(auth.token))

        const confirmed = await customConfirm(`You have ${newArr.length} unread notices. Are you sure you want to delete all?`)
        if(confirmed){
            return dispatch(deleteAllNotifies(auth.token))
        }
    }

    const getFilteredData = () => {
        if (filter === 'interactions') {
            return notify.data.filter(item => item.text.includes('like') || item.text.includes('comment') || item.text.includes('reply'));
        }
        if (filter === 'requests') {
            return notify.data.filter(item => item.text.includes('follow') || item.text.includes('request'));
        }
        return notify.data;
    }

    const renderActionBadge = (text) => {
        if (text.includes('like')) {
            return (
                <span className="material-icons position-absolute text-danger" 
                      style={{ fontSize: '0.8rem', bottom: '-2px', right: '-2px', background: 'var(--bg-card)', borderRadius: '50%', padding: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                    favorite
                </span>
            );
        }
        if (text.includes('comment') || text.includes('reply')) {
            return (
                <span className="material-icons position-absolute text-primary" 
                      style={{ fontSize: '0.8rem', bottom: '-2px', right: '-2px', background: 'var(--bg-card)', borderRadius: '50%', padding: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                    chat_bubble
                </span>
            );
        }
        if (text.includes('follow') || text.includes('request')) {
            return (
                <span className="material-icons position-absolute text-success" 
                      style={{ fontSize: '0.8rem', bottom: '-2px', right: '-2px', background: 'var(--bg-card)', borderRadius: '50%', padding: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                    person_add
                </span>
            );
        }
        return null;
    }

    const getNotificationText = (msg) => {
        const actorsCount = msg.actors ? msg.actors.length : 0;
        if (actorsCount > 1) {
            const others = actorsCount - 1;
            return ` and ${others} other${others > 1 ? 's' : ''} ${msg.text}`;
        }
        return ` ${msg.text}`;
    }

    return (
        <div style={{minWidth: '320px', padding: '5px'}}>
            <div className="d-flex justify-content-between align-items-center px-3 mb-2">
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Notifications</h3>
                {
                    notify.sound 
                    ? <i className="fas fa-bell text-danger" 
                    style={{fontSize: '1.1rem', cursor: 'pointer'}}
                    onClick={handleSound} />

                    : <i className="fas fa-bell-slash text-danger"
                    style={{fontSize: '1.1rem', cursor: 'pointer'}}
                    onClick={handleSound} />
                }
            </div>

            {/* Segmented Filter Control Tabs */}
            <div className="d-flex justify-content-around align-items-center py-1 px-1 mx-3 mb-3" 
                 style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span className={`px-2 py-1`} style={{ fontSize: '0.75rem', cursor: 'pointer', fontWeight: filter === 'all' ? 'bold' : 'normal', color: filter === 'all' ? 'var(--primary-color)' : 'var(--text-secondary)', background: filter === 'all' ? 'var(--bg-input)' : 'transparent', borderRadius: '8px', transition: 'all 0.2s ease', flex: 1, textAlign: 'center' }} onClick={() => setFilter('all')}>All</span>
                <span className={`px-2 py-1`} style={{ fontSize: '0.75rem', cursor: 'pointer', fontWeight: filter === 'interactions' ? 'bold' : 'normal', color: filter === 'interactions' ? 'var(--primary-color)' : 'var(--text-secondary)', background: filter === 'interactions' ? 'var(--bg-input)' : 'transparent', borderRadius: '8px', transition: 'all 0.2s ease', flex: 1, textAlign: 'center' }} onClick={() => setFilter('interactions')}>Interactions</span>
                <span className={`px-2 py-1`} style={{ fontSize: '0.75rem', cursor: 'pointer', fontWeight: filter === 'requests' ? 'bold' : 'normal', color: filter === 'requests' ? 'var(--primary-color)' : 'var(--text-secondary)', background: filter === 'requests' ? 'var(--bg-input)' : 'transparent', borderRadius: '8px', transition: 'all 0.2s ease', flex: 1, textAlign: 'center' }} onClick={() => setFilter('requests')}>Requests</span>
            </div>

            {
                getFilteredData().length === 0 &&
                <div className="text-center my-5 text-muted" style={{ opacity: 0.5 }}>
                    <i className="far fa-bell" style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }} />
                    <h6 style={{ fontSize: '0.85rem' }}>No notifications yet</h6>
                </div>
            }

            <div className="notify-list-container" style={{maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: '4px'}}>
                {
                    getFilteredData().map((msg, index) => (
                        <div key={index} className="px-2 mb-3" >
                            <Link to={`${msg.url}`} className="d-flex align-items-center text-decoration-none"
                            onClick={() => handleIsRead(msg)}>
                                <div className="position-relative">
                                    <Avatar src={msg.user.avatar} size="big-avatar" />
                                    {renderActionBadge(msg.text)}
                                </div>

                                <div className="mx-2 flex-fill" style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>
                                    <div>
                                        <strong className="mr-1" style={{ color: 'var(--primary-color)' }}>{msg.user.username}</strong>
                                        <span>{getNotificationText(msg)}</span>
                                    </div>
                                    {msg.content && <small className="text-muted d-block">{msg.content.slice(0,25)}...</small>}
                                </div>

                                {
                                    msg.image &&
                                    <div style={{width: '30px'}} className="ml-2">
                                        {
                                            typeof msg.image === 'string' && msg.image.match(/video/i)
                                            ? <video src={msg.image} width="100%" />
                                            : <Avatar src={msg.image} size="medium-avatar" />
                                        }
                                    </div>
                                }
                                
                            </Link>
                            <small className="text-muted d-flex justify-content-between px-2 mt-1" style={{ fontSize: '0.75rem' }}>
                                {dayjs(msg.createdAt).fromNow()}
                                {
                                    !msg.isRead && <i className="fas fa-circle text-primary" style={{ fontSize: '0.55rem', alignSelf: 'center' }} />
                                }
                            </small>
                        </div>
                    ))
                }

            </div>

            <hr className="my-2" style={{ borderColor: 'var(--border-color)' }} />
            <div className="text-right mr-3 mb-1">
                <button className="btn btn-sm btn-danger d-inline-flex align-items-center justify-content-center" 
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                onClick={handleDeleteAll} title="Delete All Notifications">
                    <span className="material-icons mr-1" style={{ fontSize: '1.1rem' }}>delete_sweep</span>
                    Clear All
                </button>
            </div>

        </div>
    )
}

export default NotifyModal
