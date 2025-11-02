#import "YamapUtils.h"
#include "React/RCTUtils.h"
#include <objc/NSObject.h>
#include "YamapLiteView.h"
#include "YamapLiteViewSpec.h"

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

#import "YamapLite-Swift.h"
#import <YandexMapsMobile/YMKMapKitFactory.h>

@implementation YamapUtils

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

- (void)rejecter:(RCTPromiseRejectBlock)reject name:(NSString*)name {
  reject(@"YamapLite", [@"failed to " stringByAppendingString:name],
         [[NSError alloc] initWithDomain:@"YamapLite" code:123 userInfo:@{}]);
}



- (YamapView*)getView:(double)viewId {
  YamapLiteView* liteView = (YamapLiteView*)[self.bridge.uiManager viewForReactTag:[NSNumber numberWithDouble:viewId]];
  if (liteView && [liteView.contentView isKindOfClass:[YamapView class]]) {
    return (YamapView*)liteView.contentView;
  }
  return nil;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeYamapUtilsSpecJSI>(params);
}


- (void)getCameraPosition:(double)viewId resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject{
    RCTExecuteOnMainQueue(^{    
        YamapView* view = [self getView:viewId];
        NSObject *coords = [view getCameraPosition];

        if(coords){
            resolve(coords);
        }

        else{
            [self rejecter:reject name:@"no coords found"];
        }
    });
}

- (void)setZoom:(double)viewId zoom:(double)zoom duration:(double)duration animation:(NSString *)animation resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
    RCTExecuteOnMainQueue(^{
        YamapView* view = [self getView:viewId];
        if (view) {
          [view setZoomWithZoom:zoom duration:duration animation:animation];
            resolve(nil);
        } else {
            [self rejecter:reject name:@"setZoom"];
        }
    });
}

- (void)setCenter:(double)viewId latitude:(double)latitude longitude:(double)longitude zoom:(double)zoom azimuth:(double)azimuth tilt:(double)tilt duration:(double)duration animation:(NSString *)animation resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
    RCTExecuteOnMainQueue(^{
        YamapView* view = [self getView:viewId];
        if (view) {
          [view setCenterWithLatitude:latitude longitude:longitude zoom:(float)zoom azimuth:(float)azimuth tilt:(float)tilt duration:(int)duration animation:animation];
            resolve(nil);
        } else {
            [self rejecter:reject name:@"setCenter"];
        }
    });
}

- (void)fitAllMarkers:(double)viewId resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject{
    RCTExecuteOnMainQueue(^{
        YamapView* view = [self getView:viewId];
        if (view) {
            [view fitAllMarkers];
            resolve(nil);
        } else {
            [self rejecter:reject name:@"fitAllMarkers"];
        }
    });
}

- (void)getScreenPoints:(double)viewId points:(NSArray<NSDictionary<NSString *,id> *> *)points resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject{
        // TODO:
}

- (void)getVisibleRegion:(double)viewId resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
  // TODO:
}

@end
