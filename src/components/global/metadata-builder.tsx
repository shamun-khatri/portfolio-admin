"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  CustomEntityFieldDefinition,
  CustomEntityFieldType,
} from "@/hooks/use-custom-entities";

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

const parseSourceJson = (value?: string): Record<string, unknown> => {
  if (!value?.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return {};
  }

  return {};
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
};

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
  fieldDefinitions,
  readOnly = false,
}: {
  value?: string;
  onChange: (nextJson: string) => void;
  fieldDefinitions?: CustomEntityFieldDefinition[];
  readOnly?: boolean;
}) {
  const [rows, setRows] = useState<MetadataRow[]>([createEmptyRow()]);
  const [schemaValues, setSchemaValues] = useState<Record<string, unknown>>({});
  const hasSchema = fieldDefinitions !== undefined;

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
    if (!hasSchema) {
      setRows(parsedRows);
      return;
    }

    setSchemaValues(parseSourceJson(value));
  }, [hasSchema, parsedRows, value]);

  const emitChange = (nextRows: MetadataRow[]) => {
    setRows(nextRows);
    const payload = serializeRows(nextRows);
    onChange(Object.keys(payload).length > 0 ? JSON.stringify(payload, null, 2) : "");
  };

  const emitSchemaValueChange = (
    field: CustomEntityFieldDefinition,
    rawValue: unknown
  ) => {
    const next = { ...schemaValues };

    if (
      rawValue === "" ||
      rawValue === null ||
      rawValue === undefined ||
      (Array.isArray(rawValue) && rawValue.length === 0)
    ) {
      delete next[field.key];
    } else {
      if (field.type === "number") {
        const numeric = Number(rawValue);
        next[field.key] = Number.isNaN(numeric) ? rawValue : numeric;
      } else if (field.type === "boolean") {
        next[field.key] = Boolean(rawValue);
      } else if (field.type === "multiselect") {
        next[field.key] = Array.isArray(rawValue)
          ? rawValue
          : String(rawValue)
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
      } else if (field.type === "json") {
        if (typeof rawValue === "string") {
          try {
            next[field.key] = rawValue.trim() ? JSON.parse(rawValue) : "";
          } catch {
            next[field.key] = rawValue;
          }
        } else {
          next[field.key] = rawValue;
        }
      } else {
        next[field.key] = rawValue;
      }
    }

    setSchemaValues(next);
    onChange(Object.keys(next).length > 0 ? JSON.stringify(next, null, 2) : "");
  };

  const getSchemaInputValue = (field: CustomEntityFieldDefinition): string | boolean => {
    const valueFromState = schemaValues[field.key];

    if (field.type === "boolean") {
      return Boolean(valueFromState);
    }

    if (field.type === "json") {
      if (valueFromState && typeof valueFromState === "object") {
        return JSON.stringify(valueFromState, null, 2);
      }
      return String(valueFromState ?? "");
    }

    if (Array.isArray(valueFromState)) {
      return valueFromState.join(", ");
    }

    return String(valueFromState ?? "");
  };

  const renderSchemaField = (field: CustomEntityFieldDefinition) => {
    const current = getSchemaInputValue(field);
    const disabled = readOnly;

    if (field.type === "image") {
      const imageSrc = typeof schemaValues[field.key] === "string" ? String(schemaValues[field.key]) : "";

      return (
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            disabled={disabled}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              try {
                const dataUrl = await fileToDataUrl(file);
                emitSchemaValueChange(field, dataUrl);
              } catch {
                emitSchemaValueChange(field, "");
              }
            }}
          />

          {imageSrc ? (
            <div className="rounded-md border border-border/50 p-2">
              <Image
                src={imageSrc}
                alt={field.label}
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 rounded-md object-cover"
              />
            </div>
          ) : null}
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          value={String(current)}
          placeholder={field.label}
          disabled={disabled}
          onChange={(event) => emitSchemaValueChange(field, event.target.value)}
        />
      );
    }

    if (field.type === "json") {
      return (
        <Textarea
          value={String(current)}
          placeholder='{"key":"value"}'
          disabled={disabled}
          className="font-mono text-xs"
          onChange={(event) => emitSchemaValueChange(field, event.target.value)}
        />
      );
    }

    if (field.type === "boolean") {
      return (
        <select
          className="h-9 rounded-md border bg-transparent px-3 text-sm"
          value={Boolean(current) ? "true" : "false"}
          disabled={disabled}
          onChange={(event) => emitSchemaValueChange(field, event.target.value === "true")}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    if (field.type === "select") {
      return (
        <select
          className="h-9 rounded-md border bg-transparent px-3 text-sm w-full"
          value={String(current)}
          disabled={disabled}
          onChange={(event) => emitSchemaValueChange(field, event.target.value)}
        >
          <option value="">Select</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "multiselect") {
      return (
        <Input
          value={String(current)}
          placeholder="option1, option2"
          disabled={disabled}
          onChange={(event) => emitSchemaValueChange(field, event.target.value)}
        />
      );
    }

    const inputTypeByField: Record<CustomEntityFieldType, string> = {
      text: "text",
      textarea: "text",
      number: "number",
      date: "date",
      image: "text",
      boolean: "text",
      select: "text",
      multiselect: "text",
      url: "url",
      json: "text",
    };

    return (
      <Input
        type={inputTypeByField[field.type]}
        value={String(current)}
        placeholder={field.label}
        disabled={disabled}
        onChange={(event) => emitSchemaValueChange(field, event.target.value)}
      />
    );
  };

  if (hasSchema) {
    return (
      <div className="space-y-3 rounded-lg border border-border/50 p-3">
        {fieldDefinitions!.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No custom fields configured yet. Configure schema fields from the Custom Fields page.
          </p>
        ) : null}

        {fieldDefinitions!.map((field) => (
          <div key={field.key} className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium">{field.label}</p>
              {field.required ? (
                <span className="text-[10px] text-muted-foreground">Required</span>
              ) : null}
            </div>
            {renderSchemaField(field)}
          </div>
        ))}
      </div>
    );
  }

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
            disabled={readOnly}
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
        disabled={readOnly}
        onClick={() => emitChange([...rows, createEmptyRow()])}
      >
        <Plus className="h-4 w-4 mr-2" /> Add Custom Field
      </Button>
    </div>
  );
}

export default MetadataBuilder;
