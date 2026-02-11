import '@/assets/style/shiny-text.css'
const ShinyText = ({ text, disabled = false, speed = 5, className = '' }) => {
  const animationDuration = `${speed}s`
  return (
    <div
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        animationDuration
      }}
    >
      {text}
      {!disabled && (
        <span
          className="shine"
          aria-hidden="true"
          style={{ animationDuration }}
        >
          {text}
        </span>
      )}
    </div>
  )
}
export default ShinyText
