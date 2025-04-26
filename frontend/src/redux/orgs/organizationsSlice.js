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

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error || data.message || `Failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

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

export const addOrganization = createAsyncThunk(
  "organizations/addOrganization",
  async (orgData, { rejectWithValue }) => {
    try {
      if (!orgData.org_name || !orgData.org_name.trim()) {
        return rejectWithValue("Organization name is required");
      }

      if (!orgData.category || !orgData.category.trim()) {
        return rejectWithValue("Category is required");
      }

      const formData = new FormData();
      formData.append("org_name", orgData.org_name);
      formData.append("description", orgData.description || "");
      formData.append("category", orgData.category);
      formData.append("isActive", orgData.isActive || "active");
      formData.append("rep_id", orgData.rep_id);

      if (orgData.logo_file) {
        formData.append("logo_file", orgData.logo_file);
      }

      const res = await fetch(`${baseApi}/api/orgs/add`, {
        method: "POST",
        body: formData,
      });
      return res.json();
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add organization.");
    }
  }
);

export const updateOrganization = createAsyncThunk(
  "organizations/updateOrganization",
  async (orgData, { rejectWithValue }) => {
    try {
      if (!orgData.org_name || !orgData.org_name.trim()) {
        return rejectWithValue("Organization name is required");
      }

      if (!orgData.category || !orgData.category.trim()) {
        return rejectWithValue("Category is required");
      }

      const orgId = orgData.org_id || orgData.orgId;

      const formData = new FormData();
      formData.append("org_name", orgData.org_name);
      formData.append("description", orgData.description || "");
      formData.append("category", orgData.category);
      formData.append("isActive", orgData.isActive || "active");
      formData.append("rep_id", orgData.rep_id);

      if (orgData.logo_file) {
        formData.append("logo_file", orgData.logo_file);
      }

      const res = await fetch(`${baseApi}/api/orgs/${orgId}`, {
        method: "PUT",
        body: formData,
      });
      return res.json();
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update organization.");
    }
  }
);

export const toggleOrgStatus = createAsyncThunk(
  "organizations/toggleOrgStatus",
  async ({ orgId, isActive }, { rejectWithValue }) => {
    try {
      return await fetchWithTimeout(`${baseApi}/api/orgs/${orgId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: isActive }),
      });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update status.");
    }
  }
);

export const setOrgRepresentative = createAsyncThunk(
  "organizations/setOrgRepresentative",
  async ({ orgId, rep_id }, { rejectWithValue }) => {
    try {
      return await fetchWithTimeout(
        `${baseApi}/api/orgs/${orgId}/representative`,
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

export const deleteOrganization = createAsyncThunk(
  "organizations/deleteOrganization",
  async (orgId, { rejectWithValue }) => {
    try {
      return await fetchWithTimeout(`${baseApi}/api/orgs/${orgId}`, {
        method: "DELETE",
      });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete organization.");
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
        const newOrg = action.payload.org || action.payload;
        state.organizations = [...state.organizations, newOrg];
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
        const updatedOrg = action.payload.org || action.payload;
        const orgId = updatedOrg.orgId || updatedOrg.org_id;

        state.organizations = state.organizations.map((org) => {
          const existingOrgId = org.orgId || org.org_id;
          return existingOrgId === orgId ? updatedOrg : org;
        });

        state.error = null;
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleOrgStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleOrgStatus.fulfilled, (state, action) => {
        state.loading = false;

        const updatedOrg = action.payload.org || action.payload;
        const orgId = updatedOrg.orgId || updatedOrg.org_id;

        state.organizations = state.organizations.map((org) => {
          const existingOrgId = org.orgId || org.org_id;
          if (existingOrgId === orgId) {
            return {
              ...org,
              isActive: updatedOrg.isActive,
              isVerified:
                updatedOrg.isVerified !== undefined
                  ? updatedOrg.isVerified
                  : org.isVerified,
            };
          }
          return org;
        });

        state.error = null;
      })
      .addCase(toggleOrgStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(setOrgRepresentative.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setOrgRepresentative.fulfilled, (state, action) => {
        state.loading = false;

        const updatedOrg = action.payload.org || action.payload;
        const orgId = updatedOrg.orgId || updatedOrg.org_id;
        const repId =
          updatedOrg.representative?.id || updatedOrg.userId || null;

        state.organizations = state.organizations.map((org) => {
          const existingOrgId = org.orgId || org.org_id;
          if (existingOrgId === orgId) {
            return {
              ...org,
              representative: repId
                ? { ...org.representative, id: repId }
                : null,
            };
          }
          return org;
        });

        state.error = null;
      })
      .addCase(setOrgRepresentative.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.loading = false;

        const deletedOrgId = action.payload.orgId || action.orgId;
        state.organizations = state.organizations.filter((org) => {
          const orgId = org.orgId || org.org_id;
          return Number(orgId) !== Number(deletedOrgId);
        });
        state.error = null;
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

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
