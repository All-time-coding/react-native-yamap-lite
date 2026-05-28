/** @type {import('@commitlint/types').UserConfig} */
const emojiPattern =
  '(?:\\p{Extended_Pictographic}|\\p{Emoji_Presentation})(?:\\uFE0F)?(?:\\u200D(?:\\p{Extended_Pictographic}|\\p{Emoji_Presentation})(?:\\uFE0F)?)*';

const PLATFORM_EMOJIS = {
  ios: '🍏',
  android: '🤖',
};

const BOTH_PLATFORMS = `${PLATFORM_EMOJIS.ios}/${PLATFORM_EMOJIS.android}`;

const FEAT_FIX_EMOJIS = [
  PLATFORM_EMOJIS.ios,
  PLATFORM_EMOJIS.android,
  BOTH_PLATFORMS,
];

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: new RegExp(
        `^(\\w+)\\((${emojiPattern}(?:\\/${emojiPattern})?)\\): (.+)$`,
        'u'
      ),
      headerCorrespondence: ['type', 'emoji', 'subject'],
    },
  },
  plugins: [
    {
      rules: {
        'platform-emoji': ({ type, emoji }) => {
          if (type !== 'feat' && type !== 'fix') {
            return [true];
          }

          if (FEAT_FIX_EMOJIS.includes(emoji)) {
            return [true];
          }

          return [
            false,
            `feat/fix must use ${PLATFORM_EMOJIS.ios} (iOS), ${PLATFORM_EMOJIS.android} (Android), or ${BOTH_PLATFORMS} (both)`,
          ];
        },
      },
    },
  ],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'platform-emoji': [2, 'always'],
    'subject-empty': [2, 'never'],
    'subject-case': [0],
    'scope-empty': [0],
    'header-max-length': [2, 'always', 100],
  },
};
