import type { Metadata } from "next";
import os from "@/data/os.json";
import { ProductMap } from "@/components/product-map";
import "./map.css";

export const metadata: Metadata = {
  title: "The Map",
  description: "How the Oolio Product OS runs end to end: every skill, the gates a person owns, and the loops that close.",
};

export default function MapPage() {
  return (
    <ProductMap
      map={os.map}
      stamp={os.stamp}
      skills={os.totals.skills}
      unplaced={os.totals.unplaced}
    />
  );
}
