import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { GLOBALTYPES } from '../redux/actions/globalTypes'
import { createPost, updatePost, repostPost } from '../redux/actions/postAction'
import Icons from './Icons'
import { imageShow, videoShow } from '../utils/mediaShow'
import Modal from 'react-modal'
import axios from 'axios'
import { getDataAPI } from '../utils/fetchData'
import Avatar from './Avatar'
import { PREDEFINED_MOODS, getMoodIcon } from '../utils/moods'

Modal.setAppElement('#root')

const StatusModal = () => {
    const { auth, theme, status, socket } = useSelector(state => state)
    const dispatch = useDispatch()

    const [content, setContent] = useState('')
    const [images, setImages] = useState([])
    const [visibility, setVisibility] = useState('public')

    const [stream, setStream] = useState(false)
    const videoRef = useRef()
    const refCanvas = useRef()
    const textareaRef = useRef()
    const [tracks, setTracks] = useState('')

    // Location autocomplete states
    const [location, setLocation] = useState('')
    const [locationInput, setLocationInput] = useState('')
    const [locationSuggestions, setLocationSuggestions] = useState([])
    const [showLocationInput, setShowLocationInput] = useState(false)

    // Mood states
    const [mood, setMood] = useState('')
    const [dynamicMoods, setDynamicMoods] = useState([])
    const [showMoodCards, setShowMoodCards] = useState(false)

    // Mention autocomplete states
    const [mentionSuggestions, setMentionSuggestions] = useState([])
    const [mentionSearch, setMentionSearch] = useState('')
    const [showMentionDropdown, setShowMentionDropdown] = useState(false)

    // Poll states
    const [showPoll, setShowPoll] = useState(false)
    const [pollQuestion, setPollQuestion] = useState('')
    const [pollOptions, setPollOptions] = useState(['', ''])

    // Hashtag autocomplete states
    const [tagSuggestions, setTagSuggestions] = useState([])
    const [tagSearch, setTagSearch] = useState('')
    const [showTagDropdown, setShowTagDropdown] = useState(false)

    useEffect(() => {
        if(status && textareaRef.current){
            setTimeout(() => {
                textareaRef.current.focus()
            }, 100)
        }
    }, [status])

    const handleChangeImages = e => {
        const files = [...e.target.files]
        let err = ""
        let newImages = []

        files.forEach(file => {
            if(!file) return err = "File does not exist."

            if(file.size > 1024 * 1024 * 30){
                return err = "The image/video largest is 30mb."
            }

            return newImages.push(file)
        })

        if(err) dispatch({ type: GLOBALTYPES.ALERT, payload: {error: err} })
        setImages([...images, ...newImages])
    }

    const deleteImages = (index) => {
        const newArr = [...images]
        newArr.splice(index, 1)
        setImages(newArr)
    }

    const handleStream = () => {
        setStream(true)
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({video: true})
            .then(mediaStream => {
                videoRef.current.srcObject = mediaStream
                videoRef.current.play()

                const track = mediaStream.getTracks()
                setTracks(track[0])
            }).catch(err => console.log(err))
        }
    }

    const handleCapture = () => {
        const width = videoRef.current.clientWidth;
        const height = videoRef.current.clientHeight;

        refCanvas.current.setAttribute("width", width)
        refCanvas.current.setAttribute("height", height)

        const ctx = refCanvas.current.getContext('2d')
        ctx.drawImage(videoRef.current, 0, 0, width, height)
        let URL = refCanvas.current.toDataURL()
        setImages([...images, {camera: URL}])
    }

    const handleStopStream = () => {
        tracks.stop()
        setStream(false)
    }

    const handleLocationSearch = async (e) => {
        const query = e.target.value;
        setLocationInput(query);
        if (query.trim().length < 3) {
            setLocationSuggestions([]);
            return;
        }
        
        try {
            const keyRes = await getDataAPI('location_key', auth.token);
            const key = keyRes.data.key;
            const res = await axios.get(`https://us1.locationiq.com/v1/autocomplete?key=${key}&q=${query}&format=json`);
            if (res.data && Array.isArray(res.data)) {
                setLocationSuggestions(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const selectSuggestion = (suggestion) => {
        setLocation(suggestion.display_name);
        setLocationInput('');
        setLocationSuggestions([]);
        setShowLocationInput(false);
    };

    // Use Predefined Mood Cards
    const toggleMoodCards = () => {
        setShowMoodCards(!showMoodCards);
    };

    // Mentions & Tagging
    const handleTextareaChange = async (e) => {
        const val = e.target.value;
        setContent(val);
        
        const selectionStart = e.target.selectionStart;
        const textBeforeCursor = val.slice(0, selectionStart);
        const words = textBeforeCursor.split(/\s+/);
        const lastWord = words[words.length - 1];
        
        if (lastWord.startsWith('@') && lastWord.length > 1) {
            const query = lastWord.substring(1);
            setMentionSearch(query);
            setShowMentionDropdown(true);
            setShowTagDropdown(false);
            try {
                const res = await getDataAPI(`search?username=${query}`, auth.token);
                if (res.data && Array.isArray(res.data.users)) {
                    setMentionSuggestions(res.data.users);
                }
            } catch (err) {
                console.error(err);
            }
        } else if (lastWord.startsWith('#') && lastWord.length > 1) {
            const query = lastWord.substring(1).toLowerCase();
            setTagSearch(query);
            setShowTagDropdown(true);
            setShowMentionDropdown(false);
            try {
                const res = await getDataAPI(`trending_tags`, auth.token);
                if (res.data && Array.isArray(res.data.tags)) {
                    const matches = res.data.tags
                        .map(t => t.tag)
                        .filter(t => t.startsWith(query));
                    setTagSuggestions(matches);
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            setShowMentionDropdown(false);
            setMentionSuggestions([]);
            setShowTagDropdown(false);
            setTagSuggestions([]);
        }
    };

    const selectTag = (tag) => {
        const selectionStart = textareaRef.current.selectionStart;
        const textBeforeCursor = content.slice(0, selectionStart);
        const textAfterCursor = content.slice(selectionStart);
        
        const words = textBeforeCursor.split(/\s+/);
        words[words.length - 1] = `#${tag} `;
        const newTextBeforeCursor = words.join(' ');
        
        const newContent = newTextBeforeCursor + textAfterCursor;
        setContent(newContent);
        setShowTagDropdown(false);
        setTagSuggestions([]);
        
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = newTextBeforeCursor.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 50);
    };

    const selectMention = (userObj) => {
        const selectionStart = textareaRef.current.selectionStart;
        const textBeforeCursor = content.slice(0, selectionStart);
        const textAfterCursor = content.slice(selectionStart);
        
        const words = textBeforeCursor.split(/\s+/);
        words[words.length - 1] = `@${userObj.username} `;
        const newTextBeforeCursor = words.join(' ');
        
        const newContent = newTextBeforeCursor + textAfterCursor;
        setContent(newContent);
        setShowMentionDropdown(false);
        setMentionSuggestions([]);
        
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = newTextBeforeCursor.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 50);
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        if(content.trim().length === 0 && images.length === 0 && !showPoll)
        return dispatch({ 
            type: GLOBALTYPES.ALERT, payload: {error: "Please add content, a photo, or a poll."}
        })

        let pollPayload = undefined
        if (showPoll) {
            if (!pollQuestion.trim()) {
                return dispatch({ type: GLOBALTYPES.ALERT, payload: {error: "Please enter a poll question."} })
            }
            const filledOptions = pollOptions.filter(o => o.trim() !== '')
            if (filledOptions.length < 2) {
                return dispatch({ type: GLOBALTYPES.ALERT, payload: {error: "Please enter at least 2 poll options."} })
            }
            pollPayload = {
                question: pollQuestion,
                options: filledOptions.map(text => ({ text }))
            }
        }

        if(status.repostOf){
            dispatch(repostPost({post: status.repostOf, content, auth, socket}))
        }else if(status.onEdit){
            dispatch(updatePost({content, images, auth, status, location, mood, visibility}))
        }else{
            dispatch(createPost({content, images, auth, socket, location, mood, visibility, poll: pollPayload}))
        }

        setContent('')
        setImages([])
        setLocation('')
        setMood('')
        setVisibility('public')
        setShowLocationInput(false)
        setShowMoodCards(false)
        setShowPoll(false)
        setPollQuestion('')
        setPollOptions(['', ''])
        if(tracks) tracks.stop()
        dispatch({ type: GLOBALTYPES.STATUS, payload: false})
    }

    const handleCloseModal = () => {
        setContent('')
        setImages([])
        setLocation('')
        setMood('')
        setVisibility('public')
        setShowLocationInput(false)
        setShowMoodCards(false)
        setShowPoll(false)
        setPollQuestion('')
        setPollOptions(['', ''])
        if(tracks) tracks.stop()
        dispatch({ type: GLOBALTYPES.STATUS, payload: false})
    }

    useEffect(() => {
        if(status.onEdit){
            setContent(status.content)
            setImages(status.images)
            setLocation(status.location || '')
            setMood(status.mood || '')
            setVisibility(status.visibility || 'public')
        }
    },[status])

    return (
        <Modal
            isOpen={!!status}
            onRequestClose={handleCloseModal}
            className="status_modal_content"
            overlayClassName="status_modal_overlay"
            contentLabel="Status Modal"
        >
            <form onSubmit={handleSubmit}>
                <div className="status_header">
                    <h5 className="m-0">{status && status.repostOf ? 'Quote Post' : 'Create Post'}</h5>
                    <span onClick={handleCloseModal}>
                        &times;
                    </span>
                </div>

                <div className="status_body">
                    <div className="d-flex align-items-center mb-3">
                        <Avatar src={auth.user.avatar} size="big-avatar" />
                        <div className="ml-2">
                            <span className="d-block font-weight-bold" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                {auth.user.fullname}
                            </span>
                            <div className="mt-1 d-flex align-items-center" style={{ gap: '6px' }}>
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@{auth.user.username}</small>
                            </div>
                        </div>
                    </div>

                    <textarea name="content" value={content}
                    placeholder="Write a caption..."
                    onChange={handleTextareaChange}
                    autoFocus
                    ref={textareaRef}
                    style={{
                        color: 'var(--text-main)',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px'
                    }} />

                    {/* Quoted post preview inside editor */}
                    {status && status.repostOf && (
                        <div className="mt-2 p-3 text-left mb-2" style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            background: 'rgba(0,0,0,0.02)',
                        }}>
                            <div className="d-flex align-items-center mb-1">
                                <Avatar src={status.repostOf.user.avatar} size="small-avatar" />
                                <div className="ml-2">
                                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>@{status.repostOf.user.username}</strong>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                                {status.repostOf.content}
                            </div>
                        </div>
                    )}

                    {/* Mention Autocomplete Dropdown overlay */}
                    {
                        showMentionDropdown && mentionSuggestions.length > 0 && (
                            <div className="mention_dropdown mb-2" style={{ 
                                background: 'var(--bg-card)', 
                                border: '1px solid var(--border-color)', 
                                borderRadius: '8px', 
                                maxHeight: '150px', 
                                overflowY: 'auto', 
                                zIndex: 100, 
                                boxShadow: 'var(--shadow-md)',
                            }}>
                                {mentionSuggestions.map((item) => (
                                    <div 
                                        key={item._id} 
                                        onClick={() => selectMention(item)} 
                                        className="p-2 dropdown-item d-flex align-items-center" 
                                        style={{ cursor: 'pointer', gap: '8px' }}
                                    >
                                        <Avatar src={item.avatar} size="small-avatar" />
                                        <div className="text-truncate">
                                            <strong style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{item.fullname}</strong>
                                            <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>@{item.username}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    }

                    {/* Hashtag Autocomplete Dropdown overlay */}
                    {
                        showTagDropdown && tagSuggestions.length > 0 && (
                            <div className="mention_dropdown mb-2" style={{ 
                                background: 'var(--bg-card)', 
                                border: '1px solid var(--border-color)', 
                                borderRadius: '8px', 
                                maxHeight: '150px', 
                                overflowY: 'auto', 
                                zIndex: 100, 
                                boxShadow: 'var(--shadow-md)',
                            }}>
                                {tagSuggestions.map((tag) => (
                                    <div 
                                        key={tag} 
                                        onClick={() => selectTag(tag)} 
                                        className="p-2 dropdown-item d-flex align-items-center" 
                                        style={{ cursor: 'pointer', gap: '8px', color: 'var(--text-main)', fontSize: '0.85rem' }}
                                    >
                                        <i className="fas fa-hashtag text-muted mr-1" />
                                        <strong>{tag}</strong>
                                    </div>
                                ))}
                            </div>
                        )
                    }

                    {/* Location Badge */}
                    {
                        location && (
                            <div className="d-flex align-items-center mb-2 px-2 py-1" 
                                 style={{ background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border-color)', width: 'fit-content', gap: '6px' }}>
                                <span className="material-icons text-primary" style={{ fontSize: '1rem' }}>place</span>
                                <small style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>{location}</small>
                                <span className="material-icons text-danger" style={{ fontSize: '1rem', cursor: 'pointer' }} onClick={() => setLocation('')}>close</span>
                            </div>
                        )
                    }

                    {/* Autocomplete Input Location Search */}
                    {
                        showLocationInput && !location && (
                            <div className="position-relative mb-2">
                                <input 
                                    type="text" 
                                    placeholder="Search location..." 
                                    value={locationInput} 
                                    onChange={handleLocationSearch}
                                    className="form-control form-control-sm"
                                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '6px 12px' }}
                                />
                                {
                                    locationSuggestions.length > 0 && (
                                        <div className="position-absolute w-100" style={{ 
                                            background: 'var(--bg-card)', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '8px', 
                                            maxHeight: '180px', 
                                            overflowY: 'auto', 
                                            zIndex: 100, 
                                            boxShadow: 'var(--shadow-md)',
                                            top: '36px'
                                        }}>
                                            {locationSuggestions.map((item, index) => (
                                                <div 
                                                    key={index} 
                                                    onClick={() => selectSuggestion(item)} 
                                                    className="p-2 dropdown-item text-truncate" 
                                                    style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}
                                                >
                                                    {item.display_name}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }

                    <div className="d-flex">
                        <div className="flex-fill"></div>
                        <Icons setContent={setContent} content={content} theme={theme} />
                    </div>

                    <div className="show_images">
                        {
                            images.map((img, index) => (
                                <div key={index} id="file_img">
                                    {
                                        img.camera ? imageShow(img.camera, theme)
                                        : img.url
                                            ?<>
                                                {
                                                    typeof img.url === 'string' && img.url.match(/video/i)
                                                    ? videoShow(img.url, theme) 
                                                    : imageShow(img.url, theme)
                                                }
                                            </>
                                            :<>
                                                {
                                                    img.type && typeof img.type === 'string' && img.type.match(/video/i)
                                                    ? videoShow(URL.createObjectURL(img), theme) 
                                                    : imageShow(URL.createObjectURL(img), theme)
                                                }
                                            </>
                                    }
                                    <span onClick={() => deleteImages(index)}>&times;</span>
                                </div>
                            ))
                        }
                    </div>

                    {
                        stream && 
                        <div className="stream position-relative">
                            <video autoPlay muted ref={videoRef} width="100%" height="100%"
                            style={{filter: theme ? 'invert(1)' : 'invert(0)'}} />
                            
                            <span onClick={handleStopStream}>&times;</span>
                            <canvas ref={refCanvas} style={{display: 'none'}} />
                        </div>
                    }

                    <div className="input_images px-3 py-2 d-flex align-items-center justify-content-between" style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        background: 'rgba(0,0,0,0.01)',
                        marginTop: '15px'
                    }}>
                        <span className="font-weight-bold" style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Add to your post</span>
                        <div className="d-flex align-items-center" style={{ gap: '15px' }}>
                            {
                                stream 
                                ? <i className="fas fa-camera text-primary" onClick={handleCapture} style={{ fontSize: '1.3rem', cursor: 'pointer' }} />
                                : <>
                                    <i className="fas fa-camera text-secondary mr-2" onClick={handleStream} style={{ fontSize: '1.3rem', cursor: 'pointer' }} title="Capture Photo" />

                                    <div className="file_upload mr-2">
                                        <i className="fas fa-image text-success" style={{ fontSize: '1.3rem', cursor: 'pointer' }} title="Upload Media" />
                                        <input type="file" name="file" id="file"
                                        multiple accept="image/*,video/*" onChange={handleChangeImages} />
                                    </div>

                                    <div className="file_upload mr-2" onClick={() => setShowLocationInput(!showLocationInput)} title="Add Location" style={{ cursor: 'pointer' }}>
                                        <span className="material-icons text-primary" style={{ fontSize: '1.4rem', verticalAlign: 'middle' }}>place</span>
                                    </div>

                                    <div className="file_upload" onClick={() => setShowLocationInput(!showLocationInput)} title="Add Location" style={{ cursor: 'pointer' }}>
                                        <span className="material-icons text-primary" style={{ fontSize: '1.4rem', verticalAlign: 'middle' }}>place</span>
                                    </div>
                                </>
                            }
                        </div>
                    </div>

                </div>

                <div className="status_footer mt-3">
                    <button className="btn btn-primary w-100" type="submit" 
                    disabled={images.length === 0 && !(status && status.repostOf)}
                    style={{ 
                        borderRadius: '4px', 
                        padding: '10px 0', 
                        fontWeight: 'bold', 
                        fontSize: '0.95rem',
                        background: '#0095f6',
                        border: 'none'
                    }}>
                        Share
                    </button>
                </div>

            </form>
        </Modal>
    )
}

export default StatusModal
