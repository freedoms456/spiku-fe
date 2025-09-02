"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {  GraduationCap,Clock, BookOpen, TrendingUp, Star, BarChart3, AlertTriangle,Users, Award, Target, Calendar } from "lucide-react"

interface Props {
  selectedGender?: string | null
  selectedGrade?: string | null
  selectedUnit?: string | null
  selectedAge?: string | null
  selectedRelation?: string | null
  selectedLocation?: string | null
  selectedLevel?: string | null
  selectedMajor?: string | null
  selectedInstitution?: string | null
  selectedYear?: string | null
  selectedTrainingType?: string | null
  selectedJPRange?: string | null
  selectedDiklatName?: string | null
  selectedCertType?: string | null
  selectedIssuer?: string | null
  selectedExpired?: string | null
  selectedJabatan?: string | null
  selectedPeriod?: string | null
  clearFilters: () => void
}

export default function ActiveFilters(props: Props) {
  const filterKeys = [
    "selectedGender",
    "selectedGrade",
    "selectedUnit",
    "selectedAge",
    "selectedRelation",
    "selectedLocation",
    "selectedLevel",
    "selectedMajor",
    "selectedInstitution",
    "selectedYear",
    "selectedTrainingType",
    "selectedJPRange",
    "selectedDiklatName",
    "selectedCertType",
    "selectedExpired",
    "selectedIssuer",
    "selectedJabatan",
    "selectedPeriod",
  ] as const;

  // buat filters secara dinamis dari props
  const filters = Object.fromEntries(
    filterKeys.map((key) => [key, props[key]])
  ) as Record<typeof filterKeys[number], string | null | undefined>;

  const hasAny = Object.values(filters).some(Boolean);
  if (!hasAny) return null;


  const badgeConfig: Record<
  string,
  { icon: any; bg: string; text: string; truncate?: number }
> = {
  selectedGender: { icon: Users, bg: "bg-blue-100", text: "text-blue-800" },
  selectedGrade: { icon: Award, bg: "bg-purple-100", text: "text-purple-800" },
  selectedUnit: { icon: Target, bg: "bg-orange-100", text: "text-orange-800", truncate: 24 },
  selectedAge: { icon: Calendar, bg: "bg-green-100", text: "text-green-800" },
  selectedRelation: { icon: Users, bg: "bg-purple-100", text: "text-purple-800" },
  selectedLocation: { icon: Users, bg: "bg-purple-100", text: "text-purple-800" },
  selectedLevel: { icon: GraduationCap, bg: "bg-blue-100", text: "text-blue-800" },
  selectedMajor: { icon: BookOpen, bg: "bg-green-100", text: "text-green-800" },
  selectedInstitution: { icon: Award, bg: "bg-orange-100", text: "text-orange-800", truncate: 20 },
  selectedYear: { icon: Calendar, bg: "bg-blue-100", text: "text-blue-800" },
  selectedTrainingType: { icon: BookOpen, bg: "bg-green-100", text: "text-green-800" },
  selectedJPRange: { icon: Clock, bg: "bg-orange-100", text: "text-orange-800" },
  selectedDiklatName: { icon: Clock, bg: "bg-orange-100", text: "text-orange-800" },
  selectedCertType: { icon: Clock, bg: "bg-orange-100", text: "text-orange-800" },
  selectedIssuer: { icon: Clock, bg: "bg-orange-100", text: "text-orange-800" },
  selectedExpired: { icon: Clock, bg: "bg-orange-100", text: "text-orange-800" },
  selectedJabatan: { icon: Clock, bg: "bg-orange-100", text: "text-orange-800" },
  selectedPeriod: { icon: Clock, bg: "bg-orange-100", text: "text-orange-800" }
  };
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              const config = badgeConfig[key];
              const Icon = config.icon;

              let displayValue = value;
              if (config.truncate && value.length > config.truncate) {
                displayValue = value.substring(0, config.truncate) + "…";
              }

              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className={`${config.bg} ${config.text} hover:opacity-80 transition-colors flex items-center`}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {displayValue}
                </Badge>
              );
            })}
          </div>

          <Button onClick={props.clearFilters} variant="outline" size="sm">
            Clear All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}