import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/services/api";

const initialState = {
  jobs: [],
  selectedJob: null,
  jobHistory: [],
  eligibleAssignees: [],
  isLoading: false,
  error: null,
  filters: {
    status: "",
    priority: "",
    department: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  },
  view: "", // "my_jobs" | "assigned_jobs" for Supervisor/GM
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const fetchJobs = createAsyncThunk(
  "job/fetchJobs",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().job;
      const query = new URLSearchParams();
      if (params?.status ?? filters.status) query.set("status", params?.status ?? filters.status);
      if (params?.priority ?? filters.priority) query.set("priority", params?.priority ?? filters.priority);
      if (params?.department ?? filters.department) query.set("department", params?.department ?? filters.department);
      if (params?.search ?? filters.search) query.set("search", params?.search ?? filters.search);
      if (params?.dateFrom ?? filters.dateFrom) query.set("dateFrom", params?.dateFrom ?? filters.dateFrom);
      if (params?.dateTo ?? filters.dateTo) query.set("dateTo", params?.dateTo ?? filters.dateTo);
      const viewVal = params?.view ?? getState().job.view;
      if (viewVal) query.set("view", viewVal);
      query.set("page", params?.page ?? pagination.page);
      query.set("limit", params?.limit ?? 500);
      const { data } = await api.get(`/jobs?${query.toString()}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchJob = createAsyncThunk(
  "job/fetchJob",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createJob = createAsyncThunk(
  "job/createJob",
  async (data, { rejectWithValue }) => {
    try {
      const { data: res } = await api.post("/jobs", data);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateJob = createAsyncThunk(
  "job/updateJob",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: res } = await api.put(`/jobs/${id}`, data);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const assignJob = createAsyncThunk(
  "job/assignJob",
  async ({ jobId, assigneeId }, { rejectWithValue }) => {
    try {
      await api.post(`/jobs/${jobId}/assign`, { assigneeId });
      return { jobId, assigneeId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchEligibleAssignees = createAsyncThunk(
  "job/fetchEligibleAssignees",
  async (department, { rejectWithValue }) => {
    try {
      const params = department ? `?department=${encodeURIComponent(department)}` : "";
      const { data } = await api.get(`/jobs/eligible-assignees${params}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteJob = createAsyncThunk(
  "job/deleteJob",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/jobs/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchJobHistory = createAsyncThunk(
  "job/fetchJobHistory",
  async (jobId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/jobs/${jobId}/history`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setView: (state, action) => {
      state.view = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedJob: (state) => {
      state.selectedJob = null;
      state.jobHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
        state.pagination.total = action.payload?.length ?? 0;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchJob.fulfilled, (state, action) => {
        state.selectedJob = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const idx = state.jobs.findIndex((j) => j.id === action.payload.id);
        if (idx !== -1) state.jobs[idx] = { ...state.jobs[idx], ...action.payload };
        if (state.selectedJob?.id === action.payload.id) {
          state.selectedJob = { ...state.selectedJob, ...action.payload };
        }
      })
      .addCase(fetchJobHistory.fulfilled, (state, action) => {
        state.jobHistory = action.payload;
      })
      .addCase(fetchEligibleAssignees.fulfilled, (state, action) => {
        state.eligibleAssignees = action.payload ?? [];
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j) => j.id !== action.payload);
        if (state.selectedJob?.id === action.payload) {
          state.selectedJob = null;
          state.jobHistory = [];
        }
      });
  },
});

export const { setFilters, clearFilters, setPage, setView, clearSelectedJob } =
  jobSlice.actions;
export default jobSlice.reducer;
