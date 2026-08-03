interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  title?: string;
}

export const Icon = ({
  name,
  size = 20,
  color = 'currentColor',
  style,
  onClick,
  title,
}: IconProps) => (
  <span
    className="material-symbols-outlined"
    onClick={onClick}
    title={title}
    style={{
      fontSize: size,
      color,
      lineHeight: 1,
      flexShrink: 0,
      ...(onClick && { cursor: 'pointer' }),
      ...style,
    }}
  >
    {name}
  </span>
);
