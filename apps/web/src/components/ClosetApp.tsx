"use client";

import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
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

type TagState = Record<TagField, string[]>;

const emptyTags = (): TagState =>
  Object.fromEntries(TAG_FIELDS.map((k) => [k, []])) as TagState;

function normalizeTags(values: string[] | string | null | undefined): string[] {
  if (!values) return [];
  if (Array.isArray(values)) return values.filter(Boolean);
  return values ? [values] : [];
}

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
  const [drafts, setDrafts] = useState<Record<TagField, string>>(emptyDrafts);
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
        for (const value of tags[key]) {
          body.append(key, value);
        }
      }
      await api<ClosetImage>("/images/upload", { method: "POST", body });
      setFile(null);
      setTags(emptyTags());
      setDrafts(emptyDrafts());
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
      category: normalizeTags(image.category),
      color: normalizeTags(image.color),
      season: normalizeTags(image.season),
      occasion: normalizeTags(image.occasion),
      style: normalizeTags(image.style),
      material: normalizeTags(image.material),
      pattern: normalizeTags(image.pattern),
      formality: normalizeTags(image.formality),
    });
    setDrafts(emptyDrafts());
  }

  async function saveTags(id: string) {
    setBusy(true);
    setError(null);
    try {
      const payload: Record<string, string[]> = {};
      for (const key of TAG_FIELDS) {
        payload[key] = editTags[key];
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

  function toggleValue(
    setter: Dispatch<SetStateAction<TagState>>,
    key: TagField,
    value: string,
  ) {
    setter((prev) => {
      const selected = prev[key];
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      return { ...prev, [key]: next };
    });
  }

  function addCustom(
    setter: Dispatch<SetStateAction<TagState>>,
    key: TagField,
  ) {
    const value = drafts[key].trim();
    if (!value) return;
    setter((prev) =>
      prev[key].includes(value)
        ? prev
        : { ...prev, [key]: [...prev[key], value] },
    );
    setDrafts((prev) => ({ ...prev, [key]: "" }));
  }

  function removeValue(
    setter: Dispatch<SetStateAction<TagState>>,
    key: TagField,
    value: string,
  ) {
    setter((prev) => ({
      ...prev,
      [key]: prev[key].filter((v) => v !== value),
    }));
  }

  function tagMultiSelect(
    key: TagField,
    selected: string[],
    setter: Dispatch<SetStateAction<TagState>>,
  ) {
    const options = taxonomies?.[key] ?? [];

    return (
      <fieldset key={key} className="tag-field">
        <legend>{key}</legend>
        {selected.length > 0 && (
          <div className="chips inline">
            {selected.map((value) => (
              <button
                key={value}
                type="button"
                className="chip removable"
                onClick={() => removeValue(setter, key, value)}
              >
                {value} ×
              </button>
            ))}
          </div>
        )}
        <div className="option-list">
          {options.map((opt) => (
            <label key={opt} className="option">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleValue(setter, key, opt)}
              />
              {opt}
            </label>
          ))}
        </div>
        <div className="custom-add">
          <input
            type="text"
            value={drafts[key]}
            placeholder={`Add custom ${key}`}
            onChange={(e) =>
              setDrafts((prev) => ({ ...prev, [key]: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom(setter, key);
              }
            }}
          />
          <button type="button" className="ghost" onClick={() => addCustom(setter, key)}>
            Add
          </button>
        </div>
      </fieldset>
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
          <div className="tag-grid multi">
            {TAG_FIELDS.map((key) => tagMultiSelect(key, tags[key], setTags))}
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
                  <div className="tag-grid compact multi">
                    {TAG_FIELDS.map((key) =>
                      tagMultiSelect(key, editTags[key], setEditTags),
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
                      {TAG_FIELDS.flatMap((k) =>
                        normalizeTags(image[k]).map((value) => (
                          <span key={`${k}:${value}`} className="chip">
                            {k}: {value}
                          </span>
                        )),
                      )}
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

function emptyDrafts(): Record<TagField, string> {
  return Object.fromEntries(TAG_FIELDS.map((k) => [k, ""])) as Record<
    TagField,
    string
  >;
}
