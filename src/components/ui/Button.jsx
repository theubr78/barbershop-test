import { forwardRef } from 'react'

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    className = '',
    ...props
}, ref) => {
    const baseClasses = 'btn'

    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
    }

    const sizeClasses = {
        sm: 'px-3 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
    }

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

    return (
        <button ref={ref} className={classes} {...props}>
            {icon && iconPosition === 'left' && <span className="icon">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="icon">{icon}</span>}
        </button>
    )
})

Button.displayName = 'Button'

export default Button
