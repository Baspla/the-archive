
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAuthorPage() {
	const [pseudonym, setPseudonym] = useState("");
	const [isPublic, setIsPublic] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const router = useRouter();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);
		try {
			const res = await fetch("/api/authors/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ pseudonym, isPublic }),
			});
			if (!res.ok) {
				const data = await res.json();
				setError(data.error || "Fehler beim Erstellen.");
			} else {
				setSuccess(true);
				setPseudonym("");
				setIsPublic(false);
				setTimeout(() => router.push("/authors"), 1200);
			}
		} catch (e) {
			setError("Netzwerkfehler.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div >
			<h1 >Autor anlegen</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label>Pseudonym *</label>
					<input
						type="text"
						value={pseudonym}
						onChange={e => setPseudonym(e.target.value)}
						required
					/>
				</div>
				<div>
					<label>
						<input
							type="checkbox"
							className="mr-2"
							checked={isPublic}
							onChange={e => setIsPublic(e.target.checked)}
						/>
						Öffentliches Profil
					</label>
				</div>
				{error && <div className="text-red-600">{error}</div>}
				{success && <div className="text-green-600">Autor erfolgreich erstellt!</div>}
				<button
					type="submit"
					disabled={loading}
				>
					{loading ? "Speichern..." : "Autor anlegen"}
				</button>
			</form>
		</div>
	);
}
