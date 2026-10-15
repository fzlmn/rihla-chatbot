// Functions that talk to the FastAPI backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function sendMessage(message, conversationId) {
  let response;
  try {
    response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message, conversation_id: conversationId }),
    });
  } catch {
    // fetch fails when the backend cannot be reached at all
    throw new Error("Cannot reach the server. Please check that the backend is running.");
  }

  if (!response.ok) {
    if (response.status === 422) {
      throw new Error("Your message is empty or too long.");
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Something went wrong. Please try again.");
  }

  return response.json();
}

export async function resetConversation(conversationId) {
  await fetch(`${API_URL}/chat/${conversationId}`, { method: "DELETE" });
}
