import { useState } from 'react'
import Icon from './Icon'

export default function FormField({ id, label, icon, error, hint, type = 'text', ...props }) {
  const [visible, setVisible] = useState(false)
  const password = type === 'password'
  const description = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
  return <div className="field-group">
    <label htmlFor={id} className="mb-2.5 block text-[12px] font-medium text-slate-200">{label}</label>
    <div className={`input-shell ${error ? 'input-invalid' : ''}`}><span className="input-icon"><Icon name={icon} size={17} /></span><input id={id} name={id} type={password && visible ? 'text' : type} aria-invalid={Boolean(error)} aria-describedby={description} {...props} className={`form-input ${password ? 'pr-12' : 'pr-4'}`} />{password && <button type="button" disabled={props.disabled} className="password-toggle" aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}><Icon name={visible ? 'eyeOff' : 'eye'} size={18} /></button>}</div>
    {hint && <p id={`${id}-hint`} className="mt-2 text-[11px] leading-5 text-slate-500">{hint}</p>}
    {error && <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-rose-300">{error}</p>}
  </div>
}
