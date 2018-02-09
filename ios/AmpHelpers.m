#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AmpHelpers, NSObject)
RCT_EXTERN_METHOD(getTokenParams:(NSString *)password resolve:(RCTPromiseResolveBlock*)resolve reject:(RCTPromiseRejectBlock*)reject)
@end
