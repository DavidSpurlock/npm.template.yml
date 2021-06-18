import {
    removeEmailAlias,
    toUnsignedString,
    unescapeCSSEncoding,
    normalizeEmail,
    ucFirst,
    addPlusAlias,
    extractChevrons,
    unicodeTag
} from '../../../src/helpers/string';
import { EMAIL_FORMATING } from '../../../src/app/constants';

const {
    OPEN_TAG_AUTOCOMPLETE,
    CLOSE_TAG_AUTOCOMPLETE,
    OPEN_TAG_AUTOCOMPLETE_RAW,
    CLOSE_TAG_AUTOCOMPLETE_RAW
} = EMAIL_FORMATING;

const EMAILS = {
    'dew@foo.bar': 'dew@foo.bar',
    'dew.new@foo.bar': 'dewnew@foo.bar',
    'dew+polo@foo.bar': 'dew@foo.bar',
    'dew.new+polo@foo.bar': 'dewnew@foo.bar',
    'dew.NEW+polo@foo.bar': 'dewnew@foo.bar'
};

const ADD_PLUS_ALIAS_TESTS = [
    {
        name: 'handle empty parameters and returns an empty string',
        input: {},
        output: ''
    },
    {
        name: 'return the same value even it doesn\'t contain a @',
        input: {
            email: 'panda'
        },
        output: 'panda'
    },
    {
        name: 'add empty plus alias',
        input: {
            email: 'panda@pm.me'
        },
        output: 'panda+@pm.me'
    },
    {
        name: 'keep the same value and not add the plus part because it already contains a +',
        input: {
            email: 'panda+tigre@pm.me',
            plus: 'tortue'
        },
        output: 'panda+tigre@pm.me'
    },
    {
        name: 'keep capitalization in the value returned',
        input: {
            email: 'Panda@pm.me',
            plus: 'Tigre'
        },
        output: 'Panda+Tigre@pm.me'
    }
];

const TEST_HEX = {
    65536: '10000',
    128892: '1f77c',
    '-128892': 'fffe0884',
    268435455: 'fffffff',
    1268435455: '4b9ac9ff',
    '-1268435455': 'b4653601',
    '-2147000000': '80076140'
};

const TEST_BINARY = {
    65536: '10000000000000000',
    128892: '11111011101111100',
    '-128892': '11111111111111100000100010000100',
    268435455: '1111111111111111111111111111',
    1268435455: '1001011100110101100100111111111',
    '-1268435455': '10110100011001010011011000000001',
    '-2147000000': '10000000000001110110000101000000'
};

const ESCAPE_MAP = {
    // CSS hex escaping
    '\\E9motion': 'émotion',
    '\\E9 dition': 'édition',
    '\\E9dition': 'ຝition',
    '\\0000E9dition': 'édition',
    '\\0000E9 dition': 'édition',
    // Special case, make sure codepoints are dealt with correctly.
    '&#x1f512; \\+ &#128477; = \\1f513': '🔒 + 🗝 = 🔓',
    'background: \\75 \\72 \\6C (\'https://TRACKING1/\')': 'background: url(\'https://TRACKING1/\')',
    'background:\\75\\72\\6C(\'https://TRACKING2/\\6CA\')': 'background:url(\'https://TRACKING2/ۊ\')',
    'background: \\75\\72\\6C(\'https://TRACKING3/\\6C A\')': 'background: url(\'https://TRACKING3/lA\')',
    'background:\\75\\72\\6C(\'https://TRACKING4/\\00006CA\')': 'background:url(\'https://TRACKING4/lA\')',
    // html escaping
    'background:&#117;rl(&quot;https://i.imgur.com/test1.jpg&quot;)': 'background:url("https://i.imgur.com/test1.jpg")',
    // combined
    '&#x20AC; &gt; &#65284;; \\0020AC  &gt; CHF; &#8364; &#x226B; &#165;!': '€ > ＄; € > CHF; € ≫ ¥!',
    'Libert\\E9,&#xA0\\0000E9galit\\E9 ,&#160;fraternit\\E9&#xA0!': 'Liberté,\xA0égalité,\xA0fraternité\xA0!',
    'background:&#117;\\72 \\6C(&quot;https://i.imgur.com/test2.jpg&quot;)': 'background:url("https://i.imgur.com/test2.jpg")'
};

describe('removeEmailAlias', () => {

    it('should remove the alias but keep the email', () => {
        Object.keys(EMAILS).forEach((email) => {
            expect(removeEmailAlias(email)).toBe(EMAILS[email]);
        });
    });
});

describe('addPlusAlias', () => {
    ADD_PLUS_ALIAS_TESTS.forEach(({ name, input = {}, output }) => {
        it(`should ${name}`, () => {
            expect(addPlusAlias(input.email, input.plus)).toBe(output);
        });
    });
});

