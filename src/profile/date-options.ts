/**
 * The values the profile form's date dropdowns can represent. Kept beside
 * the form conversion so a newly stored value never seeds a blank select.
 */

/** '', XX, 01 to 31, with 1X, 2X, 3X after 10, 20, 30. */
export const dayOptions: string[] = ['', 'XX']
for (let day = 1; day <= 31; day++) {
  dayOptions.push(String(day).padStart(2, '0'))
  if (day % 10 === 0) dayOptions.push(`${day / 10}X`)
}

export const monthOptions: Array<{ value: string, text: string }> = [
  { value: '', text: '' },
  { value: 'XX', text: 'XX' },
  ...['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December']
    .map((text, index) => ({ value: String(index + 1).padStart(2, '0'), text }))
]

/**
 * '', this year back to 0000, each round year preceded by its unknown form
 * (1920 by 192X, 1900 by 19XX, 2000 by 2XXX, as the old picker did), then XXXX.
 */
export const yearOptions: string[] = ['']
const thisYear = new Date().getUTCFullYear()
for (let year = thisYear; year >= 0; year--) {
  const digits = String(year).padStart(4, '0')
  if (year !== thisYear && year !== 0) {
    const unknown = digits.replace(/0+$/, match => 'X'.repeat(match.length))
    if (unknown !== digits) yearOptions.push(unknown)
  }
  yearOptions.push(digits)
}
yearOptions.push('XXXX')
