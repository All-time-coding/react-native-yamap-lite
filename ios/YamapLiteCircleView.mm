#import "YamapLiteCircleView.h"
#include "react/renderer/components/YamapLiteViewSpec/EventEmitters.h"
#include <Foundation/Foundation.h>
#include "ReactCodegen/react/renderer/components/YamapLiteViewSpec/EventEmitters.h"
#include <objc/NSObject.h>

#import <React/RCTConversions.h>
#import <RCTTypeSafety/RCTConvertHelpers.h>
#import <react/renderer/graphics/Color.h>

#import <react/renderer/components/YamapLiteViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/YamapLiteViewSpec/EventEmitters.h>
#import <react/renderer/components/YamapLiteViewSpec/Props.h>
#import <react/renderer/components/YamapLiteViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "YamapLite-Swift.h"

using namespace facebook::react;

@interface YamapLiteCircleView () <RCTYamapLiteCircleViewViewProtocol,YamapLiteCircleComponentDelegate>

@end

@implementation YamapLiteCircleView {
    YamapLiteCircle * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<YamapLiteCircleViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const YamapLiteCircleViewProps>();
        _props = defaultProps;
        _view = [[YamapLiteCircle alloc] init];
        _view.delegate = self;
        self.contentView = _view;
    }
    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<YamapLiteCircleViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<YamapLiteCircleViewProps const>(props);
    if(oldViewProps.radius != newViewProps.radius){
        _view.radius = newViewProps.radius;
    }
    if(oldViewProps.fillColor != newViewProps.fillColor ){
        UIColor* uiColor = RCTUIColorFromSharedColor(newViewProps.fillColor);
        _view.fillColor = uiColor;
    }
    if(oldViewProps.strokeColor != newViewProps.strokeColor){
        UIColor* uiColor = RCTUIColorFromSharedColor(newViewProps.strokeColor);
        _view.strokeColor = uiColor;
    }
    if(oldViewProps.strokeWidth != newViewProps.strokeWidth){
        _view.strokeWidth = newViewProps.strokeWidth;
    }
    if(oldViewProps.zIndex != newViewProps.zIndex){
        _view.zIndex = newViewProps.zInd;
    }
    if(oldViewProps.center.lat != newViewProps.center.lat || oldViewProps.center.lon != newViewProps.center.lon){
        [_view setCircleCenterWithLatitude:newViewProps.center.lat longitude:newViewProps.center.lon];
    }
    if(oldViewProps.handled != newViewProps.handled){
        _view.handled = newViewProps.handled;
    }

       [super updateProps:props oldProps:oldProps];
}

- (void)onCirclePressWithPoint:(NSDictionary<NSString *,NSNumber *> * _Nonnull)point {
    if (_eventEmitter != nil) {
        YamapLiteCircleViewEventEmitter::OnCirclePress event = {};
        event.lat = [[point objectForKey:@"lat"] doubleValue];
        event.lon = [[point objectForKey:@"lon"] doubleValue];
        std::dynamic_pointer_cast<const YamapLiteCircleViewEventEmitter>(_eventEmitter)
        ->onCirclePress(event);
    }
}

Class<RCTComponentViewProtocol> YamapLiteCircleViewCls(void)
{
    return YamapLiteCircleView.class;
}


@end
