#import "YamapUtils.h"
#include "React/RCTUtils.h"
#include "YamapLiteView.h"
#include "YamapLiteViewSpec.h"
#include <YandexMapsMobile/YMKMapkit.h>
#include <objc/NSObject.h>

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

#import "YamapLite-Swift.h"
#import <YandexMapsMobile/YMKMapKitFactory.h>
#import <YandexMapsMobile/YRTI18nManager.h>

@implementation YamapUtils

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

- (void)rejecter:(RCTPromiseRejectBlock)reject name:(NSString *)name {
  reject(@"YamapLite", [@"failed to " stringByAppendingString:name],
         [[NSError alloc] initWithDomain:@"YamapLite" code:123 userInfo:@{}]);
}

- (YamapView *)getView:(double)viewId {
  YamapLiteView *liteView = (YamapLiteView *)[self.bridge.uiManager
      viewForReactTag:[NSNumber numberWithDouble:viewId]];
  if (liteView && [liteView.contentView isKindOfClass:[YamapView class]]) {
    return (YamapView *)liteView.contentView;
  }
  return nil;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeYamapUtilsSpecJSI>(params);
}

- (void)getCameraPosition:(double)viewId
                  resolve:(nonnull RCTPromiseResolveBlock)resolve
                   reject:(nonnull RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    YamapView *view = [self getView:viewId];
    NSObject *coords = [view getCameraPosition];

    if (coords) {
      resolve(coords);
    }

    else {
      [self rejecter:reject name:@"no coords found"];
    }
  });
}

- (void)setZoom:(double)viewId
           zoom:(double)zoom
       duration:(double)duration
      animation:(NSString *)animation
        resolve:(nonnull RCTPromiseResolveBlock)resolve
         reject:(nonnull RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    YamapView *view = [self getView:viewId];
    if (view) {
//      [view setZoomWithZoom:zoom];
       [view setZoomWithZoom:zoom duration:duration animation:animation];
      resolve(nil);
    } else {
      [self rejecter:reject name:@"setZoom"];
    }
  });
}

- (void)setCenter:(double)viewId
         latitude:(double)latitude
        longitude:(double)longitude
             zoom:(double)zoom
          azimuth:(double)azimuth
             tilt:(double)tilt
         duration:(double)duration
        animation:(NSString *)animation
          resolve:(nonnull RCTPromiseResolveBlock)resolve
           reject:(nonnull RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    YamapView *view = [self getView:viewId];
    if (view) {
        [view setCenterWithLatitude:latitude longitude:longitude zoom:(float)zoom azimuth:(float)azimuth tilt:(float)tilt duration:(int)duration animation:animation];
      resolve(nil);
    } else {
      [self rejecter:reject name:@"setCenter"];
    }
  });
}

- (void)fitAllMarkers:(double)viewId
              resolve:(nonnull RCTPromiseResolveBlock)resolve
               reject:(nonnull RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    YamapView *view = [self getView:viewId];
    if (view) {
      [view fitAllMarkers];
      resolve(nil);
    } else {
      [self rejecter:reject name:@"fitAllMarkers"];
    }
  });
}

- (void)getScreenPoints:(double)viewId
                 points:(NSArray<NSDictionary<NSString *, id> *> *)points
                resolve:(nonnull RCTPromiseResolveBlock)resolve
                 reject:(nonnull RCTPromiseRejectBlock)reject {
  // TODO:
}

- (void)getVisibleRegion:(double)viewId
                 resolve:(nonnull RCTPromiseResolveBlock)resolve
                  reject:(nonnull RCTPromiseRejectBlock)reject {
  // TODO:
}

- (void)getLocale:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    NSString *locale = [YRTI18nManagerFactory getLocale];
    if (locale) {
      resolve(locale);
    } else {
      [self rejecter:reject name:@"getLocale"];
    }
  });
}

- (void)init:(nonnull NSString *)apiKey resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  @try {
    RCTExecuteOnMainQueue(^{
    [YMKMapKit setApiKey: apiKey];
    [[YMKMapKit sharedInstance] onStart];
    resolve(nil);
    });
  } @catch (NSException *exception) {
    [self rejecter:reject name:[NSString stringWithFormat:@"init %@ %@", exception.name, exception.reason]];
  }
}


- (void)resetLocale:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
  [YRTI18nManagerFactory setLocaleWithLocale:nil];
  resolve(nil);
}


- (void)setLocale:(nonnull NSString *)locale resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
  [YRTI18nManagerFactory setLocaleWithLocale:locale];
  resolve(nil);
}

@end
