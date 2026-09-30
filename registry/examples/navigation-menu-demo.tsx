import { BarChart3, Code2, Layers, Rocket, Users } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ballmac/navigation-menu";
const products = [
  { icon: Layers, title: "Workspaces", text: "Organize projects and files." },
  { icon: BarChart3, title: "Analytics", text: "Track usage without setup." },
  { icon: Code2, title: "API", text: "Build on the same data." },
  { icon: Users, title: "Teams", text: "Roles, groups and audit logs." },
];
export default function NavigationMenuDemo() {
  return (
    <div className="flex min-h-64 w-full max-w-lg justify-center">
      <NavigationMenu aria-label="Main">
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[min(28rem,calc(100vw-4rem))] gap-1 sm:grid-cols-2">
                {products.map(({ icon: Icon, title, text }) => (
                  <li key={title}>
                    <NavigationMenuLink href={`#${title.toLowerCase()}`}>
                      <span className="flex items-center gap-2 font-medium">
                        <Icon aria-hidden="true" /> {title}
                      </span>
                      <span className="text-xs text-muted-foreground">{text}</span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-64 gap-1">
                <li>
                  <NavigationMenuLink href="#docs">
                    <span className="flex items-center gap-2 font-medium">
                      <Rocket aria-hidden="true" /> Quickstart
                    </span>
                    <span className="text-xs text-muted-foreground">Ship your first project in minutes.</span>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#pricing" topLevel>
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
