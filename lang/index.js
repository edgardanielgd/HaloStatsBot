const en = require('./languages/en');
const es = require('./languages/es');

const languages = {
    en: en,
    es: es
}

const pkgLang = {
    getString: (lang, key) => {
        return languages[lang][key];
    },
}

module.exports = pkgLang;