#import "YamapLiteMarkerView.h"
#include "react/renderer/components/YamapLiteViewSpec/EventEmitters.h"
#include <Foundation/Foundation.h>
#include "ReactCodegen/react/renderer/components/YamapLiteViewSpec/EventEmitters.h"
#include <objc/NSObject.h>

#import <React/RCTConversions.h>
#import <RCTTypeSafety/RCTConvertHelpers.h>

#import <react/renderer/components/YamapLiteViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/YamapLiteViewSpec/EventEmitters.h>
#import <react/renderer/components/YamapLiteViewSpec/Props.h>
#import <react/renderer/components/YamapLiteViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "YamapLite-Swift.h"

using namespace facebook::react;

@interface YamapLiteMarkerView () <RCTYamapLiteMarkerViewViewProtocol,YamapLiteMarkerComponentDelegate>

@end

@implementation YamapLiteMarkerView {
    YamapLiteMarker * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<YamapLiteMarkerViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const YamapLiteMarkerViewProps>();
        _props = defaultProps;
        _view = [[YamapLiteMarker alloc] init];
        _view.delegate = self;
        self.contentView = _view;
    }
    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<YamapLiteMarkerViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<YamapLiteMarkerViewProps const>(props);
    if(oldViewProps.scale != newViewProps.scale){
        _view.scale = newViewProps.scale;
    }
   if(oldViewProps.zInd != newViewProps.zInd){
       _view.zIndex = newViewProps.zInd;
   }
    if(oldViewProps.visible != newViewProps.visible){
        _view.visible = newViewProps.visible;
    }
    if(oldViewProps.handled != newViewProps.handled){
        _view.handled = newViewProps.handled;
    }
    if(oldViewProps.point.lat != newViewProps.point.lat || oldViewProps.point.lon != newViewProps.point.lon){
        [_view setPointWithLat:newViewProps.point.lat lon:newViewProps.point.lon];
    }
    if(oldViewProps.anchor.x != newViewProps.anchor.x || oldViewProps.anchor.y != newViewProps.anchor.y){
        [_view setAnchorWithX:newViewProps.anchor.x y:newViewProps.anchor.y];
    }
    if(RCTNSStringFromString(oldViewProps.source) != RCTNSStringFromString(newViewProps.source)){
        [_view setIconWithUri:RCTNSStringFromString(newViewProps.source)];
    }
    if(oldViewProps.rotated != newViewProps.rotated){
        _view.rotated = newViewProps.rotated;
    }
    if(oldViewProps.size != newViewProps.size){
        _view.size = newViewProps.size;
    }
    
    [super updateProps:props oldProps:oldProps];
}

- (void)onMarkerPressWithPoint:(NSDictionary<NSString *,NSNumber *> * _Nonnull)point { 
   if (_eventEmitter != nil) {
        YamapLiteMarkerViewEventEmitter::OnMarkerPress event = {};
        event.lat = [[point objectForKey:@"lat"] doubleValue];
        event.lon = [[point objectForKey:@"lon"] doubleValue];
        std::dynamic_pointer_cast<const YamapLiteMarkerViewEventEmitter>(_eventEmitter)
        ->onMarkerPress(event);
    }
}


Class<RCTComponentViewProtocol> YamapLiteMarkerViewCls(void)
{
    return YamapLiteMarkerView.class;
}


@end
