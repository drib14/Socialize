import React from 'react'
import { useDispatch } from 'react-redux'
import { GLOBALTYPES } from '../redux/actions/globalTypes'
import {
    EmailShareButton, EmailIcon,
    FacebookShareButton, FacebookIcon,
    TelegramShareButton, TelegramIcon,
    TwitterShareButton, TwitterIcon,
    WhatsappShareButton, WhatsappIcon,
    RedditShareButton, RedditIcon
} from 'react-share'

const ShareModal = ({url, theme}) => {
    const dispatch = useDispatch()

    const handleCopy = () => {
        navigator.clipboard.writeText(url)
        dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Link copied to clipboard!' } })
    }

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Socialize Post',
                    url: url
                })
            } catch (err) {
                console.error(err)
            }
        } else {
            handleCopy()
        }
    }

    return (
        <div className="d-flex align-items-center justify-content-between px-4 py-2 border rounded mt-2"
        style={{ filter: theme ? 'invert(1)' : 'invert(0)', background: 'var(--bg-card)', gap: '10px' }}>
            <FacebookShareButton url={url} >
                <FacebookIcon round={true} size={32} />
            </FacebookShareButton>

            <TwitterShareButton url={url} >
                <TwitterIcon round={true} size={32} />
            </TwitterShareButton>

            <EmailShareButton url={url} >
                <EmailIcon round={true} size={32} />
            </EmailShareButton>

            <RedditShareButton url={url} >
                <RedditIcon round={true} size={32} />
            </RedditShareButton>

            <TelegramShareButton url={url} >
                <TelegramIcon round={true} size={32} />
            </TelegramShareButton>

            <WhatsappShareButton url={url} >
                <WhatsappIcon round={true} size={32} />
            </WhatsappShareButton>

            <button className="btn btn-light rounded-circle d-flex align-items-center justify-content-center p-1"
            onClick={handleCopy} title="Copy Link" style={{ width: '32px', height: '32px', background: '#e4e6eb', border: 'none', cursor: 'pointer' }}>
                <span className="material-icons" style={{ fontSize: '18px', color: '#050505' }}>content_copy</span>
            </button>

            {
                navigator.share &&
                <button className="btn btn-light rounded-circle d-flex align-items-center justify-content-center p-1"
                onClick={handleNativeShare} title="Native Share" style={{ width: '32px', height: '32px', background: '#e4e6eb', border: 'none', cursor: 'pointer' }}>
                    <span className="material-icons" style={{ fontSize: '18px', color: '#050505' }}>share</span>
                </button>
            }
        </div>
    )
}

export default ShareModal
