#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"

@interface ClusteredYamapLiteViewManager : RCTViewManager
@end

@implementation ClusteredYamapLiteViewManager

RCT_EXPORT_MODULE(ClusteredYamapLiteView)

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end
