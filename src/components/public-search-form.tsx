type PublicSearchFormProps = {
  defaultValue?: string;
  variant?: "header" | "page";
};

export function PublicSearchForm({
  defaultValue = "",
  variant = "header",
}: PublicSearchFormProps) {
  const isPageSearch = variant === "page";

  return (
    <form
      action="/kereses"
      className={`public-search public-search--${variant}`}
      role="search"
    >
      <label>
        <span className="visually-hidden">Keresés a témák, tanulmányok és videók között</span>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          defaultValue={defaultValue}
          enterKeyHint="search"
          maxLength={100}
          minLength={2}
          name="q"
          placeholder={isPageSearch ? "Mit keresel?" : "Keresés…"}
          type="search"
        />
      </label>
      <button aria-label={isPageSearch ? undefined : "Keresés"} type="submit">
        {isPageSearch ? "Keresés" : (
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m9 6 6 6-6 6" />
          </svg>
        )}
      </button>
    </form>
  );
}
