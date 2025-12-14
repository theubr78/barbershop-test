const Badge = ({ children, variant = 'primary', className = '' }) => {
    const baseClasses = 'badge'

    const variantClasses = {
        primary: 'badge-primary',
        gold: 'badge-gold',
        success: 'badge-success',
    }

    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

    return (
        <span className={classes}>
            {children}
        </span>
    )
}

export default Badge
