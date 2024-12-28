import { createSlice } from "@reduxjs/toolkit";

interface authInitialState {
    userInfo: {
        uid: string,
        email: string,
        name: string
    } | undefined,
    isDarkTheme: boolean,
}

const initialState: authInitialState = {
    userInfo: {
        uid: 'tester',
        email: "randomtester@gmail.com",
        name: 'random tester',
    },
    isDarkTheme: false
}

export const authSlice = createSlice(
    {
        name: 'auth',
        initialState,
        reducers: {
            changeTheme: (state, action) => {
                state.isDarkTheme = action.payload.isDarkTheme
            },
            setUser: (state, action) => {
                state.userInfo = action.payload
            }
        }
    }
)

export const { setUser, changeTheme } = authSlice.actions