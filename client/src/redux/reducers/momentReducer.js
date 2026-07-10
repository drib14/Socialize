export const MOMENT_TYPES = {
    LOADING: 'LOADING_MOMENT',
    GET_MOMENTS: 'GET_MOMENTS',
    CREATE_MOMENT: 'CREATE_MOMENT',
    DELETE_MOMENT: 'DELETE_MOMENT',
    VIEW_MOMENT: 'VIEW_MOMENT'
}

const initialState = {
    moments: [],
    loading: false
}

const momentReducer = (state = initialState, action) => {
    switch (action.type) {
        case MOMENT_TYPES.LOADING:
            return {
                ...state,
                loading: action.payload
            }
        case MOMENT_TYPES.GET_MOMENTS:
            return {
                ...state,
                moments: action.payload,
                loading: false
            }
        case MOMENT_TYPES.CREATE_MOMENT: {
            const userId = action.payload.user._id
            const userIndex = state.moments.findIndex(item => item.user._id === userId)
            let newMoments = [...state.moments]
            
            if (userIndex > -1) {
                // Prepend new moment to this user's list
                newMoments[userIndex] = {
                    ...newMoments[userIndex],
                    moments: [action.payload, ...newMoments[userIndex].moments]
                }
            } else {
                // Add a new user moments group at the beginning of the list
                newMoments.unshift({
                    user: action.payload.user,
                    moments: [action.payload]
                })
            }
            return {
                ...state,
                moments: newMoments
            }
        }
        case MOMENT_TYPES.DELETE_MOMENT: {
            const { momentId, userId } = action.payload
            let filteredMoments = state.moments.map(item => {
                if (item.user._id === userId) {
                    return {
                        ...item,
                        moments: item.moments.filter(m => m._id !== momentId)
                    }
                }
                return item;
            }).filter(item => item.moments.length > 0)
            
            return {
                ...state,
                moments: filteredMoments
            }
        }
        case MOMENT_TYPES.VIEW_MOMENT: {
            const { momentId, userId } = action.payload
            let viewedMoments = state.moments.map(item => {
                return {
                    ...item,
                    moments: item.moments.map(m => {
                        if (m._id === momentId) {
                            const updatedViews = m.views.includes(userId) 
                                ? m.views 
                                : [...m.views, userId]
                            return { ...m, views: updatedViews }
                        }
                        return m;
                    })
                }
            })
            return {
                ...state,
                moments: viewedMoments
            }
        }
        default:
            return state;
    }
}

export default momentReducer
