import React from 'react'
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

    return (
        <div style={{minWidth: '300px'}}>
            <div className="d-flex justify-content-between align-items-center px-3">
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Notification</h3>
                {
                    notify.sound 
                    ? <i className="fas fa-bell text-danger" 
                    style={{fontSize: '1.2rem', cursor: 'pointer'}}
                    onClick={handleSound} />

                    : <i className="fas fa-bell-slash text-danger"
                    style={{fontSize: '1.2rem', cursor: 'pointer'}}
                    onClick={handleSound} />
                }
            </div>
            <hr className="mt-2 mb-3" style={{ borderColor: 'var(--border-color)' }} />

            {
                notify.data.length === 0 &&
                <div className="text-center my-5 text-muted" style={{ opacity: 0.5 }}>
                    <i className="far fa-bell" style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }} />
                    <h5>No notifications yet</h5>
                </div>
            }

            <div style={{maxHeight: 'calc(100vh - 200px)', overflow: 'auto'}}>
                {
                    notify.data.map((msg, index) => (
                        <div key={index} className="px-2 mb-3" >
                            <Link to={`${msg.url}`} className="d-flex align-items-center text-decoration-none"
                            onClick={() => handleIsRead(msg)}>
                                <Avatar src={msg.user.avatar} size="big-avatar" />

                                <div className="mx-2 flex-fill" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    <div>
                                        <strong className="mr-1" style={{ color: 'var(--primary-color)' }}>{msg.user.username}</strong>
                                        <span>{msg.text}</span>
                                    </div>
                                    {msg.content && <small className="text-muted d-block">{msg.content.slice(0,20)}...</small>}
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
                            <small className="text-muted d-flex justify-content-between px-2 mt-1">
                                {dayjs(msg.createdAt).fromNow()}
                                {
                                    !msg.isRead && <i className="fas fa-circle text-primary" />
                                }
                            </small>
                        </div>
                    ))
                }

            </div>

            <hr className="my-1" />
            <div className="text-right mr-2">
                <button className="btn btn-danger" style={{ padding: '6px 12px !important', fontSize: '0.85rem !important' }}
                onClick={handleDeleteAll} title="Delete All Notifications">
                    <span className="material-icons">delete_sweep</span>
                </button>
            </div>

        </div>
    )
}

export default NotifyModal
