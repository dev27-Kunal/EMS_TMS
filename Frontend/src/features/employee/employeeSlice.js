import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/services/api";

const initialState = {
  employees: [],
  supervisors: [],
  reportingManagers: [],
  departments: [],
  roles: [],
  selectedEmployee: null,
  selectedDepartment: null,
  selectedRole: null,
  isLoading: false,
  error: null,
  filters: {
    department: "",
    status: "",
    search: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const fetchEmployees = createAsyncThunk(
  "employee/fetchEmployees",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().employee;
      const query = new URLSearchParams();
      const dept = params?.department ?? filters.department;
      const status = params?.status ?? filters.status;
      const search = params?.search ?? filters.search;
      const role = params?.role;
      if (dept && dept !== "all") query.set("department", dept);
      if (status && status !== "all") query.set("status", status);
      if (search) query.set("search", search);
      if (role) query.set("role", role);
      query.set("page", params?.page ?? pagination.page);
      query.set("limit", params?.limit ?? 500);
      const { data } = await api.get(`/employees?${query.toString()}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSupervisors = createAsyncThunk(
  "employee/fetchSupervisors",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/employees?role=supervisor&limit=500");
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** Fetch eligible reporting managers for an employee (by department) */
export const fetchReportingManagers = createAsyncThunk(
  "employee/fetchReportingManagers",
  async (department, { rejectWithValue }) => {
    try {
      if (!department) return [];
      const { data } = await api.get(`/employees/reporting-managers?department=${encodeURIComponent(department)}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchEmployee = createAsyncThunk(
  "employee/fetchEmployee",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/employees/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  "employee/createEmployee",
  async (data, { rejectWithValue }) => {
    try {
      const { data: res } = await api.post("/employees", data);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employee/updateEmployee",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: res } = await api.put(`/employees/${id}`, data);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employee/deleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/employees/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  "employee/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/departments");
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchDepartment = createAsyncThunk(
  "employee/fetchDepartment",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/departments/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createDepartment = createAsyncThunk(
  "employee/createDepartment",
  async (data, { rejectWithValue }) => {
    try {
      const { data: res } = await api.post("/departments", data);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  "employee/updateDepartment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: res } = await api.put(`/departments/${id}`, data);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  "employee/deleteDepartment",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/departments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRoles = createAsyncThunk(
  "employee/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/roles");
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRole = createAsyncThunk(
  "employee/fetchRole",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/roles/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createRole = createAsyncThunk(
  "employee/createRole",
  async (data, { rejectWithValue }) => {
    try {
      const { data: res } = await api.post("/roles", data);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateRole = createAsyncThunk(
  "employee/updateRole",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: res } = await api.put(`/roles/${id}`, data);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const employeeSlice = createSlice({
  name: "employee",
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
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
    clearSelectedDepartment: (state) => {
      state.selectedDepartment = null;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload;
        state.pagination.total = action.payload?.length ?? 0;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSupervisors.fulfilled, (state, action) => {
        state.supervisors = action.payload;
      })
      .addCase(fetchReportingManagers.fulfilled, (state, action) => {
        state.reportingManagers = action.payload ?? [];
      })
      .addCase(fetchEmployee.fulfilled, (state, action) => {
        state.selectedEmployee = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.unshift(action.payload);
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.employees.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.employees[idx] = { ...state.employees[idx], ...action.payload };
        if (state.selectedEmployee?.id === action.payload.id) {
          state.selectedEmployee = { ...state.selectedEmployee, ...action.payload };
        }
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter((e) => e.id !== action.payload);
        state.supervisors = state.supervisors.filter((e) => e.id !== action.payload);
        if (state.selectedEmployee?.id === action.payload) {
          state.selectedEmployee = null;
        }
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload;
      })
      .addCase(fetchDepartment.fulfilled, (state, action) => {
        state.selectedDepartment = action.payload;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const idx = state.departments.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.departments[idx] = { ...state.departments[idx], ...action.payload };
        if (state.selectedDepartment?.id === action.payload.id) {
          state.selectedDepartment = { ...state.selectedDepartment, ...action.payload };
        }
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter((d) => d.id !== action.payload);
        if (state.selectedDepartment?.id === action.payload) {
          state.selectedDepartment = null;
        }
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
      })
      .addCase(fetchRole.fulfilled, (state, action) => {
        state.selectedRole = action.payload;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        const idx = state.roles.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.roles[idx] = { ...state.roles[idx], ...action.payload };
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = { ...state.selectedRole, ...action.payload };
        }
      });
  },
});

export const { setFilters, clearFilters, setPage, clearSelectedEmployee, clearSelectedDepartment, clearSelectedRole } =
  employeeSlice.actions;
export default employeeSlice.reducer;
