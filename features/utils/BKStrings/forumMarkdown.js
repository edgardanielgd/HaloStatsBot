exports.align = (position, content) => {
    return `[align=${position}]${content}[/align]`;
}

exports.glow = (color, content) => {
    return `[glow=${color}]${content}[/glow]`;
}

exports.size = (size, content) => {
    return `[size=${size}]${content}[/size]`;
}

exports.textColor = (color, content) => {
    return `[color=${color}]${content}[/color]`;
}

exports.b = (content) => {
    return `[b]${content}[/b]`;
}

exports.url = (url, content) => {
    return `[url=${url}]${content}[/url]`;
}

exports.img = (url) => {
    return `[img]${url}[/img]`;
}

exports.concatenate = (...contents) => {
    return contents.join("");
}

exports.newLine = (content) => {
    return `${content}\n`;
}