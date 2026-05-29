import React from 'react'

export function Textarea({ className = '', ...props }) {
  return <textarea className={`border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-400 ${className}`} {...props} />
}
