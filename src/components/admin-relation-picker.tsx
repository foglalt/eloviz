"use client";

import { useId, useState } from "react";

type RelationOption = {
  id: string;
  label: string;
  meta?: string;
};

type Props = {
  name: string;
  options: RelationOption[];
  selectedIds?: string[];
  searchLabel: string;
  emptyLabel: string;
};

export function AdminRelationPicker({
  name,
  options,
  selectedIds = [],
  searchLabel,
  emptyLabel,
}: Props) {
  const searchId = useId();
  const listId = useId();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("hu-HU");
  const matches = (option: RelationOption) =>
    !normalizedQuery
    || option.label.toLocaleLowerCase("hu-HU").includes(normalizedQuery)
    || option.meta?.toLocaleLowerCase("hu-HU").includes(normalizedQuery);
  const visibleCount = options.filter(matches).length;

  return (
    <div className="relation-picker">
      <div className="relation-picker__search">
        <label htmlFor={searchId}>{searchLabel}</label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-controls={listId}
          placeholder="Keresés…"
        />
        <span>{visibleCount} / {options.length}</span>
      </div>
      <div id={listId} className="relation-picker__options">
        {options.map((option) => {
          const visible = matches(option);
          return (
            <label className="check-field" key={option.id} hidden={!visible}>
              <input
                type="checkbox"
                name={name}
                value={option.id}
                defaultChecked={selectedIds.includes(option.id)}
              />
              <span>{option.label}{option.meta ? <small>{option.meta}</small> : null}</span>
            </label>
          );
        })}
        {visibleCount === 0 ? <p className="relation-picker__empty">{emptyLabel}</p> : null}
      </div>
    </div>
  );
}
