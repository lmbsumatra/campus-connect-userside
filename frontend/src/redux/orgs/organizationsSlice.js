import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";

const initialState = {
  organizations: [],
  categories: [],
  users: [],
  loading: false,
  error: null,
  currentOrg: null,
  searchRepMap: {},
};

// Helper function for API requests with timeout
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          JSON.parse(localStorage.getItem("studentUser"))?.token
        }`,
        ...options.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// GET /api/orgs
export const fetchOrganizations = createAsyncThunk(
  "organizations/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchWithTimeout(`${baseApi}/api/orgs`);
    } catch (error) {
      return rejectWithValue(error.message || "Unexpected error occurred.");
    }
  }
);

// GET /api/orgs/categories
export const fetchCategories = createAsyncThunk(
  "organizations/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchWithTimeout(`${baseApi}/api/orgs/categories`);
    } catch (error) {
      return rejectWithValue(error.message || "Unexpected error occurred.");
    }
  }
);

// GET /api/users
export const fetchUsers = createAsyncThunk(
  "organizations/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchWithTimeout(`${baseApi}/user`);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch users.");
    }
  }
);

// POST /api/orgs
export const addOrganization = createAsyncThunk(
  "organizations/addOrganization",
  async (orgData, { rejectWithValue }) => {
    try {
      return await fetchWithTimeout(`${baseApi}/api/orgs`, {
        method: "POST",
        body: JSON.stringify(orgData),
      });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add organization.");
    }
  }
);

// PUT /api/orgs/:id
export const updateOrganization = createAsyncThunk(
  "organizations/updateOrganization",
  async (orgData, { rejectWithValue }) => {
    try {
      return await fetchWithTimeout(`${baseApi}/api/orgs/${orgData.org_id}`, {
        method: "PUT",
        body: JSON.stringify(orgData),
      });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update organization.");
    }
  }
);

// PATCH /api/orgs/:id/status
export const toggleOrgStatus = createAsyncThunk(
  "organizations/toggleOrgStatus",
  async ({ orgId, status }, { rejectWithValue }) => {
    try {
      return await fetchWithTimeout(`${baseApi}/api/orgs/${orgId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update status.");
    }
  }
);

// PATCH /api/orgs/:id/representative
export const setOrgRepresentative = createAsyncThunk(
  "organizations/setOrgRepresentative",
  async ({ org_id, rep_id }, { rejectWithValue }) => {
    try {
      return await fetchWithTimeout(
        `${baseApi}/api/orgs/${org_id}/representative`,
        {
          method: "PATCH",
          body: JSON.stringify({ rep_id }),
        }
      );
    } catch (error) {
      return rejectWithValue(error.message || "Failed to set representative.");
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
        [orgId]: searchTerm,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Organizations
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

      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Users
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

      // Add Organization
      .addCase(addOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = [...state.organizations, action.payload];
        state.error = null;
      })
      .addCase(addOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Organization
      .addCase(updateOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = state.organizations.map((org) =>
          org.orgId === action.payload.org.orgId ? action.payload : org
        );
        state.error = null;
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Organization Status
      .addCase(toggleOrgStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleOrgStatus.fulfilled, (state, action) => {
        state.loading = false;

        // Optimistically update the status in the state
        state.organizations = state.organizations.map((org) =>
          org.orgId === action.payload.org.orgId
            ? {
                ...org,
                isVerified: action.payload.isVerified,
                isActive: action.payload.isActive,
              }
            : org
        );

        state.error = null;

        // Optionally, dispatch a fetch to get fresh data from the server
        // dispatch(fetchOrganizations());
      })
      .addCase(toggleOrgStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Set Organization Representative
      .addCase(setOrgRepresentative.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setOrgRepresentative.fulfilled, (state, action) => {
        state.loading = false;

        console.log(action.payload.org);

        // Update the organization's representative in the state
        state.organizations = state.organizations.map((org) =>
          org.orgId === action.payload.org.orgId
            ? {
                ...org,
                representative: {
                  ...org.representative,
                  id: action.payload.org.userId,
                },
              }
            : org
        );

        state.error = null;
      })
      .addCase(setOrgRepresentative.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export selectors and actions
export const selectOrganizations = (state) => state.organizations.organizations;
export const selectCategories = (state) => state.organizations.categories;
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
