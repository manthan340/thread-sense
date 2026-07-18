"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  clearToken,
  ClosetImage,
  getToken,
  Taxonomies,
} from "@/lib/api";

const TAG_FIELDS = [
  "category",
  "color",
  "season",
  "occasion",
  "style",
  "material",
  "pattern",
  "formality",
] as const;

type TagField = (typeof TAG_FIELDS)[number];

type TagState = Record<TagField, string>;

const emptyTags = (): TagState =>
  Object.fromEntries(TAG_FIELDS.map((k) => [k, ""])) as TagState;

export function ClosetApp() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [taxonomies, setTaxonomies] = useState<Taxonomies | null>(null);
  const [images, setImages] = useState<ClosetImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<TagState>(emptyTags);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTags, setEditTags] = useState<TagState>(emptyTags);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [me, tax, list] = await Promise.all([
      api<{ email: string }>("/auth/me"),
      api<Taxonomies>("/taxonomies", { auth: false }),
      api<ClosetImage[]>("/images"),
    ]);
    setEmail(me.email);
    setTaxonomies(tax);
    setImages(list);
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    load()
      .catch(() => {
        clearToken();
        router.replace("/login");
      })
      .finally(() => setReady(true));
  }, [load, router]);

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose an image to upload");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      for (const key of TAG_FIELDS) {
        if (tags[key]) body.append(key, tags[key]);
      }
      await api<ClosetImage>("/images/upload", { method: "POST", body });
      setFile(null);
      setTags(emptyTags());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(image: ClosetImage) {
    setEditingId(image.id);
    setEditTags({
      category: image.category ?? "",
      color: image.color ?? "",
      season: image.season ?? "",
      occasion: image.occasion ?? "",
      style: image.style ?? "",
      material: image.material ?? "",
      pattern: image.pattern ?? "",
      formality: image.formality ?? "",
    });
  }

  async function saveTags(id: string) {
    setBusy(true);
    setError(null);
    try {
      const payload: Record<string, string> = {};
      for (const key of TAG_FIELDS) {
        if (editTags[key]) payload[key] = editTags[key];
      }
      await api(`/images/${id}/tags`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    clearToken();
    router.push("/login");
  }

  function tagInput(
    key: TagField,
    value: string,
    onChange: (next: string) => void,
  ) {
    const listId = `suggestions-${key}`;
    const options = taxonomies?.[key] ?? [];
    return (
      <label key={key}>
        {key}
        <input
          type="text"
          value={value}
          list={options.length ? listId : undefined}
          placeholder={`Any ${key}`}
          onChange={(e) => onChange(e.target.value)}
        />
        {options.length > 0 && (
          <datalist id={listId}>
            {options.map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        )}
      </label>
    );
  }

  if (!ready) {
    return <p className="muted">Loading closet…</p>;
  }

  return (
    <div className="closet">
      <header className="topbar">
        <div>
          <p className="brand">Thread Sense</p>
          <p className="muted">{email}</p>
        </div>
        <button type="button" className="ghost" onClick={logout}>
          Log out
        </button>
      </header>

      <section className="panel">
        <h2>Upload garment</h2>
        <form onSubmit={onUpload} className="upload-form">
          <label>
            Image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="tag-grid">
            {TAG_FIELDS.map((key) =>
              tagInput(key, tags[key], (next) =>
                setTags((prev) => ({ ...prev, [key]: next })),
              ),
            )}
          </div>
          <button type="submit" disabled={busy}>
            {busy ? "Uploading…" : "Upload"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="panel">
        <h2>Your closet</h2>
        {images.length === 0 ? (
          <p className="muted">No items yet. Upload your first piece.</p>
        ) : (
          <div className="grid">
            {images.map((image) => (
              <article key={image.id} className="card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="Closet item" />
                {editingId === image.id ? (
                  <div className="tag-grid compact">
                    {TAG_FIELDS.map((key) =>
                      tagInput(key, editTags[key], (next) =>
                        setEditTags((prev) => ({ ...prev, [key]: next })),
                      ),
                    )}
                    <div className="row">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => saveTags(image.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="chips">
                      {TAG_FIELDS.filter((k) => image[k]).map((k) => (
                        <span key={k} className="chip">
                          {k}: {image[k]}
                        </span>
                      ))}
                    </div>
                    <button type="button" className="ghost" onClick={() => startEdit(image)}>
                      Edit tags
                    </button>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
