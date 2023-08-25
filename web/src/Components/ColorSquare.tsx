export default function ColorSquare(props: { hexValue: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect fill={`#${props.hexValue}`} x="0" y="0" width="100" height="100" />
    </svg>
  )
}
