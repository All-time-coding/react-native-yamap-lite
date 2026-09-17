#import "ClusteredYamapLiteView.h"
#include "ReactCodegen/react/renderer/components/YamapLiteViewSpec/EventEmitters.h"
#include "YamapLiteCircleView.h"
#include "YamapLiteMarkerView.h"
#include "YamapLitePolygonView.h"
#include "YamapLitePolylineView.h"
#include <Foundation/Foundation.h>
#include <objc/NSObject.h>
#include <os/log.h>

#import <RCTTypeSafety/RCTConvertHelpers.h>
#import <React/RCTConversions.h>

#import <react/renderer/components/YamapLiteViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/YamapLiteViewSpec/EventEmitters.h>
#import <react/renderer/components/YamapLiteViewSpec/Props.h>
#import <react/renderer/components/YamapLiteViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "Utils/PointsEqual.h"
#if __has_include("YamapLite/YamapLite-Swift.h")
#import "YamapLite/YamapLite-Swift.h"
#else
#import "YamapLite-Swift.h"
#endif
#import <YandexMapsMobile/YMKMapKitFactory.h>

using namespace facebook::react;

@interface ClusteredYamapLiteView () <RCTClusteredYamapLiteViewViewProtocol,
                                      YamapViewComponentDelegate>

@end

