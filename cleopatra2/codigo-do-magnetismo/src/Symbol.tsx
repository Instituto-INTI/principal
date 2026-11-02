export function Symbol({ kind, className = '' }: { kind: number; className?: string }) {
  return <svg className={`symbol ${className}`} viewBox="0 0 200 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path opacity=".3" d="M25 202V87a75 75 0 0 1 150 0v115M33 202V87a67 67 0 0 1 134 0v115M16 202h168M20 208h160" />
    <path opacity=".25" d="M100 26v9M56 41l6 8M144 41l-6 8M38 76l9 3M162 76l-9 3" />
    {kind === 1 && <g><ellipse cx="100" cy="96" rx="37" ry="47" /><ellipse cx="100" cy="96" rx="30" ry="39" /><path d="M91 142l-5 42h28l-5-42M86 184l-10 10h48l-10-10M79 111l38-44M83 124l35-40M67 139l-7 16M133 139l7 16" /><path opacity=".5" d="M94 152h12M92 161h16M90 170h20" /></g>}
    {kind === 2 && <g><path d="M56 104l10 55h68l10-55-24 19-20-43-20 43-24-19ZM66 159v13h68v-13M72 145h56M100 96v44M76 123l6 18M124 123l-6 18" /><path d="M100 59l8 12-8 12-8-12 8-12ZM51 95l5-7 5 7-5 7-5-7ZM139 95l5-7 5 7-5 7-5-7Z" /><circle cx="100" cy="152" r="4" /><path opacity=".5" d="M72 177h56M62 185h76" /></g>}
    {kind === 3 && <g><path d="M60 118h80v55H60zM60 118l16-29h48l16 29M80 89v29M120 89v29M60 130h80M83 173v-43M117 173v-43" /><path d="M94 126h12v16H94zM76 100h48M46 186q14-10 28 0t28 0 28 0 28 0M48 194q14-10 28 0t28 0 28 0 28 0" /><circle cx="91" cy="80" r="7" /><circle cx="106" cy="77" r="8" /><path d="M100 47v11M95 52h10M52 100v10M47 105h10M147 84v10M142 89h10" /></g>}
    {kind === 4 && <g><path d="M59 76q-15-10-13 7c0 12 18 9 18-2h66q-10 4-10 18v67H65V84M65 166q-11 0-11 9t12 9h65q13-1 13-10t-13-9h-11M77 101h29M77 112h29M77 123h23M77 134h16" /><circle cx="106" cy="153" r="12" /><path d="M100 164l-3 15 9-5 8 5-3-15M104 150l3-4 3 4-2 5h-3zM141 74l-4 66M134 71l8-13 6 14-7 7-7-8Z" /></g>}
    {kind === 5 && <g><path d="M46 111q54-59 108 0-54 48-108 0ZM52 109q48-43 96 0M48 111l-12-9M152 111l12-9M52 115l-9 5" /><circle cx="100" cy="108" r="18" /><circle cx="100" cy="108" r="7" /><path d="M100 127v26q-18 14-26 7M119 130l20 31-22-9M59 148q27 29 45 21M48 168q46 26 94 1" /><path opacity=".4" d="M70 80l-4-9M91 71v-8M112 73l4-9M132 84l7-6" /></g>}
    {kind === 6 && <g><ellipse cx="100" cy="120" rx="48" ry="65" /><ellipse cx="100" cy="120" rx="40" ry="57" opacity=".5" /><circle cx="100" cy="96" r="13" /><path d="M92 109q-14 10-10 29l-10 35h56l-10-35q4-19-10-29M82 124l-15 27M118 124l15 27M100 37v10M45 75l8 7M155 75l-8 7M35 121h10M155 121h10M48 169l8-7M152 169l-8-7" /><path d="M100 62v9M95 67h10" /></g>}
    {kind === 7 && <g><path d="M65 136V85a35 35 0 0 1 70 0v51M73 136V85a27 27 0 0 1 54 0v51M61 136h78v16H61zM58 152v26M142 152v26M69 152l-3 26M131 152l3 26M56 126h15v10H56zM129 126h15v10h-15zM52 178h96v9H52zM44 187h112v8H44z" /><circle cx="100" cy="84" r="10" /><path d="M100 94v28M87 103h26M80 65l9 9M120 65l-9 9M85 123h30M79 143h42M93 117l7 6 7-6" /></g>}
  </svg>;
}

export function WingedSun({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 120 44" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><circle cx="60" cy="16" r="9"/><path d="M49 15L5 6l13 16 31 1M71 15l44-9-13 16-31 1M49 19L14 11M49 23L23 18M71 19l35-8M71 23l26-5M60 25v13M54 31h12M56 38h8"/></svg>;
}
