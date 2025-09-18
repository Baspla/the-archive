"use client";
import { useState } from "react";

export default function CreatePublicationForm({ authors }: { authors: { id: string, pseudonym: string | null }[] }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/publications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, summary, authorId, visibility }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Erstellen der Publikation.");
      } else {
        setSuccess(true);
        setTitle("");
        setContent("");
        setSummary("");
        setAuthorId("");
        setVisibility("private");
      }
    } catch (err) {
      setError("Netzwerkfehler oder Server nicht erreichbar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Content *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Summary *</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Author *</label>
        <select
          value={authorId}
          onChange={(e) => setAuthorId(e.target.value)}
          required
        >
          <option value="">Bitte wählen</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.pseudonym || author.id}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Visibility *</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          required
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </div>
      <div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Publication"}
        </button>
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>Publikation erfolgreich erstellt!</div>}
    </form>
  );
}
