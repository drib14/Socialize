import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { toast } from 'react-toastify'

import Loading from './Loading'

const Notify = () => {
    const { alert } = useSelector(state => state)
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
            {alert.loading && <Loading />}
        </div>
    )
}

export default Notify
