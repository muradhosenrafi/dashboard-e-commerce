import { createSlice } from '@reduxjs/toolkit'






export const userinfoslices = createSlice({
  name: 'info',
  
 
 initialState : {
    value : 0
 },


  reducers: {
    activeuserifo: (state,action) => {
    
      console.log(state.value);
      console.log(action.payload);
      
    },
  
  }
})


export const { activeuserifo} = userinfoslices.actions

export default userinfoslices.reducer