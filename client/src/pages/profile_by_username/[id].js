import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getDataAPI } from '../../utils/fetchData'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'

const ProfileByUsername = () => {
    const { id } = useParams() // this will receive the username parameter from the route matching
    const { auth } = useSelector(state => state)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getDataAPI(`user_by_username/${id}`, auth.token)
                if (res.data && res.data.user) {
                    navigate(`/profile/${res.data.user._id}`, { replace: true })
                }
            } catch (err) {
                dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.msg || err.message } })
                navigate('/', { replace: true })
            }
        }
        if (id && auth.token) {
            fetchUser()
        }
    }, [id, auth.token, navigate, dispatch])

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <img src="/images/socialize-icon.svg" alt="loading" className="loading-logo" style={{ width: '80px', height: '80px' }} />
        </div>
    )
}

export default ProfileByUsername
