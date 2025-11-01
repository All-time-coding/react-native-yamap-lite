#import "YamapLiteView.h"
#include "YamapLiteMarkerView.h"
#include "YamapLiteCircleView.h"
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

@interface YamapLiteView () <RCTYamapLiteViewViewProtocol, YamapViewComponentDelegate>

@end

@implementation YamapLiteView {
    YamapView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<YamapLiteViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const YamapLiteViewProps>();
        _props = defaultProps;
        
        _view = [[YamapView alloc] init];
        _view.delegate = self;
        
        
        self.contentView = _view;
    }
    
    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<YamapLiteViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<YamapLiteViewProps const>(props);
    
    if(oldViewProps.mapType != newViewProps.mapType){
        NSString *sampleRate = RCTNSStringFromStringNilIfEmpty(toString(newViewProps.mapType));
        _view.mapType = sampleRate;
    }

    if(oldViewProps.nightMode != newViewProps.nightMode){
        _view.nightMode = newViewProps.nightMode;
    }
    
    if(oldViewProps.zoomGesturesEnabled != newViewProps.zoomGesturesEnabled){
        _view.zoomGesturesEnabled = newViewProps.zoomGesturesEnabled;
    }
    if(oldViewProps.scrollGesturesEnabled != newViewProps.scrollGesturesEnabled){
        _view.scrollGesturesEnabled = newViewProps.scrollGesturesEnabled;
    }
    if(oldViewProps.rotateGesturesEnabled != newViewProps.rotateGesturesEnabled){
        _view.rotateGesturesEnabled = newViewProps.rotateGesturesEnabled;
    }
    if(oldViewProps.tiltGesturesEnabled != newViewProps.tiltGesturesEnabled){
        _view.tiltGesturesEnabled = newViewProps.tiltGesturesEnabled;
    }
    if(oldViewProps.fastTapEnabled != newViewProps.fastTapEnabled){
        _view.fastTapEnabled = newViewProps.fastTapEnabled;
    }
    
    if(oldViewProps.showUserPosition != newViewProps.showUserPosition){
        _view.showUserPosition = newViewProps.showUserPosition;
        [_view setShowUserPositionState:newViewProps.showUserPosition];
    }
      
    if(oldViewProps.userLocationIconScale != newViewProps.userLocationIconScale){
        _view.userLocationIconScale = newViewProps.userLocationIconScale;
        [_view updateUserIcon];
    }
    if(RCTNSStringFromString(oldViewProps.userLocationIcon) != RCTNSStringFromString(newViewProps.userLocationIcon)){
        [_view setUserLocationIconWithPath:RCTNSStringFromString(newViewProps.userLocationIcon)];
    }

    if(oldViewProps.initialRegion.latitude != newViewProps.initialRegion.latitude){
        [_view move:newViewProps.initialRegion.latitude :newViewProps.initialRegion.longitude :newViewProps.initialRegion.zoom :newViewProps.initialRegion.azimuth :newViewProps.initialRegion.tilt];
    }
    if(oldViewProps.logoPosition.horizontal != newViewProps.logoPosition.horizontal || oldViewProps.logoPosition.vertical != newViewProps.logoPosition.vertical){
        NSDictionary *logoPositionDict = @{
            @"horizontal": RCTNSStringFromString(toString(newViewProps.logoPosition.horizontal)),
            @"vertical": RCTNSStringFromString(toString(newViewProps.logoPosition.vertical))
        };
        [_view setLogoPositionWithPosition:logoPositionDict];
    }
    if(oldViewProps.logoPadding.horizontal !=newViewProps.logoPadding.horizontal || oldViewProps.logoPadding.vertical != newViewProps.logoPadding.vertical){
        [_view setLogoPaddingWithVertical:newViewProps.logoPadding.vertical horizontal:newViewProps.logoPadding.horizontal];
    }
    
    if(oldViewProps.maxFps != newViewProps.maxFps){
        _view.maxFps = newViewProps.maxFps;
    }
    
    [super updateProps:props oldProps:oldProps];
}

- (void)handleCommand:(NSString *)commandName args:(NSArray *)args{
    if ([commandName isEqualToString:@"setCenter"]) {
        if ([args count] >= 6) {
            double latitude = [[args objectAtIndex:0] doubleValue];
            double longitude = [[args objectAtIndex:1] doubleValue];
            float zoom = [[args objectAtIndex:2] floatValue];
            float azimuth = [[args objectAtIndex:3] floatValue];
            float tilt = [[args objectAtIndex:4] floatValue];
            float duration = [[args objectAtIndex:5] floatValue];
            [self setCenter:latitude longitude:longitude zoom:zoom azimuth:azimuth tilt:tilt duration:duration];
        }
    }
}

