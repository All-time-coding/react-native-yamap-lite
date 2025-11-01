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
  return static_cast<YamapView*>(
      [self.bridge.uiManager viewForReactTag:[NSNumber numberWithDouble:viewId]]);
  ;
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

- (void)fitAllMarkers:(double)viewId points:(NSArray<NSDictionary<NSString *,id> *> *)points resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject{
    RCTExecuteOnMainQueue(^{
        YamapView* view = [self getView:viewId];
        //TODO:
    });
}

- (void)getVisibleRegion:(double)viewId
{
    RCTExecuteOnMainQueue(^{
        YamapView* view = [self getView:viewId];
        //TODO:
    });
}

- (void)getScreenPoints:(double)viewId points:(NSArray<NSDictionary<NSString *,id> *> *)points resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject{
    RCTExecuteOnMainQueue(^{
        YamapView* view = [self getView:viewId];
        //TODO:
    });
}
@end
