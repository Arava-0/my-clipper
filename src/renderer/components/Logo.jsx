export default function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="my-clipper"
    >
      <defs>
        {/*
          Cut line runs from (−2, 23) → (34, 9)  (upper boundary)
          Gap of 2px below: (−2, 25) → (34, 11)  (lower boundary)
          Direction: bottom-left to top-right, ~23° from horizontal
        */}
        <clipPath id="logo-upper">
          <polygon points="-2,-2 34,-2 34,9 -2,23" />
        </clipPath>
        <clipPath id="logo-lower">
          <polygon points="-2,25 34,11 34,34 -2,34" />
        </clipPath>
      </defs>

      {/* Upper fragment — accent red, pulled away from the cut */}
      <g transform="translate(1,-1.5)">
        <polygon
          points="4,3 28,16 4,29"
          fill="#e63946"
          clipPath="url(#logo-upper)"
        />
      </g>

      {/* Lower fragment — off-white, pulled away from the cut */}
      <g transform="translate(-1,1.5)">
        <polygon
          points="4,3 28,16 4,29"
          fill="#f0f0f0"
          clipPath="url(#logo-lower)"
        />
      </g>
    </svg>
  )
}
