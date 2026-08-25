import type { CSSProperties, MouseEventHandler, ReactNode } from 'react'

export interface ButtonInterface {
  children: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  /** Native button type - 'button' unless it submits a form. Genegeerd wanneer `href` gezet is. */
  type?: 'button' | 'submit' | 'reset'
  /** Rendert als een echte <a> i.p.v. <button> - voor navigatie/downloads (native browser-gedrag), geen JS-nagemaakte link. */
  href?: string
  /** Enkel zinvol samen met `href` - zet het native download-attribuut. */
  download?: string | boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 's' | 'm' | 'l'
  disabled?: boolean
  /** Native title-attribuut - bv. om uit te leggen waarom een knop disabled is. */
  title?: string
  style?: CSSProperties
  testID?: string
}
