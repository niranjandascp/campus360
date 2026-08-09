export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_URL}/stats`);
    return await response.json();
  } catch (err) {
    return null;
  }
};
// --- AUTH APIS ---
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return await response.json();
  } catch (err) {
    return { message: "Server connection error. Please check backend server." };
  }
};

export const adminLoginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return await response.json();
  } catch (err) {
    return { message: "Server connection error." };
  }
};

export const registerUser = async (name, email, password, role, userId, department, year) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, userId, department, year })
    });
    return await response.json();
  } catch (err) {
    return { message: "Registration failed. Server connection error." };
  }
};

// --- ISSUES APIS ---
export const getIssues = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.status && params.status !== "all") queryParams.append("status", params.status);
    if (params.category) queryParams.append("category", params.category);
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const response = await fetch(`${API_URL}/issues${queryString ? `?${queryString}` : ""}`);
    return await response.json();
  } catch (err) {
    return { issues: [] };
  }
};

export const createIssue = async (issueData) => {
  try {
    const token = localStorage.getItem("token");
    let headers = {};
    let body;

    if (issueData instanceof FormData) {
      body = issueData;
      headers = { Authorization: `Bearer ${token}` };
    } else {
      body = JSON.stringify(issueData);
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };
    }

    const response = await fetch(`${API_URL}/issues`, {
      method: "POST",
      headers,
      body
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to submit issue." };
  }
};

export const updateIssue = async (issueId, issueData) => {
  try {
    const token = localStorage.getItem("token");
    let headers = {};
    let body;

    if (issueData instanceof FormData) {
      body = issueData;
      headers = { Authorization: `Bearer ${token}` };
    } else {
      body = JSON.stringify(issueData);
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };
    }

    const response = await fetch(`${API_URL}/issues/${issueId}`, {
      method: "PUT",
      headers,
      body
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to update issue." };
  }
};

export const deleteIssue = async (issueId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/issues/${issueId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to delete issue." };
  }
};

export const upvoteIssue = async (issueId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/issues/${issueId}/upvote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (err) {
    return { message: "Upvote failed." };
  }
};

// --- LOST & FOUND APIS ---
export const getLostFound = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.type && params.type !== "all") queryParams.append("type", params.type);
    if (params.category && params.category !== "all") queryParams.append("category", params.category);
    if (params.status && params.status !== "all") queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const response = await fetch(`${API_URL}/lost-found${queryString ? `?${queryString}` : ""}`);
    return await response.json();
  } catch (err) {
    return { items: [] };
  }
};

export const getLostFoundItems = getLostFound;

export const createLostFound = async (itemData) => {
  try {
    const token = localStorage.getItem("token");
    let headers = {};
    let body;

    if (itemData instanceof FormData) {
      body = itemData;
      headers = { Authorization: `Bearer ${token}` };
    } else {
      body = JSON.stringify(itemData);
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };
    }

    const response = await fetch(`${API_URL}/lost-found`, {
      method: "POST",
      headers,
      body
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to post item." };
  }
};

export const updateLostFound = async (itemId, itemData) => {
  try {
    const token = localStorage.getItem("token");
    let headers = {};
    let body;

    if (itemData instanceof FormData) {
      body = itemData;
      headers = { Authorization: `Bearer ${token}` };
    } else {
      body = JSON.stringify(itemData);
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };
    }

    const response = await fetch(`${API_URL}/lost-found/${itemId}`, {
      method: "PUT",
      headers,
      body
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to update item." };
  }
};

export const deleteLostFound = async (itemId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/lost-found/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to delete item." };
  }
};

export const claimLostFound = async (itemId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/lost-found/${itemId}/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (err) {
    return { message: "Claim failed." };
  }
};

export const updateLostFoundStatus = async (itemId, status) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/lost-found/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to update status." };
  }
};

// --- EVENT HUB APIS ---
export const getEvents = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.category && params.category !== "all") queryParams.append("category", params.category);
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const response = await fetch(`${API_URL}/events${queryString ? `?${queryString}` : ""}`);
    return await response.json();
  } catch (err) {
    return [];
  }
};

export const getEventById = async (eventId) => {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}`);
    return await response.json();
  } catch (err) {
    return null;
  }
};

export const createEvent = async (eventData) => {
  try {
    const token = localStorage.getItem("token");
    let headers = {};
    let body;

    if (eventData instanceof FormData) {
      body = eventData;
      headers = { Authorization: `Bearer ${token}` };
    } else {
      body = JSON.stringify(eventData);
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };
    }

    const response = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers,
      body
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to create event." };
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const token = localStorage.getItem("token");
    let headers = {};
    let body;

    if (eventData instanceof FormData) {
      body = eventData;
      headers = { Authorization: `Bearer ${token}` };
    } else {
      body = JSON.stringify(eventData);
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };
    }

    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: "PUT",
      headers,
      body
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to update event." };
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to delete event." };
  }
};

export const toggleEventRsvp = async (eventId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (err) {
    return { message: "RSVP failed." };
  }
};

// --- MESSAGING APIS ---
export const getConversations = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    return [];
  }
};

export const getConversationUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/conversations/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    return [];
  }
};

export const createConversation = async (otherUserId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ otherUserId })
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to start conversation." };
  }
};

export const getMessages = async (conversationId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    return [];
  }
};

export const deleteConversation = async (conversationId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to delete conversation." };
  }
};

export const deleteSingleMessage = async (messageId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/messages/${messageId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to delete message." };
  }
};

export const searchUsers = async (query = "", department = "", role = "") => {
  try {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (department) params.append("department", department);
    if (role) params.append("role", role);

    const response = await fetch(`${API_URL}/users/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    return [];
  }
};

export const getCurrentUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return null;
  }
};

export const getUserProfile = async (identifier) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/users/${identifier}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return null;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    return await response.json();
  } catch (err) {
    return { message: "Failed to update profile." };
  }
};

export const uploadAvatar = async (file) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await fetch(`${API_URL}/users/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    return await response.json();
  } catch (err) {
    return { message: "Avatar upload failed." };
  }
};


export const getAdminStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return { users: { total: 0 }, issues: { total: 0 }, lostFound: { total: 0 }, messaging: { messages: 0 } };
  }
};

export const getAdminUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return [];
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });
    return await response.json();
  } catch (err) {
    return { message: "Role update failed." };
  }
};

export const deleteUserAccount = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return { message: "Account deletion failed." };
  }
};

export const adminUpdateIssueStatus = async (issueId, status) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/admin/issues/${issueId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return await response.json();
  } catch (err) {
    return { message: "Status update failed." };
  }
};

export const adminDeleteIssue = async (issueId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/admin/issues/${issueId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return { message: "Delete issue failed." };
  }
};

export const adminDeleteLostFound = async (itemId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/admin/lost-found/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return { message: "Delete item failed." };
  }
};