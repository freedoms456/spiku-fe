"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Heart,
  MapPin,
  BarChart3,
  TrendingUp,
  Activity,
  Baby,
  User,
  AlertTriangle,
} from "lucide-react";
import {
  accounts,
  placementHistories,
  families,
} from "@/lib/employee-management-data";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function PlacementAnalytics() {
  

  return (
    <div className="grid gap-6 md:grid-cols-2">
    
    

    
    </div>
  );
}
