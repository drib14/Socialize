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

                    <img src="/icon-web-01.png" alt="Chattix Logo" 
                    style={{
                        width: '90px', 
                        height: '90px', 
                        borderRadius: '20px', 
                        boxShadow: 'var(--shadow-md)'
                    }} />
                    <h4 className="mt-3 font-weight-bold" style={{color: 'var(--text-secondary)'}}>Chattix</h4>

                </div>
            </div>
        </div>
    )
}

export default Message
