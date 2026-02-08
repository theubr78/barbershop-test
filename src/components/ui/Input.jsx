import { forwardRef } from 'react'

const Input = forwardRef(({
    label,
    error,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={props.id}
                    className="block text-sm font-medium text-white/70 mb-2"
                >
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`input ${error ? 'border-red-500' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    )
})

Input.displayName = 'Input'

export default Input
