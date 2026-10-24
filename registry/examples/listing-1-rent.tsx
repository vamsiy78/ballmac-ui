"use client"

import { Listing1 } from "@/components/ballmac/blocks/listing-1/listing-1"

export default function Listing1Rent() {
  return <Listing1 listing={{ address: "Flat 7, 22 Mill Lane", city: "Leeds", price: 1450, offer: "To rent", per: "per month", type: "Flat", beds: 2, baths: 1, area: 74, description: "A modern second-floor flat close to the station, with a balcony and an open-plan kitchen. Available from 1 December, unfurnished.", features: ["Balcony", "Open-plan kitchen", "Bike store", "Pets considered"], photos: [{ alt: "The open-plan living room" }, { alt: "The balcony" }], agent: { name: "Tom Hartley", role: "Lettings agent" }, viewings: [{ id: "v1", label: "Mon 27 Oct, 17:30" }, { id: "v2", label: "Wed 29 Oct, 12:00" }] }} currency="GBP" />
}
