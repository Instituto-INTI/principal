import { journey } from './content';

const layers = journey.levels.flatMap(level => level.days.map(day => ({ ...day, group: level.name })));

// Núcleo + seis anéis. O número de cada faixa corresponde à legenda em HTML.
export function SevenLayersInfographic() {
  return <figure className="seven-layers" aria-labelledby="journey-title" aria-describedby="journey-subtitle">
    <div className="layers-map">
      <svg className="layers-diagram" viewBox="0 0 550 560" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="layers-core"><stop stopColor="#e6c88f" /><stop offset="1" stopColor="#c5a46d" /></radialGradient>
        </defs>
        {[...layers].reverse().map(day => <circle key={day.day} data-layer={day.day} cx="275" cy="280" r={34 + (day.day - 1) * 36} className={`layer-ring layer-ring-${day.day}`} />)}
        {layers.map((day, i) => {
          const radius = 16 + i * 36;
          const x = 275 + radius / Math.sqrt(2);
          const y = 280 + radius / Math.sqrt(2);
          return <g key={day.day} className="layer-callout">
            <circle cx={x} cy={y} r="12" />
            <text x={x} y={y} dy=".35em" textAnchor="middle">{day.day}</text>
          </g>;
        })}
      </svg>
      <svg className="layers-lines" viewBox="0 0 1000 560" aria-hidden="true" focusable="false">{layers.map((day, i) => {
        const radius = 16 + i * 36;
        return <path key={day.day} className="layer-connector" d={`M ${288 + radius / Math.sqrt(2)} ${280 + radius / Math.sqrt(2)} L 568 ${40 + i * 80} H 610`} />;
      })}</svg>
      <ol className="layers-legend">{layers.map(day => <li key={day.day}>
        <a href={`#dia-${day.day}`}><span className="layer-number">{String(day.day).padStart(2, '0')}</span><span><strong>{day.name}</strong><small>{day.group}</small></span></a>
      </li>)}</ol>
    </div>
  </figure>;
}
