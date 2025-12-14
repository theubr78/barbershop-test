import { forwardRef } from 'react'

const Card = forwardRef(({
    children,
    variant = 'default',
    hover = false,
    className = '',
    ...props
}, ref) => {
    const baseClasses = variant === 'glass' ? 'card-glass' : 'card'
    const hoverClasses = hover ? 'card-hover' : ''
    const classes = `${baseClasses} ${hoverClasses} ${className}`

    return (
        <div ref={ref} className={classes} {...props}>
            {children}
        </div>
    )
})

Card.displayName = 'Card'

export default Card