- (void)setCenter:(double)latitude longitude:(double)longitude zoom:(float)zoom azimuth:(float)azimuth tilt:(float)tilt duration:(float)duration{
    [_view setCenterWithLatitude:latitude longitude:longitude zoom:zoom azimuth:azimuth tilt:tilt duration:duration];
}

- (void)handleOnMapLoadedWithResult:(NSDictionary *)obj{
    if (_eventEmitter != nil) {
        YamapLiteViewEventEmitter::OnMapLoaded event = {};
        event.curZoomGeometryLoaded = [[obj objectForKey:@"curZoomGeometryLoaded"] doubleValue];
        event.curZoomModelsLoaded = [[obj objectForKey:@"curZoomModelsLoaded"] doubleValue];
        event.curZoomLabelsLoaded = [[obj objectForKey:@"curZoomLabelsLoaded"] doubleValue];
        event.curZoomPlacemarksLoaded = [[obj objectForKey:@"curZoomPlacemarksLoaded"] doubleValue];
        event.fullyLoaded = [[obj objectForKey:@"fullyLoaded"] doubleValue];
        event.renderObjectCount = [[obj objectForKey:@"renderObjectCount"] doubleValue];
        event.tileMemoryUsage = [[obj objectForKey:@"tileMemoryUsage"] doubleValue];
        event.delayedGeometryLoaded = [[obj objectForKey:@"delayedGeometryLoaded"] doubleValue];
        event.fullyAppeared = [[obj objectForKey:@"fullyAppeared"] doubleValue];
        std::dynamic_pointer_cast<const YamapLiteViewEventEmitter>(_eventEmitter)
        ->onMapLoaded(event);
    }
}


- (void)handleOnCameraPositionChangeWithCoords:(NSDictionary *)coords {
    if (_eventEmitter != nil) {
        YamapLiteViewEventEmitter::OnCameraPositionChange event = {};
        event.latitude = [[coords objectForKey:@"latitude"] doubleValue];
        event.longitude = [[coords objectForKey:@"longitude"] doubleValue];
        event.zoom = [[coords objectForKey:@"zoom"] doubleValue];
        event.azimuth = [[coords objectForKey:@"azimuth"] doubleValue];
        event.tilt = [[coords objectForKey:@"tilt"] doubleValue];
        event.finished = [[coords objectForKey:@"finished"] boolValue];
        event.target = [[coords objectForKey:@"target"] doubleValue];
        
        std::dynamic_pointer_cast<const YamapLiteViewEventEmitter>(_eventEmitter)
        ->onCameraPositionChange(event);
    }
}

- (void)handleOnCameraPositionChangeEndWithCoords:(NSDictionary<NSString *,id> *)coords {
    if (_eventEmitter != nil) {
        YamapLiteViewEventEmitter::OnCameraPositionChangeEnd event = {};
        event.latitude = [[coords objectForKey:@"latitude"] doubleValue];
        event.longitude = [[coords objectForKey:@"longitude"] doubleValue];
        event.zoom = [[coords objectForKey:@"zoom"] doubleValue];
        event.azimuth = [[coords objectForKey:@"azimuth"] doubleValue];
        event.tilt = [[coords objectForKey:@"tilt"] doubleValue];
        event.finished = [[coords objectForKey:@"finished"] boolValue];
        event.target = [[coords objectForKey:@"target"] doubleValue];
        
        std::dynamic_pointer_cast<const YamapLiteViewEventEmitter>(_eventEmitter)
        ->onCameraPositionChangeEnd(event);
    }
}

- (void)mountChildComponentView:(nonnull UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index { 
    if ([childComponentView isKindOfClass:YamapLiteMarkerView.class]) {
        [_view insertReactSubview:childComponentView atIndex:index];
    }
    if ([childComponentView isKindOfClass:YamapLiteCircleView.class]) {
        [_view insertReactSubview:childComponentView atIndex:index];
    }
}
- (void)unmountChildComponentView:(nonnull UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index { 
//TODO:
}



Class<RCTComponentViewProtocol> YamapLiteViewCls(void)
{
    return YamapLiteView.class;
}

- hexStringToColor:(NSString *)stringToConvert
{
    NSString *noHashString = [stringToConvert stringByReplacingOccurrencesOfString:@"#" withString:@""];
    NSScanner *stringScanner = [NSScanner scannerWithString:noHashString];
    
    unsigned hex;
    if (![stringScanner scanHexInt:&hex]) return nil;
    int r = (hex >> 16) & 0xFF;
    int g = (hex >> 8) & 0xFF;
    int b = (hex) & 0xFF;
    
    return [UIColor colorWithRed:r / 255.0f green:g / 255.0f blue:b / 255.0f alpha:1.0f];
}

@end
