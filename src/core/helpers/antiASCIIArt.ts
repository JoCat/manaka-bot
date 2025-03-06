function isAsciiArt(message: string): boolean {
    const lines = message.split("\n")
    if (lines.length < 3) {
        return false // ASCII-арт обычно занимает несколько строк
    }

    // Регулярное выражение для проверки строк на наличие специальных символов
    const artPattern = /[^\w\s]{3,}/u // 3+ специальных символов подряд
    const countArtLines = lines.filter((line) => artPattern.test(line)).length

    // Если большинство строк соответствуют шаблону, это может быть ASCII-арт
    return countArtLines >= Math.floor(lines.length / 2)
}

function hasAlignedLines(message: string): boolean {
    const lines = message.split("\n").filter((line) => line.trim().length > 0)
    if (lines.length < 3) {
        return false // ASCII-арт обычно занимает несколько строк
    }

    const lengths = lines.map((line) => line.length)
    const avgLength =
        lengths.reduce((sum, len) => sum + len, 0) / lengths.length

    // Проверяем, что длины строк не слишком различаются (разброс ±5 символов)
    return lengths.every((len) => Math.abs(len - avgLength) <= 5)
}

export function detectAsciiArt(message: string): boolean {
    return isAsciiArt(message) && hasAlignedLines(message)
}
