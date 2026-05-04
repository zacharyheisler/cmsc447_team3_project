import { useState, useRef, useEffect, useId } from "react";
import "./components.css";

interface Company {
  companyId: number;
  name: string;
}

interface Props {
  companies: Company[];
  /** Called when the user commits a selection or new-company name. */
  onChange: (value: { companyId: number; companyName?: never } | { companyId?: never; companyName: string } | null) => void;
  onBlur?: () => void;
  errorMessage?: string;
}

export default function CompanyCombobox({ companies, onChange, onBlur, errorMessage }: Props) {
  const inputId = useId();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // What is currently committed as the value
  const [committed, setCommitted] = useState<string>("");

  const normalised = query.trim().toLowerCase();

  const filtered = normalised
    ? companies.filter((c) => c.name.toLowerCase().includes(normalised))
    : companies;

  const exactMatch = companies.find(
    (c) => c.name.toLowerCase() === normalised,
  );

  // Show "Create …" row when there's a query with no exact match
  const showCreate = query.trim().length > 0 && !exactMatch;

  // All options including the optional create row
  const totalOptions = filtered.length + (showCreate ? 1 : 0);

  function commit(name: string, id?: number) {
    setQuery(name);
    setCommitted(name);
    setOpen(false);
    setActiveIndex(-1);
    if (id !== undefined) {
      onChange({ companyId: id });
    } else {
      onChange({ companyName: name });
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setOpen(true);
    setActiveIndex(-1);
    // If the user modifies the text away from a committed value, clear the selection
    if (committed && e.target.value !== committed) {
      setCommitted("");
      onChange(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, totalOptions - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        const c = filtered[activeIndex];
        commit(c.name, c.companyId);
      } else if (activeIndex === filtered.length && showCreate) {
        commit(query.trim());
      } else if (exactMatch) {
        commit(exactMatch.name, exactMatch.companyId);
      } else if (showCreate) {
        commit(query.trim());
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Close on outside click
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const hasError = Boolean(errorMessage);
  const inputClass = `textfield_input${hasError ? " textfield_input--error" : ""}`;

  return (
    <div className="textfield" ref={containerRef}>
      <label className="textfield_label" htmlFor={inputId}>
        Company
      </label>

      <div style={{ position: "relative" }}>
        <input
          id={inputId}
          className={inputClass}
          type="text"
          autoComplete="off"
          placeholder="Search or type a company name…"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
        />

        {open && (query.trim().length > 0 || companies.length > 0) && (
          <ul
            id={listboxId}
            role="listbox"
            className="company-combobox-list"
          >
            {filtered.length === 0 && !showCreate && (
              <li className="company-combobox-empty">No companies found</li>
            )}

            {filtered.map((c, i) => (
              <li
                key={c.companyId}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`company-combobox-option${i === activeIndex ? " company-combobox-option--active" : ""}`}
                onPointerDown={(e) => {
                  e.preventDefault(); // keep focus on input
                  commit(c.name, c.companyId);
                }}
              >
                {c.name}
              </li>
            ))}

            {showCreate && (
              <li
                id={`${listboxId}-opt-${filtered.length}`}
                role="option"
                aria-selected={activeIndex === filtered.length}
                className={`company-combobox-option company-combobox-create${activeIndex === filtered.length ? " company-combobox-option--active" : ""}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  commit(query.trim());
                }}
              >
                Create&nbsp;<strong>&ldquo;{query.trim()}&rdquo;</strong>
              </li>
            )}
          </ul>
        )}
      </div>

      {errorMessage && <p className="textfield_error">{errorMessage}</p>}
    </div>
  );
}
