import { Kanban1 } from "@/components/ballmac/blocks/kanban-1/kanban-1"

export default function Kanban1Simple() {
  return (
    <Kanban1
      title="Hiring pipeline"
      description="Move candidates along as they progress."
      height="26rem"
      defaultColumns={[
        { id: "applied", title: "Applied", tasks: [{ id: "c1", title: "Sam Okafor, Product Designer", tags: ["Design"], due: "Oct 8" }, { id: "c2", title: "Lena Berg, Backend Engineer", tags: ["Engineering"] }] },
        { id: "interview", title: "Interviewing", tasks: [{ id: "c3", title: "Ines Duarte, Support Lead", tags: ["Customer"], assignee: "Tomás Herrera", due: "Oct 10", comments: 2 }] },
        { id: "offer", title: "Offer", tasks: [] },
      ]}
    />
  )
}
