import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../redux/actions/authAction'
import { useDispatch, useSelector } from 'react-redux'


const Login = () => {
    const initialState = { email: '', password: '' }
    const [userData, setUserData] = useState(initialState)
    const { email, password } = userData

    const [typePass, setTypePass] = useState(false)

    const { auth } = useSelector(state => state)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if(auth.token) navigate("/")
    }, [auth.token, navigate])

    const handleChangeInput = e => {
        const { name, value } = e.target
        setUserData({...userData, [name]:value})
    }

    const handleSubmit = e => {
        e.preventDefault()
        dispatch(login(userData))
    }

    return (
        <div className="auth_page">
            <form onSubmit={handleSubmit}>
                <h3 className="text-uppercase text-center mb-4">Socialize</h3>

                <div className="form-group">
                    <input type="email" className="form-control" id="exampleInputEmail1" name="email"
                    placeholder="Email address"
                    aria-describedby="emailHelp" onChange={handleChangeInput} value={email} />
                    
                    <small id="emailHelp" className="form-text text-muted">
                        We'll never share your email with anyone else.
                    </small>
                </div>

                <div className="form-group">
                    <div className="pass">
                        
                        <input type={ typePass ? "text" : "password" } 
                        className="form-control" id="exampleInputPassword1"
                        placeholder="Password"
                        onChange={handleChangeInput} value={password} name="password" />

                        <small onClick={() => setTypePass(!typePass)}>
                            {typePass ? 'Hide' : 'Show'}
                        </small>
                    </div>
                   
                </div>
                
                <button type="submit" className="btn btn-dark w-100"
                disabled={email && password ? false : true}
                style={{ background: '#2b8a3e', borderColor: '#2b8a3e' }}>
                    Login
                </button>

                <p className="my-2">
                    You don't have an account? <Link to="/register" style={{color: "#2b8a3e"}}>Register Now</Link>
                </p>

                <p className="my-2">
                    <Link to="/forgot_password" style={{color: "#2b8a3e"}}>Forgot Password?</Link>
                </p>
            </form>
        </div>
    )
}

export default Login
