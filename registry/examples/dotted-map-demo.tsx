import { DottedMap } from "@/components/ballmac/dotted-map"

export default function DottedMapDemo() {
  return (
    <div className="w-full max-w-2xl rounded-2xl border bg-card p-4">
      <DottedMap
        dots={170}
        labels
        label="Our offices"
        markers={[
          { lat: 37.77, lng: -122.42, label: "San Francisco", tone: "chart-1" },
          { lat: 40.71, lng: -74.0, label: "New York", tone: "chart-1" },
          { lat: 51.5, lng: -0.12, label: "London", tone: "chart-4" },
          { lat: 1.35, lng: 103.82, label: "Singapore", tone: "chart-2" },
          { lat: -33.87, lng: 151.21, label: "Sydney", tone: "chart-3" },
        ]}
        arcs={[
          { from: [37.77, -122.42], to: [51.5, -0.12], tone: "chart-1" },
          { from: [51.5, -0.12], to: [1.35, 103.82], tone: "chart-4" },
          { from: [1.35, 103.82], to: [-33.87, 151.21], tone: "chart-2" },
          { from: [40.71, -74.0], to: [37.77, -122.42], tone: "chart-1" },
        ]}
      />
    </div>
  )
}
