import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppIcon, DriveIcon, FileIcon, FolderIcon } from "@/components/ballmac/mac-icons";

describe("mac-icons", () => {
  it("renders every icon as decorative", () => {
    const { container } = render(
      <>
        <FolderIcon tone="teal" />
        <FileIcon label="pdf" />
        <DriveIcon />
        <AppIcon>A</AppIcon>
      </>
    );
    for (const slot of ["folder-icon", "file-icon", "drive-icon", "app-icon"]) {
      expect(container.querySelector(`[data-slot=${slot}]`)).toHaveAttribute("aria-hidden", "true");
    }
  });
  it("shows the file extension in capitals and respects size", () => {
    const { container } = render(<FileIcon label="pdf" size={40} />);
    expect(container.querySelector("text")).toHaveTextContent("PDF");
    expect(container.querySelector("svg")).toHaveAttribute("width", "40");
  });
  it("gives each folder unique gradient ids", () => {
    const { container } = render(<><FolderIcon /><FolderIcon /></>);
    const ids = [...container.querySelectorAll("linearGradient")].map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
