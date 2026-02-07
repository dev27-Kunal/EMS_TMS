import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/services/api";

const initialState = {
  records: [],
  selectedRecord: null,
  isLoading: false,
  error: null,
  filters: {
    status: "",
    userId: "",
    role: "",
    startDate: "",
    endDate: "",
    search: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const fetchLoginHistory = createAsyncThunk(
  "loginHistory/fetchLoginHistory",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().loginHistory;
      const query = new URLSearchParams();
      const userId = params?.userId ?? filters.userId;
      const status = params?.status ?? filters.status;
      const role = params?.role ?? filters.role;
      const startDate = params?.startDate ?? filters.startDate;
      const endDate = params?.endDate ?? filters.endDate;
      const search = params?.search ?? filters.search;
      if (userId) query.set("userId", userId);
      if (status) query.set("status", status);
      if (role) query.set("role", role);
      if (startDate) query.set("startDate", startDate);
      if (endDate) query.set("endDate", endDate);
      if (search) query.set("search", search);
      query.set("page", params?.page ?? pagination.page);
      query.set("limit", params?.limit ?? pagination.limit);
      const { data } = await api.get(`/login-history?${query.toString()}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchLoginRecord = createAsyncThunk(
  "loginHistory/fetchLoginRecord",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/login-history/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const loginHistorySlice = createSlice({
  name: "loginHistory",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedRecord: (state) => {
      state.selectedRecord = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoginHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLoginHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload;
        state.pagination.total = action.payload?.length ?? 0;
      })
      .addCase(fetchLoginHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchLoginRecord.fulfilled, (state, action) => {
        state.selectedRecord = action.payload;
      });
  },
});

export const { setFilters, clearFilters, setPage, clearSelectedRecord } =
  loginHistorySlice.actions;
export default loginHistorySlice.reducer;
