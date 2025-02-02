"use client";

import { EducationRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap, Calendar, Percent, FileCheck } from "lucide-react";

interface EducationCardProps {
  record: EducationRecord;
}

export function EducationCard({ record }: EducationCardProps) {
  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            {record.type}
          </div>
        </CardTitle>
        <Badge variant={record.status === "Completed" ? "default" : "secondary"}>
          {record.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <p className="text-lg font-medium">{record.institution}</p>
            <p className="text-sm text-muted-foreground">Board: {record.board}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{record.yearOfPassing}</span>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{record.percentage}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Certificate: {record.certificateNumber}</span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Subjects:</p>
              <ScrollArea className="h-20">
                <div className="flex flex-wrap gap-2">
                  {record.subjects.map((subject, index) => (
                    <Badge key={index} variant="outline">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}