import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center text-center px-4" 
        style={{ minHeight: 'calc(100vh - 80px)', background: 'var(--bg-body)', transition: 'var(--transition)' }}>
            
            {/* Animated Radar Scanning / Sonar SVG */}
            <div className="position-relative mb-4" style={{ width: '220px', height: '220px' }}>
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-color)" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="var(--border-color)" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="15" fill="none" stroke="var(--border-color)" strokeWidth="0.5" />
                    
                    {/* Crosshairs */}
                    <line x1="50" y1="5" x2="50" y2="95" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="5" y1="50" x2="95" y2="50" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2 2" />
                    
                    {/* Rotating Radar Sweep Line */}
                    <line x1="50" y1="50" x2="50" y2="5" stroke="var(--primary-color)" strokeWidth="1.5">
                        <animateTransform 
                            attributeName="transform" 
                            type="rotate" 
                            from="0 50 50" 
                            to="360 50 50" 
                            dur="4s" 
                            repeatCount="indefinite" 
                        />
                    </line>
                    
                    {/* Blinking signal dot for lost page */}
                    <circle cx="75" cy="30" r="2.5" fill="#ef4444">
                        <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                </svg>
                
                {/* 404 Number Layered in the Center */}
                <h1 className="position-absolute m-0" 
                style={{ 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    fontSize: '3rem', 
                    fontWeight: '800', 
                    color: 'var(--text-main)', 
                    letterSpacing: '1px' 
                }}>
                    404
                </h1>
            </div>

            <h2 className="font-weight-bold mb-2" style={{ color: 'var(--text-main)', fontSize: '1.75rem' }}>
                Lost in Space
            </h2>
            
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                The coordinates you entered led to an empty quadrant. The page you are looking for has been moved or doesn't exist.
            </p>

            <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <span className="material-icons mr-2">home</span>
                Return Orbit
            </Link>
        </div>
    )
}

export default NotFound
