import React from 'react'
import LeftSide from '../../components/message/LeftSide'

const Message = () => {
    return (
        <div className="message d-flex">
            <div className="col-md-4 border-right px-0">
                <LeftSide />
            </div>

            <div className="col-md-8 px-0 right_mess">
                <div className="d-flex justify-content-center 
                align-items-center flex-column h-100">

                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram Logo" 
                    style={{
                        width: '90px', 
                        height: '90px'
                    }} />
                    <h4 className="mt-3 font-weight-bold" style={{color: 'var(--text-main)', fontSize: '1.25rem'}}>Your Messages</h4>
                    <p className="text-muted" style={{fontSize: '0.88rem'}}>Send private photos and messages to a friend or group.</p>

                </div>
            </div>
        </div>
    )
}

export default Message
