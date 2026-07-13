import { GLOBALTYPES } from './globalTypes'
import { postDataAPI, getDataAPI, patchDataAPI, deleteDataAPI } from '../../utils/fetchData'

export const HIGHLIGHT_TYPES = {
    CREATE: 'CREATE_HIGHLIGHT',
    GET: 'GET_HIGHLIGHTS',
    DELETE: 'DELETE_HIGHLIGHT',
    UPDATE: 'UPDATE_HIGHLIGHT'
}

export const createHighlight = ({title, cover, moments, auth}) => async (dispatch) => {
    try {
        dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})
        const res = await postDataAPI('highlights', { title, cover, moments }, auth.token)

        dispatch({
            type: HIGHLIGHT_TYPES.CREATE,
            payload: res.data.highlight
        })

        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const getHighlights = ({userId, token}) => async (dispatch) => {
    try {
        const res = await getDataAPI(`highlights/${userId}`, token)
        dispatch({
            type: HIGHLIGHT_TYPES.GET,
            payload: res.data.highlights
        })
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}

export const deleteHighlight = ({highlightId, auth}) => async (dispatch) => {
    try {
        dispatch({type: GLOBALTYPES.ALERT, payload: {loading: true}})
        const res = await deleteDataAPI(`highlight/${highlightId}`, auth.token)
        dispatch({
            type: HIGHLIGHT_TYPES.DELETE,
            payload: highlightId
        })
        dispatch({type: GLOBALTYPES.ALERT, payload: {success: res.data.msg}})
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {error: err.response?.data?.msg || err.message}
        })
    }
}
