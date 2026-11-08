import { configureStore } from '@reduxjs/toolkit'
import  userinfoslices  from './slices/userinfoslices'

export const store = configureStore({
  reducer: {
    userinfo:userinfoslices
  }
})