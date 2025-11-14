export function getInitialAvatar(fullName: string) {
  if (!fullName) return { initials: "?", color: "#888" };

  const parts = fullName.trim().split(" ");

  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

  const initials = (first + last).toUpperCase();

  const hash = [...fullName].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    "#608DBC",
    "#4A90E2",
    "#50C878",
    "#FF8C42",
    "#C850C0",
    "#FF5E5B",
  ];
  const color = colors[hash % colors.length];

  return { initials, color };
}
