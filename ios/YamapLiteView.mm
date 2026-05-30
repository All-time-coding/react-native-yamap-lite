#import "YamapLiteView.h"
#include "ReactCodegen/react/renderer/components/YamapLiteViewSpec/EventEmitters.h"
#include "YamapLiteCircleView.h"
#include "YamapLiteMarkerView.h"
#import "YamapLitePolygonView.h"
#import "YamapLitePolylineView.h"
#include <os/log.h>

#include <Foundation/Foundation.h>
#include <objc/NSObject.h>

#import <RCTTypeSafety/RCTConvertHelpers.h>
#import <React/RCTConversions.h>
#import <react/renderer/components/YamapLiteViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/YamapLiteViewSpec/EventEmitters.h>
#import <react/renderer/components/YamapLiteViewSpec/Props.h>
#import <react/renderer/components/YamapLiteViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "YamapLite-Swift.h"

using namespace facebook::react;

@interface YamapLiteView () <RCTYamapLiteViewViewProtocol,
                             YamapViewComponentDelegate>

@end

@implementation YamapLiteView {
  YamapView *_view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      YamapLiteViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const YamapLiteViewProps>();
    _props = defaultProps;

    _view = [[YamapView alloc] init];
    _view.delegate = self;

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &oldViewProps =
      *std::static_pointer_cast<YamapLiteViewProps const>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<YamapLiteViewProps const>(props);

  if (oldViewProps.mapType != newViewProps.mapType) {
    self->_view.mapType = RCTNSStringFromString(toString(newViewProps.mapType));
  }
  if (oldViewProps.nightMode != newViewProps.nightMode) {
    self->_view.nightMode = newViewProps.nightMode;
  }
  if (oldViewProps.zoomGesturesEnabled != newViewProps.zoomGesturesEnabled) {
    self->_view.zoomGesturesEnabled = newViewProps.zoomGesturesEnabled;
  }
  if (oldViewProps.scrollGesturesEnabled !=
      newViewProps.scrollGesturesEnabled) {
    self->_view.scrollGesturesEnabled = newViewProps.scrollGesturesEnabled;
  }
  if (oldViewProps.rotateGesturesEnabled !=
      newViewProps.rotateGesturesEnabled) {
    self->_view.rotateGesturesEnabled = newViewProps.rotateGesturesEnabled;
  }

  if (oldViewProps.initialRegion.lat != newViewProps.initialRegion.lat ||
      oldViewProps.initialRegion.lon != newViewProps.initialRegion.lon ||
      oldViewProps.initialRegion.zoom != newViewProps.initialRegion.zoom ||
      oldViewProps.initialRegion.azimuth !=
          newViewProps.initialRegion.azimuth ||
      oldViewProps.initialRegion.tilt != newViewProps.initialRegion.tilt) {
    [self->_view move:newViewProps.initialRegion.lat :newViewProps.initialRegion.lon :newViewProps.initialRegion.zoom :newViewProps.initialRegion.azimuth :newViewProps.initialRegion.tilt];
  }
  if (oldViewProps.tiltGesturesEnabled != newViewProps.tiltGesturesEnabled) {
    self->_view.tiltGesturesEnabled = newViewProps.tiltGesturesEnabled;
  }
  if (oldViewProps.fastTapEnabled != newViewProps.fastTapEnabled) {
    self->_view.fastTapEnabled = newViewProps.fastTapEnabled;
  }
  if (oldViewProps.userLocationAccuracyFillColor !=
      newViewProps.userLocationAccuracyFillColor) {
    self->_view.userLocationAccuracyFillColor =
        [self hexStringToColor:RCTNSStringFromString(
                                   newViewProps.userLocationAccuracyFillColor)];
  }
  if (oldViewProps.userLocationAccuracyStrokeColor !=
      newViewProps.userLocationAccuracyStrokeColor) {
    self->_view.userLocationAccuracyStrokeColor = [self
        hexStringToColor:RCTNSStringFromString(
                             newViewProps.userLocationAccuracyStrokeColor)];
  }
  if (oldViewProps.userLocationAccuracyStrokeWidth !=
      newViewProps.userLocationAccuracyStrokeWidth) {
    self->_view.userLocationAccuracyStrokeWidth =
        newViewProps.userLocationAccuracyStrokeWidth;
  }
  if (oldViewProps.showUserPosition != newViewProps.showUserPosition) {
    [self->_view setShowUserPositionState:newViewProps.showUserPosition];
  }
  if (oldViewProps.userLocationIcon != newViewProps.userLocationIcon) {
    [self->_view
        setUserLocationIconWithPath:RCTNSStringFromString(
                                        newViewProps.userLocationIcon)];
  }
  if (oldViewProps.userLocationIconScale !=
      newViewProps.userLocationIconScale) {
    self->_view.userLocationIconScale = newViewProps.userLocationIconScale;
  }
  if (oldViewProps.followUser != newViewProps.followUser) {
    self->_view.followUser = newViewProps.followUser;
  }
  if (oldViewProps.logoPosition.horizontal !=
          newViewProps.logoPosition.horizontal ||
      oldViewProps.logoPosition.vertical !=
          newViewProps.logoPosition.vertical) {
    [self->_view setLogoPositionWithPosition:@{
      @"horizontal" :
          RCTNSStringFromString(toString(newViewProps.logoPosition.horizontal)),
      @"vertical" :
          RCTNSStringFromString(toString(newViewProps.logoPosition.vertical))
    }];
  }
  if (oldViewProps.logoPadding.vertical != newViewProps.logoPadding.vertical ||
      oldViewProps.logoPadding.horizontal !=
          newViewProps.logoPadding.horizontal) {
    [self->_view
        setLogoPaddingWithVertical:newViewProps.logoPadding.vertical
                        horizontal:newViewProps.logoPadding.horizontal];
  }
  if (oldViewProps.maxFps != newViewProps.maxFps) {
    self->_view.maxFps = newViewProps.maxFps;
  }
  [self->_view applyProperties];

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
    os_log_error(OS_LOG_DEFAULT, "YamapLiteView: _view is nil");
  }
}

