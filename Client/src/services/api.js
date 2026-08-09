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