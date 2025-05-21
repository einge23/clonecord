"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResourceCardProps {
  title: string;
  description: string;
  href: string;
}

export function ResourceCard({ title, description, href }: ResourceCardProps) {
  return (
    <Card className="h-full flex flex-col bg-card text-card-foreground border border-border">
      <CardHeader>
        <CardTitle>
          <a
            href={href}
            className="text-lg underline hover:no-underline text-primary"
            target="_blank" // Added for external links
            rel="noopener noreferrer" // Added for security
          >
            {title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
