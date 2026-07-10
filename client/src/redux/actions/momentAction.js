import { GLOBALTYPES } from './globalTypes'
import { postDataAPI, getDataAPI, deleteDataAPI } from '../../utils/fetchData'
import { imageUpload } from '../../utils/imageUpload'
import { MOMENT_TYPES } from '../reducers/momentReducer'

export const getMoments = (token) => async (dispatch) => {
    try {
        dispatch({ type: MOMENT_TYPES.LOADING, payload: true })
        const res = await getDataAPI('moments', token)
        
        dispatch({
            type: MOMENT_TYPES.GET_MOMENTS,
            payload: res.data.moments
        })
        
        dispatch({ type: MOMENT_TYPES.LOADING, payload: false })
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.msg || err.message }
        })
    }
}

export const createMoment = ({ file, caption, auth }) => async (dispatch) => {
    try {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })

        // Upload media file to Cloudinary via the /api/upload_media proxy endpoint
        const mediaRes = await imageUpload([file], auth.token)
        if (mediaRes.length === 0) throw new Error("Failed to upload media.")

        const mediaUrl = mediaRes[0].url
        // Identify resource type (image vs video)
        const resource_type = file.type.startsWith('video') ? 'video' : 'image'

        const res = await postDataAPI('moments', {
            media: mediaUrl,
            resource_type,
            caption
        }, auth.token)

        dispatch({
            type: MOMENT_TYPES.CREATE_MOMENT,
            payload: res.data.newMoment
        })

        dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.msg || err.message }
        })
    }
}

export const viewMoment = ({ momentId, auth }) => async (dispatch) => {
    try {
        // Dispatch local action immediately for optimal responsiveness
        dispatch({
            type: MOMENT_TYPES.VIEW_MOMENT,
            payload: { momentId, userId: auth.user._id }
        })

        // Call backend view API silently
        await postDataAPI(`moments/${momentId}/view`, {}, auth.token)
    } catch (err) {
        console.error("Failed to mark moment as viewed in backend:", err)
    }
}

export const deleteMoment = ({ momentId, auth }) => async (dispatch) => {
    try {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })

        const res = await deleteDataAPI(`moments/${momentId}`, auth.token)

        dispatch({
            type: MOMENT_TYPES.DELETE_MOMENT,
            payload: { momentId, userId: auth.user._id }
        })

        dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.msg || err.message }
        })
    }
}
