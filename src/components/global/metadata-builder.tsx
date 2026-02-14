"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MetadataValueType = "text" | "number" | "boolean";

type MetadataRow = {
  key: string;
  value: string;
  type: MetadataValueType;
};

const createEmptyRow = (): MetadataRow => ({
  key: "",
  value: "",
  type: "text",
});

const inferType = (value: unknown): MetadataValueType => {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "text";
};

const serializeRows = (rows: MetadataRow[]) => {
  const payload: Record<string, unknown> = {};

  rows.forEach((row) => {
    const key = row.key.trim();
    if (!key) return;

    if (row.type === "number") {
      const numericValue = Number(row.value);
      if (!Number.isNaN(numericValue)) {
        payload[key] = numericValue;
      }
      return;
    }

    if (row.type === "boolean") {
      payload[key] = row.value === "true";
      return;
    }

    payload[key] = row.value;
  });

  return payload;
};

export function MetadataBuilder({
  value,
  onChange,
}: {
  value?: string;
  onChange: (nextJson: string) => void;
}) {
  const [rows, setRows] = useState<MetadataRow[]>([createEmptyRow()]);

  const parsedRows = useMemo(() => {
    if (!value?.trim()) {
      return [createEmptyRow()];
    }

    try {
      const parsed = JSON.parse(value);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return [createEmptyRow()];
      }

      const mapped = Object.entries(parsed).map(([key, rawValue]) => ({
        key,
        value: typeof rawValue === "string" ? rawValue : String(rawValue),
        type: inferType(rawValue),
      }));

      return mapped.length > 0 ? mapped : [createEmptyRow()];
    } catch {
      return [createEmptyRow()];
    }
  }, [value]);

  useEffect(() => {
    setRows(parsedRows);
  }, [parsedRows]);

  const emitChange = (nextRows: MetadataRow[]) => {
    setRows(nextRows);
    const payload = serializeRows(nextRows);
    onChange(Object.keys(payload).length > 0 ? JSON.stringify(payload, null, 2) : "");
  };

  return (
    <div className="space-y-2 rounded-lg border border-border/50 p-3">
      {rows.map((row, index) => (
        <div key={`${row.key}-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <Input
            className="md:col-span-4"
            placeholder="key (e.g. location)"
            value={row.key}
            onChange={(event) => {
              const nextRows = [...rows];
              nextRows[index] = {
                ...row,
                key: event.target.value.replace(/\s+/g, ""),
              };
              emitChange(nextRows);
            }}
          />

          <select
            className="md:col-span-3 h-9 rounded-md border bg-transparent px-3 text-sm"
            value={row.type}
            onChange={(event) => {
              const nextRows = [...rows];
              const nextType = event.target.value as MetadataValueType;
              nextRows[index] = {
                ...row,
                type: nextType,
                value: nextType === "boolean" ? "false" : row.value,
              };
              emitChange(nextRows);
            }}
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
          </select>

          {row.type === "boolean" ? (
            <select
              className="md:col-span-4 h-9 rounded-md border bg-transparent px-3 text-sm"
              value={row.value === "true" ? "true" : "false"}
              onChange={(event) => {
                const nextRows = [...rows];
                nextRows[index] = { ...row, value: event.target.value };
                emitChange(nextRows);
              }}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <Input
              className="md:col-span-4"
              placeholder="value"
              value={row.value}
              onChange={(event) => {
                const nextRows = [...rows];
                nextRows[index] = { ...row, value: event.target.value };
                emitChange(nextRows);
              }}
            />
          )}

          <Button
            type="button"
            variant="ghost"
            className="md:col-span-1"
            onClick={() => {
              const nextRows = rows.filter((_, currentIndex) => currentIndex !== index);
              emitChange(nextRows.length ? nextRows : [createEmptyRow()]);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => emitChange([...rows, createEmptyRow()])}
      >
        <Plus className="h-4 w-4 mr-2" /> Add Custom Field
      </Button>
    </div>
  );
}

export default MetadataBuilder;
