import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../config/axios";

export const fetchAllMentors = createAsyncThunk('/mentors/fetchAllMentors', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get('/api/mentors/all', { headers: { Authorization: localStorage.getItem('token') } })
        return response.data
    } catch (err) {
        console.log(err)
        return rejectWithValue(err.response.data.errors)
    }
})

export const updateMentor = createAsyncThunk('/mentors/updateMentor', async ({ userId, form }, { rejectWithValue }) => {
    try {
        const response = await axios.put(`/api/mentors/additionalInfo/${userId}`, form, { headers: { Authorization: localStorage.getItem('token') } })
        return response.data
    } catch (err) {
        console.log(err)
        return rejectWithValue(err.response.data.errors)
    }
})

export const updateMentorProfilePic = createAsyncThunk('/mentors/updateMentorProfilePic', async ({ id, image }, { rejectWithValue }) => {
    try {
        const response = await axios.put(`/api/mentors/update/profilePic/${id}`, image, { headers: { Authorization: localStorage.getItem('token') } })
        console.log(response.data)
        return response.data
    } catch (err) {
        console.log(err)
        return rejectWithValue(err.response.data.errors)
    }
})

export const isVerified = createAsyncThunk('/mentors/isVerified', async ({ userId }, { rejectWithValue }) => {
    try {
        const response = await axios.put(`/api/mentors/verify/${userId}`, { isVerified: true }, { headers: { Authorization: localStorage.getItem('token') } })
        return response.data
    } catch (err) {
        console.log(err)
        return rejectWithValue(err.response.data.errors)
    }

})

export const deleteMentor = createAsyncThunk('/mentors/deleteMentor', async ({ userId }, { rejectWithValue }) => {
    try {
        const response = await axios.delete(`/api/mentors/${userId}`, { headers: { Authorization: localStorage.getItem('token') } })
        return response.data
    } catch (err) {
        console.log(err)
        return rejectWithValue(err.response.data.errors)
    }
})

export const mentorProfile = createAsyncThunk('/mentors/mentorProfile', async ({ id }, { rejectWithValue }) => {
    try {
        const response = await axios.get(`/api/mentors/profile/${id}`, { headers: { Authorization: localStorage.getItem('token') } })
        return response.data
    } catch (err) {
        console.log(err)
        return rejectWithValue(err.response.data.errors)
    }
})

export const verifiedMentors = createAsyncThunk('/mentors/verifiedMentors', async ({ search, page, limit, skill, sortOrder }, { rejectWithValue }) => {
    const params = { search, page, limit, skill, sortOrder }
    try {
        const response = await axios.get(`/api/mentors/`, { params })
        return response.data
    } catch (err) {
        console.log(err)
        return rejectWithValue(err.response.data.errors)
    }
})

const mentorSlice = createSlice({
    name: 'mentors',
    initialState: {
        data: [],
        verifiedData: [],
        singleData: null,
        serverError: null,
        editId: null
    },

    extraReducers: (builder) => {

        //mentor second form details
        builder.addCase(updateMentor.fulfilled, (state, action) => {
            state.data = action.payload
            state.serverError = null
        })
        builder.addCase(updateMentor.rejected, (state, action) => {
            state.serverError = action.payload
        })

        //update mentor profile pic
        builder.addCase(updateMentorProfilePic.fulfilled, (state, action) => {
            state.data = action.payload
        })
        //get all mentors
        builder.addCase(fetchAllMentors.fulfilled, (state, action) => {
            state.data = action.payload
        })
        builder.addCase(fetchAllMentors.rejected, (state, action) => {
            state.serverError = action.payload
        })

        //isVerified
        builder.addCase(isVerified.fulfilled, (state, action) => {
            const index = state.data.findIndex(ele => ele.userId && ele.userId._id == action.payload.userId._id)
            state.data[index] = action.payload
        })

        // reject or delete mentor
        builder.addCase(deleteMentor.fulfilled, (state, action) => {
            state.data = state.data.filter(ele => ele.userId && ele.userId._id !== action.payload.userId._id)
        })

        // get verified mentors to show in all mentor list 
        builder.addCase(verifiedMentors.fulfilled, (state, action) => {
            state.verifiedData = action.payload
        })
        builder.addCase(verifiedMentors.rejected, (state, action) => {
            state.serverError = action.payload
        })

        // individual mentor profile
        builder.addCase(mentorProfile.fulfilled, (state, action) => {
            state.singleData = action.payload
        })
    }
})

export default mentorSlice.reducer