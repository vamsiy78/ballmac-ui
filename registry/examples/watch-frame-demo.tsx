import { WatchFrame } from "@/components/ballmac/watch-frame"

const ticks = Array.from({ length: 60 }, (_, i) => i)

function AnalogFace() {
  // 10:09:30 — the classic watch-advert time, so server and browser always agree.
  const hour = (10 + 9.5 / 60) * 30
  const minute = 9.5 * 6
  const second = 30 * 6
  return (
    <div className="relative size-full bg-black">
      <svg viewBox="0 0 208 248" className="size-full" role="img" aria-label="Analog watch face showing 10:09">
        <g transform="translate(104 124)">
          {ticks.map((i) => {
            const major = i % 5 === 0
            return <line key={i} x1="0" y1={major ? -98 : -102} x2="0" y2="-108" transform={`rotate(${i * 6})`} stroke={major ? "white" : "rgb(255 255 255 / 0.4)"} strokeWidth={major ? 3 : 1.2} strokeLinecap="round" />
          })}
          {[12, 3, 6, 9].map((n, i) => (
            <text key={n} x={Math.sin((i * 90 * Math.PI) / 180) * 80} y={-Math.cos((i * 90 * Math.PI) / 180) * 80 + 8} textAnchor="middle" fontSize="22" fontWeight="600" fill="white" fontFamily="ui-rounded, system-ui, sans-serif">
              {n}
            </text>
          ))}
          {/* Complications */}
          <g>
            <circle cx="-42" cy="8" r="26" fill="rgb(255 255 255 / 0.08)" />
            <circle cx="-42" cy="8" r="20" fill="none" stroke="oklch(0.7 0.2 25)" strokeWidth="5" strokeLinecap="round" strokeDasharray="88 126" transform="rotate(-90 -42 8)" />
            <text x="-42" y="13" textAnchor="middle" fontSize="14" fontWeight="700" fill="white" fontFamily="ui-rounded, system-ui, sans-serif">70</text>
            <circle cx="42" cy="8" r="26" fill="rgb(255 255 255 / 0.08)" />
            <text x="42" y="3" textAnchor="middle" fontSize="9" fontWeight="600" fill="oklch(0.78 0.16 35)" fontFamily="ui-rounded, system-ui, sans-serif">THU</text>
            <text x="42" y="22" textAnchor="middle" fontSize="19" fontWeight="700" fill="white" fontFamily="ui-rounded, system-ui, sans-serif">1</text>
          </g>
          <line x1="0" y1="6" x2="0" y2="-52" transform={`rotate(${hour})`} stroke="white" strokeWidth="7" strokeLinecap="round" />
          <line x1="0" y1="6" x2="0" y2="-82" transform={`rotate(${minute})`} stroke="white" strokeWidth="5" strokeLinecap="round" />
          <line x1="0" y1="14" x2="0" y2="-90" transform={`rotate(${second})`} stroke="oklch(0.78 0.17 55)" strokeWidth="2" strokeLinecap="round" />
          <circle r="5.5" fill="oklch(0.78 0.17 55)" />
          <circle r="2" fill="black" />
        </g>
      </svg>
    </div>
  )
}

export default function WatchFrameDemo() {
  return (
    <div className="flex w-full justify-center px-2 py-6">
      <WatchFrame screenWidth={208} band="sport" bandTone="blue" className="max-w-[250px]">
        <AnalogFace />
      </WatchFrame>
    </div>
  )
}
