import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
} from 'react-native-harness';
import { Platform } from 'react-native';
import { YamapUtils } from '@atc/react-native-yamap-lite';
import { YAMAP_API_KEY } from '../constants';

describe('YamapUtils', () => {
  describe('init', () => {
    test('initializes MapKit with a valid API key on iOS', async () => {
      if (Platform.OS !== 'ios') {
        return;
      }

      await expect(YamapUtils.init(YAMAP_API_KEY)).resolves.toBeUndefined();
    });
  });

  describe('locale', () => {
    beforeEach(async () => {
      if (Platform.OS !== 'ios') {
        return;
      }
      await YamapUtils.resetLocale();
    });

    afterEach(async () => {
      if (Platform.OS !== 'ios') {
        return;
      }
      await YamapUtils.resetLocale();
    });

    test('returns a non-empty locale string on iOS', async () => {
      if (Platform.OS !== 'ios') {
        return;
      }

      const locale = await YamapUtils.getLocale();
      expect(typeof locale).toBe('string');
      expect(locale.length).toBeGreaterThan(0);
    });

    test('setLocale updates the active locale on iOS', async () => {
      if (Platform.OS !== 'ios') {
        return;
      }

      await YamapUtils.setLocale('en_US');
      expect(await YamapUtils.getLocale()).toMatch(/^en/);
    });

    test('resetLocale restores the default locale on iOS', async () => {
      if (Platform.OS !== 'ios') {
        return;
      }

      const defaultLocale = await YamapUtils.getLocale();
      await YamapUtils.setLocale('ru_RU');
      await YamapUtils.resetLocale();
      expect(await YamapUtils.getLocale()).toBe(defaultLocale);
    });
  });
});
