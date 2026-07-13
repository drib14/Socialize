import { GLOBALTYPES } from './globalTypes'
import { postDataAPI, getDataAPI, patchDataAPI, deleteDataAPI } from '../../utils/fetchData'

export const FLEET_TYPES = {
    CREATE: 'CREATE_HIGHLIGHT',
    GET: 'GET_HIGHLIGHTS',
    DELETE: 'DELETE_HIGHLIGHT',
    UPDATE: 'UPDATE_HIGHLIGHT'
}

export const createFleet = ({title, cover, moments, auth}) => async (dispatch) => {
    try {
        dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})
        const res = await postDataAPI('fleets', { title, cover, moments }, auth.token)

        dispatch({
            type: FLEET_TYPES.CREATE,
            payload: res.data.fleet
        })

        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const getFleets = ({userId, token}) => async (dispatch) => {
    try {
        const res = await getDataAPI(`fleets/${userId}`, token)
        dispatch({
            type: FLEET_TYPES.GET,
            payload: res.data.fleets
        })
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const deleteFleet = ({fleetId, auth}) => async (dispatch) => {
    try {
        dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})
        const res = await deleteDataAPI(`fleet/${fleetId}`, auth.token)
        dispatch({
            type: FLEET_TYPES.DELETE,
            payload: fleetId
        })
        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}
