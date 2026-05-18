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
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldDescription, FieldError, FieldTitle } from "@/components/ui/field";

interface AdminTechTableProps {
  techs: Tech[];
  tags: { id: string; name: string }[];
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

export function AdminTechTable({ techs, tags }: AdminTechTableProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tech | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyForm,
  });

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
    const payload = {
      name: values.name,
      slug: values.slug || values.name.toLowerCase().replace(/\s+/g, "-"),
      description: values.description || null,
      url: values.url || null,
      github_url: values.github_url || null,
    };

    if (editing) {
      await updateTech(editing.id, payload);
    } else {
      await createTech(payload);
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this technology?")) return;
    await deleteTech(id);
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-end">
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
                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
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
                            { message: fieldState.error.message || "Invalid input" },
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
