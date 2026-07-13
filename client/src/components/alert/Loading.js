import React from 'react'

const Loading = () => {
    return (
        <div className="position-fixed w-100 h-100 text-center loading"
        style={{
            background: "rgba(9, 13, 22, 0.6)",
            backdropFilter: "blur(16px)",
            color: "var(--text-main)",
            top: 0,
            left: 0,
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div className="splash_container" style={{ textAlign: 'center' }}>
                <img 
                    src="/icon-web-01.png" 
                    alt="Instagram Logo" 
                    className="pulse"
                    style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
                        animation: 'pulse 1.8s infinite ease-in-out'
                    }} 
                />
                <h2 style={{
                    marginTop: '20px',
                    fontSize: '28px',
                    fontWeight: '800',
                    letterSpacing: '-0.5px',
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>Instagram</h2>
                <div style={{
                    marginTop: '15px',
                    height: '4px',
                    width: '80px',
                    background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--accent-color) 50%, var(--primary-color) 100%)',
                    backgroundSize: '200% 100%',
                    borderRadius: '4px',
                    margin: '10px auto 0',
                    animation: 'loading-bar-forward 1.5s infinite linear'
                }}></div>
            </div>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.96); opacity: 0.85; }
                    50% { transform: scale(1.04); opacity: 1; }
                    100% { transform: scale(0.96); opacity: 0.85; }
                }
                @keyframes loading-bar-forward {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    )
}

export default Loading