@implementation ClusteredYamapLiteView {
  ClusteredYamapView *_view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      ClusteredYamapLiteViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const ClusteredYamapLiteViewProps>();
    _props = defaultProps;

    _view = [[ClusteredYamapView alloc] init];
    _view.delegate = self;
    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &oldViewProps =
      *std::static_pointer_cast<ClusteredYamapLiteViewProps const>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<ClusteredYamapLiteViewProps const>(props);

  if (oldViewProps.mapType != newViewProps.mapType) {
    _view.mapType = RCTNSStringFromString(toString(newViewProps.mapType));
  }
  if (oldViewProps.nightMode != newViewProps.nightMode) {
    _view.nightMode = newViewProps.nightMode;
  }
  if (oldViewProps.zoomGesturesEnabled != newViewProps.zoomGesturesEnabled) {
    _view.zoomGesturesEnabled = newViewProps.zoomGesturesEnabled;
  }
  if (oldViewProps.scrollGesturesEnabled !=
      newViewProps.scrollGesturesEnabled) {
    _view.scrollGesturesEnabled = newViewProps.scrollGesturesEnabled;
  }
  if (oldViewProps.rotateGesturesEnabled !=
      newViewProps.rotateGesturesEnabled) {
    _view.rotateGesturesEnabled = newViewProps.rotateGesturesEnabled;
  }
  if (oldViewProps.tiltGesturesEnabled != newViewProps.tiltGesturesEnabled) {
    _view.tiltGesturesEnabled = newViewProps.tiltGesturesEnabled;
  }
  if (oldViewProps.fastTapEnabled != newViewProps.fastTapEnabled) {
    _view.fastTapEnabled = newViewProps.fastTapEnabled;
  }
  if (oldViewProps.maxFps != newViewProps.maxFps) {
    _view.maxFps = newViewProps.maxFps;
  }

  if (oldViewProps.initialRegion.lat != newViewProps.initialRegion.lat ||
      oldViewProps.initialRegion.lon != newViewProps.initialRegion.lon ||
      oldViewProps.initialRegion.zoom != newViewProps.initialRegion.zoom ||
      oldViewProps.initialRegion.azimuth !=
          newViewProps.initialRegion.azimuth ||
      oldViewProps.initialRegion.tilt != newViewProps.initialRegion.tilt) {
    [_view move:newViewProps.initialRegion.lat
                :newViewProps.initialRegion.lon
                :newViewProps.initialRegion.zoom
                :newViewProps.initialRegion.azimuth
                :newViewProps.initialRegion.tilt];
  }

  if (oldViewProps.userLocationAccuracyFillColor !=
      newViewProps.userLocationAccuracyFillColor) {
    UIColor *color =
        [self hexStringToColor:RCTNSStringFromString(
                                   newViewProps.userLocationAccuracyFillColor)];
    if (color) {
      _view.userLocationAccuracyFillColor = color;
    }
  }
  if (oldViewProps.userLocationAccuracyStrokeColor !=
      newViewProps.userLocationAccuracyStrokeColor) {
    UIColor *color = [self
        hexStringToColor:RCTNSStringFromString(
                             newViewProps.userLocationAccuracyStrokeColor)];
    if (color) {
      _view.userLocationAccuracyStrokeColor = color;
    }
  }
  if (oldViewProps.userLocationAccuracyStrokeWidth !=
      newViewProps.userLocationAccuracyStrokeWidth) {
    _view.userLocationAccuracyStrokeWidth =
        newViewProps.userLocationAccuracyStrokeWidth;
  }
  if (oldViewProps.showUserPosition != newViewProps.showUserPosition) {
    [_view setShowUserPositionState:newViewProps.showUserPosition];
  }
  if (oldViewProps.userLocationIcon != newViewProps.userLocationIcon) {
    [_view setUserLocationIconWithPath:RCTNSStringFromString(
                                           newViewProps.userLocationIcon)];
  }
  if (oldViewProps.userLocationIconScale !=
      newViewProps.userLocationIconScale) {
    _view.userLocationIconScale = newViewProps.userLocationIconScale;
  }
  if (oldViewProps.followUser != newViewProps.followUser) {
    [_view setFollowUser:newViewProps.followUser];
  }

  if (oldViewProps.logoPosition.horizontal !=
          newViewProps.logoPosition.horizontal ||
      oldViewProps.logoPosition.vertical !=
          newViewProps.logoPosition.vertical) {
    [_view setLogoPositionWithPosition:@{
      @"horizontal" :
          RCTNSStringFromString(toString(newViewProps.logoPosition.horizontal)),
      @"vertical" :
          RCTNSStringFromString(toString(newViewProps.logoPosition.vertical))
    }];
  }
  if (oldViewProps.logoPadding.vertical != newViewProps.logoPadding.vertical ||
      oldViewProps.logoPadding.horizontal !=
          newViewProps.logoPadding.horizontal) {
    [_view setLogoPaddingWithVertical:newViewProps.logoPadding.vertical
                           horizontal:newViewProps.logoPadding.horizontal];
  }

  if (oldViewProps.clusterColor != newViewProps.clusterColor) {
    UIColor *color = [self
        hexStringToColor:RCTNSStringFromString(newViewProps.clusterColor)];
    if (color) {
      _view.clusterColor = color;
    }
  }
  if (!yamaplite::pointsEqual(oldViewProps.clusteredMarkers,
                              newViewProps.clusteredMarkers)) {
    NSMutableArray<YMKPoint *> *markersArr =
        [NSMutableArray arrayWithCapacity:newViewProps.clusteredMarkers.size()];
    for (const auto &marker : newViewProps.clusteredMarkers) {
      [markersArr addObject:[YMKPoint pointWithLatitude:marker.lat
                                              longitude:marker.lon]];
    }
    [_view setupClusteredMarkersWithMarkers:markersArr];
  }

  [_view applyProperties];

  [super updateProps:props oldProps:oldProps];
}

- (void)handleCommand:(NSString *)commandName args:(NSArray *)args {
}

- (void)setCenter:(double)latitude
        longitude:(double)longitude
             zoom:(float)zoom
          azimuth:(float)azimuth
             tilt:(float)tilt
         duration:(float)duration
        animation:(NSString *)animation {
  [_view setCenterWithLatitude:latitude
                     longitude:longitude
                          zoom:zoom
                       azimuth:azimuth
                          tilt:tilt
                      duration:duration
                     animation:animation];
}

- (void)setZoom:(float)zoom
       duration:(float)duration
      animation:(NSString *)animation {
  if (_view != nil) {
    [_view setZoomWithZoom:zoom duration:duration animation:animation];
  } else {
    os_log_error(OS_LOG_DEFAULT, "ClusteredYamapLiteView: _view is nil");
  }
}

- (void)fitAllMarkers {
  if (_view != nil) {
    [_view fitAllMarkers];
  } else {
    os_log_error(OS_LOG_DEFAULT, "ClusteredYamapLiteView: _view is nil");
  }
}

