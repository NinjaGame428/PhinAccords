export const USFlag = ({ className = "w-5 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 640 480"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="United States flag"
  >
    <defs>
      <clipPath id="us">
        <path fillOpacity=".67" d="M-85.333 0h682.67v512h-682.67z" />
      </clipPath>
    </defs>
    <g clipPath="url(#us)" transform="translate(80) scale(.94)">
      <g strokeWidth="1pt">
        <path fill="#bd3d44" d="M-256 0H768v512H-256z" />
        <path
          fill="#fff"
          d="M-256 0H768v64H-256zm0 128H768v64H-256zm0 128H768v64H-256zm0 128H768v64H-256zm0 128H768v64H-256z"
        />
        <path fill="#192f5d" d="M-256 0H0v320H-256z" />
        <path
          fill="#fff"
          d="M-208 82.667h177.78v26.667H-208zm0 53.333h177.78v26.667H-208zm0 53.333h177.78v26.667H-208zm0 53.333h177.78v26.667H-208z"
        />
      </g>
    </g>
  </svg>
);

