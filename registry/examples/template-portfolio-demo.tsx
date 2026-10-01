import { PortfolioHome } from "@/components/ballmac/templates/portfolio/portfolio-home"

export default function TemplatePortfolioDemo() {
  return (
    <PortfolioHome
      hrefs={{ home: "/preview/template-portfolio-demo", work: "/preview/template-portfolio-work", case: "/preview/template-portfolio-case", writing: "/preview/template-portfolio-writing", uses: "/preview/template-portfolio-uses" }}
    />
  )
}