- (void)handleOnMapLoadedWithResult:(NSDictionary *)obj {
  if (_view != nil) {
    [_view applyProperties];
  }

  if (_eventEmitter != nil) {
    ClusteredYamapLiteViewEventEmitter::OnMapLoaded event = {};
    event.curZoomGeometryLoaded =
        [[obj objectForKey:@"curZoomGeometryLoaded"] doubleValue];
    event.curZoomModelsLoaded =
        [[obj objectForKey:@"curZoomModelsLoaded"] doubleValue];
    event.curZoomLabelsLoaded =
        [[obj objectForKey:@"curZoomLabelsLoaded"] doubleValue];
    event.curZoomPlacemarksLoaded =
        [[obj objectForKey:@"curZoomPlacemarksLoaded"] doubleValue];
    event.fullyLoaded = [[obj objectForKey:@"fullyLoaded"] doubleValue];
    event.renderObjectCount =
        [[obj objectForKey:@"renderObjectCount"] doubleValue];
    event.tileMemoryUsage = [[obj objectForKey:@"tileMemoryUsage"] doubleValue];
    event.delayedGeometryLoaded =
        [[obj objectForKey:@"delayedGeometryLoaded"] doubleValue];
    event.fullyAppeared = [[obj objectForKey:@"fullyAppeared"] doubleValue];
    std::dynamic_pointer_cast<const ClusteredYamapLiteViewEventEmitter>(
        _eventEmitter)
        ->onMapLoaded(event);
  }
}

- (void)handleOnCameraPositionChangeWithCoords:(NSDictionary *)coords {
  if (_eventEmitter != nil) {
    ClusteredYamapLiteViewEventEmitter::OnCameraPositionChange event = {};
    event.point.lat = [[coords objectForKey:@"lat"] doubleValue];
    event.point.lon = [[coords objectForKey:@"lon"] doubleValue];
    event.zoom = [[coords objectForKey:@"zoom"] doubleValue];
    event.azimuth = [[coords objectForKey:@"azimuth"] doubleValue];
    event.tilt = [[coords objectForKey:@"tilt"] doubleValue];
    event.finished = [[coords objectForKey:@"finished"] boolValue];
    event.target = [[coords objectForKey:@"target"] doubleValue];

    // Handle reason string - Swift strings bridge to NSString
    id reasonObj = [coords objectForKey:@"reason"];
    NSString *reasonString = @"GESTURES"; // default fallback
    if ([reasonObj isKindOfClass:[NSString class]]) {
      reasonString = (NSString *)reasonObj;
    } else if (reasonObj != nil) {
      // Fallback: try to get string representation
      reasonString = [NSString stringWithFormat:@"%@", reasonObj];
    }
    if ([reasonString isEqualToString:@"APPLICATION"]) {
      event.reason = ClusteredYamapLiteViewEventEmitter::
          OnCameraPositionChangeReason::APPLICATION;
    } else {
      event.reason = ClusteredYamapLiteViewEventEmitter::
          OnCameraPositionChangeReason::GESTURES;
    }

    std::dynamic_pointer_cast<const ClusteredYamapLiteViewEventEmitter>(
        _eventEmitter)
        ->onCameraPositionChange(event);
  }
}

