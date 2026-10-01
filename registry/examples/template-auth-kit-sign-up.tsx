import { AuthKitPage } from "@/components/ballmac/templates/auth-kit/auth-kit-pages"

export default function TemplateAuthKitSignUp() {
  return (
    <AuthKitPage
      page="sign-up"
      hrefs={{ "sign-in": "/preview/template-auth-kit-sign-in", "sign-up": "/preview/template-auth-kit-sign-up", verify: "/preview/template-auth-kit-verify", forgot: "/preview/template-auth-kit-forgot", reset: "/preview/template-auth-kit-reset", invite: "/preview/template-auth-kit-invite", onboarding: "/preview/template-auth-kit-onboarding" }}
    />
  )
}
