export async function diagnoseApi({
  uri = process.env.NEXT_PUBLIC_NEO4J_URI || "",
  model = process.env.NEXT_PUBLIC_CHATBOT_MODEL || "",
  userName = process.env.NEXT_PUBLIC_NEO4J_USERNAME || "",
  password = process.env.NEXT_PUBLIC_NEO4J_PASSWORD || "",
  database = process.env.NEXT_PUBLIC_NEO4J_DATABASE || "",
  question,
  document_names = "[]",
  session_id,
  mode = process.env.NEXT_PUBLIC_CHATBOT_MODE || "",
  email,
}: {
  uri?: string;
  model?: string;
  userName?: string;
  password?: string;
  database?: string;
  question: string;
  document_names?: string;
  session_id: string;
  mode?: string;
  email: string;
}) {
  console.log("uri", uri);
  console.log("model", model);
  console.log("userName", userName);
  const formData = new FormData();
  formData.append("uri", uri);
  if (model) formData.append("model", model);
  formData.append("userName", userName);
  formData.append("password", password);
  formData.append("database", database);
  if (question) formData.append("question", question);
  if (document_names) formData.append("document_names", document_names);
  if (session_id) formData.append("session_id", session_id);
  if (mode) formData.append("mode", mode);
  formData.append("email", email);

  try {
    const response = await fetch("http://127.0.0.1:8000/chat_bot/diagnose", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error calling chat_bot API:", error);
    return { status: "Failed", message: "Unable to get chat response", error };
  }
}

export async function chatBotApi({
  model = process.env.NEXT_PUBLIC_CHATBOT_MODEL || "",
  human_messages,
  session_id,
  is_diagnose = false,
  context,
  disease_context,
}: {
  model?: string;
  human_messages: string;
  session_id: string;
  is_diagnose: boolean;
  context: string;
  disease_context: string;
}) {
  try {
    const formData = new FormData();
    formData.append("model", model);
    formData.append("human_messages", human_messages);
    formData.append("session_id", session_id);
    formData.append("context", context);
    formData.append("diagnosis", is_diagnose.toString());
    formData.append("disease_context", disease_context);

    const response = await fetch("http://127.0.0.1:8000/chat_bot/interact", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in chatBotApi:", error);
    return { error: "Failed to fetch chatbot response." };
  }
}

export async function clearChatHistory({
  uri = process.env.NEXT_PUBLIC_NEO4J_URI || "",
  userName = process.env.NEXT_PUBLIC_NEO4J_USERNAME || "",
  password = process.env.NEXT_PUBLIC_NEO4J_PASSWORD || "",
  database = process.env.NEXT_PUBLIC_NEO4J_DATABASE || "",
  session_id,
  email,
}: {
  uri?: string;
  userName?: string;
  password?: string;
  database?: string;
  session_id: string;
  email: string;
}) {
  try {
    const formData = new FormData();
    formData.append("uri", uri);
    formData.append("userName", userName);
    formData.append("password", password);
    formData.append("database", database);
    if (session_id) formData.append("session_id", session_id);
    formData.append("email", email);

    const response = await fetch("http://127.0.0.1:8000/clear_chat_bot", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in clearChatHistory:", error);
    return { error: "Failed to clear chat history." };
  }
}

export async function checkSymptoms({
  human_messages,
  model = process.env.NEXT_PUBLIC_CHATBOT_MODEL || "",
}: {
  human_messages: string;
  model?: string;
}) {
  try {
    const formData = new FormData();
    formData.append("human_messages", human_messages);
    formData.append("model", model);

    const response = await fetch("http://127.0.0.1:8000/check-symptoms", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in checkSymptoms:", error);
    return { error: "Failed to check symptoms." };
  }
}

export async function initializeChat({
  session_id,
  context,
}: {
  session_id?: string;
  context?: string;
}) {
  try {
    const formData = new FormData();
    if (session_id) formData.append("session_id", session_id);
    if (context) formData.append("context", context);

    const response = await fetch("http://127.0.0.1:8000/init_chat", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in initializeChat:", error);
    return { error: "Failed to initialize chat." };
  }
}
