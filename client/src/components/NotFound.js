import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
    const canvasRef = useRef(null)
    const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animationFrameId

        let width = canvas.width = window.innerWidth
        let height = canvas.height = window.innerHeight

        const particles = []
        const particleCount = 100

        class Particle {
            constructor() {
                this.x = Math.random() * width
                this.y = Math.random() * height
                this.size = Math.random() * 3 + 1
                this.baseX = this.x
                this.baseY = this.y
                this.density = (Math.random() * 30) + 1
            }

            draw() {
                ctx.fillStyle = 'rgba(37, 99, 235, 0.8)' // primary color
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.closePath()
                ctx.fill()
            }

            update() {
                let dx = mousePos.x - this.x
                let dy = mousePos.y - this.y
                let distance = Math.sqrt(dx * dx + dy * dy)
                let forceDirectionX = dx / distance
                let forceDirectionY = dy / distance
                let maxDistance = 150
                let force = (maxDistance - distance) / maxDistance
                let directionX = forceDirectionX * force * this.density
                let directionY = forceDirectionY * force * this.density

                if (distance < maxDistance) {
                    this.x -= directionX
                    this.y -= directionY
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX
                        this.x -= dx / 10
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY
                        this.y -= dy / 10
                    }
                }
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle())
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height)
            for (let i = 0; i < particleCount; i++) {
                particles[i].draw()
                particles[i].update()
            }
            connect()
            animationFrameId = requestAnimationFrame(animate)
        }

        const connect = () => {
            let opacityValue = 1
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                                 + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y))
                    if (distance < (canvas.width/7) * (canvas.height/7)) {
                        opacityValue = 1 - (distance / 20000)
                        ctx.strokeStyle = `rgba(37, 99, 235, ${opacityValue})`
                        ctx.lineWidth = 1
                        ctx.beginPath()
                        ctx.moveTo(particles[a].x, particles[a].y)
                        ctx.lineTo(particles[b].x, particles[b].y)
                        ctx.stroke()
                    }
                }
            }
        }

        animate()

        const handleResize = () => {
            width = canvas.width = window.innerWidth
            height = canvas.height = window.innerHeight
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [mousePos])

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect()
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
    }

    return (
        <div
            className="d-flex flex-column align-items-center justify-content-center text-center px-4"
            style={{ minHeight: 'calc(100vh - 80px)', background: 'var(--bg-body)', position: 'relative', overflow: 'hidden' }}
            onMouseMove={handleMouseMove}
        >
            <canvas
                ref={canvasRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
            />
            
            <div style={{ position: 'relative', zIndex: 10, background: 'rgba(255, 255, 255, 0.5)', padding: '40px', borderRadius: '16px', backdropFilter: 'blur(10px)', boxShadow: 'var(--shadow-lg)' }}>
                <h1 className="font-weight-bold m-0"
                    style={{
                        fontSize: '6rem',
                        color: 'var(--primary-color)',
                        letterSpacing: '2px',
                        textShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                    }}>
                    404
                </h1>

                <h2 className="font-weight-bold mb-3" style={{ color: 'var(--text-main)', fontSize: '2rem' }}>
                    Connection Lost
                </h2>

                <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px', fontSize: '1.1rem' }}>
                    The node you're looking for doesn't exist in our network. Try interacting with the particles while you're here.
                </p>

                <Link to="/" className="btn btn-primary px-4 py-2" style={{ textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold' }}>
                    Return Home
                </Link>
            </div>
        </div>
    )
}

export default NotFound
