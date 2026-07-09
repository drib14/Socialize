import React, { useState, useEffect, useRef } from 'react'
import UserCard from '../UserCard'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import MsgDisplay from './MsgDisplay'
import Icons from '../Icons'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { imageShow, videoShow } from '../../utils/mediaShow'
import { imageUpload } from '../../utils/imageUpload'
import { addMessage, getMessages, loadMoreMessages, deleteConversation } from '../../redux/actions/messageAction'
import { customConfirm } from '../../utils/customAlert'

const RightSide = () => {
    const { auth, message, theme, socket, peer } = useSelector(state => state)
    const dispatch = useDispatch()

    const { id } = useParams()
    const [user, setUser] = useState([])
    const [text, setText] = useState('')
    const [media, setMedia] = useState([])
    const [loadMedia, setLoadMedia] = useState(false)

    const refDisplay = useRef()
    const pageEnd = useRef()

    const [data, setData] = useState([])
    const [result, setResult] = useState(9)
    const [page, setPage] = useState(0)
    const [isLoadMore, setIsLoadMore] = useState(0)

    const navigate = useNavigate()

    // Voice message recording states
    const [recording, setRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState(null)
    const [replyMessage, setReplyMessage] = useState(null)

    useEffect(() => {
        const newData = message.data.find(item => item._id === id)
        if(newData){
            setData(newData.messages)
            setResult(newData.result)
            setPage(newData.page)
        }
    },[message.data, id])

    useEffect(() => {
        if(id && message.users.length > 0){
            setTimeout(() => {
                if(refDisplay.current) {
                    refDisplay.current.scrollIntoView({behavior: 'smooth', block: 'end'})
                }
            },50)

            const newUser = message.users.find(user => user._id === id)
            if(newUser) setUser(newUser)
        }
    }, [message.users, id])

    const handleChangeMedia = (e) => {
        const files = [...e.target.files]
        let err = ""
        let newMedia = []

        files.forEach(file => {
            if(!file) return err = "File does not exist."

            if(file.size > 1024 * 1024 * 5){
                return err = "The largest file size is 5mb."
            }

            return newMedia.push(file)
        })

        if(err) dispatch({ type: GLOBALTYPES.ALERT, payload: {error: err} })
        setMedia([...media, ...newMedia])
    }

    const handleDeleteMedia = (index) => {
        const newArr = [...media]
        newArr.splice(index, 1)
        setMedia(newArr)
    }

    const handleSubmit = async (e) => {
        if(e) e.preventDefault();
        if(!text.trim() && media.length === 0) return;
        
        const textToSend = text;
        const mediaToSend = media;
        const replyToSend = replyMessage;

        setText('')
        setMedia([])
        setReplyMessage(null)
        setLoadMedia(true)

        let newArr = [];
        if(mediaToSend.length > 0) newArr = await imageUpload(mediaToSend, auth.token)

        const msg = {
            sender: auth.user._id,
            recipient: id,
            text: textToSend, 
            media: newArr,
            replyTo: replyToSend ? replyToSend._id : undefined,
            createdAt: new Date().toISOString()
        }

        setLoadMedia(false)
        await dispatch(addMessage({msg, auth, socket}))
        if(refDisplay.current){
            refDisplay.current.scrollIntoView({behavior: 'smooth', block: 'end'})
        }
    }

    useEffect(() => {
        const getMessagesData = async () => {
            if(message.data.every(item => item._id !== id)){
                await dispatch(getMessages({auth, id}))
                setTimeout(() => {
                    if(refDisplay.current) {
                        refDisplay.current.scrollIntoView({behavior: 'smooth', block: 'end'})
                    }
                },50)
            }
        }
        getMessagesData()
    },[id, dispatch, auth, message.data])

    // Load More
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if(entries[0].isIntersecting){
                setIsLoadMore(p => p + 1)
            }
        },{
            threshold: 0.1
        })

        if(pageEnd.current) {
            observer.observe(pageEnd.current)
        }
    },[setIsLoadMore])

    useEffect(() => {
        if(isLoadMore > 1){
            if(result >= page * 9){
                dispatch(loadMoreMessages({auth, id, page: page + 1}))
                setIsLoadMore(1)
            }
        }
        // eslint-disable-next-line
    },[isLoadMore])

    const handleDeleteConversation = async () => {
        const confirmed = await customConfirm('Do you want to delete this conversation?')
        if(confirmed){
            dispatch(deleteConversation({auth, id}))
            return navigate('/message')
        }
    }

    // Call
    const caller = ({video}) => {
        const { _id, avatar, username, fullname } = user

        const msg = {
            sender: auth.user._id,
            recipient: _id, 
            avatar, username, fullname, video
        }
        dispatch({ type: GLOBALTYPES.CALL, payload: msg })
    }

    const callUser = ({video}) => {
        const { _id, avatar, username, fullname } = auth.user

        const msg = {
            sender: _id,
            recipient: user._id, 
            avatar, username, fullname, video
        }

        if(peer.open) msg.peerId = peer._id

        socket.emit('callUser', msg)
    }

    const handleAudioCall = () => {
        caller({video: false})
        callUser({video: false})
    }
    
    const handleVideoCall = () => {
        caller({video: true})
        callUser({video: true})
    }

    // Audio Voice Message Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            let chunks = [];
            
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            
            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
                const audioFile = new File([audioBlob], `voice_${Date.now()}.mp3`, { type: 'audio/mp3' });
                
                // Upload and send voice message immediately for modern experience
                setLoadMedia(true)
                const uploaded = await imageUpload([audioFile], auth.token);
                const msg = {
                    sender: auth.user._id,
                    recipient: id,
                    text: "", 
                    media: uploaded,
                    replyTo: replyMessage ? replyMessage._id : undefined,
                    createdAt: new Date().toISOString()
                }
                setReplyMessage(null)
                setLoadMedia(false)
                await dispatch(addMessage({msg, auth, socket}))
                if(refDisplay.current){
                    refDisplay.current.scrollIntoView({behavior: 'smooth', block: 'end'})
                }
            };
            
            recorder.start();
            setMediaRecorder(recorder);
            setRecording(true);
        } catch (err) {
            dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Microphone access denied or unavailable." } });
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setRecording(false);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.ondataavailable = null;
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setRecording(false);
        }
    };

    return (
        <>
            <div className="message_header" style={{cursor: 'pointer'}} >
                {
                    user.length !== 0 &&
                    <UserCard user={user}>
                        <div>
                            <i className="fas fa-phone-alt"
                            onClick={handleAudioCall} />

                            <i className="fas fa-video mx-3"
                            onClick={handleVideoCall} />

                            <i className="fas fa-trash text-danger"
                            onClick={handleDeleteConversation} />
                        </div>
                    </UserCard>
                }
            </div>

            <div className="chat_container" 
            style={{height: media.length > 0 ? 'calc(100% - 180px)' : ''}} >
                <div className="chat_display" ref={refDisplay}>
                    <button style={{marginTop: '-25px', opacity: 0}} ref={pageEnd}>
                        Load more
                    </button>

                    {
                        data.map((msg, index) => (
                                <div key={index}>
                                    {
                                        msg.sender !== auth.user._id &&
                                        <div className="chat_row other_message">
                                            <MsgDisplay user={user} msg={msg} theme={theme} setOnReply={setReplyMessage} />
                                        </div>
                                    }

                                    {
                                        msg.sender === auth.user._id &&
                                        <div className="chat_row you_message">
                                            <MsgDisplay user={auth.user} msg={msg} theme={theme} data={data} setOnReply={setReplyMessage} />
                                        </div>
                                    }
                                </div>
                        ))
                    }
                    

                   {
                       loadMedia && 
                       <div className="chat_row you_message">
                           <img src="/icon-web-01.png" alt="loading" className="loading-logo" />
                       </div>
                   }

                </div>
            </div>

            <div className="show_media" style={{display: media.length > 0 ? 'grid' : 'none'}} >
                {
                    media.map((item, index) => (
                        <div key={index} id="file_media">
                            {
                                item.type && typeof item.type === 'string' && item.type.match(/video/i)
                                ? videoShow(URL.createObjectURL(item), theme)
                                : (item.type && typeof item.type === 'string' && item.type.match(/image/i)
                                   ? imageShow(URL.createObjectURL(item), theme)
                                   : <div className="d-flex align-items-center justify-content-center h-100" style={{background: '#eee'}}><span className="material-icons text-primary">insert_drive_file</span></div>)
                            }
                            <span onClick={() => handleDeleteMedia(index)} >&times;</span>
                        </div>
                    ))
                }
            </div>

            {/* Quoted Message Preview above text bar */}
            {
                replyMessage && (
                    <div className="d-flex justify-content-between align-items-center px-3 py-2" 
                         style={{ background: 'var(--bg-body)', borderTop: '1px solid var(--border-color)', gap: '10px', borderLeft: '4px solid var(--primary-color)' }}>
                        <div className="text-left overflow-hidden" style={{ flex: 1 }}>
                            <small className="font-weight-bold d-block" style={{ color: 'var(--primary-color)' }}>
                                Replying to {replyMessage.sender === auth.user._id ? 'Yourself' : user.fullname}
                            </small>
                            <small className="text-muted text-truncate d-block" style={{ fontSize: '0.85rem' }}>
                                {replyMessage.text || (replyMessage.media.length > 0 ? 'Attachment' : '')}
                            </small>
                        </div>
                        <span className="material-icons text-muted" style={{ cursor: 'pointer', fontSize: '1.25rem' }} 
                              onClick={() => setReplyMessage(null)}>
                            close
                        </span>
                    </div>
                )
            }

            {/* Voice Message Recorder Bar vs Text Inputs */}
            {
                recording ? (
                    <div className="chat_input d-flex align-items-center justify-content-between py-2 px-3" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', gap: '16px' }}>
                        <div className="d-flex align-items-center" style={{ gap: '8px', color: '#ef4444' }}>
                            <span className="material-icons animated flash infinite" style={{ animation: 'blink 1s infinite' }}>mic</span>
                            <small className="font-weight-bold">Recording Voice Message...</small>
                        </div>
                        <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                            <button className="btn btn-sm btn-outline-danger py-1 px-3" style={{ borderRadius: '16px' }} onClick={cancelRecording}>Cancel</button>
                            <button className="btn btn-sm btn-clay py-1 px-3 text-white" style={{ borderRadius: '16px', background: 'var(--primary-color)' }} onClick={stopRecording}>Done</button>
                        </div>
                    </div>
                ) : (
                    <form className="chat_input" onSubmit={handleSubmit} >
                        <input type="text" placeholder="Enter your message..."
                        value={text} onChange={e => setText(e.target.value)}
                        style={{
                            background: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '18px'
                        }} />

                        <Icons setContent={setText} content={text} theme={theme} />

                        {/* Record Trigger */}
                        <div className="file_upload" onClick={startRecording} title="Record Voice Message" style={{ cursor: 'pointer' }}>
                            <span className="material-icons text-success" style={{ fontSize: '1.5rem' }}>mic</span>
                        </div>

                        {/* File Upload Trigger */}
                        <div className="file_upload" title="Upload Media/Files">
                            <span className="material-icons text-danger" style={{ fontSize: '1.5rem' }}>insert_drive_file</span>
                            <input type="file" name="file" id="file"
                            multiple accept="image/*,video/*,audio/*,application/*,text/*" onChange={handleChangeMedia} />
                        </div>

                        <button type="submit" className="material-icons" 
                        disabled={(text || media.length > 0) ? false : true}>
                            near_me
                        </button>
                    </form>
                )
            }
        </>
    )
}

export default RightSide
