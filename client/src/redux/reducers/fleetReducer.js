import { FLEET_TYPES } from '../actions/fleetAction'

const initialState = {
    fleets: [],
    loading: false
}

const fleetReducer = (state = initialState, action) => {
    switch (action.type) {
        case FLEET_TYPES.GET:
            return {
                ...state,
                fleets: action.payload
            };
        case FLEET_TYPES.CREATE:
            return {
                ...state,
                fleets: [...state.fleets, action.payload]
            };
        case FLEET_TYPES.DELETE:
            return {
                ...state,
                fleets: state.fleets.filter(item => item._id !== action.payload)
            };
        case FLEET_TYPES.UPDATE:
            return {
                ...state,
                fleets: state.fleets.map(item =>
                    item._id === action.payload._id ? action.payload : item
                )
            };
        default:
            return state;
    }
}

export default fleetReducer