describe('toUnsignedString', () => {

    it('should correctly encode to binary', () => {
        Object.keys(TEST_BINARY).forEach((str) => {
            expect(toUnsignedString(Number.parseInt(str, 10), 1)).toBe(TEST_BINARY[str]);
        });
    });

    it('should correctly encode to hex', () => {
        Object.keys(TEST_HEX).forEach((str) => {
            expect(toUnsignedString(Number.parseInt(str, 10), 4)).toBe(TEST_HEX[str]);
        });
    });

});
describe('unescapeCSSEncoding', () => {
    it('should unescape all test data correctly', () => {
        Object.keys(ESCAPE_MAP).forEach((style) => {
            expect(unescapeCSSEncoding(style)).toBe(ESCAPE_MAP[style]);
        });
    });
});

describe('ucFirst', () => {
    [
        {
            name: 'no value',
            output: ''
        },
        {
            name: 'empty string',
            input: '',
            output: ''
        },
        {
            name: 'simple string',
            input: 'jeanne',
            output: 'Jeanne'
        },
        {
            name: 'already uppercase',
            input: 'JEANNE',
            output: 'JEANNE'
        }
    ].forEach(({ name, input, output }) => {
        it(`should convert the string when ${name}`, () => {
            expect(ucFirst(input)).toBe(output);
        });
    });
});

describe('Manage unicodeTag', () => {

    const convert = (input = '', type = OPEN_TAG_AUTOCOMPLETE_RAW) => input.replace(/###/g,  type);
    const count = (input = '', code = OPEN_TAG_AUTOCOMPLETE) => {
        return input
            .split('')
            .filter((n) => n === code)
            .length;
    };

    describe('Mode default', () => {

        [
            {
                title: 'nothing for an empty input',
                output: ''
            },
            {
                title: 'encode the OPEN_TAG_AUTOCOMPLETE_RAW',
                input: convert('###html'),
                totalOpen: 1,
                output: convert('###html', OPEN_TAG_AUTOCOMPLETE)
            },
            {
                title: 'encode many tags raw',
                input: `${convert('###html ###html ###html ###html ###html')} monique de test  ${convert('dew### dew### dew### dew### dew###', CLOSE_TAG_AUTOCOMPLETE_RAW)}`,
                totalOpen: 5,
                totalClose: 5,
                output: `${convert('###html ###html ###html ###html ###html', OPEN_TAG_AUTOCOMPLETE)} monique de test  ${convert('dew### dew### dew### dew### dew###', CLOSE_TAG_AUTOCOMPLETE)}`
            }
        ].forEach(({ title, input, output, totalOpen = 0, totalClose = 0 }) => {

            it(`should ${title}`, () => {
                expect(unicodeTag(input)).toBe(output);
                expect(count(output)).toBe(totalOpen);
                expect(count(output, CLOSE_TAG_AUTOCOMPLETE)).toBe(totalClose)
            })
        });
    });

    describe('Mode reverse', () => {

        [
            {
                title: 'nothing for an empty input',
                output: ''
            },
            {
                title: 'remove the OPEN_TAG_AUTOCOMPLETE',
                input: convert('###html', OPEN_TAG_AUTOCOMPLETE),
                totalOpen: 1,
                output: convert('###html', OPEN_TAG_AUTOCOMPLETE_RAW)
            },
            {
                title: 'encode many tags encoded',
                input: `${convert('###html ###html ###html ###html ###html', OPEN_TAG_AUTOCOMPLETE)} monique de test  ${convert('dew### dew### dew### dew### dew###', CLOSE_TAG_AUTOCOMPLETE)}`,
                totalOpen: 5,
                totalClose: 5,
                output: `${convert('###html ###html ###html ###html ###html', OPEN_TAG_AUTOCOMPLETE_RAW)} monique de test  ${convert('dew### dew### dew### dew### dew###', CLOSE_TAG_AUTOCOMPLETE_RAW)}`
            }
        ].forEach(({ title, input, output, totalOpen = 0, totalClose = 0 }) => {

            it(`should ${title}`, () => {
                expect(unicodeTag(input, 'reverse')).toBe(output);
                expect(count(output, OPEN_TAG_AUTOCOMPLETE_RAW)).toBe(totalOpen);
                expect(count(output, CLOSE_TAG_AUTOCOMPLETE_RAW)).toBe(totalClose)
            })
        });
    });
});

describe('extractChevrons', () => {
    [
        {
            name: 'should handle empty parameter and return an empty String',
            output: ''
        },
        {
            name: 'should return an empty String if we cannot find a value surrounded by chevrons',
            input: 'panda>',
            output: ''
        },
        {
            name: 'should return an empty String if we cannot find a value surrounded by chevrons',
            input: '<panda',
            output: ''
        },
        {
            name: 'should extract the value surrounded by chevrons',
            input: 'Pandi <panda>',
            output: 'panda'
        }
    ].forEach(({ name, input, output }) => {
        it(name, () => {
            expect(extractChevrons(input)).toBe(output);
        });
    });
});

describe('normalizeEmail', () => {
    [
        {
            name: 'should handle empty parameter and return a String',
            output: ''
        },
        {
            name: 'should lowercase the String',
            input: 'PandA@pm.me',
            output: 'panda@pm.me'
        }
    ].forEach(({ name, input, output }) => {
        it(name, () => {
            expect(normalizeEmail(input)).toBe(output);
        });
    });
});