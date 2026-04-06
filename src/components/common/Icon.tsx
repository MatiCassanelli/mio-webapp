interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

// TODO update all the existing icons to use this component instead of manually adding the span with the material symbol class
export const Icon = ({
  name,
  size = 20,
  color = 'currentColor',
  style,
}: IconProps) => (
  <span
    className="material-symbols-outlined"
    style={{ fontSize: size, color, lineHeight: 1, ...style }}
  >
    {name}
  </span>
);
