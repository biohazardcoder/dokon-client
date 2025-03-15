import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/interface";

interface UserState {
  data: User | null;
  isPending: boolean;
  isError: string | null;
  isAuth: boolean;
}

const initialState: UserState = {
  data: null,
  isPending: false,
  isError: null,
  isAuth: false,
};

const UserSlicer = createSlice({
  name: "User",
  initialState,
  reducers: {
    getPending(state) {
      state.isPending = true;
      state.isError = null; 
    },
    getUserInfo(state, { payload }: PayloadAction<User>) {
      state.isAuth = true;
      state.data = payload;
      state.isPending = false;
    },
    getError(state, { payload }: PayloadAction<string>) {
      state.isPending = false;
      state.isError = payload;
    },
  },
});

export const { getError, getPending, getUserInfo } = UserSlicer.actions;
export default UserSlicer.reducer;
