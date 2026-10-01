import { Signup1 } from "@/components/ballmac/blocks/signup-1/signup-1"

export default function Signup1Simple() {
  return (
    <Signup1
      brand="Northwind"
      title="Start your free trial"
      description="14 days, every feature, no card."
      buttonLabel="Start trial"
      onSso={null}
      benefits={[]}
      pitch="Join the teams shipping with Northwind."
      proof="Trusted by 3,100 engineers"
    />
  )
}
