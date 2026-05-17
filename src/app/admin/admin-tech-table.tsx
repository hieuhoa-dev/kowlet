"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface AdminTechTableProps {
    techs: Tech[];
    tags: { id: string; name: string }[];
}

const emptyForm = {
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
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setOpen(true);
    };

    const openEdit = (tech: Tech) => {
        setEditing(tech);
        setForm({
            name: tech.name,
            slug: tech.slug,
            description: tech.description ?? "",
            url: tech.url ?? "",
            github_url: tech.github_url ?? "",
        });
        setOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            name: form.name,
            slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
            description: form.description || null,
            url: form.url || null,
            github_url: form.github_url || null,
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
                                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
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
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {(["name", "slug", "url", "github_url", "description"] as const).map(
                            (field) => (
                                <div key={field} className="flex flex-col gap-1.5">
                                    <Label htmlFor={field} className="capitalize">
                                        {field.replace("_", " ")}
                                    </Label>
                                    <Input
                                        id={field}
                                        value={form[field]}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, [field]: e.target.value }))
                                        }
                                        required={field === "name"}
                                    />
                                </div>
                            )
                        )}
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
