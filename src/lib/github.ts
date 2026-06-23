export async function getRecentActivity(username: string) {
  const res = await fetch(
    `https://api.github.com/users/${username}/events/public`,
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "GitHub API failed");
  }

  if (!Array.isArray(data)) {
    throw new Error("GitHub API did not return an array");
  }

  return data.slice(0, 5).map((event: any) => ({
    type: event.type,
    repo: event.repo?.name,
    createdAt: event.created_at,
  }));
}

export async function getProfileReadme(username: string) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${username}/${username}/readme`,
    );

    if (!res.ok) {
      return "";
    }

    const data = await res.json();

    if (!data.content) {
      return "";
    }

    console.log(Buffer.from(data.content, "base64").toString("utf-8"));

    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch (error) {
    console.error("Failed to fetch profile README:", error);
    return "";
  }
}
