import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../redux/actions/authAction'

const Register = () => {
    const { auth, alert } = useSelector(state => state)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const initialState = { 
        fullname: '', username: '', email: '', password: '', cf_password: '', gender: 'male'
    }
    const [userData, setUserData] = useState(initialState)
    const { fullname, username, email, password, cf_password } = userData

    const [typePass, setTypePass] = useState(false)
    const [typeCfPass, setTypeCfPass] = useState(false)

    useEffect(() => {
        if(auth.token) navigate("/")
    }, [auth.token, navigate])

    
    const handleChangeInput = e => {
        const { name, value } = e.target
        setUserData({...userData, [name]:value})
    }

    const handleSubmit = e => {
        e.preventDefault()
        dispatch(register(userData))
    }

    return (
        <div className="auth_page">
            <form onSubmit={handleSubmit}>
                <h3 className="text-uppercase text-center mb-4">Socialize</h3>

                <div className="form-group">
                    <input type="text" className="form-control" id="fullname" name="fullname"
                    placeholder="Full Name"
                    onChange={handleChangeInput} value={fullname}
                    style={{background: `${alert.fullname ? '#fd2d6a14' : ''}`}} />
                    
                    <small className="form-text text-danger">
                        {alert.fullname ? alert.fullname : ''}
                    </small>
                </div>

                <div className="form-group">
                    <input type="text" className="form-control" id="username" name="username"
                    placeholder="Username"
                    onChange={handleChangeInput} value={username.toLowerCase().replace(/ /g, '')}
                    style={{background: `${alert.username ? '#fd2d6a14' : ''}`}} />
                    
                    <small className="form-text text-danger">
                        {alert.username ? alert.username : ''}
                    </small>
                </div>

                <div className="form-group">
                    <input type="email" className="form-control" id="exampleInputEmail1" name="email"
                    placeholder="Email address"
                    onChange={handleChangeInput} value={email}
                    style={{background: `${alert.email ? '#fd2d6a14' : ''}`}} />
                    
                    <small className="form-text text-danger">
                        {alert.email ? alert.email : ''}
                    </small>
                </div>

                <div className="form-group">
                    <div className="pass">
                        <input type={ typePass ? "text" : "password" } 
                        className="form-control" id="exampleInputPassword1"
                        placeholder="Password"
                        onChange={handleChangeInput} value={password} name="password"
                        style={{background: `${alert.password ? '#fd2d6a14' : ''}`}} />

                        <small onClick={() => setTypePass(!typePass)}>
                            {typePass ? 'Hide' : 'Show'}
                        </small>
                    </div>

                    <small className="form-text text-danger">
                        {alert.password ? alert.password : ''}
                    </small>
                </div>

                <div className="form-group">
                    <div className="pass">
                        <input type={ typeCfPass ? "text" : "password" } 
                        className="form-control" id="cf_password"
                        placeholder="Confirm Password"
                        onChange={handleChangeInput} value={cf_password} name="cf_password"
                        style={{background: `${alert.cf_password ? '#fd2d6a14' : ''}`}} />

                        <small onClick={() => setTypeCfPass(!typeCfPass)}>
                            {typeCfPass ? 'Hide' : 'Show'}
                        </small>
                    </div>

                    <small className="form-text text-danger">
                        {alert.cf_password ? alert.cf_password : ''}
                    </small>
                </div>

                <div className="gender_buttons_container d-flex gap-2 mb-3">
                    <button type="button" 
                    className={`gender_btn ${userData.gender === 'male' ? 'active-gender' : ''}`}
                    onClick={() => setUserData({...userData, gender: 'male'})} title="Male">
                        <i className="fas fa-mars" />
                    </button>

                    <button type="button" 
                    className={`gender_btn ${userData.gender === 'female' ? 'active-gender' : ''}`}
                    onClick={() => setUserData({...userData, gender: 'female'})} title="Female">
                        <i className="fas fa-venus" />
                    </button>

                    <button type="button" 
                    className={`gender_btn ${userData.gender === 'other' ? 'active-gender' : ''}`}
                    onClick={() => setUserData({...userData, gender: 'other'})} title="Other">
                        <i className="fas fa-genderless" />
                    </button>
                </div>
                
                <button type="submit" className="btn btn-dark w-100"
                style={{ background: '#2b8a3e', borderColor: '#2b8a3e' }} title="Register">
                    <span className="material-icons">how_to_reg</span>
                </button>

                <p className="my-2">
                    Already have an account? <Link to="/" style={{color: "#2b8a3e"}}>Login Now</Link>
                </p>
            </form>
        </div>
    )
}

export default Register