- (void)fitAllMarkers {
  if (_view != nil) {
    [_view fitAllMarkers];
  } else {
    os_log_error(OS_LOG_DEFAULT, "YamapLiteView: _view is nil");
  }
}

- (void)handleOnMapLoadedWithResult:(NSDictionary *)obj {
  if (_view != nil) {
    [_view applyProperties];
  }

  if (_eventEmitter != nil) {
    YamapLiteViewEventEmitter::OnMapLoaded event = {};
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
    std::dynamic_pointer_cast<const YamapLiteViewEventEmitter>(_eventEmitter)
        ->onMapLoaded(event);
  }
}

- (void)handleOnCameraPositionChangeWithCoords:(NSDictionary *)coords {
  if (_eventEmitter != nil) {
    YamapLiteViewEventEmitter::OnCameraPositionChange event = {};
    event.point.lat = [[coords objectForKey:@"lat"] doubleValue];
    event.point.lon = [[coords objectForKey:@"lon"] doubleValue];
    event.zoom = [[coords objectForKey:@"zoom"] doubleValue];
    event.azimuth = [[coords objectForKey:@"azimuth"] doubleValue];
    event.tilt = [[coords objectForKey:@"tilt"] doubleValue];
    event.finished = [[coords objectForKey:@"finished"] boolValue];
    event.target = [[coords objectForKey:@"target"] doubleValue];

    id reasonObj = [coords objectForKey:@"reason"];
    NSString *reasonString = @"GESTURES";
    if ([reasonObj isKindOfClass:[NSString class]]) {
      reasonString = (NSString *)reasonObj;
    } else if (reasonObj != nil) {
      reasonString = [NSString stringWithFormat:@"%@", reasonObj];
    }
    if ([reasonString isEqualToString:@"APPLICATION"]) {
      event.reason =
          YamapLiteViewEventEmitter::OnCameraPositionChangeReason::APPLICATION;
    } else {
      event.reason =
          YamapLiteViewEventEmitter::OnCameraPositionChangeReason::GESTURES;
    }

    std::dynamic_pointer_cast<const YamapLiteViewEventEmitter>(_eventEmitter)
        ->onCameraPositionChange(event);
  }
}

