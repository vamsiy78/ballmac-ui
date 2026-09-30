import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ballmac/navigation-menu";
export default function NavigationMenuStates() {
  return (
    <div className="flex min-h-56 w-full max-w-md justify-center">
      <NavigationMenu viewport={false} aria-label="Docs">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-56 gap-1">
                {["Installation", "Theming", "Accessibility"].map((t) => (
                  <li key={t}>
                    <NavigationMenuLink href={`#${t}`} active={t === "Theming"}>
                      {t}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#changelog" topLevel>
              Changelog
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