- (void)handleOnCameraPositionChangeEndWithCoords:
    (NSDictionary<NSString *, id> *)coords {
  if (_eventEmitter != nil) {
    ClusteredYamapLiteViewEventEmitter::OnCameraPositionChangeEnd event = {};
    event.point.lat = [[coords objectForKey:@"lat"] doubleValue];
    event.point.lon = [[coords objectForKey:@"lon"] doubleValue];
    event.zoom = [[coords objectForKey:@"zoom"] doubleValue];
    event.azimuth = [[coords objectForKey:@"azimuth"] doubleValue];
    event.tilt = [[coords objectForKey:@"tilt"] doubleValue];
    event.finished = [[coords objectForKey:@"finished"] boolValue];
    event.target = [[coords objectForKey:@"target"] doubleValue];

    // Handle reason string - Swift strings bridge to NSString
    id reasonObj = [coords objectForKey:@"reason"];
    NSString *reasonString = @"GESTURES"; // default fallback
    if ([reasonObj isKindOfClass:[NSString class]]) {
      reasonString = (NSString *)reasonObj;
    } else if (reasonObj != nil) {
      // Fallback: try to get string representation
      reasonString = [NSString stringWithFormat:@"%@", reasonObj];
    }
    if ([reasonString isEqualToString:@"APPLICATION"]) {
      event.reason = ClusteredYamapLiteViewEventEmitter::
          OnCameraPositionChangeEndReason::APPLICATION;
    } else {
      event.reason = ClusteredYamapLiteViewEventEmitter::
          OnCameraPositionChangeEndReason::GESTURES;
    }
    std::dynamic_pointer_cast<const ClusteredYamapLiteViewEventEmitter>(
        _eventEmitter)
        ->onCameraPositionChangeEnd(event);
  }
}

- (void)handleOnMapPressWithCoords:(NSDictionary *)coords {
  if (_eventEmitter != nil) {
    ClusteredYamapLiteViewEventEmitter::OnMapPress event = {};
    event.lat = [[coords objectForKey:@"lat"] doubleValue];
    event.lon = [[coords objectForKey:@"lon"] doubleValue];
    std::dynamic_pointer_cast<const ClusteredYamapLiteViewEventEmitter>(
        _eventEmitter)
        ->onMapPress(event);
  }
}

- (void)handleOnMapLongPressWithCoords:(NSDictionary *)coords {
  if (_eventEmitter != nil) {
    ClusteredYamapLiteViewEventEmitter::OnMapLongPress event = {};
    event.lat = [[coords objectForKey:@"lat"] doubleValue];
    event.lon = [[coords objectForKey:@"lon"] doubleValue];
    std::dynamic_pointer_cast<const ClusteredYamapLiteViewEventEmitter>(
        _eventEmitter)
        ->onMapLongPress(event);
  }
}

- (void)mountChildComponentView:
            (nonnull UIView<RCTComponentViewProtocol> *)childComponentView
                          index:(NSInteger)index {
  if ([childComponentView isKindOfClass:YamapLiteMarkerView.class]) {
    [_view insertReactSubview:childComponentView atIndex:index];
  }
  if ([childComponentView isKindOfClass:YamapLiteCircleView.class]) {
    [_view insertReactSubview:childComponentView atIndex:index];
  }
  if ([childComponentView isKindOfClass:YamapLitePolygonView.class]) {
    [_view insertReactSubview:childComponentView atIndex:index];
  }
  if ([childComponentView isKindOfClass:YamapLitePolylineView.class]) {
    [_view insertReactSubview:childComponentView atIndex:index];
  }
}
- (void)unmountChildComponentView:
            (nonnull UIView<RCTComponentViewProtocol> *)childComponentView
                            index:(NSInteger)index {
  if ([childComponentView isKindOfClass:YamapLiteMarkerView.class] ||
      [childComponentView isKindOfClass:YamapLiteCircleView.class] ||
      [childComponentView isKindOfClass:YamapLitePolygonView.class] ||
      [childComponentView isKindOfClass:YamapLitePolylineView.class]) {
    [_view removeReactSubview:childComponentView];
    [childComponentView removeFromSuperview];
  }
}

Class<RCTComponentViewProtocol> ClusteredYamapLiteViewCls(void) {
  return ClusteredYamapLiteView.class;
}

- hexStringToColor:(NSString *)stringToConvert {
  NSString *noHashString =
      [stringToConvert stringByReplacingOccurrencesOfString:@"#"
                                                 withString:@""];
  NSScanner *stringScanner = [NSScanner scannerWithString:noHashString];

  unsigned hex;
  if (![stringScanner scanHexInt:&hex])
    return nil;
  int r = (hex >> 16) & 0xFF;
  int g = (hex >> 8) & 0xFF;
  int b = (hex) & 0xFF;

  return [UIColor colorWithRed:r / 255.0f
                         green:g / 255.0f
                          blue:b / 255.0f
                         alpha:1.0f];
}

@end
