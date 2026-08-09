export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// --- AUTH APIS ---
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  return response.json();
};

export const adminLoginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/admin-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  return response.json();
};

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, password })
  });

  return response.json();
};

// --- ISSUES APIS ---
export const getIssues = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status && params.status !== "all") queryParams.append("status", params.status);
  if (params.category) queryParams.append("category", params.category);
  if (params.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const response = await fetch(`${API_URL}/issues${queryString ? `?${queryString}` : ""}`);
  return response.json();
};

export const createIssue = async (issueData) => {
  const token = localStorage.getItem("token");
  let headers = {};
  let body;

  if (issueData instanceof FormData) {
    body = issueData;
    headers = {
      Authorization: `Bearer ${token}`
    };
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

  return response.json();
};

export const updateIssue = async (issueId, issueData) => {
  const token = localStorage.getItem("token");
  let headers = {};
  let body;

  if (issueData instanceof FormData) {
    body = issueData;
    headers = {
      Authorization: `Bearer ${token}`
    };
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

  return response.json();
};

export const deleteIssue = async (issueId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/issues/${issueId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.json();
};

export const upvoteIssue = async (issueId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/issues/${issueId}/upvote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  return response.json();
};

// --- LOST & FOUND APIS ---
export const getLostFound = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.type && params.type !== "all") queryParams.append("type", params.type);
  if (params.category && params.category !== "all") queryParams.append("category", params.category);
  if (params.status && params.status !== "all") queryParams.append("status", params.status);
  if (params.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const response = await fetch(`${API_URL}/lost-found${queryString ? `?${queryString}` : ""}`);
  return response.json();
};

export const getLostFoundItems = getLostFound;

export const createLostFound = async (itemData) => {
  const token = localStorage.getItem("token");
  let headers = {};
  let body;

  if (itemData instanceof FormData) {
    body = itemData;
    headers = {
      Authorization: `Bearer ${token}`
    };
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

  return response.json();
};

export const updateLostFound = async (itemId, itemData) => {
  const token = localStorage.getItem("token");
  let headers = {};
  let body;

  if (itemData instanceof FormData) {
    body = itemData;
    headers = {
      Authorization: `Bearer ${token}`
    };
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

  return response.json();
};

export const deleteLostFound = async (itemId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/lost-found/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.json();
};

export const claimLostFound = async (itemId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/lost-found/${itemId}/claim`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  return response.json();
};

export const updateLostFoundStatus = async (itemId, status) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/lost-found/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  return response.json();
};

// --- EVENT HUB APIS ---
export const getEvents = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category && params.category !== "all") queryParams.append("category", params.category);
  if (params.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const response = await fetch(`${API_URL}/events${queryString ? `?${queryString}` : ""}`);
  return response.json();
};

export const getEventById = async (eventId) => {
  const response = await fetch(`${API_URL}/events/${eventId}`);
  return response.json();
};

export const createEvent = async (eventData) => {
  const token = localStorage.getItem("token");
  let headers = {};
  let body;

  if (eventData instanceof FormData) {
    body = eventData;
    headers = {
      Authorization: `Bearer ${token}`
    };
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

  return response.json();
};

export const updateEvent = async (eventId, eventData) => {
  const token = localStorage.getItem("token");
  let headers = {};
  let body;

  if (eventData instanceof FormData) {
    body = eventData;
    headers = {
      Authorization: `Bearer ${token}`
    };
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

  return response.json();
};

export const deleteEvent = async (eventId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/events/${eventId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.json();
};

export const toggleEventRsvp = async (eventId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  return response.json();
};

// --- MESSAGING APIS ---
export const getConversations = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.json();
};

export const getConversationUsers = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/conversations/users`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.json();
};

export const createConversation = async (otherUserId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ otherUserId })
  });
  return response.json();
};

export const getMessages = async (conversationId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.json();
};

export const deleteConversation = async (conversationId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.json();
};

export const deleteSingleMessage = async (messageId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/messages/${messageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.json();
};

export const searchUsers = async (query = "", department = "", role = "") => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (department) params.append("department", department);
  if (role) params.append("role", role);

  const response = await fetch(`${API_URL}/users/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.json();
};

export const getCurrentUserProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.json();
};

export const getUserProfile = async (identifier) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/users/${identifier}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.json();
};

export const updateUserProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  return response.json();
};

export const getAdminStats = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
};

export const getAdminUsers = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
};

export const updateUserRole = async (userId, role) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });
  return response.json();
};

export const deleteUserAccount = async (userId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
};

export const adminUpdateIssueStatus = async (issueId, status) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/admin/issues/${issueId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  return response.json();
};

export const adminDeleteIssue = async (issueId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/admin/issues/${issueId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
};

export const adminDeleteLostFound = async (itemId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/admin/lost-found/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
};