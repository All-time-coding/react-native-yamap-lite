#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"

@interface YamapLiteViewManager : RCTViewManager
@end

@implementation YamapLiteViewManager

RCT_EXPORT_MODULE(YamapLiteView)

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end
