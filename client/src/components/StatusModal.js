import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { GLOBALTYPES } from '../redux/actions/globalTypes'
import { createPost, updatePost } from '../redux/actions/postAction'
import Icons from './Icons'
import { imageShow, videoShow } from '../utils/mediaShow'
import Modal from 'react-modal'
import axios from 'axios'
import { getDataAPI } from '../utils/fetchData'

Modal.setAppElement('#root')

const StatusModal = () => {
    const { auth, theme, status, socket } = useSelector(state => state)
    const dispatch = useDispatch()

    const [content, setContent] = useState('')
    const [images, setImages] = useState([])

    const [stream, setStream] = useState(false)
    const videoRef = useRef()
    const refCanvas = useRef()
    const textareaRef = useRef()
    const [tracks, setTracks] = useState('')

    // Location states
    const [location, setLocation] = useState('')
    const [loadingLocation, setLoadingLocation] = useState(false)

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

            if(file.size > 1024 * 1024 * 5){
                return err = "The image/video largest is 5mb."
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

    const handleShareLocation = async () => {
        if (navigator.geolocation) {
            setLoadingLocation(true)
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const keyRes = await getDataAPI('location_key', auth.token);
                    const key = keyRes.data.key;
                    
                    const res = await axios.get(`https://us1.locationiq.com/v1/reverse.php?key=${key}&lat=${latitude}&lon=${longitude}&format=json`);
                    if (res.data && res.data.address) {
                        const addr = res.data.address;
                        const city = addr.city || addr.town || addr.village || addr.suburb || '';
                        const country = addr.country || '';
                        const locationName = city ? `${city}, ${country}` : country;
                        setLocation(locationName);
                    }
                } catch (err) {
                    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Failed to fetch geocoded location." } })
                }
                setLoadingLocation(false)
            }, (err) => {
                dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.message } })
                setLoadingLocation(false)
            })
        } else {
            dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Geolocation is not supported by your browser." } })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if(content.trim().length === 0 && images.length === 0)
        return dispatch({ 
            type: GLOBALTYPES.ALERT, payload: {error: "Please add content or a photo."}
        })

        if(status.onEdit){
            dispatch(updatePost({content, images, auth, status, location}))
        }else{
            dispatch(createPost({content, images, auth, socket, location}))
        }

        setContent('')
        setImages([])
        setLocation('')
        if(tracks) tracks.stop()
        dispatch({ type: GLOBALTYPES.STATUS, payload: false})
    }

    const handleCloseModal = () => {
        setContent('')
        setImages([])
        setLocation('')
        if(tracks) tracks.stop()
        dispatch({ type: GLOBALTYPES.STATUS, payload: false})
    }

    useEffect(() => {
        if(status.onEdit){
            setContent(status.content)
            setImages(status.images)
            setLocation(status.location || '')
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
                    <h5 className="m-0">Create Post</h5>
                    <span onClick={handleCloseModal}>
                        &times;
                    </span>
                </div>

                <div className="status_body">
                    <textarea name="content" value={content}
                    placeholder={`${auth.user.username}, what are you thinking?`}
                    onChange={e => setContent(e.target.value)}
                    autoFocus
                    ref={textareaRef}
                    style={{
                        color: 'var(--text-main)',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px'
                    }} />

                    {
                        loadingLocation && <small className="text-muted d-block mb-2">Fetching GPS coordinates...</small>
                    }
                    
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

                    <div className="input_images">
                        {
                            stream 
                            ? <i className="fas fa-camera" onClick={handleCapture} />
                            : <>
                                <i className="fas fa-camera" onClick={handleStream} />

                                <div className="file_upload">
                                    <i className="fas fa-image" />
                                    <input type="file" name="file" id="file"
                                    multiple accept="image/*,video/*" onChange={handleChangeImages} />
                                </div>

                                <div className="file_upload" onClick={handleShareLocation} title="Share Location" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons text-success" style={{ fontSize: '1.4rem', verticalAlign: 'middle' }}>place</span>
                                </div>
                            </>
                        }
                        
                    </div>

                </div>

                <div className="status_footer">
                    <button className="btn btn-secondary w-100" type="submit" style={{ background: '#2b8a3e', borderColor: '#2b8a3e', color: 'white' }}>
                        Post
                    </button>
                </div>

            </form>
        </Modal>
    )
}

export default StatusModal
