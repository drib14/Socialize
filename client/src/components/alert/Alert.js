import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { toast } from 'react-toastify'

import Loading from './Loading'

const Notify = () => {
    const { alert, auth } = useSelector(state => state)
    const dispatch = useDispatch()

    useEffect(() => {
        if(alert.error) {
            toast.error(alert.error, {
                onClose: () => dispatch({type: GLOBALTYPES.ALERT, payload: {}})
            })
        }
        if(alert.success) {
            toast.success(alert.success, {
                onClose: () => dispatch({type: GLOBALTYPES.ALERT, payload: {}})
            })
        }
    }, [alert, dispatch])

    return (
        <div>
            {
                alert.loading && (
                    !auth.token 
                    ? <Loading />
                    : <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--accent-color) 50%, var(--primary-color) 100%)',
                        zIndex: 99999,
                        animation: 'loading-bar 1.5s infinite linear',
                        backgroundSize: '200% 100%'
                      }}>
                        <style>{`
                            @keyframes loading-bar {
                                0% { background-position: 200% 0; }
                                100% { background-position: -200% 0; }
                            }
                        `}</style>
                      </div>
                )
            }
        </div>
    )
}

export default Notify
