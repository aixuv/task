import React from 'react'

function cx(...items) { return items.filter(Boolean).join(' ') }

export function Button({ className = '', variant = 'default', size, type = 'button', ...props }) {
  const base = 'inline-flex items-center justify-center gap-1 rounded-md font-medium transition disabled:pointer-events-none disabled:opacity-50'
  const variants = {
    default: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
    ghost: 'bg-transparent hover:bg-slate-100',
  }
  const sizes = {
    icon: 'h-9 w-9 p-0',
    sm: 'h-8 px-3 text-xs',
  }
  return <button type={type} className={cx(base, variants[variant] || variants.default, sizes[size], className)} {...props} />
}
