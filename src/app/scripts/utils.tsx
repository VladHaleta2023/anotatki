import React from "react";

export function renderTextWithLineBreaks(text: string) {
  const lines = text.split('\n');
  return lines.map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

export function getRoleFromSession(): string {
    if (typeof window !== "undefined") {
        const role = sessionStorage.getItem("adminStatus") || "false";
        return role;
    }
    
    return "false";
}

export function updateRole(): boolean {
  return getRoleFromSession() === "true";
}