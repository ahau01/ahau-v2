import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/svelte'

import other from './assets/account-fill.svg'
import tane from './assets/tane.svg'
import wahine from './assets/wahine.svg'
import Avatar from './Avatar.svelte'

/** The silhouette for each gender, as the create-profile picker shows it. */
describe('avatar', () => {
  for (const [gender, src] of [
    ['male', tane],
    ['female', wahine],
    ['other', other],
    ['unknown', other],
    [null, other]
  ] as const) {
    test(`a person who chose ${gender ?? 'no gender'} gets ${src.split('/').pop()}`, () => {
      render(Avatar, { name: 'Mere', gender, size: 46 })

      const image = screen.getByRole('img', { name: 'Mere' })
      expect(image.getAttribute('src')).toBe(src)
    })
  }

  test('takes the size it is given', () => {
    render(Avatar, { name: 'Mere', gender: 'female', size: 170 })

    const image = screen.getByRole('img', { name: 'Mere' })
    expect(image.getAttribute('width')).toBe('170')
    expect(image.getAttribute('height')).toBe('170')
  })
})
