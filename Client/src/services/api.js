const API_URL = "http://localhost:3000/api";

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  return response.json();
};

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      email,
      password
    })
  });

  return response.json();
};

export const getIssues = async () => {
  const response = await fetch(`${API_URL}/issues`);

  return response.json();
};

export const createIssue = async (formData) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};

export const upvoteIssue = async (issueId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/issues/${issueId}/upvote`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.json();
};