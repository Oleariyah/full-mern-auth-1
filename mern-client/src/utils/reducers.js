export const authReducer = (state, action) => {

    switch (action.type) {
        case "INITIALIZE": {
            return action.data;
        }

        case "USER_DETAILS": {
            return {
                ...state,
                data: { ...action.data }
            };
        }

        default:
            return state;
    }

};