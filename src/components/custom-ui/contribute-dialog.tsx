"use client";

import { useState } from "react";
import { submitContribution } from "@/lib/actions/contribution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";

interface ContributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  url: "",
  githubUrl: "",
};

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidGithubUrl(value: string) {
  if (!isValidUrl(value)) return false;
  const host = new URL(value).hostname.toLowerCase();
  return host === "github.com" || host === "www.github.com";
}

export function ContributeDialog({
  open,
  onOpenChange,
}: ContributeDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<{ url?: string; githubUrl?: string; root?: string }>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setForm(emptyForm);
      setErrors({});
      setSuccess(false);
    }
    onOpenChange(next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setSuccess(false);

    const url = form.url.trim();
    const githubUrl = form.githubUrl.trim();
    let newErrors: { url?: string; githubUrl?: string; root?: string } = {};

    if (!url && !githubUrl) {
      newErrors.root = "Please provide a website URL or a GitHub repository URL.";
    }

    if (url && !isValidUrl(url)) {
      newErrors.url = "Website URL is invalid. Please include http:// or https://";
    }

    if (githubUrl && !isValidGithubUrl(githubUrl)) {
      newErrors.githubUrl = "GitHub URL must be a valid https://github.com/... link.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await submitContribution({
        url: url || null,
        github_url: githubUrl || null,
      });
      setForm(emptyForm);
      setSuccess(true);
    } catch (err) {
      setErrors({ root: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contribute a technology</DialogTitle>
          <DialogDescription>
            Submit a website or GitHub repository URL for review.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field data-invalid={!!errors.url}>
            <Label htmlFor="contribute-url">Website URL</Label>
            <Input
              id="contribute-url"
              type="url"
              placeholder="https://example.com"
              value={form.url}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, url: event.target.value }));
                if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }));
              }}
              aria-invalid={!!errors.url}
            />
            <FieldDescription>The URL of the technology&apos;s website.</FieldDescription>
            <FieldError>{errors.url}</FieldError>
          </Field>

          <Field data-invalid={!!errors.githubUrl}>
            <Label htmlFor="contribute-github">GitHub URL</Label>
            <Input
              id="contribute-github"
              type="url"
              placeholder="https://github.com/org/repo"
              value={form.githubUrl}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, githubUrl: event.target.value }));
                if (errors.githubUrl) setErrors((prev) => ({ ...prev, githubUrl: undefined }));
              }}
              aria-invalid={!!errors.githubUrl}
            />
            <FieldDescription>The GitHub repository URL, if applicable.</FieldDescription>
            <FieldError>{errors.githubUrl}</FieldError>
          </Field>

          {errors.root && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errors.root}
            </p>
          )}

          {success && (
            <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-600">
              Thanks! Your request was submitted for review.
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
