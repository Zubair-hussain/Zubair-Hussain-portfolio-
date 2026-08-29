// NOTE: The timeline suggestion runs SERVER-SIDE at /api/suggest-timeline so
// no AI/API key is ever shipped to the browser. This client helper just calls
// that endpoint. (Previously this used NEXT_PUBLIC_HF_API_KEY, which leaked the
// key into the client bundle — removed.)
export const suggestTimeline = async (category: string, userLocation: string) => {
  try {
    const res = await fetch("/api/suggest-timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, location: userLocation }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    return (data?.suggestion as string) || "2-4 weeks (Based on project complexity)";
  } catch {
    return "2-4 weeks (Based on project complexity)";
  }
};

export const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const hasProfanity = (text: string) => {
  const forbidden = ["abuse", "spam", "scam", "badword1", "badword2"]; // Add actual words or use a library
  const regex = new RegExp(forbidden.join("|"), "gi");
  return regex.test(text);
};