- (void)handleOnCameraPositionChangeEndWithCoords:
    (NSDictionary<NSString *, id> *)coords {
  if (_eventEmitter != nil) {
    YamapLiteViewEventEmitter::OnCameraPositionChangeEnd event = {};
    event.point.lat = [[coords objectForKey:@"lat"] doubleValue];
    event.point.lon = [[coords objectForKey:@"lon"] doubleValue];
    event.zoom = [[coords objectForKey:@"zoom"] doubleValue];
    event.azimuth = [[coords objectForKey:@"azimuth"] doubleValue];
    event.tilt = [[coords objectForKey:@"tilt"] doubleValue];
    event.finished = [[coords objectForKey:@"finished"] boolValue];
    event.target = [[coords objectForKey:@"target"] doubleValue];

    id reasonObj = [coords objectForKey:@"reason"];
    NSString *reasonString = @"GESTURES";
    if ([reasonObj isKindOfClass:[NSString class]]) {
      reasonString = (NSString *)reasonObj;
    } else if (reasonObj != nil) {
      reasonString = [NSString stringWithFormat:@"%@", reasonObj];
    }
    if ([reasonString isEqualToString:@"APPLICATION"]) {
      event.reason = YamapLiteViewEventEmitter::
          OnCameraPositionChangeEndReason::APPLICATION;
    } else {
      event.reason =
          YamapLiteViewEventEmitter::OnCameraPositionChangeEndReason::GESTURES;
    }

    std::dynamic_pointer_cast<const YamapLiteViewEventEmitter>(_eventEmitter)
        ->onCameraPositionChangeEnd(event);
  }
}

- (void)handleOnMapLongPressWithCoords:(NSDictionary *)coords {
  if (_eventEmitter != nil) {
    YamapLiteViewEventEmitter::OnMapLongPress event = {};
    event.lat = [[coords objectForKey:@"lat"] doubleValue];
    event.lon = [[coords objectForKey:@"lon"] doubleValue];
    std::dynamic_pointer_cast<const YamapLiteViewEventEmitter>(_eventEmitter)
        ->onMapLongPress(event);
  }
}

- (void)handleOnMapPressWithCoords:(NSDictionary *)coords {
  if (_eventEmitter != nil) {
    YamapLiteViewEventEmitter::OnMapPress event = {};
    event.lat = [[coords objectForKey:@"lat"] doubleValue];
    event.lon = [[coords objectForKey:@"lon"] doubleValue];
    std::dynamic_pointer_cast<const YamapLiteViewEventEmitter>(_eventEmitter)
        ->onMapPress(event);
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
  if ([childComponentView isKindOfClass:YamapLitePolylineView.class]) {
    [_view insertReactSubview:childComponentView atIndex:index];
  }
  if ([childComponentView isKindOfClass:YamapLitePolygonView.class]) {
    [_view insertReactSubview:childComponentView atIndex:index];
  }
}

- (void)unmountChildComponentView:
            (nonnull UIView<RCTComponentViewProtocol> *)childComponentView
                            index:(NSInteger)index {
  if ([childComponentView isKindOfClass:YamapLiteMarkerView.class] ||
      [childComponentView isKindOfClass:YamapLiteCircleView.class] ||
      [childComponentView isKindOfClass:YamapLitePolylineView.class] ||
      [childComponentView isKindOfClass:YamapLitePolygonView.class]) {
    [_view removeReactSubview:childComponentView];
    [childComponentView removeFromSuperview];
  }
}

Class<RCTComponentViewProtocol> YamapLiteViewCls(void) {
  return YamapLiteView.class;
}

- hexStringToColor:(NSString *)stringToConvert {
  NSString *noHashString =
      [stringToConvert stringByReplacingOccurrencesOfString:@"#"
                                                 withString:@""];
  NSScanner *stringScanner = [NSScanner scannerWithString:noHashString];

  unsigned hex;
  if (![stringScanner scanHexInt:&hex])
    return nil;

  if (noHashString.length == 8) {
    // AARRGGBB
    int a = (hex >> 24) & 0xFF;
    int r = (hex >> 16) & 0xFF;
    int g = (hex >> 8) & 0xFF;
    int b = (hex) & 0xFF;
    return [UIColor colorWithRed:r / 255.0f
                           green:g / 255.0f
                            blue:b / 255.0f
                           alpha:a / 255.0f];
  }

  int r = (hex >> 16) & 0xFF;
  int g = (hex >> 8) & 0xFF;
  int b = (hex) & 0xFF;
  return [UIColor colorWithRed:r / 255.0f
                         green:g / 255.0f
                          blue:b / 255.0f
                         alpha:1.0f];
}

@end
