import { render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { I18nProvider, useLocale, useMessages } from "@/lib/ballmac/i18n";
import { Pagination, PaginationNext, PaginationPrevious } from "@/components/ballmac/pagination";
import { CurrencyInput } from "@/components/ballmac/currency-input";

afterEach(() => {
  document.documentElement.lang = "";
});

describe("i18n", () => {
  it("keeps the English default when there is no provider or no key", () => {
    render(
      <Pagination>
        <PaginationPrevious href="#" />
      </Pagination>,
    );
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous page" })).toBeInTheDocument();
  });

  it("translates built-in aria-labels from the provider", () => {
    render(
      <I18nProvider messages={{ "pagination.label": "ترقيم الصفحات", "pagination.nextPage": "الصفحة التالية" }}>
        <Pagination>
          <PaginationPrevious href="#" />
          <PaginationNext href="#" />
        </Pagination>
      </I18nProvider>,
    );
    expect(screen.getByRole("navigation", { name: "ترقيم الصفحات" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "الصفحة التالية" })).toBeInTheDocument();
    // A key the dictionary leaves out stays English.
    expect(screen.getByRole("link", { name: "Previous page" })).toBeInTheDocument();
  });

  it("lets an explicit prop win over the dictionary", () => {
    render(
      <I18nProvider messages={{ "pagination.label": "From dictionary" }}>
        <Pagination aria-label="From prop" />
      </I18nProvider>,
    );
    expect(screen.getByRole("navigation", { name: "From prop" })).toBeInTheDocument();
  });

  it("fills {placeholders} and picks plural forms", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <I18nProvider locale="ar" messages={{ "x.rows": "{count} صف", "x.rows_one": "صف واحد", "x.rows_two": "صفان", "x.rows_few": "{count} صفوف" }}>
        {children}
      </I18nProvider>
    );
    const { result } = renderHook(() => useMessages(), { wrapper });
    expect(result.current("x.rows", "{count} rows", { count: 1 })).toBe("صف واحد");
    expect(result.current("x.rows", "{count} rows", { count: 2 })).toBe("صفان");
    expect(result.current("x.rows", "{count} rows", { count: 5 })).toBe("5 صفوف");
    expect(result.current("x.rows", "{count} rows", { count: 100 })).toBe("100 صف");
    expect(result.current("missing", "Row {n} of {total}", { n: 3, total: 9 })).toBe("Row 3 of 9");
    expect(result.current("missing", "Row {n}", {})).toBe("Row {n}");
  });

  it("resolves the locale from the provider, then <html lang>, then en-US", () => {
    expect(renderHook(() => useLocale()).result.current).toBe("en-US");
    document.documentElement.lang = "de-DE";
    expect(renderHook(() => useLocale()).result.current).toBe("de-DE");
    const wrapper = ({ children }: { children: React.ReactNode }) => <I18nProvider locale="fa-IR">{children}</I18nProvider>;
    expect(renderHook(() => useLocale(), { wrapper }).result.current).toBe("fa-IR");
  });

  it("formats money with the provider's locale, and a locale prop wins", () => {
    const { rerender } = render(
      <I18nProvider locale="de-DE">
        <CurrencyInput label="Price" currency="EUR" value={1234.5} />
      </I18nProvider>,
    );
    expect((screen.getByLabelText("Price") as HTMLInputElement).value).toMatch(/1\.234,50/);
    rerender(
      <I18nProvider locale="de-DE">
        <CurrencyInput label="Price" currency="EUR" value={1234.5} locale="en-US" />
      </I18nProvider>,
    );
    expect((screen.getByLabelText("Price") as HTMLInputElement).value).toMatch(/1,234\.50/);
  });
});
