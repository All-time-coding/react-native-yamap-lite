#import "YamapLitePolylineView.h"
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

@interface YamapLitePolylineView () <RCTYamapLitePolylineViewViewProtocol,
                                     YamapLitePolylineComponentDelegate>

@end

@implementation YamapLitePolylineView {
  YamapLitePolyline *_view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      YamapLitePolylineViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const YamapLitePolylineViewProps>();
    _props = defaultProps;
    _view = [[YamapLitePolyline alloc] init];
    _view.delegate = self;
    self.contentView = _view;
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &oldViewProps =
      *std::static_pointer_cast<YamapLitePolylineViewProps const>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<YamapLitePolylineViewProps const>(props);
  if (oldViewProps.strokeColor != newViewProps.strokeColor) {
    UIColor *uiColor = RCTUIColorFromSharedColor(newViewProps.strokeColor);
    if (uiColor) {
      _view.strokeColor = uiColor;
    }
  }
  if (oldViewProps.strokeWidth != newViewProps.strokeWidth) {
    _view.strokeWidth = newViewProps.strokeWidth;
  }
  if (oldViewProps.outlineColor != newViewProps.outlineColor) {
    UIColor *uiColor = RCTUIColorFromSharedColor(newViewProps.outlineColor);
    if (uiColor) {
      _view.outlineColor = uiColor;
    }
  }
  if (oldViewProps.dashLength != newViewProps.dashLength) {
    _view.dashLength = newViewProps.dashLength;
  }
  if (oldViewProps.gapLength != newViewProps.gapLength) {
    _view.gapLength = newViewProps.gapLength;
  }
  if (oldViewProps.outlineWidth != newViewProps.outlineWidth) {
    _view.outlineWidth = newViewProps.outlineWidth;
  }
  if (oldViewProps.dashOffset != newViewProps.dashOffset) {
    _view.dashOffset = newViewProps.dashOffset;
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
  if (oldViewProps.handled != newViewProps.handled) {
    _view.handled = newViewProps.handled;
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)onPolylinePressWithPoint:
    (NSDictionary<NSString *, NSNumber *> *_Nonnull)point {
  if (_eventEmitter != nil) {
    YamapLitePolylineViewEventEmitter::OnPolylinePress event = {};
    event.lat = [[point objectForKey:@"lat"] doubleValue];
    event.lon = [[point objectForKey:@"lon"] doubleValue];
    std::dynamic_pointer_cast<const YamapLitePolylineViewEventEmitter>(
        _eventEmitter)
        ->onPolylinePress(event);
  }
}

Class<RCTComponentViewProtocol> YamapLitePolylineViewCls(void) {
  return YamapLitePolylineView.class;
}

@end
