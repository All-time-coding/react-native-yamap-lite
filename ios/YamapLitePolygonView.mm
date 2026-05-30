#import "YamapLitePolygonView.h"
#include "ReactCodegen/react/renderer/components/YamapLiteViewSpec/EventEmitters.h"
#include "react/renderer/components/YamapLiteViewSpec/EventEmitters.h"
#include <Foundation/Foundation.h>
#include <objc/NSObject.h>

#import <RCTTypeSafety/RCTConvertHelpers.h>
#import <React/RCTConversions.h>
#import <react/renderer/components/YamapLiteViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/YamapLiteViewSpec/EventEmitters.h>
#import <react/renderer/components/YamapLiteViewSpec/Props.h>
#import <react/renderer/components/YamapLiteViewSpec/RCTComponentViewHelpers.h>
#import <react/renderer/graphics/Color.h>

#import "RCTFabricComponentsPlugins.h"
#import "Utils/PointsEqual.h"
#import "YamapLite-Swift.h"
#import <YandexMapsMobile/YMKMapKitFactory.h>

using namespace facebook::react;

@interface YamapLitePolygonView () <RCTYamapLitePolygonViewViewProtocol,
                                    YamapLitePolygonComponentDelegate>

@end

@implementation YamapLitePolygonView {
  YamapLitePolygon *_view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      YamapLitePolygonViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const YamapLitePolygonViewProps>();
    _props = defaultProps;
    _view = [[YamapLitePolygon alloc] init];
    _view.delegate = self;
    self.contentView = _view;
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &oldViewProps =
      *std::static_pointer_cast<YamapLitePolygonViewProps const>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<YamapLitePolygonViewProps const>(props);
  if (oldViewProps.fillColor != newViewProps.fillColor) {
    UIColor *uiColor = RCTUIColorFromSharedColor(newViewProps.fillColor);
    if (uiColor) {
      _view.fillColor = uiColor;
    }
  }
  if (oldViewProps.strokeColor != newViewProps.strokeColor) {
    UIColor *uiColor = RCTUIColorFromSharedColor(newViewProps.strokeColor);
    if (uiColor) {
      _view.strokeColor = uiColor;
    }
  }
  if (oldViewProps.strokeWidth != newViewProps.strokeWidth) {
    _view.strokeWidth = newViewProps.strokeWidth;
  }
  if (oldViewProps.zInd != newViewProps.zInd) {
    _view.zIndex = newViewProps.zInd;
  }

  if (!yamaplite::pointsEqual(oldViewProps.points, newViewProps.points)) {
    NSMutableArray<YMKPoint *> *pointsArr =
        [NSMutableArray arrayWithCapacity:newViewProps.points.size()];
    for (const auto &p : newViewProps.points) {
      [pointsArr addObject:[YMKPoint pointWithLatitude:p.lat longitude:p.lon]];
    }
    _view.points = pointsArr;
  }

  if (!yamaplite::ringsEqual(oldViewProps.innerRings,
                             newViewProps.innerRings)) {
    NSMutableArray<NSArray<YMKPoint *> *> *innerRingsArr =
        [NSMutableArray arrayWithCapacity:newViewProps.innerRings.size()];
    for (const auto &ring : newViewProps.innerRings) {
      NSMutableArray<YMKPoint *> *ringArr =
          [NSMutableArray arrayWithCapacity:ring.size()];
      for (const auto &p : ring) {
        [ringArr addObject:[YMKPoint pointWithLatitude:p.lat longitude:p.lon]];
      }
      [innerRingsArr addObject:ringArr];
    }
    _view.innerRings = innerRingsArr;
  }

  if (oldViewProps.handled != newViewProps.handled) {
    _view.handled = newViewProps.handled;
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)onPolygonPressWithPoint:
    (NSDictionary<NSString *, NSNumber *> *_Nonnull)point {
  if (_eventEmitter != nil) {
    YamapLitePolygonViewEventEmitter::OnPolygonPress event = {};
    event.lat = [[point objectForKey:@"lat"] doubleValue];
    event.lon = [[point objectForKey:@"lon"] doubleValue];
    std::dynamic_pointer_cast<const YamapLitePolygonViewEventEmitter>(
        _eventEmitter)
        ->onPolygonPress(event);
  }
}

Class<RCTComponentViewProtocol> YamapLitePolygonViewCls(void) {
  return YamapLitePolygonView.class;
}

@end
