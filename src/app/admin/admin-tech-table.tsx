"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createTech, deleteTech, updateTech } from "@/lib/actions/tech";
import type { Tech } from "@/types/database";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldTitle,
} from "@/components/ui/field";

interface AdminTechTableProps {
  techs: Tech[];
  tags: { id: string; name: string }[];
  total: number;
  page: number;
  pageSize: number;
  initialQuery: string;
  initialSelectedTags: string[];
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  github_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const emptyForm: FormValues = {
  name: "",
  slug: "",
  description: "",
  url: "",
  github_url: "",
};

export function AdminTechTable({
  techs,
  tags,
  total,
  page,
  pageSize,
  initialQuery,
  initialSelectedTags,
}: AdminTechTableProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tech | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString.withDefault(initialQuery ?? ""),
  );
  const [selectedTagIds, setSelectedTagIds] = useQueryState(
    "tags",
    parseAsArrayOf(parseAsString).withDefault(initialSelectedTags),
  );
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(page),
  );
  const [searchInput, setSearchInput] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(total / pageSize);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyForm,
  });

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(value ? value : null);
      setCurrentPage(0);
    }, 400);
  };

  const handleTagToggle = (tagId: string) => {
    const next = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    setSelectedTagIds(next);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setQuery(null);
    setSelectedTagIds([]);
    setCurrentPage(0);
  };

  const openCreate = () => {
    setEditing(null);
    form.reset(emptyForm);
    setOpen(true);
  };

  const openEdit = (tech: Tech) => {
    setEditing(tech);
    form.reset({
      name: tech.name,
      slug: tech.slug,
      description: tech.description ?? "",
      url: tech.url ?? "",
      github_url: tech.github_url ?? "",
    });
    setOpen(true);
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    form.clearErrors();
    const payload = {
      name: values.name,
      slug: values.slug || values.name.toLowerCase().replace(/\s+/g, "-"),
      description: values.description || null,
      url: values.url || null,
      github_url: values.github_url || null,
    };

    try {
      if (editing) {
        await updateTech(editing.id, payload);
      } else {
        await createTech(payload);
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save technology";

      if (
        message.includes("tech_slug_key") ||
        message.includes("duplicate key")
      ) {
        form.setError("slug", {
          type: "manual",
          message: "Slug already exists. Please choose a different name.",
        });
      } else {
        form.setError("name", { type: "manual", message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this technology?")) return;
    await deleteTech(id);
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            value={searchInput}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search name, URL, or GitHub..."
            className="h-9 w-full min-w-[220px] max-w-xs"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                Tags
                {selectedTagIds.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-4 px-1 text-[10px]"
                  >
                    {selectedTagIds.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="flex flex-col gap-2">
                {tags.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No tags available.
                  </p>
                )}
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent"
                  >
                    <Checkbox
                      checked={selectedTagIds.includes(tag.id)}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          {(query || selectedTagIds.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          )}
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Technology
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>GitHub</TableHead>
              <TableHead className="text-right">Bookmarks</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {techs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No technologies yet.
                </TableCell>
              </TableRow>
            )}
            {techs.map((tech) => (
              <TableRow key={tech.id}>
                <TableCell className="font-medium">{tech.name}</TableCell>
                <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                  {tech.url ?? "—"}
                </TableCell>
                <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                  {tech.github_url ?? "—"}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {tech.bookmark_count}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEdit(tech)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(tech.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {currentPage + 1} of {totalPages} — {total} total
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ‹
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              ›
            </Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Technology" : "Add Technology"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            {(
              ["name", "slug", "url", "github_url", "description"] as const
            ).map((fieldName) => (
              <Field key={fieldName}>
                <Controller
                  name={fieldName}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1.5"
                    >
                      <FieldTitle className="capitalize">
                        {fieldName.replace("_", " ")}
                      </FieldTitle>
                      <Input id={fieldName} {...field} />
                      {fieldName !== "name" && (
                        <FieldDescription>Optional</FieldDescription>
                      )}
                      {fieldState.invalid && fieldState.error && (
                        <FieldError
                          errors={[
                            {
                              message:
                                fieldState.error.message || "Invalid input",
                            },
                          ]}
                        />
                      )}
                    </Field>
                  )}
                />
              </Field>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {editing ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
