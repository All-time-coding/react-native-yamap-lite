<div align="center">

<img src="./images/banner.png" alt="@exterio/react-native-yamap-lite" width="420" />

# @exterio/react-native-yamap-lite

**Легковесная библиотека для интеграции Yandex Maps (Яндекс Карт) в React Native.**

Yandex Maps · React Native · Fabric

[![npm](https://img.shields.io/npm/v/@exterio/react-native-yamap-lite.svg)](https://www.npmjs.com/package/@exterio/react-native-yamap-lite)
[![platforms](https://img.shields.io/badge/platforms-iOS%20%7C%20Android-blue.svg)](#требования)
[![New Architecture](https://img.shields.io/badge/New%20Architecture-Fabric-success.svg)](#требования)
[![tests](https://img.shields.io/badge/tests-Jest%20%2B%20Harness-brightgreen.svg)](#тесты)
[![license](https://img.shields.io/npm/l/@exterio/react-native-yamap-lite.svg)](./LICENSE)

</div>

---

Lite-обёртка над [Yandex MapKit SDK](https://yandex.ru/dev/maps/mapkit/) — карты, маркеры,
круги, полигоны, полилинии и кластеризация без лишнего веса: в ней нет маршрутов,
геокодера и поиска, только то, что нужно для отображения карты в приложении.

Библиотека собрана целиком на **новой архитектуре React Native** (**Fabric** +
**TurboModules**), что даёт нативную скорость рендеринга на iOS и Android.

## ✨ Возможности

- 🗺️ **Карты Yandex** — типы `map` / `satellite` / `hybrid`, ночной режим, кастомные стили MapKit.
- 📍 **Маркеры** — локальные (`require`) и удалённые (`{ uri }`) изображения, якорь, масштаб, z-index.
- ⭕ **Круги, полигоны, полилинии** — оверлеи с настраиваемыми цветами заливки и обводки.
- 🔗 **Кластеризация** — компонент `ClusteredYamap` для автоматической группировки маркеров.
- 📱 **Позиция пользователя** — отслеживание геолокации, кастомная иконка и зона точности.
- 🎯 **Управление камерой** — `setCenter`, `setZoom`, `fitAllMarkers`, чтение позиции и видимой области через `ref`.
- 🎨 **Жесты и UI** — гибкая настройка жестов, частоты кадров и позиции логотипа Яндекса.

> 💡 Знакомы с [`react-native-yamap`](https://github.com/volga-volga/react-native-yamap)?
> API близок по духу — миграция требует минимальных изменений.

## Требования

Библиотека использует **Fabric (новую архитектуру React Native)** и требует:

- **React Native >= 0.70.0** с включенной новой архитектурой

## Установка

```sh
yarn add @exterio/react-native-yamap-lite
```

или

```sh
npm install @exterio/react-native-yamap-lite --save
```

### iOS

После установки выполните:

```sh
cd ios && pod install && cd ..
```

## Инициализация карт

Инициализация выполняется **полностью из JavaScript** — не нужно править
`AppDelegate.swift` или `MainApplication`. Достаточно один раз вызвать
`YamapUtils.init(apiKey)` до того, как карта отрендерится (например, в `index.js`
или в корне `App.tsx`). Этот вызов сам устанавливает API-ключ и запускает MapKit
на обеих платформах.

```js
// index.js
import { AppRegistry } from 'react-native';
import { YamapUtils } from '@exterio/react-native-yamap-lite';
import App from './App';
import { name as appName } from './app.json';

// Замените на ваш API-ключ от Yandex MapKit
YamapUtils.init('YOUR_API_KEY').catch((error) => {
  console.warn('YamapUtils.init failed:', error);
});

// (необязательно) язык интерфейса карты
YamapUtils.setLocale('ru_RU');

AppRegistry.registerComponent(appName, () => App);
```

> 💡 `init` возвращает `Promise` — карту можно рендерить сразу, она дождётся
> завершения инициализации. Метод идемпотентен: повторные вызовы безопасны.

> ℹ️ Android-зависимость MapKit (`com.yandex.android:maps.mobile`) уже входит в
> библиотеку — добавлять её в `android/app/build.gradle` вручную не нужно.

## Использование

### Базовый пример

```jsx
import React from 'react';
import { YaMap, Marker, Circle } from '@exterio/react-native-yamap-lite';

const Map = () => {
  return (
    <YaMap
      initialRegion={{
        lat: 55.751244,
        lon: 37.618423,
        zoom: 10
      }}
      style={{ flex: 1 }}
    >
      <Marker
        point={{ lat: 55.751244, lon: 37.618423 }}
        source={require('./marker.png')}
      />
      <Circle
        center={{ lat: 55.751244, lon: 37.618423 }}
        radius={1000}
        fillColor="#0000ff"
        strokeColor="#ff0000"
        strokeWidth={2}
      />
    </YaMap>
  );
};
```

## Типы

```typescript
interface Point {
  lat: number;
  lon: number;
}

interface InitialRegion {
  lat: number;
  lon: number;
  zoom?: number;
  azimuth?: number;
  tilt?: number;
}

interface CameraPosition {
  nativeEvent: {
    zoom: number;
    tilt: number;
    azimuth: number;
    point: { lat: number; lon: number };
    finished: boolean;
    target: number;
    reason: 'GESTURES' | 'APPLICATION';
  };
}

interface MapLoaded {
  nativeEvent: {
    renderObjectCount: number;
    curZoomModelsLoaded: number;
    curZoomPlacemarksLoaded: number;
    curZoomLabelsLoaded: number;
    curZoomGeometryLoaded: number;
    tileMemoryUsage: number;
    delayedGeometryLoaded: number;
    fullyAppeared: number;
    fullyLoaded: number;
  };
}

type YandexLogoPosition = {
  horizontal?: 'left' | 'center' | 'right';
  vertical?: 'top' | 'bottom';
};

type YandexLogoPadding = {
  horizontal?: number;
  vertical?: number;
};
```

## Компонент YaMap

### Props

| Название | Тип | По умолчанию | Описание |
|--|--|--|--|
| `initialRegion` | `InitialRegion` | - | Изначальное местоположение карты при загрузке |
| `showUserPosition` | `boolean` | `false` | Отслеживание геоданных и отображение позиции пользователя |
| `followUser` | `boolean` | `false` | Слежение камеры за пользователем |
| `userLocationIcon` | `ImageSource` | - | Иконка для позиции пользователя |
| `userLocationIconScale` | `number` | `1` | Масштабирование иконки пользователя |
| `userLocationAccuracyFillColor` | `string` | `#00FF00` | Цвет фона зоны точности определения позиции пользователя |
| `userLocationAccuracyStrokeColor` | `string` | `#000000` | Цвет границы зоны точности определения позиции пользователя |
| `userLocationAccuracyStrokeWidth` | `number` | `2` | Толщина зоны точности определения позиции пользователя |
| `nightMode` | `boolean` | `false` | Использование ночного режима |
| `mapStyle` | `string` | - | Стили карты согласно [документации](https://yandex.ru/dev/maps/mapkit/doc/dg/concepts/style.html) |
| `mapType` | `'map' \| 'satellite' \| 'hybrid'` | `'map'` | Тип карты |
| `scrollGesturesEnabled` | `boolean` | `true` | Включены ли жесты скролла |
| `zoomGesturesEnabled` | `boolean` | `true` | Включены ли жесты зума |
| `tiltGesturesEnabled` | `boolean` | `true` | Включены ли жесты наклона камеры двумя пальцами |
| `rotateGesturesEnabled` | `boolean` | `true` | Включены ли жесты поворота камеры |
| `fastTapEnabled` | `boolean` | `true` | Убрана ли задержка в 300мс при клике/тапе |
| `maxFps` | `number` | `60` | Максимальная частота обновления карты |
| `logoPosition` | `YandexLogoPosition` | - | Позиция логотипа Яндекса на карте |
| `logoPadding` | `YandexLogoPadding` | - | Отступ логотипа Яндекса на карте |
| `onMapLoaded` | `(event: MapLoaded) => void` | - | Колбек на загрузку карты |
| `onCameraPositionChange` | `(event: CameraPosition) => void` | - | Колбек на изменение положения камеры |
| `onCameraPositionChangeEnd` | `(event: CameraPosition) => void` | - | Колбек при завершении изменения положения камеры |
| `onMapPress` | `(event: Point) => void` | - | Событие нажатия на карту |
| `onMapLongPress` | `(event: Point) => void` | - | Событие долгого нажатия на карту |

### Методы (через ref)

```typescript
interface YaMapRef {
  getCameraPosition: () => Promise<{
    lat: number;
    lon: number;
    zoom: number;
    azimuth: number;
    tilt: number;
  }>;
  setZoom: (
    zoom: number,
    duration?: number,
    animation?: 'LINEAR' | 'SMOOTH'
  ) => void;
  setCenter: (
    center: { lat: number; lon: number },
    zoom?: number,
    azimuth?: number,
    tilt?: number,
    duration?: number,
    animation?: 'LINEAR' | 'SMOOTH'
  ) => void;
  fitAllMarkers: () => void;
  getMapObjectCount: () => Promise<number>;
  getVisibleRegion: () => Promise<VisibleRegion>;
  getScreenPoints: (points: Point[]) => Promise<ScreenPoint[]>;
  getWorldPoints: (points: ScreenPoint[]) => Promise<Point[]>;
}
```

**Пример использования:**

```jsx
import React, { useRef } from 'react';
import { YaMap } from '@exterio/react-native-yamap-lite';

const Map = () => {
  const mapRef = useRef(null);

  const handleSetCenter = () => {
    mapRef.current?.setCenter(
      { lat: 55.751244, lon: 37.618423 },
      15,
      0,
      0,
      1000,
      'SMOOTH'
    );
  };

  const handleGetCameraPosition = async () => {
    const position = await mapRef.current?.getCameraPosition();
    console.log(position);
  };

  return (
    <YaMap
      ref={mapRef}
      initialRegion={{
        lat: 55.751244,
        lon: 37.618423,
        zoom: 10
      }}
      style={{ flex: 1 }}
    />
  );
};
```

## Примитивы

### Marker

```jsx
<YaMap>
  <Marker
    point={{ lat: 55.751244, lon: 37.618423 }}
    source={require('./marker.png')}
    scale={1.5}
    anchor={{ x: 0.5, y: 0.5 }}
    zInd={100}
    visible={true}
    onPress={(point) => console.log('Marker pressed', point)}
  />
</YaMap>
```

#### Props для Marker

| Название | Тип | Описание |
|--|--|--|
| `point` | `Point` | Координаты точки для отображения маркера |
| `source` | `ImageSource` | Данные для изображения маркера |
| `scale` | `number` | Масштабирование иконки маркера |
| `anchor` | `{ x: number, y: number }` | Якорь иконки маркера. Координаты принимают значения от 0 до 1 |
| `zInd` | `number` | Отображение элемента по оси Z |
| `visible` | `boolean` | Отображение маркера на карте |
| `rotated` | `boolean` | Вращение маркера при движении |
| `size` | `number` | Размер маркера в пикселях |
| `handled` | `boolean` | Включение(**false**)/отключение(**true**) всплытия события нажатия для родителя `default: true` |
| `onPress` | `(event: Point) => void` | Действие при нажатии/клике |

### Circle

```jsx
<YaMap>
  <Circle
    center={{ lat: 55.751244, lon: 37.618423 }}
    radius={1000}
    fillColor="#0000ff"
    strokeColor="#ff0000"
    strokeWidth={2}
    zInd={100}
    onPress={(point) => console.log('Circle pressed', point)}
  />
</YaMap>
```

#### Props для Circle

| Название | Тип | Описание |
|--|--|--|
| `center` | `Point` | Координаты центра круга |
| `radius` | `number` | Радиус круга в метрах |
| `fillColor` | `string` | Цвет заливки |
| `strokeColor` | `string` | Цвет границы |
| `strokeWidth` | `number` | Толщина границы |
| `zInd` | `number` | Отображение элемента по оси Z |
| `handled` | `boolean` | Включение(**false**)/отключение(**true**) всплытия события нажатия для родителя `default: true` |
| `onPress` | `(event: Point) => void` | Действие при нажатии/клике |

## ClusteredYamap

Компонент для отображения кластеризованных маркеров:

```jsx
import { ClusteredYamap, Marker } from '@exterio/react-native-yamap-lite';

<ClusteredYamap
  clusterColor="#ff00ff"
  clusteredMarkers={[
    { point: { lat: 55.751244, lon: 37.618423 }, data: {} },
    { point: { lat: 55.752244, lon: 37.619423 }, data: {} },
  ]}
  renderMarker={({ point, data }) => (
    <Marker
      point={point}
      source={{ uri: data.source }}
      size={data.size}
    />
  )}
  style={{ flex: 1 }}
/>
```

#### Props для ClusteredYamap

Все props из `YaMap` плюс:

| Название | Тип | По умолчанию | Описание |
|--|--|--|--|
| `clusteredMarkers` | `Array<{ point: Point, data: any }>` | `[]` | Массив маркеров для кластеризации |
| `renderMarker` | `(info: { point: Point, data: any }, index: number) => ReactElement` | - | Функция для рендеринга каждого маркера |
| `clusterColor` | `string` | `#FF0000` | Цвет фона метки-кластера |

## Запуск Example приложения

Перед запуском example приложения необходимо собрать нативный код для вашей платформы:

**Для iOS:**
```sh
cd example
cd ios && pod install && cd ..
yarn ios
```

**Для Android:**
```sh
cd example
yarn build:android
yarn android
```

После сборки можно запускать приложение как обычно используя `yarn ios` или `yarn android`.

**Примечание:** Все методы и примеры использования карты можно запустить и посмотреть в папке `example` проекта.

## Тесты

Библиотека покрыта тестами на двух уровнях:

- **Jest** — модульные тесты JS-слоя (компоненты, парсинг пропсов, преобразование
  координат, мосты к нативным модулям). Запускаются без устройства/эмулятора:

  ```sh
  yarn test
  ```

- **Harness** — интеграционные тесты, которые гоняют реальные нативные Fabric-компоненты
  на **iOS и Android** через [`react-native-harness`](https://github.com/callstack/react-native-harness).
  Покрыты `YaMap`, `Marker`, `Circle`, `Polygon`, `Polyline`, `ClusteredYamap`,
  события карты, методы `YamapUtils` и набор регрессионных сценариев
  (см. `example/harness/tests`):

  ```sh
  # обе платформы
  yarn test:harness

  # по отдельности
  yarn test:harness:ios
  yarn test:harness:android
  ```

Так нативный код проверяется на настоящих картах, а не на моках, — это покрывает баги,
которые JS-тесты увидеть не могут.

## Важные замечания

1. Компонент карт стилизуется, как и `View` из React Native. Если карта не отображается, после инициализации с валидным ключом API, вероятно необходимо прописать стиль, который опишет размеры компонента (`height + width` или `flex`).

2. Для маркеров и иконки локации пользователя можно использовать как локальные изображения (через `require('./img.png')`), так и удаленные (через `{ uri: 'https://...' }`).

3. Для отображения позиции пользователя на Android нужно запросить разрешение `android.permission.ACCESS_FINE_LOCATION`. На iOS нужно добавить `NSLocationWhenInUseUsageDescription` в `Info.plist`.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
