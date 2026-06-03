import type { CrewKey } from "@/lib/data/schedule";

/**
 * Inline chibi SVG character per crew member.
 * Same designs as the original HTML widget.
 */
export function CrewCharacter({ who }: { who: CrewKey }) {
  if (who === "art") return <Art />;
  if (who === "pop") return <Pop />;
  if (who === "tai") return <Tai />;
  return <Jack />;
}

function Art() {
  return (
    <svg viewBox="0 0 120 140" width="100" height="116">
      <ellipse cx="60" cy="135" rx="36" ry="4" fill="rgba(0,0,0,0.08)" />
      <rect x="32" y="100" width="56" height="6" rx="2" fill="#B98762" />
      <rect x="34" y="106" width="52" height="3" fill="#9A6E4F" />
      <rect x="48" y="76" width="8" height="22" rx="3" fill="#4A5568" />
      <rect x="64" y="76" width="8" height="22" rx="3" fill="#4A5568" />
      <rect x="38" y="52" width="44" height="46" rx="10" fill="#E07A5F" />
      <rect x="28" y="62" width="12" height="26" rx="5" fill="#E07A5F" />
      <rect x="80" y="62" width="12" height="26" rx="5" fill="#E07A5F" />
      <circle cx="34" cy="85" r="5" fill="#FFE4C4" />
      <circle cx="86" cy="85" r="5" fill="#FFE4C4" />
      <g>
        <rect x="36" y="66" width="48" height="22" rx="4" fill="#2C2C2A" />
        <rect x="50" y="62" width="20" height="6" rx="2" fill="#1F2937" />
        <circle cx="60" cy="77" r="9" fill="#1F2937" />
        <circle cx="60" cy="77" r="6.5" fill="#374151" />
        <circle cx="60" cy="77" r="4" fill="#1F2937" />
        <circle cx="58" cy="75" r="1.5" fill="#fff" opacity="0.7" />
        <rect x="74" y="70" width="4" height="3" rx="1" fill="#E63946" />
      </g>
      <circle cx="60" cy="32" r="17" fill="#FFE4C4" />
      <path
        d="M 43 32 Q 43 14 60 14 Q 77 14 77 32 Q 77 26 60 27 Q 43 26 43 32 Z"
        fill="#5D4037"
      />
      <path d="M 48 22 Q 60 18 72 22 L 70 26 Q 60 22 50 26 Z" fill="#4E342E" />
      <ellipse cx="54" cy="34" rx="2" ry="2.2" fill="#3D405B" />
      <ellipse cx="66" cy="34" rx="2" ry="2.2" fill="#3D405B" />
      <ellipse cx="50" cy="40" rx="3" ry="2" fill="#FF9999" opacity="0.5" />
      <ellipse cx="70" cy="40" rx="3" ry="2" fill="#FF9999" opacity="0.5" />
      <path
        d="M 56 44 Q 60 47 64 44"
        stroke="#3D405B"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Pop() {
  return (
    <svg viewBox="0 0 120 140" width="100" height="116">
      <ellipse cx="60" cy="135" rx="40" ry="4" fill="rgba(0,0,0,0.08)" />
      <rect x="12" y="100" width="96" height="6" rx="2" fill="#B98762" />
      <rect x="14" y="106" width="92" height="3" fill="#9A6E4F" />
      <g>
        <rect x="30" y="80" width="60" height="20" rx="2" fill="#2C2C2A" />
        <rect x="32" y="82" width="56" height="16" rx="1" fill="#81B29A" />
        <rect x="36" y="86" width="18" height="2" fill="#fff" opacity="0.65" />
        <rect x="36" y="90" width="12" height="2" fill="#fff" opacity="0.45" />
        <rect x="36" y="94" width="22" height="2" fill="#fff" opacity="0.35" />
        <rect x="28" y="100" width="64" height="3" rx="1" fill="#1F2937" />
      </g>
      <rect x="38" y="50" width="44" height="38" rx="10" fill="#81B29A" />
      <rect x="28" y="60" width="12" height="30" rx="5" fill="#81B29A" />
      <rect x="80" y="60" width="12" height="30" rx="5" fill="#81B29A" />
      <circle cx="34" cy="92" r="5" fill="#FFE4C4" />
      <circle cx="86" cy="92" r="5" fill="#FFE4C4" />
      <circle cx="60" cy="30" r="17" fill="#FFE4C4" />
      <path
        d="M 43 30 Q 43 13 60 13 Q 77 13 77 30 Q 77 24 60 25 Q 43 24 43 30"
        fill="#3E2723"
      />
      <circle
        cx="53"
        cy="32"
        r="5"
        fill="rgba(255,255,255,0.85)"
        stroke="#3D405B"
        strokeWidth="1.5"
      />
      <circle
        cx="67"
        cy="32"
        r="5"
        fill="rgba(255,255,255,0.85)"
        stroke="#3D405B"
        strokeWidth="1.5"
      />
      <line x1="58" y1="32" x2="62" y2="32" stroke="#3D405B" strokeWidth="1.5" />
      <circle cx="53" cy="32" r="1.5" fill="#3D405B" />
      <circle cx="67" cy="32" r="1.5" fill="#3D405B" />
      <ellipse cx="50" cy="40" rx="3" ry="2" fill="#FF9999" opacity="0.45" />
      <ellipse cx="70" cy="40" rx="3" ry="2" fill="#FF9999" opacity="0.45" />
      <path
        d="M 56 42 Q 60 44 64 42"
        stroke="#3D405B"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Tai() {
  return (
    <svg viewBox="0 0 120 140" width="100" height="116">
      <ellipse cx="60" cy="135" rx="40" ry="4" fill="rgba(0,0,0,0.08)" />
      <rect x="12" y="100" width="96" height="6" rx="2" fill="#B98762" />
      <rect x="14" y="106" width="92" height="3" fill="#9A6E4F" />
      <g>
        <rect
          x="34"
          y="86"
          width="52"
          height="14"
          rx="2"
          fill="#fff"
          stroke="#C5C5D6"
          strokeWidth="1"
        />
        <line x1="38" y1="90" x2="80" y2="90" stroke="#D5D5E0" strokeWidth="0.6" />
        <line x1="38" y1="93" x2="76" y2="93" stroke="#D5D5E0" strokeWidth="0.6" />
        <line x1="38" y1="96" x2="70" y2="96" stroke="#D5D5E0" strokeWidth="0.6" />
      </g>
      <g>
        <rect x="62" y="78" width="3" height="14" fill="#F2CC8F" />
        <polygon points="62,78 65,78 63.5,74" fill="#3D405B" />
        <rect x="62" y="92" width="3" height="2" fill="#E63946" />
      </g>
      <rect x="38" y="50" width="44" height="40" rx="10" fill="#F2A4B0" />
      <rect x="28" y="62" width="12" height="28" rx="5" fill="#F2A4B0" />
      <rect x="80" y="58" width="12" height="32" rx="5" fill="#F2A4B0" />
      <circle cx="34" cy="92" r="5" fill="#FFE4C4" />
      <circle cx="86" cy="92" r="5" fill="#FFE4C4" />
      <circle cx="60" cy="30" r="17" fill="#FFE4C4" />
      <path
        d="M 43 30 Q 43 13 60 13 Q 77 13 77 30 L 77 42 Q 70 38 60 38 Q 50 38 43 42 Z"
        fill="#3E2723"
      />
      <ellipse cx="50" cy="16" rx="4" ry="3" fill="#F2A4B0" />
      <ellipse cx="58" cy="16" rx="4" ry="3" fill="#F2A4B0" />
      <circle cx="54" cy="16" r="2" fill="#E07A5F" />
      <ellipse cx="54" cy="30" rx="2" ry="2.2" fill="#3D405B" />
      <ellipse cx="66" cy="30" rx="2" ry="2.2" fill="#3D405B" />
      <ellipse cx="50" cy="38" rx="3" ry="2" fill="#FF9999" opacity="0.5" />
      <ellipse cx="70" cy="38" rx="3" ry="2" fill="#FF9999" opacity="0.5" />
      <ellipse cx="60" cy="42" rx="2" ry="1.4" fill="#3D405B" />
      <g>
        <circle cx="92" cy="18" r="5" fill="#FFE082" />
        <path d="M 88 22 L 96 22 L 95 25 L 89 25 Z" fill="#FFB74D" />
        <line x1="83" y1="14" x2="87" y2="16" stroke="#FFB74D" strokeWidth="1" />
        <line x1="92" y1="9" x2="92" y2="12" stroke="#FFB74D" strokeWidth="1" />
      </g>
    </svg>
  );
}

function Jack() {
  return (
    <svg viewBox="0 0 120 140" width="100" height="116">
      <ellipse cx="60" cy="135" rx="40" ry="4" fill="rgba(0,0,0,0.08)" />
      <rect x="12" y="100" width="96" height="6" rx="2" fill="#B98762" />
      <rect x="14" y="106" width="92" height="3" fill="#9A6E4F" />
      <g>
        <rect x="28" y="58" width="64" height="40" rx="3" fill="#2C2C2A" />
        <rect x="30" y="60" width="60" height="36" rx="1" fill="#0F1729" />
        <rect x="32" y="62" width="56" height="22" fill="#374151" />
        <circle cx="60" cy="73" r="5" fill="#fff" opacity="0.25" />
        <polygon points="58,69 58,77 65,73" fill="#fff" opacity="0.8" />
        <rect x="32" y="86" width="56" height="6" fill="#1F2937" />
        <rect x="32" y="86" width="24" height="6" fill="#6B95C9" />
        <rect x="40" y="86" width="2" height="6" fill="#fff" opacity="0.5" />
        <rect x="50" y="86" width="2" height="6" fill="#fff" opacity="0.5" />
        <rect x="55" y="98" width="10" height="6" fill="#1F2937" />
        <rect x="48" y="103" width="24" height="3" rx="1" fill="#1F2937" />
      </g>
      <rect x="38" y="42" width="44" height="42" rx="10" fill="#6B95C9" />
      <rect x="28" y="54" width="12" height="32" rx="5" fill="#6B95C9" />
      <rect x="80" y="54" width="12" height="32" rx="5" fill="#6B95C9" />
      <circle cx="34" cy="88" r="5" fill="#FFE4C4" />
      <circle cx="86" cy="88" r="5" fill="#FFE4C4" />
      <circle cx="60" cy="22" r="16" fill="#FFE4C4" />
      <path
        d="M 44 22 Q 44 6 60 6 Q 76 6 76 22 Q 70 18 60 18 Q 50 18 44 22"
        fill="#1A1A1A"
      />
      <path
        d="M 44 22 Q 44 12 60 12 Q 76 12 76 22"
        stroke="#2C2C2A"
        strokeWidth="3"
        fill="none"
      />
      <ellipse cx="42" cy="26" rx="5" ry="6" fill="#6B95C9" />
      <ellipse cx="78" cy="26" rx="5" ry="6" fill="#6B95C9" />
      <ellipse cx="42" cy="26" rx="3" ry="4" fill="#2C2C2A" />
      <ellipse cx="78" cy="26" rx="3" ry="4" fill="#2C2C2A" />
      <ellipse cx="54" cy="24" rx="2" ry="2.2" fill="#3D405B" />
      <ellipse cx="66" cy="24" rx="2" ry="2.2" fill="#3D405B" />
      <line
        x1="56"
        y1="33"
        x2="64"
        y2="33"
        stroke="#3D405B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
