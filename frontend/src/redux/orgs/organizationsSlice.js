import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";

const initialState = {
  organizations: [],
  users: [],
  loading: false,
  error: null,
  currentOrg: null,
  searchRepMap: {},
};

export const fetchOrganizations = createAsyncThunk(
  "organizations/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${baseApi}/organizations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("studentUser"))?.token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch organizations.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request timed out. Please try again.");
      }
      return rejectWithValue(error.message || "Unexpected error occurred.");
    } finally {
      clearTimeout(timeoutId);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "organizations/fetchUsers",
  async (_, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${baseApi}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("studentUser"))?.token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch users.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request timed out. Please try again.");
      }
      return rejectWithValue(error.message || "Unexpected error occurred.");
    } finally {
      clearTimeout(timeoutId);
    }
  }
);

export const addOrganization = createAsyncThunk(
  "organizations/addOrganization",
  async (orgData, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${baseApi}/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("studentUser"))?.token}`,
        },
        body: JSON.stringify(orgData),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add organization.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request timed out. Please try again.");
      }
      return rejectWithValue(error.message || "Unexpected error occurred.");
    } finally {
      clearTimeout(timeoutId);
    }
  }
);

export const updateOrganization = createAsyncThunk(
  "organizations/updateOrganization",
  async (orgData, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${baseApi}/organizations/${orgData.org_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("studentUser"))?.token}`,
        },
        body: JSON.stringify(orgData),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update organization.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request timed out. Please try again.");
      }
      return rejectWithValue(error.message || "Unexpected error occurred.");
    } finally {
      clearTimeout(timeoutId);
    }
  }
);

export const updateOrgStatus = createAsyncThunk(
  "organizations/updateOrgStatus",
  async ({ orgId, status }, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${baseApi}/organizations/${orgId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("studentUser"))?.token}`,
        },
        body: JSON.stringify({ status }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update organization status.");
      }

      const data = await response.json();
      return { orgId, status: data.status };
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request timed out. Please try again.");
      }
      return rejectWithValue(error.message || "Unexpected error occurred.");
    } finally {
      clearTimeout(timeoutId);
    }
  }
);

export const assignRepresentative = createAsyncThunk(
  "organizations/assignRepresentative",
  async ({ orgId, userId }, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${baseApi}/organizations/${orgId}/representative`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("studentUser"))?.token}`,
        },
        body: JSON.stringify({ rep_id: userId }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign representative.");
      }

      const data = await response.json();
      return { orgId, repId: data.rep_id };
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request timed out. Please try again.");
      }
      return rejectWithValue(error.message || "Unexpected error occurred.");
    } finally {
      clearTimeout(timeoutId);
    }
  }
);

const organizationsSlice = createSlice({
  name: "organizations",
  initialState,
  reducers: {
    setCurrentOrg: (state, action) => {
      state.currentOrg = action.payload;
    },
    clearCurrentOrg: (state) => {
      state.currentOrg = null;
    },
    updateSearchRepMap: (state, action) => {
      const { orgId, searchTerm } = action.payload;
      state.searchRepMap = {
        ...state.searchRepMap,
        [orgId]: searchTerm
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
        state.error = null;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(addOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations.push(action.payload);
        state.error = null;
      })
      .addCase(addOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = state.organizations.map(org => 
          org.org_id === action.payload.org_id ? action.payload : org
        );
        state.error = null;
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateOrgStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrgStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = state.organizations.map(org => 
          org.org_id === action.payload.orgId ? 
          { ...org, status: action.payload.status } : org
        );
        state.error = null;
      })
      .addCase(updateOrgStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(assignRepresentative.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignRepresentative.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = state.organizations.map(org => 
          org.org_id === action.payload.orgId ? 
          { ...org, rep_id: action.payload.repId } : org
        );
        if (state.searchRepMap[action.payload.orgId]) {
          state.searchRepMap[action.payload.orgId] = "";
        }
        state.error = null;
      })
      .addCase(assignRepresentative.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectOrganizations = (state) => state.organizations.organizations;
export const selectUsers = (state) => state.organizations.users;
export const selectLoading = (state) => state.organizations.loading;
export const selectError = (state) => state.organizations.error;
export const selectCurrentOrg = (state) => state.organizations.currentOrg;
export const selectSearchRepMap = (state) => state.organizations.searchRepMap;

export const {
  setCurrentOrg,
  clearCurrentOrg,
  updateSearchRepMap,
  clearError,
} = organizationsSlice.actions;

export default organizationsSlice.reducer;