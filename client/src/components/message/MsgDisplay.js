import React from 'react'
import Avatar from '../Avatar'
import { imageShow, videoShow } from '../../utils/mediaShow'
import { useSelector, useDispatch } from 'react-redux'
import { deleteMessages } from '../../redux/actions/messageAction'
import Times from './Times'
import { customConfirm } from '../../utils/customAlert'

const MsgDisplay = ({user, msg, theme, data}) => {
    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()

    const handleDeleteMessages = async () => {
        if(!data) return;
        
        const confirmed = await customConfirm('Do you want to delete this message?')
        if(confirmed){
            dispatch(deleteMessages({msg, data, auth}))
        }
    }

    const renderMediaOrFile = (item, index) => {
        if (!item || !item.url) return null;
        
        const url = item.url;
        const isVideo = typeof url === 'string' && (url.match(/\.(mp4|webm|ogg|quicktime)/i) || url.includes('/video/upload/') || url.match(/video/i));
        const isImage = typeof url === 'string' && (url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || url.includes('/image/upload/') || !url.match(/video/i));

        if (isImage) {
            return (
                <div key={index} className="chat_media_container position-relative mb-2" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: '280px', boxShadow: 'var(--shadow-sm)' }}>
                    <img src={url} alt="chat attachment" className="img-thumbnail p-0 border-0" style={{ width: '100%', height: 'auto', display: 'block', transition: 'var(--transition)' }} />
                    <a href={url} target="_blank" rel="noopener noreferrer" className="chat_media_download position-absolute d-flex align-items-center justify-content-center" 
                       style={{ top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.85)', color: 'var(--text-main)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', textDecoration: 'none' }}>
                        <span className="material-icons" style={{ fontSize: '1.1rem' }}>file_download</span>
                    </a>
                </div>
            );
        }

        if (isVideo) {
            return (
                <div key={index} className="chat_media_container position-relative mb-2" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: '320px', boxShadow: 'var(--shadow-sm)' }}>
                    <video src={url} controls className="w-100" style={{ display: 'block', borderRadius: 'var(--radius-md)' }} />
                </div>
            );
        }

        // Generic File
        const fileName = typeof url === 'string' ? url.substring(url.lastIndexOf('/') + 1) : "file";
        const displayName = fileName.length > 20 ? fileName.substring(0, 15) + '...' + fileName.substring(fileName.lastIndexOf('.')) : fileName;
        
        return (
            <div key={index} className="chat_file_bubble d-flex align-items-center p-3 mb-2" 
                 style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', maxWidth: '280px', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
                <span className="material-icons text-primary" style={{ fontSize: '2.5rem' }}>insert_drive_file</span>
                <div className="text-left overflow-hidden" style={{ flex: 1 }}>
                    <div className="font-weight-bold text-truncate" style={{ fontSize: '0.9rem', color: 'var(--text-main)' }} title={fileName}>
                        {displayName}
                    </div>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>Attachment</small>
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-clay" 
                   style={{ padding: '6px', borderRadius: '50%', minWidth: 'auto', background: 'var(--bg-card)' }}
                   title="Download file">
                    <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>download</span>
                </a>
            </div>
        );
    };

    return (
        <>
            <div className="chat_title">
                <Avatar src={user.avatar} size="small-avatar" />
                <span>{user.fullname}</span>
            </div>

            <div className="you_content">
                { 
                    user._id === auth.user._id && 
                    <i className="fas fa-trash text-danger"
                     onClick={handleDeleteMessages} />
                }

                <div>
                    {
                        msg.text && 
                        <div className="chat_text"
                        style={{filter: theme ? 'invert(1)' : 'invert(0)'}}>
                            {msg.text}
                        </div>
                    }
                    {
                        msg.media.map((item, index) => renderMediaOrFile(item, index))
                    }
                </div>
            
                {
                    msg.call &&
                    <button className="btn d-flex align-items-center py-3"
                    style={{background: '#eee', borderRadius: '10px'}}>

                        <span className="material-icons font-weight-bold mr-1"
                        style={{ 
                            fontSize: '2.5rem', color: msg.call.times === 0 ? '#2b8a3e' : 'green',
                            filter: theme ? 'invert(1)' : 'invert(0)'
                        }}>
                            {
                                msg.call.times === 0
                                ? msg.call.video ? 'videocam_off' : 'phone_disabled'
                                : msg.call.video ? 'video_camera_front' : 'call'
                            }
                        </span>

                        <div className="text-left">
                            <h6>{msg.call.video ? 'Video Call' : 'Audio Call'}</h6>
                            <small>
                                {
                                    msg.call.times > 0 
                                    ? <Times total={msg.call.times} />
                                    : new Date(msg.createdAt).toLocaleTimeString()
                                }
                            </small>
                        </div>

                    </button>
                }
            
            </div>

            <div className="chat_time">
                {new Date(msg.createdAt).toLocaleString()}
            </div>
        </>
    )
}

export default MsgDisplay
