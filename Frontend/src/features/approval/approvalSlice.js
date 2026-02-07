import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/services/api";

const initialState = {
  approvals: [],
  selectedApproval: null,
  pendingCount: 0,
  isLoading: false,
  error: null,
  filters: {
    status: "",
    type: "",
    search: "",
  },
};

export const fetchApprovals = createAsyncThunk(
  "approval/fetchApprovals",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().approval;
      const query = new URLSearchParams();
      const status = params?.status ?? filters.status;
      const type = params?.type ?? filters.type;
      const search = params?.search ?? filters.search;
      if (status && status !== "all") query.set("status", status);
      if (type) query.set("type", type);
      if (search) query.set("search", search);
      const { data } = await api.get(`/approvals?${query.toString()}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchApproval = createAsyncThunk(
  "approval/fetchApproval",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/approvals/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const approveRequest = createAsyncThunk(
  "approval/approve",
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      await api.post(`/approvals/${id}/approve`, { comment });
      return { id, status: "approved" };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const rejectRequest = createAsyncThunk(
  "approval/reject",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      await api.post(`/approvals/${id}/reject`, { reason });
      return { id, status: "rejected" };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const approvalSlice = createSlice({
  name: "approval",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedApproval: (state) => {
      state.selectedApproval = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchApprovals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvals = action.payload;
        state.pendingCount = action.payload.filter(
          (a) => a.status === "pending"
        ).length;
      })
      .addCase(fetchApprovals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchApproval.fulfilled, (state, action) => {
        state.selectedApproval = action.payload;
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        const approval = state.approvals.find(
          (a) => a.id === action.payload.id
        );
        if (approval) {
          approval.status = action.payload.status;
        }
        state.pendingCount = state.approvals.filter(
          (a) => a.status === "pending"
        ).length;
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        const approval = state.approvals.find(
          (a) => a.id === action.payload.id
        );
        if (approval) {
          approval.status = action.payload.status;
        }
        state.pendingCount = state.approvals.filter(
          (a) => a.status === "pending"
        ).length;
      });
  },
});

export const { setFilters, clearFilters, clearSelectedApproval } =
  approvalSlice.actions;
export default approvalSlice.reducer;
