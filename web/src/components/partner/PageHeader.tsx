"use client";
import React from "react";
import Link from "next/link";

export type Breadcrumb = { label: string; href?: string };

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  breadcrumbs = [],
  actions,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {breadcrumbs.length > 0 && (
        <nav className="mb-2 text-sm text-gray-500 flex flex-wrap items-center gap-2">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-gray-700 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-700 font-medium">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <span className="text-gray-400">/</span>}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {backLabel}
            </Link>
          )}
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
