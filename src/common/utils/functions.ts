export function minimalizeSpaces (text: string): string {
    let result = text
    while (result.indexOf('  ') >= 0) {
        result = result.replace('  ', ' ')
    }
    return result.trim()
}

export function treateTextField (value: string): string {
    const result = value.trim().normalize('NFD').replace(/([\u0300-\u036f]|[^0-9a-zA-Z ])/g, '').toUpperCase()
    return minimalizeSpaces(result)
}